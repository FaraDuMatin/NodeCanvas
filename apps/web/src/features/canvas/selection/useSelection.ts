"use client";

import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { getEdgesMap, getNodesMap } from "@node-canvas/graph";
import type { CanvasEdge, CanvasNode } from "@node-canvas/schema";
import { useCanvas } from "../CanvasContext";
import type { FlowEdge, FlowNode } from "../sync/flowTypes";

/** Reads and sets the current selection. Returns Y.Doc records, not React Flow nodes. */
export function useSelection() {
  const { doc } = useCanvas();
  const { getNodes, getEdges, setNodes, setEdges } = useReactFlow<FlowNode, FlowEdge>();

  const selectedNodes = useCallback((): CanvasNode[] => {
    const map = getNodesMap(doc);
    return getNodes()
      .filter((n) => n.selected)
      .flatMap((n) => map.get(n.id) ?? []);
  }, [doc, getNodes]);

  const selectedEdges = useCallback((): CanvasEdge[] => {
    const map = getEdgesMap(doc);
    return getEdges()
      .filter((e) => e.selected)
      .flatMap((e) => map.get(e.id) ?? []);
  }, [doc, getEdges]);

  const select = useCallback(
    (nodeIds: Iterable<string>) => {
      const ids = new Set(nodeIds);
      setNodes((nodes) => nodes.map((n) => (n.selected === ids.has(n.id) ? n : { ...n, selected: ids.has(n.id) })));
      setEdges((edges) => edges.map((e) => (e.selected ? { ...e, selected: false } : e)));
    },
    [setNodes, setEdges],
  );

  const selectAll = useCallback(() => select(getNodes().map((n) => n.id)), [getNodes, select]);

  return { selectedNodes, selectedEdges, select, selectAll };
}
