"use client";

import { useCallback } from "react";
import type { XYPosition } from "@xyflow/react";
import { DEFAULT_SIZE } from "@node-canvas/graph";
import type { NodeType } from "@node-canvas/schema";
import { useCanvas } from "../CanvasContext";
import { requestAutoEdit } from "../nodes/useAutoEdit";
import { useSelection } from "../selection/useSelection";

/** Creates a node centered on `at`, selects it and opens its label for editing. */
export function useCreateNode() {
  const { actions } = useCanvas();
  const { select } = useSelection();

  return useCallback(
    (type: Exclude<NodeType, "image">, at: XYPosition) => {
      const size = DEFAULT_SIZE[type];
      const node = actions.addNode({
        type,
        data: { label: "" },
        position: { x: at.x - size.width / 2, y: at.y - size.height / 2 },
      });
      select([node.id]);
      requestAutoEdit(node.id);
      return node;
    },
    [actions, select],
  );
}
