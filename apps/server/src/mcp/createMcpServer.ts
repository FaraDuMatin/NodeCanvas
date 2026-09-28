import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DocAccess } from "../collab/docAccess";
import { registerBoardTools } from "./tools/boardTools";
import { registerEdgeTools } from "./tools/edgeTools";
import { registerGraphTools } from "./tools/graphTools";
import { registerLayoutTools } from "./tools/layoutTools";
import { registerNodeTools } from "./tools/nodeTools";

export function createMcpServer(docs: DocAccess): McpServer {
  const server = new McpServer(
    { name: "node-canvas", version: "0.1.0" },
    {
      instructions:
        "Edit a live node canvas. Start with list_boards, then list_graph. " +
        "Use add_graph to build many nodes at once. " +
        "Changes appear instantly in the user's browser.",
    },
  );
  registerBoardTools(server, docs);
  registerNodeTools(server, docs);
  registerEdgeTools(server, docs);
  registerGraphTools(server, docs);
  registerLayoutTools(server, docs);
  return server;
}
