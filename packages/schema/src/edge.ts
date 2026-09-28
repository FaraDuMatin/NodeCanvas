import { z } from "zod";

/** An edge as stored in the Y.Doc. */
export const CanvasEdgeSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  target: z.string().min(1),
  sourceHandle: z.string().nullable().optional(),
  targetHandle: z.string().nullable().optional(),
  label: z.string().optional(),
});
export type CanvasEdge = z.infer<typeof CanvasEdgeSchema>;
