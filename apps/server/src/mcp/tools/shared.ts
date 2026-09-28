import { z } from "zod";
import { PositionSchema, SizeSchema } from "@node-canvas/schema";

/** Zod fragments reused across tool input schemas. */
export const boardId = z.string().min(1).describe("Board id from list_boards");
export const position = PositionSchema.optional().describe(
  "Canvas position (top-left). Omit to place automatically.",
);
export const size = SizeSchema.partial().optional().describe("Width/height in pixels");
