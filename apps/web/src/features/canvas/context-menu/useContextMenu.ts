"use client";

import { useCallback, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useReactFlow } from "@xyflow/react";
import { useSelection } from "../selection/useSelection";
import type { FlowEdge, FlowNode } from "../sync/flowTypes";
import type { MenuState, MenuTarget } from "./types";

/** Right-click handlers for React Flow. Right-clicking an unselected node selects it first. */
export function useContextMenu() {
  const [menu, setMenu] = useState<MenuState | null>(null);
  const { screenToFlowPosition, setEdges } = useReactFlow<FlowNode, FlowEdge>();
  const { select } = useSelection();

  const open = useCallback(
    (event: ReactMouseEvent | MouseEvent, target: MenuTarget) => {
      event.preventDefault();
      const screen = { x: event.clientX, y: event.clientY };
      setMenu({ target, screen, flow: screenToFlowPosition(screen) });
    },
    [screenToFlowPosition],
  );

  const onNodeContextMenu = useCallback(
    (event: ReactMouseEvent, node: FlowNode) => {
      if (!node.selected) select([node.id]);
      open(event, { kind: "node", id: node.id });
    },
    [open, select],
  );

  const onEdgeContextMenu = useCallback(
    (event: ReactMouseEvent, edge: FlowEdge) => {
      select([]);
      setEdges((edges) => edges.map((e) => ({ ...e, selected: e.id === edge.id })));
      open(event, { kind: "edge", id: edge.id });
    },
    [open, select, setEdges],
  );

  const onPaneContextMenu = useCallback((event: ReactMouseEvent | MouseEvent) => open(event, { kind: "pane" }), [open]);
  const onSelectionContextMenu = useCallback((event: ReactMouseEvent) => open(event, { kind: "selection" }), [open]);
  const close = useCallback(() => setMenu(null), []);

  return { menu, close, onNodeContextMenu, onEdgeContextMenu, onPaneContextMenu, onSelectionContextMenu };
}
