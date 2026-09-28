"use client";

import { useState } from "react";

export type ToolMode = "select" | "hand";

export function useToolMode() {
  const [tool, setTool] = useState<ToolMode>("select");
  return { tool, setTool };
}

/** React Flow props for each tool. Select: drag = box select. Hand: drag = pan. */
export function toolFlowProps(tool: ToolMode) {
  return tool === "hand"
    ? { panOnDrag: true, selectionOnDrag: false, nodesDraggable: false }
    : { panOnDrag: [1, 2], selectionOnDrag: true, nodesDraggable: true };
}
