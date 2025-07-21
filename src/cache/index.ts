import CacheServer from "./server";

const servers: CacheServer[] = [];

for (let port = 6379; port <= 6388; port++) {
  const cacheServer = new CacheServer();
  cacheServer.initServer();
  cacheServer.listen(port);
  servers.push(cacheServer);
}
