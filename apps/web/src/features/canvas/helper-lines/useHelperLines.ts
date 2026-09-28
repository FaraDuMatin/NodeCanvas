"use client";

import { useCallback, useState } from "react";
import { useReactFlow, type NodeChange, type XYPosition } from "@xyflow/react";
import type { FlowNode } from "../sync/flowTypes";
import { getHelperLines } from "./getHelperLines";

const SNAP_SCREEN_PX = 6;

interface Guides {
  horizontal?: number;
  vertical?: number;
  origin?: XYPosition;
}

/**
 * Wraps onNodesChange: while a single node is dragged, snaps it to its siblings
 * and exposes the guides to draw.
 */
export function useHelperLines(nodes: FlowNode[]) {
  const { getZoom, getInternalNode } = useReactFlow<FlowNode>();
  const [guides, setGuides] = useState<Guides>({});

  const applyHelperLines = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      const [change] = changes;
      const single = changes.length === 1 && change?.type === "position" && change.dragging && change.position;
      if (!single) {
        setGuides((g) => (g.horizontal === undefined && g.vertical === undefined ? g : {}));
        return changes;
      }

      const lines = getHelperLines(change, nodes, SNAP_SCREEN_PX / getZoom());
      change.position = { ...change.position!, ...lines.snapPosition };

      const parentId = nodes.find((n) => n.id === change.id)?.parentId;
      const origin = parentId ? getInternalNode(parentId)?.internals.positionAbsolute : undefined;
      setGuides({ horizontal: lines.horizontal, vertical: lines.vertical, origin });
      return changes;
    },
    [nodes, getZoom, getInternalNode],
  );

  return { guides, applyHelperLines };
}
