import { z } from "zod";
import { PositionSchema } from "./geometry";

export const NODE_TYPES = ["text", "image", "group"] as const;
export const NodeTypeSchema = z.enum(NODE_TYPES);
export type NodeType = z.infer<typeof NodeTypeSchema>;

export const NodeDataSchema = z.object({
  label: z.string().default(""),
  content: z.string().optional(),
  url: z.string().optional(),
  color: z.string().optional(),
  /** Image nodes: natural width / height, filled in once the image loads. */
  aspectRatio: z.number().positive().optional(),
});
export type NodeData = z.infer<typeof NodeDataSchema>;

/** A node as stored in the Y.Doc. */
export const CanvasNodeSchema = z.object({
  id: z.string().min(1),
  type: NodeTypeSchema,
  position: PositionSchema,
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  parentId: z.string().optional(),
  zIndex: z.number().optional(),
  data: NodeDataSchema,
});
export type CanvasNode = z.infer<typeof CanvasNodeSchema>;

/** Fields a client may patch on an existing node. */
export const NodePatchSchema = z.object({
  position: PositionSchema.optional(),
  width: z.number().positive().optional(),
  height: z.number().positive().optional(),
  parentId: z.string().nullable().optional(),
  zIndex: z.number().optional(),
  data: NodeDataSchema.partial().optional(),
});
export type NodePatch = z.infer<typeof NodePatchSchema>;
