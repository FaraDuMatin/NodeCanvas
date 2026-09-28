"use client";

import { useCallback, useMemo } from "react";
import { useReactFlow, type XYPosition } from "@xyflow/react";
import { getNodesMap, type LayoutDirection } from "@node-canvas/graph";
import { useCanvas } from "../CanvasContext";
import { useClipboard } from "../clipboard/useClipboard";
import { useHistory } from "../history/useHistory";
import { pickImageFiles } from "../images/pickImageFiles";
import { useInsertImages } from "../images/useInsertImages";
import { useSelection } from "../selection/useSelection";
import type { ToolMode } from "../tools/useToolMode";
import { useViewportCenter } from "../viewport/useViewportCenter";
import { useCreateNode } from "./useCreateNode";
import { useGroupCommands } from "./useGroupCommands";

/**
 * Every user-facing canvas command in one place.
 * Shared by the toolbar, keyboard shortcuts and context menu. Call once per canvas.
 */
export function useCanvasCommands(setTool: (tool: ToolMode) => void) {
  const { doc, actions } = useCanvas();
  const history = useHistory();
  const { duplicate } = useClipboard();
  const { group, ungroup } = useGroupCommands();
  const { selectedNodes, selectedEdges, select, selectAll } = useSelection();
  const createNode = useCreateNode();
  const insertImages = useInsertImages();
  const viewportCenter = useViewportCenter();
  const { fitView } = useReactFlow();

  const addText = useCallback((at?: XYPosition) => createNode("text", at ?? viewportCenter()), [createNode, viewportCenter]);
  const addGroup = useCallback((at?: XYPosition) => createNode("group", at ?? viewportCenter()), [createNode, viewportCenter]);

  const addImages = useCallback(
    async (at?: XYPosition) => {
      const files = await pickImageFiles();
      if (files.length) await insertImages(files, at ?? viewportCenter());
    },
    [insertImages, viewportCenter],
  );

  const deleteSelection = useCallback(() => {
    actions.batch(() => {
      actions.deleteEdges(selectedEdges().map((e) => e.id));
      actions.deleteNodes(selectedNodes().map((n) => n.id));
    });
  }, [actions, selectedNodes, selectedEdges]);

  const setZ = useCallback(
    (ids: string[], front: boolean) => {
      const zs = [...getNodesMap(doc).values()].map((n) => n.zIndex ?? 0);
      const z = front ? Math.max(0, ...zs) + 1 : Math.min(0, ...zs) - 1;
      actions.batch(() => ids.forEach((id) => actions.updateNode(id, { zIndex: z })));
    },
    [doc, actions],
  );

  const autoLayout = useCallback(
    async (direction: LayoutDirection = "RIGHT") => {
      await actions.autoLayout(direction);
      requestAnimationFrame(() => void fitView({ duration: 400, padding: 0.2 }));
    },
    [actions, fitView],
  );

  return useMemo(
    () => ({
      ...history,
      selectTool: () => setTool("select"),
      handTool: () => setTool("hand"),
      addText,
      addGroup,
      addImages,
      duplicate,
      group,
      ungroup,
      deleteSelection,
      bringToFront: (ids: string[]) => setZ(ids, true),
      sendToBack: (ids: string[]) => setZ(ids, false),
      selectAll,
      deselect: () => select([]),
      autoLayout,
      selectedNodes,
    }),
    [history, setTool, addText, addGroup, addImages, duplicate, group, ungroup, deleteSelection, setZ, selectAll, select, autoLayout, selectedNodes],
  );
}

export type CanvasCommands = ReturnType<typeof useCanvasCommands>;
