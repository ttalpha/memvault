import net from "net";
import { AVLTree } from "./avl";
import { getHashRingIndex } from "./hash";

interface SocketInfo {
  socket: net.Socket;
  vnode: number;
  host: string;
  port: number;
}

export default class CacheClient {
  private avlTree = new AVLTree<SocketInfo>();

  connect(host?: string, port?: number, vnodes = 100) {
    if (host === "localhost") host = "127.0.0.1";

    const PORT = port ?? 6379;
    const HOST = host ?? "127.0.0.1";
    const socket = new net.Socket();
    socket.connect({ port: PORT, host: HOST }, () => {
      console.log(`[INFO] Connected to MemVault server on ${HOST}:${PORT}`);
    });

    const ringIndices: number[] = [];
    for (let i = 0; i < vnodes; i++) {
      const ringIndex = getHashRingIndex(`${HOST}:${PORT}-${i}`);
      this.avlTree.set(ringIndex, { socket, vnode: i, host: HOST, port: PORT });
      ringIndices.push(ringIndex);
    }

    socket.on("end", () => {
      console.log(`[INFO] Socket connection with ${HOST}:${PORT} closed`);
      for (const index of ringIndices) {
        this.avlTree.delete(index);
      }
      console.log("[INFO] Successfully removed all the hash rings");
    });
  }

  private getSocket(key: string): net.Socket {
    if (this.avlTree.isEmpty()) throw new Error("No cache nodes connected");
    const ringIndex = getHashRingIndex(key);
    const nearestNodeInfo = this.avlTree.getNearestLargerNode(ringIndex);
    if (!nearestNodeInfo) throw new Error("Cannot find cache nodes to connect");
    console.log(
      `[INFO] Key: ${key} has been sent to node ${nearestNodeInfo.value.host}:${nearestNodeInfo.value.port}`
    );

    return nearestNodeInfo.value.socket;
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
      const socket = this.getSocket(key);
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
      const socket = this.getSocket(key);
      this.sendCommand(socket, `SET ${key} "${escaped}" EX ${ttl}`);
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
      const socket = this.getSocket(key);
      this.sendCommand(socket, `DEL ${key}`);
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
