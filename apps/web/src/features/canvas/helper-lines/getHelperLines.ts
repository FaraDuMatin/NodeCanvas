import type { NodePositionChange, XYPosition } from "@xyflow/react";
import type { FlowNode } from "../sync/flowTypes";

export interface HelperLines {
  /** Canvas-space y of a horizontal guide. */
  horizontal?: number;
  /** Canvas-space x of a vertical guide. */
  vertical?: number;
  /** Position adjusted to snap onto the guides. */
  snapPosition: Partial<XYPosition>;
}

interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
}

const boxOf = (position: XYPosition, node: FlowNode): Box => {
  const width = node.measured?.width ?? node.width ?? 0;
  const height = node.measured?.height ?? node.height ?? 0;
  return {
    left: position.x,
    right: position.x + width,
    top: position.y,
    bottom: position.y + height,
    centerX: position.x + width / 2,
    centerY: position.y + height / 2,
    width,
    height,
  };
};

type Edge = "left" | "right" | "centerX" | "top" | "bottom" | "centerY";
const X_PAIRS: [Edge, Edge][] = [
  ["left", "left"], ["right", "right"], ["left", "right"], ["right", "left"], ["centerX", "centerX"],
];
const Y_PAIRS: [Edge, Edge][] = [
  ["top", "top"], ["bottom", "bottom"], ["top", "bottom"], ["bottom", "top"], ["centerY", "centerY"],
];

/** Offset from the dragged box's `from` edge to its left/top. */
const offset = (edge: Edge, box: Box) =>
  edge === "right" ? box.width : edge === "bottom" ? box.height : edge === "centerX" ? box.width / 2 : edge === "centerY" ? box.height / 2 : 0;

/**
 * Finds the closest alignment between a dragged node and its siblings.
 * Only siblings (same parent) are compared, so positions share one coordinate space.
 */
export function getHelperLines(change: NodePositionChange, nodes: FlowNode[], threshold: number): HelperLines {
  const result: HelperLines = { snapPosition: {} };
  const dragged = nodes.find((n) => n.id === change.id);
  if (!dragged || !change.position) return result;

  const a = boxOf(change.position, dragged);
  let bestX = threshold;
  let bestY = threshold;

  for (const node of nodes) {
    if (node.id === dragged.id || node.parentId !== dragged.parentId) continue;
    const b = boxOf(node.position, node);

    for (const [from, to] of X_PAIRS) {
      const distance = Math.abs(a[from] - b[to]);
      if (distance < bestX) {
        bestX = distance;
        result.vertical = b[to];
        result.snapPosition.x = b[to] - offset(from, a);
      }
    }
    for (const [from, to] of Y_PAIRS) {
      const distance = Math.abs(a[from] - b[to]);
      if (distance < bestY) {
        bestY = distance;
        result.horizontal = b[to];
        result.snapPosition.y = b[to] - offset(from, a);
      }
    }
  }
  return result;
}
