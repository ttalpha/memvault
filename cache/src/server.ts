import net from "net";
import { parseCommand } from "./parse-command";
import { LRUCache } from "./lru";
import chalk from "chalk";

export default class CacheServer {
  private lruCache = new LRUCache(5);
  private server: net.Server | null = null;

  private port = 6379;
  private host = "0.0.0.0"; // allow the client to connect to Docker containers (NOT 127.0.0.1)

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
        chalk.greenBright(
          `[${new Date().toISOString()}] [INFO] Client connected from ${
            socket.remoteAddress
          }:${socket.remotePort}`
        )
      );

      socket.on("data", (buffer) => {
        const command = buffer.toString().trim();
        const parsed = parseCommand(command);
        switch (parsed.type) {
          case "GET":
            const getValue = this.get(parsed.key);
            console.log(
              chalk.greenBright(
                `[${new Date().toISOString()}] [INFO] GET ${parsed.key}`
              )
            );
            socket.write(getValue + "\r\n");
            break;
          case "PING":
            socket.write("PONG\r\n");
            break;
          case "SET":
            const setResult = this.set(parsed.key, parsed.value, parsed.ttl);
            console.log(
              chalk.greenBright(
                `[${new Date().toISOString()}] [INFO] SET ${parsed.key} ${
                  parsed.value
                } EX ${parsed.ttl}`
              )
            );
            socket.write(setResult + "\r\n");
            break;
          case "DELETE":
            const delResult = this.delete(parsed.key);
            console.log(
              chalk.greenBright(
                `[${new Date().toISOString()}] [INFO] DEL ${parsed.key}`
              )
            );
            socket.write(delResult + "\r\n");
            break;
          default:
            console.error(
              chalk.redBright(
                `[${new Date().toISOString()}] [ERROR] Unknown command: ${
                  parsed.original
                }`
              )
            );
        }
        console.log(
          chalk.greenBright(
            `[${new Date().toISOString()}] [INFO] Received from client: ${command}`
          )
        );
      });
    });
    this.end();
    this.onError();
  }

  listen(port?: number, host?: string) {
    const PORT = port ?? this.port;
    const HOST = host ?? this.host;
    this.server?.listen(PORT, HOST, () => {
      console.log(
        chalk.greenBright(
          `[${new Date().toISOString()}] [INFO] MemVault Server listening on ${HOST}:${PORT}`
        )
      );
    });
  }

  private end() {
    this.server?.on("close", () => {
      console.log(
        chalk.blueBright(
          `[${new Date().toISOString()}] [INFO] MemVault Server connection closed`
        )
      );
    });
  }

  private onError() {
    this.server?.on("error", (err) => {
      console.error(
        chalk.redBright(
          `[${new Date().toISOString()}] [ERROR] MemVault Server error: ${
            err.message
          }`
        )
      );
    });
  }
}
