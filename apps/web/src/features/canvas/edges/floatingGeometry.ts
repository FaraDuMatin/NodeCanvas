import { Position, type InternalNode, type XYPosition } from "@xyflow/react";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const rectOf = (node: InternalNode): Rect => ({
  ...node.internals.positionAbsolute,
  width: node.measured.width ?? 0,
  height: node.measured.height ?? 0,
});

const center = (r: Rect): XYPosition => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });

/** Point where the line from `r`'s center towards `toward` leaves `r`. */
function borderPoint(r: Rect, toward: XYPosition): XYPosition {
  const c = center(r);
  const dx = toward.x - c.x;
  const dy = toward.y - c.y;
  if (dx === 0 && dy === 0) return c;
  const scale = Math.min(
    dx !== 0 ? r.width / 2 / Math.abs(dx) : Infinity,
    dy !== 0 ? r.height / 2 / Math.abs(dy) : Infinity,
  );
  return { x: c.x + dx * scale, y: c.y + dy * scale };
}

function sideOf(r: Rect, p: XYPosition): Position {
  const eps = 1;
  if (Math.abs(p.x - r.x) < eps) return Position.Left;
  if (Math.abs(p.x - (r.x + r.width)) < eps) return Position.Right;
  if (Math.abs(p.y - r.y) < eps) return Position.Top;
  return Position.Bottom;
}

/** Endpoints for an edge that attaches to the facing sides of two nodes. */
export function floatingEdgeParams(source: InternalNode, target: InternalNode) {
  const s = rectOf(source);
  const t = rectOf(target);
  const sp = borderPoint(s, center(t));
  const tp = borderPoint(t, center(s));
  return {
    sourceX: sp.x,
    sourceY: sp.y,
    sourcePosition: sideOf(s, sp),
    targetX: tp.x,
    targetY: tp.y,
    targetPosition: sideOf(t, tp),
  };
}
