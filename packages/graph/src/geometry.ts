import type { CanvasNode, Position, Size } from "@node-canvas/schema";
import { DEFAULT_SIZE } from "./defaults";
import type { NodesMap } from "./doc";

export interface Rect extends Position, Size {}

export const sizeOf = (node: CanvasNode): Size => ({
  width: node.width ?? DEFAULT_SIZE[node.type].width,
  height: node.height ?? DEFAULT_SIZE[node.type].height,
});

/** Position in canvas space, resolving parent (group) offsets. */
export function absolutePosition(nodes: NodesMap, node: CanvasNode): Position {
  let { x, y } = node.position;
  let parentId = node.parentId;
  const seen = new Set<string>([node.id]);
  while (parentId && !seen.has(parentId)) {
    seen.add(parentId);
    const parent = nodes.get(parentId);
    if (!parent) break;
    x += parent.position.x;
    y += parent.position.y;
    parentId = parent.parentId;
  }
  return { x, y };
}

export const absoluteRect = (nodes: NodesMap, node: CanvasNode): Rect => ({
  ...absolutePosition(nodes, node),
  ...sizeOf(node),
});

export const rectsOverlap = (a: Rect, b: Rect, margin = 0): boolean =>
  a.x < b.x + b.width + margin &&
  a.x + a.width + margin > b.x &&
  a.y < b.y + b.height + margin &&
  a.y + a.height + margin > b.y;
