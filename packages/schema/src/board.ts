import { z } from "zod";

export const BoardSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(200),
  createdAt: z.number(),
});
export type Board = z.infer<typeof BoardSchema>;

/** Name of the Y.Doc that holds the list of boards. */
export const BOARDS_DOC = "__boards__";

/** Name of the Y.Doc that holds one board's graph. */
export const boardDocName = (boardId: string) => `board:${boardId}`;
