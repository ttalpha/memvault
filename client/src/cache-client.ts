import net from "net";
import chalk from "chalk";
import { AVLTree, BSTNode } from "./avl";
import { getHashRingIndex } from "./hash";

interface SocketInfo {
  socket: net.Socket;
  vnode: number;
  host: string;
  port: number;
}

export default class CacheClient {
  private avlTree = new AVLTree<SocketInfo>();
  private replicationFactor = 3;

  constructor(replicationFactor?: number) {
    this.replicationFactor = replicationFactor ?? this.replicationFactor;
  }

  private getReplicas(key: number): BSTNode<SocketInfo>[] {
    const replicas: BSTNode<SocketInfo>[] = [];
    const seenHosts = new Set<string>();

    let current = this.avlTree.getNearestLargerNode(key);
    if (!current) current = this.avlTree.getMinNode(this.avlTree.root);

    while (replicas.length < this.replicationFactor - 1) {
      if (!current) continue;
      const { host, port } = current.value;
      const hostId = `${host}:${port}`;
      if (!seenHosts.has(hostId)) {
        replicas.push(current);
        seenHosts.add(hostId);
      }
      current = this.avlTree.getSuccessor(current);
      if (!current) current = this.avlTree.getMinNode(this.avlTree.root);
    }

    return replicas;
  }

  async connect(
    host?: string,
    port?: number,
    vnodes = 100,
    maxRetries = 5,
    retryDelay = 1000
  ) {
    if (host === "localhost") host = "127.0.0.1";
    const PORT = port ?? 6379;
    const HOST = host ?? "127.0.0.1";

    try {
      const socket = await this.tryConnect(PORT, HOST, maxRetries, retryDelay);
      const ringIndices: number[] = [];

      for (let i = 0; i < vnodes; i++) {
        const ringIndex = getHashRingIndex(`${HOST}:${PORT}-${i}`);
        this.avlTree.set(ringIndex, {
          socket,
          vnode: i,
          host: HOST,
          port: PORT,
        });
        ringIndices.push(ringIndex);
      }

      socket.on("end", async () => {
        console.log(
          chalk.yellow(
            `[${new Date().toISOString()}] [WARN] Disconnected from ${HOST}:${PORT} — cleaning up`
          )
        );

        for (const index of ringIndices) {
          this.avlTree.delete(index);
        }

        console.log(
          chalk.greenBright(
            `[${new Date().toISOString()}] [INFO] Removed all ${vnodes} virtual nodes from the ring`
          )
        );
      });
    } catch (error) {
      console.error(
        chalk.redBright(`[${new Date().toISOString()}] [ERROR] ${error}`)
      );
    }
  }

  private tryConnect(
    port: number,
    host: string,
    maxRetries: number,
    retryDelay = 1000,
    attempt: number = 0
  ): Promise<net.Socket> {
    return new Promise((resolve, reject) => {
      const socket = new net.Socket();

      socket.connect({ port, host }, () => {
        socket.write("PING\r\n");
      });

      socket.on("data", (data) => {
        const response = data.toString().trim();
        if (response === "PONG") {
          console.log(
            chalk.greenBright(
              `[${new Date().toISOString()}] [INFO] Connected to MemVault server at ${host}:${port}`
            )
          );
          socket.removeAllListeners("data"); // prevent future 'data' misfires
          resolve(socket);
        } else {
          socket.destroy();
          reject(
            new Error(
              `[ERROR] Unexpected response during handshake: ${response}`
            )
          );
        }
      });

      socket.on("error", (err) => {
        socket.destroy();
        if (attempt < maxRetries) {
          console.log(
            chalk.yellow(
              `[${new Date().toISOString()}] [WARN] Failed to connect to ${host}:${port} — Retrying (${
                attempt + 1
              }/${maxRetries})...`
            )
          );
          setTimeout(() => {
            this.tryConnect(port, host, maxRetries, retryDelay, attempt + 1)
              .then(resolve)
              .catch(reject);
          }, retryDelay);
        } else {
          reject(
            new Error(
              `[ERROR] Failed to connect to ${host}:${port} after ${maxRetries} retries`
            )
          );
        }
      });
    });
  }

  private getSocketInfo(key: string): [number, SocketInfo] {
    if (this.avlTree.isEmpty()) {
      throw new Error(
        chalk.redBright(
          `[${new Date().toISOString()}] [ERROR] No cache nodes connected`
        )
      );
    }

    const ringIndex = getHashRingIndex(key);
    const node = this.avlTree.getNearestLargerNode(ringIndex);

    if (!node) {
      throw new Error(
        chalk.redBright(
          `[${new Date().toISOString()}] [ERROR] No responsible node found for key`
        )
      );
    }

    console.log(
      chalk.blueBright(
        `[${new Date().toISOString()}] [INFO] Key "${key}" routed to node ${
          node.value.host
        }:${node.value.port}`
      )
    );

    return [node.key, node.value];
  }

  private sendCommand(socket: net.Socket, command: string) {
    try {
      console.log(
        chalk.gray(`[${new Date().toISOString()}] [COMMAND] → ${command}`)
      );
      socket.write(command + "\r\n");
    } catch (error) {
      console.error(
        chalk.redBright(
          `[${new Date().toISOString()}] [ERROR] Failed to send command: ${String(
            error
          )}`
        )
      );
      throw error;
    }
  }

  get(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const [, socketInfo] = this.getSocketInfo(key);
      const { socket } = socketInfo;

      this.sendCommand(socket, `GET ${key}`);

      const onData = (buffer: Buffer) => {
        const data = buffer.toString().trim();

        socket.off("data", onData);
        if (data.startsWith("ERROR ")) {
          reject(new Error(data));
        } else if (data.startsWith("OK ")) {
          const cleanValue = data.slice(3).replace(/\\/g, "");
          console.log(
            chalk.greenBright(
              `[${new Date().toISOString()}] [INFO] GET → "${cleanValue}"`
            )
          );
          resolve(cleanValue);
        } else if (data === "NOT_FOUND") {
          console.log(
            chalk.yellow(
              `[${new Date().toISOString()}] [WARN] Key "${key}" not found`
            )
          );
          resolve(null);
        }
      };

      socket.on("data", onData);
    });
  }

  set(key: string, value: string, ttl: number = 120) {
    const escaped = value.replace(/"/g, '\\"');

    return new Promise((resolve, reject) => {
      const [leaderIndex, socketInfo] = this.getSocketInfo(key);
      const { socket } = socketInfo;
      const replicas = this.getReplicas(leaderIndex);

      const onData = (buffer: Buffer) => {
        const data = buffer.toString().trim();
        socket.off("data", onData);
        if (data === "OK") {
          console.log(
            chalk.greenBright(
              `[${new Date().toISOString()}] [INFO] SET "${key}" successful`
            )
          );
          resolve(data);
        } else if (data.startsWith("ERROR ")) {
          reject(new Error(data));
        }
      };

      this.sendCommand(socket, `SET ${key} "${escaped}" EX ${ttl}`);
      socket.on("data", onData);

      for (const replica of replicas) {
        const r = replica.value;
        console.log(
          chalk.cyanBright(
            `[${new Date().toISOString()}] [REPLICA] → Replicating SET "${key}" to ${
              r.host
            }:${r.port}`
          )
        );
        this.sendCommand(r.socket, `SET ${key} "${escaped}" EX ${ttl}`);
        r.socket.on("data", onData);
      }
    });
  }

  delete(key: string) {
    return new Promise((resolve, reject) => {
      const [leaderIndex, socketInfo] = this.getSocketInfo(key);
      const { socket } = socketInfo;
      const replicas = this.getReplicas(leaderIndex);

      const onData = (buffer: Buffer) => {
        const data = buffer.toString().trim();
        socket.off("data", onData);
        if (data === "OK") {
          console.log(
            chalk.greenBright(
              `[${new Date().toISOString()}] [INFO] DEL "${key}" successful`
            )
          );
          resolve(data);
        } else {
          reject(new Error(data));
        }
      };

      this.sendCommand(socket, `DEL ${key}`);
      socket.on("data", onData);

      for (const replica of replicas) {
        const r = replica.value;
        console.log(
          chalk.cyanBright(
            `[${new Date().toISOString()}] [REPLICA] → Replicating DEL "${key}" to ${
              r.host
            }:${r.port}`
          )
        );
        this.sendCommand(r.socket, `DEL ${key}`);
        r.socket.on("data", onData);
      }
    });
  }
}
