import fs from "node:fs";
import { createCollabServer } from "./collab/createCollabServer";
import { DocAccess } from "./collab/docAccess";
import { config } from "./config";
import { createHttpApp } from "./http/createHttpApp";

fs.mkdirSync(config.dataDir, { recursive: true });

const collab = createCollabServer();
await collab.listen();

const docs = new DocAccess(collab.hocuspocus);
const app = createHttpApp(docs);
const http = app.listen(config.httpPort, config.host, () => {
  console.log(`Yjs WebSocket  ws://${config.host}:${config.wsPort}`);
  console.log(`MCP            http://${config.host}:${config.httpPort}/mcp`);
  console.log(`Uploads        http://${config.host}:${config.httpPort}/upload`);
  console.log(`Auth           ${config.authToken ? "token required" : "off"}`);
});

async function shutdown() {
  http.close();
  await collab.destroy();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
