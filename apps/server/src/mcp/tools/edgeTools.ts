import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { deleteEdges, linkNodes } from "@node-canvas/graph";
import { SERVER_ORIGIN, type DocAccess } from "../../collab/docAccess";
import { fail, ok, safely } from "../toolResult";
import { boardId } from "./shared";

export function registerEdgeTools(server: McpServer, docs: DocAccess) {
  server.registerTool(
    "link_nodes",
    {
      description: "Connect two nodes with a directed edge.",
      inputSchema: {
        boardId,
        sourceId: z.string(),
        targetId: z.string(),
        label: z.string().optional(),
      },
    },
    safely(async ({ boardId, sourceId, targetId, label }) => {
      const edge = await docs.withBoard(boardId, (doc) =>
        linkNodes(doc, { source: sourceId, target: targetId, label }, SERVER_ORIGIN),
      );
      return ok(edge);
    }),
  );

  server.registerTool(
    "unlink",
    {
      description: "Delete an edge.",
      inputSchema: { boardId, edgeId: z.string() },
    },
    safely(async ({ boardId, edgeId }) => {
      const deleted = await docs.withBoard(boardId, (doc) => deleteEdges(doc, [edgeId], SERVER_ORIGIN));
      return deleted.length ? ok({ deleted }) : fail(`Edge not found: ${edgeId}`);
    }),
  );
}
