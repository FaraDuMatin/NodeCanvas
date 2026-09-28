import { z } from "zod";
import { CanvasEdgeSchema, CanvasNodeSchema } from "@node-canvas/schema";
import type { GraphFragment } from "./cloneGraph";

const PREFIX = "node-canvas/fragment:";

const FragmentSchema = z.object({
  nodes: z.array(CanvasNodeSchema),
  edges: z.array(CanvasEdgeSchema),
});

export const encodeFragment = (fragment: GraphFragment) => PREFIX + JSON.stringify(fragment);

/** Parses clipboard text written by encodeFragment. Undefined if it is anything else. */
export function decodeFragment(text: string): GraphFragment | undefined {
  if (!text.startsWith(PREFIX)) return undefined;
  try {
    const parsed = FragmentSchema.safeParse(JSON.parse(text.slice(PREFIX.length)));
    return parsed.success ? parsed.data : undefined;
  } catch {
    return undefined;
  }
}
