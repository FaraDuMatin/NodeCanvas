import type { Position, Size } from "@node-canvas/schema";
import { GAP } from "./defaults";
import type { NodesMap } from "./doc";
import { absoluteRect, rectsOverlap, type Rect } from "./geometry";

const topLevelRects = (nodes: NodesMap): Rect[] =>
  [...nodes.values()].filter((n) => !n.parentId).map((n) => absoluteRect(nodes, n));

const isFree = (candidate: Rect, taken: Rect[]) =>
  !taken.some((r) => rectsOverlap(candidate, r, GAP / 2));

/**
 * Finds a free spot for a new node.
 * Near `nearId` if given (right, below, left, above, then spiralling out),
 * otherwise to the right of everything on the canvas.
 */
export function findFreePosition(nodes: NodesMap, size: Size, nearId?: string): Position {
  const taken = topLevelRects(nodes);
  const near = nearId ? nodes.get(nearId) : undefined;

  if (!near) {
    if (taken.length === 0) return { x: 0, y: 0 };
    const maxX = Math.max(...taken.map((r) => r.x + r.width));
    const minY = Math.min(...taken.map((r) => r.y));
    return { x: maxX + GAP, y: minY };
  }

  const anchor = absoluteRect(nodes, near);
  for (let ring = 1; ring <= 20; ring++) {
    const dx = (anchor.width + GAP) * ring;
    const dy = (anchor.height + GAP) * ring;
    const candidates: Position[] = [
      { x: anchor.x + dx, y: anchor.y },
      { x: anchor.x, y: anchor.y + dy },
      { x: anchor.x - (size.width + GAP) * ring, y: anchor.y },
      { x: anchor.x, y: anchor.y - (size.height + GAP) * ring },
      { x: anchor.x + dx, y: anchor.y + dy },
    ];
    const free = candidates.find((p) => isFree({ ...p, ...size }, taken));
    if (free) return free;
  }
  return { x: anchor.x + anchor.width + GAP, y: anchor.y };
}
