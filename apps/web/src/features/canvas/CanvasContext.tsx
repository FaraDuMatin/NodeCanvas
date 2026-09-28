"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import * as Y from "yjs";
import { getEdgesMap, getNodesMap } from "@node-canvas/graph";
import { LOCAL_ORIGIN, createCanvasActions, type CanvasActions } from "./actions/canvasActions";

interface CanvasContextValue {
  doc: Y.Doc;
  actions: CanvasActions;
  undoManager: Y.UndoManager;
}

const CanvasContext = createContext<CanvasContextValue | null>(null);

export function CanvasProvider({ doc, children }: { doc: Y.Doc; children: ReactNode }) {
  const actions = useMemo(() => createCanvasActions(doc), [doc]);
  const [undoManager, setUndoManager] = useState<Y.UndoManager | null>(null);

  useEffect(() => {
    const manager = new Y.UndoManager([getNodesMap(doc), getEdgesMap(doc)], {
      trackedOrigins: new Set([LOCAL_ORIGIN]),
      captureTimeout: 400,
    });
    setUndoManager(manager);
    return () => manager.destroy();
  }, [doc]);

  const value = useMemo(
    () => (undoManager ? { doc, actions, undoManager } : null),
    [doc, actions, undoManager],
  );
  if (!value) return null;
  return <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>;
}

export function useCanvas(): CanvasContextValue {
  const value = useContext(CanvasContext);
  if (!value) throw new Error("useCanvas must be used inside <CanvasProvider>");
  return value;
}
