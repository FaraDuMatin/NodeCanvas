import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { LAYOUT_DIRECTIONS, applyLayout } from "@node-canvas/graph";
import { SERVER_ORIGIN, type DocAccess } from "../../collab/docAccess";
import { ok, safely } from "../toolResult";
import { boardId } from "./shared";

export function registerLayoutTools(server: McpServer, docs: DocAccess) {
  server.registerTool(
    "auto_layout",
    {
      description: "Arrange all top-level nodes of a board following the edges (ELK layered).",
      inputSchema: { boardId, direction: z.enum(LAYOUT_DIRECTIONS).optional().default("RIGHT") },
    },
    safely(async ({ boardId, direction }) => {
      const moved = await docs.withBoard(boardId, (doc) => applyLayout(doc, direction, SERVER_ORIGIN));
      return ok({ moved });
    }),
  );
}
