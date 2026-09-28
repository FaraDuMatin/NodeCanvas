import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createBoard, listBoards, snapshot } from "@node-canvas/graph";
import type { DocAccess } from "../../collab/docAccess";
import { ok, safely } from "../toolResult";
import { boardId } from "./shared";

export function registerBoardTools(server: McpServer, docs: DocAccess) {
  server.registerTool(
    "list_boards",
    { description: "List all boards (canvases). Every other tool needs a boardId from here." },
    safely(async () => ok(await docs.withBoards(listBoards))),
  );

  server.registerTool(
    "create_board",
    {
      description: "Create a new empty board.",
      inputSchema: { name: z.string().min(1).max(200) },
    },
    safely(async ({ name }) => ok(await docs.withBoards((doc) => createBoard(doc, name)))),
  );

  server.registerTool(
    "list_graph",
    {
      description:
        "Get every node and edge on a board. Positions of nodes with a parentId are relative to the parent group.",
      inputSchema: { boardId },
    },
    safely(async ({ boardId }) => ok(await docs.withBoard(boardId, snapshot))),
  );
}
