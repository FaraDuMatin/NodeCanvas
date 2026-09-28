import type { NodeType, Size } from "@node-canvas/schema";

export const DEFAULT_SIZE: Record<NodeType, Size> = {
  text: { width: 240, height: 120 },
  image: { width: 320, height: 240 },
  group: { width: 480, height: 320 },
};

/** Space between auto-placed nodes. */
export const GAP = 80;

/** Space between a group's border and its children. */
export const GROUP_PADDING = 32;
