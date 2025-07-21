import net from "net";
import { parseCommand } from "./parse-command";
import { LRUCache } from "./lru";

export default class CacheServer {
  private lruCache = new LRUCache(5);
  private server: net.Server | null = null;

  private port = 6379;
  private host = "127.0.0.1";

  private get(key: string) {
    try {
      const value = this.lruCache.get(key);
      if (!value) return "NOT_FOUND";
      return `OK ${value}`;
    } catch (error) {
      return `ERROR ${error}`;
    }
  }

  private set(key: string, value: string, ttl = 120) {
    try {
      this.lruCache.set(key, value, ttl);
      return "OK";
    } catch (error) {
      return `ERROR ${error}`;
    }
  }

  private delete(key: string) {
    try {
      this.lruCache.delete(key);
      return "OK";
    } catch (error) {
      return `ERROR ${error}`;
    }
  }

  initServer() {
    this.server = net.createServer((socket) => {
      console.log(
        `Client connected from ${socket.remoteAddress}:${socket.remotePort}`
      );

      socket.on("data", (buffer) => {
        const command = buffer.toString().trim();
        const parsed = parseCommand(command);
        switch (parsed.type) {
          case "GET":
            const getValue = this.get(parsed.key);
            socket.write(getValue);
            break;
          case "SET":
            const setResult = this.set(parsed.key, parsed.value, parsed.ttl);
            socket.write(setResult);
            break;
          case "DELETE":
            const delResult = this.delete(parsed.key);
            socket.write(delResult);
            break;
          default:
            console.error("[ERROR] Unknown command:", parsed.original);
        }
        console.log(`Received from client: ${command}`);
      });
    });
  }

  listen(port?: number, host?: string) {
    const PORT = port ?? this.port;
    const HOST = host ?? this.host;
    this.server?.listen(PORT, HOST, () => {
      console.log(`MemVault Server listening on ${HOST}:${PORT}`);
    });
  }

  end() {
    this.server?.on("close", () => {
      console.log("MemVault Server connection closed");
    });
  }

  onError() {
    this.server?.on("error", (err) => {
      console.error(`MemVault Server error: ${err.message}`);
    });
  }
}
