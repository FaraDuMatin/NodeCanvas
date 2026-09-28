"use client";

import { useCallback, useEffect, useState } from "react";
import {
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import { getEdgesMap, getNodesMap } from "@node-canvas/graph";
import type { NodePatch } from "@node-canvas/schema";
import { useCanvas } from "../CanvasContext";
import type { FlowEdge, FlowNode } from "./flowTypes";
import { sortParentsFirst, toFlowEdge, toFlowNode } from "./toFlow";

/**
 * Bridges the Y.Doc and React Flow.
 * Y.Doc = persistent fields. Local state adds transient ones (selection, measuring).
 */
export function useFlowGraph() {
  const { doc, actions } = useCanvas();
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);

  useEffect(() => {
    const nodesMap = getNodesMap(doc);
    const edgesMap = getEdgesMap(doc);

    const syncNodes = () =>
      setNodes((prev) => {
        const prevById = new Map(prev.map((n) => [n.id, n]));
        const all = [...nodesMap.values()];
        const ids = new Set(all.map((n) => n.id));
        return sortParentsFirst(all).map((n) => {
          const orphan = n.parentId && !ids.has(n.parentId);
          return toFlowNode(orphan ? { ...n, parentId: undefined } : n, prevById.get(n.id));
        });
      });

    const syncEdges = () =>
      setEdges((prev) => {
        const prevById = new Map(prev.map((e) => [e.id, e]));
        return [...edgesMap.values()].map((e) => toFlowEdge(e, prevById.get(e.id)));
      });

    syncNodes();
    syncEdges();
    nodesMap.observe(syncNodes);
    edgesMap.observe(syncEdges);
    return () => {
      nodesMap.unobserve(syncNodes);
      edgesMap.unobserve(syncEdges);
    };
  }, [doc]);

  const onNodesChange = useCallback(
    (changes: NodeChange<FlowNode>[]) => {
      setNodes((prev) => applyNodeChanges(changes, prev));
      const removed: string[] = [];
      actions.batch(() => {
        for (const change of changes) {
          if (change.type === "add") continue;
          const patch = persistentPatch(change);
          if (patch) actions.updateNode(change.id, patch);
          if (change.type === "remove") removed.push(change.id);
        }
        if (removed.length) actions.deleteNodes(removed);
      });
    },
    [actions],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange<FlowEdge>[]) => {
      setEdges((prev) => applyEdgeChanges(changes, prev));
      const removed = changes.filter((c) => c.type === "remove").map((c) => c.id);
      if (removed.length) actions.deleteEdges(removed);
    },
    [actions],
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      if (connection.source === connection.target) return;
      actions.link(connection);
    },
    [actions],
  );

  /** A drag is its own undo step, even right after another edit. */
  const onNodeDragStart = actions.newStep;

  return { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect, onNodeDragStart };
}

/** The part of a React Flow change that belongs in the Y.Doc, if any. */
function persistentPatch(change: NodeChange<FlowNode>): NodePatch | undefined {
  if (change.type === "position" && change.position) {
    return { position: change.position };
  }
  if (change.type === "dimensions" && change.resizing !== undefined && change.dimensions) {
    return { width: change.dimensions.width, height: change.dimensions.height };
  }
  return undefined;
}
