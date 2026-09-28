"use client";

import { useCallback } from "react";
import { useReactFlow, useStoreApi, type XYPosition } from "@xyflow/react";

/** Canvas-space point at the center of the visible area. */
export function useViewportCenter() {
  const store = useStoreApi();
  const { screenToFlowPosition } = useReactFlow();

  return useCallback((): XYPosition => {
    const rect = store.getState().domNode?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  }, [store, screenToFlowPosition]);
}
