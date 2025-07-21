import net from "net";
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

  /**
   * @param replicationFactor Replication factor. Default is 3
   */
  constructor(replicationFactor?: number) {
    this.replicationFactor = replicationFactor ?? this.replicationFactor;
  }

  private getReplicas(key: number): BSTNode<SocketInfo>[] {
    const replicas: BSTNode<SocketInfo>[] = [];
    const seenHosts = new Set<string>();

    let current = this.avlTree.getNearestLargerNode(key);
    if (!current) current = this.avlTree.getMinNode(this.avlTree.root); // wrap around if needed

    while (replicas.length < this.replicationFactor) {
      if (!current) continue;
      const { host, port } = current.value;
      const hostId = `${host}:${port}`; // Unique physical node ID

      if (!seenHosts.has(hostId)) {
        replicas.push(current);
        seenHosts.add(hostId);
      }

      current = this.avlTree.getSuccessor(current);
      if (!current) current = this.avlTree.getMinNode(this.avlTree.root); // wrap again
    }

    return replicas;
  }

  connect(host?: string, port?: number, vnodes = 100) {
    if (host === "localhost") host = "127.0.0.1";

    const PORT = port ?? 6379;
    const HOST = host ?? "127.0.0.1";
    const socket = new net.Socket();
    const ringIndices: number[] = [];
    socket.connect({ port: PORT, host: HOST }, () => {
      console.log(`[INFO] Connected to MemVault server on ${HOST}:${PORT}`);
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
    });

    socket.on("end", () => {
      console.log(`[INFO] Socket connection with ${HOST}:${PORT} closed`);
      for (const index of ringIndices) {
        this.avlTree.delete(index);
      }
      console.log("[INFO] Successfully removed all the hash rings");
    });
  }

  private getSocketInfo(key: string): [number, SocketInfo] {
    if (this.avlTree.isEmpty()) throw new Error("No cache nodes connected");
    const ringIndex = getHashRingIndex(key);
    const nearestNodeInfo = this.avlTree.getNearestLargerNode(ringIndex);
    if (!nearestNodeInfo) throw new Error("Cannot find cache nodes to connect");
    console.log(
      `[INFO] Key: ${key} has been sent to node ${nearestNodeInfo.value.host}:${nearestNodeInfo.value.port}`
    );

    return [nearestNodeInfo.key, nearestNodeInfo.value];
  }

  private sendCommand(socket: net.Socket, command: string) {
    try {
      console.log("[INFO] Sending command:", command);
      socket.write(command + "\r\n");
    } catch (error) {
      console.error("[ERROR] Cannot send command. Error:\n", error);
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
        if (data.startsWith("OK ")) {
          resolve(data.slice(3).replace(/\\/g, ""));
        } else if (data === "NOT_FOUND") {
          resolve(null);
        } else {
          reject(new Error(data));
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
      this.sendCommand(socket, `SET ${key} "${escaped}" EX ${ttl}`);
      for (const replica of replicas) {
        console.log(
          `[INFO] Replicate \`SET ${key}\` in node ${replica.value.host}:${replica.value.port}`
        );

        this.sendCommand(
          replica.value.socket,
          `SET ${key} "${escaped}" EX ${ttl}`
        );
      }
      const onData = (buffer: Buffer) => {
        const data = buffer.toString().trim();
        socket.off("data", onData);
        if (data === "OK") resolve(data);
        else reject(new Error(data));
      };
      socket.on("data", onData);
    });
  }

  delete(key: string) {
    return new Promise((resolve, reject) => {
      const [leaderIndex, socketInfo] = this.getSocketInfo(key);
      const { socket } = socketInfo;
      const replicas = this.getReplicas(leaderIndex);
      this.sendCommand(socket, `DEL ${key}`);
      for (const replica of replicas) {
        console.log(
          `[INFO] Replicate \`DEL ${key}\` in node ${replica.value.host}:${replica.value.port}`
        );
        this.sendCommand(replica.value.socket, `DEL ${key}`);
      }
      const onData = (buffer: Buffer) => {
        const data = buffer.toString().trim();
        socket.off("data", onData);
        if (data === "OK") resolve(data);
        else reject(new Error(data));
      };
      socket.on("data", onData);
    });
  }
}
