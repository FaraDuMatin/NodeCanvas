import { MarkerType } from "@xyflow/react";
import type { CanvasEdge, CanvasNode } from "@node-canvas/schema";
import type { FlowEdge, FlowNode } from "./flowTypes";

/** Fields React Flow owns locally. They never go into the Y.Doc. */
type Transient = Pick<FlowNode, "selected" | "dragging" | "resizing" | "measured">;

const transientOf = (node?: FlowNode): Transient =>
  node
    ? { selected: node.selected, dragging: node.dragging, resizing: node.resizing, measured: node.measured }
    : {};

export function toFlowNode(node: CanvasNode, prev?: FlowNode): FlowNode {
  return {
    ...transientOf(prev),
    id: node.id,
    type: node.type,
    position: node.position,
    width: node.width,
    height: node.height,
    parentId: node.parentId,
    zIndex: node.zIndex ?? (node.type === "group" ? -1 : undefined),
    data: node.data,
  } as FlowNode;
}

const ARROW = { type: MarkerType.ArrowClosed, width: 16, height: 16 };

export function toFlowEdge(edge: CanvasEdge, prev?: FlowEdge): FlowEdge {
  return {
    id: edge.id,
    type: "labeled",
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle ?? null,
    targetHandle: edge.targetHandle ?? null,
    data: { label: edge.label },
    markerEnd: ARROW,
    selected: prev?.selected,
  };
}

/** React Flow requires parents to come before their children. */
export function sortParentsFirst(nodes: CanvasNode[]): CanvasNode[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const depth = (n: CanvasNode): number => {
    let d = 0;
    let parentId = n.parentId;
    while (parentId && d < 32) {
      d++;
      parentId = byId.get(parentId)?.parentId;
    }
    return d;
  };
  return nodes
    .map((n) => ({ n, d: depth(n) }))
    .sort((a, b) => a.d - b.d)
    .map(({ n }) => n);
}
