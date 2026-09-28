"use client";

import { useCallback, type DragEvent } from "react";
import { useReactFlow } from "@xyflow/react";
import { useInsertImages } from "./useInsertImages";

/** Drag-and-drop image files onto the canvas. Spread the returned props on the wrapper. */
export function useImageDrop() {
  const { screenToFlowPosition } = useReactFlow();
  const insertImages = useInsertImages();

  const onDragOver = useCallback((e: DragEvent) => {
    if (!e.dataTransfer.types.includes("Files")) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      if (!e.dataTransfer.files.length) return;
      e.preventDefault();
      void insertImages(e.dataTransfer.files, screenToFlowPosition({ x: e.clientX, y: e.clientY }));
    },
    [insertImages, screenToFlowPosition],
  );

  return { onDragOver, onDrop };
}
