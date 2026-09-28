"use client";

import { useCallback } from "react";
import { useReactFlow, type InternalNode, type OnNodeDrag } from "@xyflow/react";
import { useCanvas } from "../CanvasContext";
import type { FlowNode } from "../sync/flowTypes";

/** A node belongs to a group while its center is inside the group. */
function centerInside(group: InternalNode<FlowNode>, node: InternalNode<FlowNode>): boolean {
  const g = group.internals.positionAbsolute;
  const n = node.internals.positionAbsolute;
  const cx = n.x + (node.measured.width ?? 0) / 2;
  const cy = n.y + (node.measured.height ?? 0) / 2;
  return cx >= g.x && cy >= g.y && cx <= g.x + (group.measured.width ?? 0) && cy <= g.y + (group.measured.height ?? 0);
}

/** After a drag, moves nodes into the group under them, or out of the group they left. */
export function useReparentOnDrop(): OnNodeDrag<FlowNode> {
  const { actions } = useCanvas();
  const { getNodes, getInternalNode } = useReactFlow<FlowNode>();

  return useCallback(
    (_event, _node, dragged) => {
      const draggedIds = new Set(dragged.map((n) => n.id));
      // Nodes are sorted parents-first, so the last match is the innermost group.
      const groups = getNodes()
        .filter((n) => n.type === "group" && !draggedIds.has(n.id))
        .flatMap((n) => getInternalNode(n.id) ?? []);

      actions.batch(() => {
        for (const node of dragged) {
          if (node.parentId && draggedIds.has(node.parentId)) continue;
          const self = getInternalNode(node.id);
          if (!self) continue;
          const current = node.parentId ? getInternalNode(node.parentId) : undefined;
          if (current && centerInside(current, self)) continue;
          const target = groups.filter((g) => centerInside(g, self)).at(-1);
          actions.reparent(node.id, target?.id);
        }
      });
    },
    [actions, getNodes, getInternalNode],
  );
}
