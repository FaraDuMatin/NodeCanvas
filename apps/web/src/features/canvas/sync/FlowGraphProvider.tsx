"use client";

import { createContext, useContext, useMemo, type Dispatch, type ReactNode, type SetStateAction } from "react";
import type { FlowEdge, FlowNode } from "./flowTypes";
import { useFlowGraph } from "./useFlowGraph";

type FlowGraph = ReturnType<typeof useFlowGraph>;

interface FlowSetters {
  setNodes: Dispatch<SetStateAction<FlowNode[]>>;
  setEdges: Dispatch<SetStateAction<FlowEdge[]>>;
}

const GraphContext = createContext<FlowGraph | null>(null);
/** Stable setters, split out so their users don't re-render on every graph change. */
const SettersContext = createContext<FlowSetters | null>(null);

/** Owns React Flow's local node/edge state (see useFlowGraph). */
export function FlowGraphProvider({ children }: { children: ReactNode }) {
  const graph = useFlowGraph();
  const { setNodes, setEdges } = graph;
  const setters = useMemo(() => ({ setNodes, setEdges }), [setNodes, setEdges]);

  return (
    <SettersContext.Provider value={setters}>
      <GraphContext.Provider value={graph}>{children}</GraphContext.Provider>
    </SettersContext.Provider>
  );
}

export function useGraphState(): FlowGraph {
  const value = useContext(GraphContext);
  if (!value) throw new Error("useGraphState must be used inside <FlowGraphProvider>");
  return value;
}

/**
 * Setters for local flow state. Unlike React Flow's setNodes, updates queue after
 * pending Y.Doc syncs, so selecting a node right after creating it works.
 */
export function useFlowSetters(): FlowSetters {
  const value = useContext(SettersContext);
  if (!value) throw new Error("useFlowSetters must be used inside <FlowGraphProvider>");
  return value;
}
