"use client";

import { useCallback } from "react";
import { useReactFlow, type OnConnectEnd } from "@xyflow/react";
import { useCanvas } from "../CanvasContext";
import { useCreateNode } from "../commands/useCreateNode";

/** Dropping a connection on empty canvas creates a linked text node there. */
export function useConnectToCreate(): OnConnectEnd {
  const { actions } = useCanvas();
  const { screenToFlowPosition } = useReactFlow();
  const createNode = useCreateNode();

  return useCallback(
    (event, state) => {
      if (state.isValid || !state.fromNode) return;
      const target = event.target as Element | null;
      if (!target?.classList.contains("react-flow__pane")) return;

      const { clientX, clientY } = "changedTouches" in event ? event.changedTouches[0]! : event;
      const fromId = state.fromNode.id;
      actions.batch(() => {
        const node = createNode("text", screenToFlowPosition({ x: clientX, y: clientY }));
        actions.link({ source: fromId, target: node.id, sourceHandle: state.fromHandle?.id });
      });
    },
    [actions, createNode, screenToFlowPosition],
  );
}
