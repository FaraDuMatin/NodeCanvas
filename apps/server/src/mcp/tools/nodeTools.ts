import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createNode, deleteNodes, updateNode } from "@node-canvas/graph";
import { NodeTypeSchema, PositionSchema } from "@node-canvas/schema";
import { SERVER_ORIGIN, type DocAccess } from "../../collab/docAccess";
import { fail, ok, safely } from "../toolResult";
import { boardId, position, size } from "./shared";

const nearNodeId = z
  .string()
  .optional()
  .describe("When position is omitted, place the new node next to this node");

export function registerNodeTools(server: McpServer, docs: DocAccess) {
  server.registerTool(
    "create_node",
    {
      description: "Create a node. Types: text (label + content), group (a frame), image (prefer add_image).",
      inputSchema: {
        boardId,
        type: NodeTypeSchema,
        label: z.string(),
        content: z.string().optional().describe("Body text (text nodes)"),
        color: z.string().optional().describe("CSS color for the node accent"),
        position,
        size,
        nearNodeId,
        parentId: z.string().optional().describe("Group node to put this node in"),
      },
    },
    safely(async ({ boardId, type, label, content, color, position, size, nearNodeId, parentId }) => {
      const node = await docs.withBoard(boardId, (doc) =>
        createNode(
          doc,
          { type, data: { label, content, color }, position, size, nearId: nearNodeId, parentId },
          SERVER_ORIGIN,
        ),
      );
      return ok(node);
    }),
  );

  server.registerTool(
    "update_node",
    {
      description: "Update a node's fields. Only given fields change.",
      inputSchema: {
        boardId,
        id: z.string(),
        fields: z.object({
          label: z.string().optional(),
          content: z.string().optional(),
          color: z.string().optional(),
          url: z.string().optional(),
          position: PositionSchema.optional(),
          width: z.number().positive().optional(),
          height: z.number().positive().optional(),
          parentId: z.string().nullable().optional().describe("null removes it from its group"),
        }),
      },
    },
    safely(async ({ boardId, id, fields }) => {
      const { label, content, color, url, ...rest } = fields;
      const node = await docs.withBoard(boardId, (doc) =>
        updateNode(doc, id, { ...rest, data: { label, content, color, url } }, SERVER_ORIGIN),
      );
      return node ? ok(node) : fail(`Node not found: ${id}`);
    }),
  );

  server.registerTool(
    "delete_node",
    {
      description: "Delete a node, its children (for groups) and its edges.",
      inputSchema: { boardId, id: z.string() },
    },
    safely(async ({ boardId, id }) => {
      const deleted = await docs.withBoard(boardId, (doc) => deleteNodes(doc, [id], SERVER_ORIGIN));
      return deleted.length ? ok({ deleted }) : fail(`Node not found: ${id}`);
    }),
  );

  server.registerTool(
    "add_image",
    {
      description: "Add an image node from a URL.",
      inputSchema: { boardId, url: z.url(), label: z.string().optional(), position, size, nearNodeId },
    },
    safely(async ({ boardId, url, label, position, size, nearNodeId }) => {
      const node = await docs.withBoard(boardId, (doc) =>
        createNode(
          doc,
          { type: "image", data: { label: label ?? "", url }, position, size, nearId: nearNodeId },
          SERVER_ORIGIN,
        ),
      );
      return ok(node);
    }),
  );
}
