import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LAYOUT_DIRECTIONS, addSubgraph, applyLayout, groupNodes } from "@node-canvas/graph";
import { NodeTypeSchema, PositionSchema } from "@node-canvas/schema";
import { SERVER_ORIGIN, type DocAccess } from "../../collab/docAccess";
import { fail, ok, safely } from "../toolResult";
import { boardId } from "./shared";

const subgraphNode = z.object({
  ref: z.string().min(1).describe("Your temporary key for this node, used in edges"),
  type: NodeTypeSchema.optional().default("text"),
  label: z.string(),
  content: z.string().optional(),
  color: z.string().optional(),
  url: z.string().optional().describe("Image URL (type image)"),
  position: PositionSchema.optional(),
  parent: z.string().optional().describe("ref of a group in this call, or id of an existing group"),
});

const subgraphEdge = z.object({
  from: z.string().describe("ref from this call or existing node id"),
  to: z.string().describe("ref from this call or existing node id"),
  label: z.string().optional(),
});

/** Bulk tools: build or restructure many nodes in one call. */
export function registerGraphTools(server: McpServer, docs: DocAccess) {
  server.registerTool(
    "add_graph",
    {
      description:
        "Create many nodes and edges in one call. Edges reference node refs from this call or existing node ids. " +
        "Prefer this over repeated create_node/link_nodes. Set layout to arrange the whole board afterwards.",
      inputSchema: {
        boardId,
        nodes: z.array(subgraphNode).max(500),
        edges: z.array(subgraphEdge).max(2000).optional().default([]),
        layout: z.enum(LAYOUT_DIRECTIONS).optional().describe("Run auto_layout afterwards in this direction"),
      },
    },
    safely(async ({ boardId, nodes, edges, layout }) => {
      const result = await docs.withBoard(boardId, async (doc) => {
        const created = addSubgraph(
          doc,
          {
            nodes: nodes.map(({ ref, type, label, content, color, url, position, parent }) => ({
              ref,
              type,
              position,
              parent,
              data: { label, content, color, url },
            })),
            edges,
          },
          SERVER_ORIGIN,
        );
        if (layout) await applyLayout(doc, layout, SERVER_ORIGIN);
        return created;
      });
      return ok({ ids: result.ids, edges: result.edges.map((e) => e.id) });
    }),
  );

  server.registerTool(
    "group_nodes",
    {
      description: "Wrap existing nodes in a new group (frame) sized to fit them.",
      inputSchema: { boardId, ids: z.array(z.string()).min(1), label: z.string().optional() },
    },
    safely(async ({ boardId, ids, label }) => {
      const group = await docs.withBoard(boardId, (doc) => groupNodes(doc, ids, SERVER_ORIGIN, label));
      return group ? ok({ id: group.id }) : fail("None of the ids exist");
    }),
  );
}
