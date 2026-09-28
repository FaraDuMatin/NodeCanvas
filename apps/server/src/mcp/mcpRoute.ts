import { Router } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { DocAccess } from "../collab/docAccess";
import { requireToken } from "../http/requireToken";
import { createMcpServer } from "./createMcpServer";

const methodNotAllowed = {
  jsonrpc: "2.0",
  error: { code: -32000, message: "Method not allowed." },
  id: null,
};

/** Stateless Streamable HTTP: one MCP server + transport per request. */
export function createMcpRouter(docs: DocAccess): Router {
  const router = Router();

  router.post("/mcp", requireToken, async (req, res) => {
    const server = createMcpServer(docs);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    res.on("close", () => {
      void transport.close();
      void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  router.all("/mcp", (_req, res) => {
    res.status(405).json(methodNotAllowed);
  });

  return router;
}
