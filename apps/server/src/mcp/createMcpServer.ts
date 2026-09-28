import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocAccess } from "../collab/docAccess";
import { registerBoardTools } from "./tools/boardTools";
import { registerEdgeTools } from "./tools/edgeTools";
import { registerLayoutTools } from "./tools/layoutTools";
import { registerNodeTools } from "./tools/nodeTools";

export function createMcpServer(docs: DocAccess): McpServer {
  const server = new McpServer(
    { name: "node-canvas", version: "0.1.0" },
    {
      instructions:
        "Edit a live node canvas. Start with list_boards, then list_graph. " +
        "Changes appear instantly in the user's browser.",
    },
  );
  registerBoardTools(server, docs);
  registerNodeTools(server, docs);
  registerEdgeTools(server, docs);
  registerLayoutTools(server, docs);
  return server;
}
