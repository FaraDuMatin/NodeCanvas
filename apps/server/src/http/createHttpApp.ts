import cors from "cors";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import type { DocAccess } from "../collab/docAccess";
import { config } from "../config";
import { createMcpRouter } from "../mcp/mcpRoute";
import { createUploadRouter } from "./uploadRoute";

export function createHttpApp(docs: DocAccess) {
  const app = createMcpExpressApp({ host: config.host });
  app.use(cors({ origin: config.corsOrigin, exposedHeaders: ["Mcp-Session-Id"] }));
  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });
  app.use(createUploadRouter());
  app.use(createMcpRouter(docs));
  return app;
}
