import { CacheServer } from "./server";

const PORT = +(process.env.MEMVAULT_PORT || 6379); // Default if not set
const HOST = process.env.MEMVAULT_HOST || "0.0.0.0"; // Default if not set

const cacheServer = new CacheServer();
cacheServer.initServer();
cacheServer.listen(PORT, HOST);
