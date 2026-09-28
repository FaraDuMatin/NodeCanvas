"use client";

import { useCallback } from "react";
import type { XYPosition } from "@xyflow/react";
import { useCanvas } from "../CanvasContext";
import { isImageFile, uploadImage } from "./uploadImage";

const STAGGER = 32;

/** Uploads image files and places them on the canvas, starting at `at` (canvas space). */
export function useInsertImages() {
  const { actions } = useCanvas();

  return useCallback(
    async (files: Iterable<File>, at: XYPosition) => {
      const images = [...files].filter(isImageFile);
      await Promise.all(
        images.map(async (file, i) => {
          try {
            const url = await uploadImage(file);
            actions.addNode({
              type: "image",
              data: { label: file.name, url },
              position: { x: at.x + i * STAGGER, y: at.y + i * STAGGER },
            });
          } catch (error) {
            console.error(error);
            alert(`Could not upload ${file.name}`);
          }
        }),
      );
    },
    [actions],
  );
}
