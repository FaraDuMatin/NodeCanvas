"use client";

import { useCallback, useEffect, useState } from "react";
import { useCanvas } from "../CanvasContext";

/** Undo/redo over local edits, with live availability flags. */
export function useHistory() {
  const { undoManager } = useCanvas();
  const [state, setState] = useState({ canUndo: false, canRedo: false });

  useEffect(() => {
    const update = () => setState({ canUndo: undoManager.canUndo(), canRedo: undoManager.canRedo() });
    update();
    undoManager.on("stack-item-added", update);
    undoManager.on("stack-item-popped", update);
    undoManager.on("stack-cleared", update);
    return () => {
      undoManager.off("stack-item-added", update);
      undoManager.off("stack-item-popped", update);
      undoManager.off("stack-cleared", update);
    };
  }, [undoManager]);

  const undo = useCallback(() => undoManager.undo(), [undoManager]);
  const redo = useCallback(() => undoManager.redo(), [undoManager]);

  return { ...state, undo, redo };
}
