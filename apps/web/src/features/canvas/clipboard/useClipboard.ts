"use client";

import { useCallback, useEffect, useRef } from "react";
import { isEditableTarget } from "@/lib/dom";
import { useCanvas } from "../CanvasContext";
import { LOCAL_ORIGIN } from "../actions/canvasActions";
import { useInsertImages } from "../images/useInsertImages";
import { useSelection } from "../selection/useSelection";
import { useViewportCenter } from "../viewport/useViewportCenter";
import { decodeFragment, encodeFragment } from "./clipboardFormat";
import { fragmentOf, insertFragment, type GraphFragment } from "./cloneGraph";

const PASTE_OFFSET = 32;

/**
 * Copy / cut / paste through the system clipboard, plus duplicate.
 * Paste handles: copied nodes, image files, and plain text (becomes a text node).
 */
export function useClipboard() {
  const { doc, actions } = useCanvas();
  const { selectedNodes, select } = useSelection();
  const insertImages = useInsertImages();
  const viewportCenter = useViewportCenter();
  const pasteCount = useRef(0);

  const paste = useCallback(
    (fragment: GraphFragment, offset: number) => {
      const ids = insertFragment(doc, fragment, { x: offset, y: offset }, LOCAL_ORIGIN);
      select(ids);
    },
    [doc, select],
  );

  const duplicate = useCallback(() => {
    const nodes = selectedNodes();
    if (nodes.length) paste(fragmentOf(doc, nodes), PASTE_OFFSET);
  }, [doc, selectedNodes, paste]);

  useEffect(() => {
    const onCopy = (e: ClipboardEvent, cut: boolean) => {
      if (isEditableTarget(e.target)) return;
      const nodes = selectedNodes();
      if (!nodes.length || !e.clipboardData) return;
      e.preventDefault();
      e.clipboardData.setData("text/plain", encodeFragment(fragmentOf(doc, nodes)));
      pasteCount.current = 0;
      if (cut) actions.deleteNodes(nodes.map((n) => n.id));
    };

    const onPaste = (e: ClipboardEvent) => {
      if (isEditableTarget(e.target) || !e.clipboardData) return;
      const files = [...e.clipboardData.files];
      const text = e.clipboardData.getData("text/plain");
      e.preventDefault();

      if (files.length) {
        void insertImages(files, viewportCenter());
        return;
      }
      const fragment = decodeFragment(text);
      if (fragment) {
        pasteCount.current += 1;
        paste(fragment, PASTE_OFFSET * pasteCount.current);
      } else if (text.trim()) {
        const [label = "", ...rest] = text.trim().split("\n");
        const node = actions.addNode({
          type: "text",
          data: { label: label.slice(0, 200), content: rest.join("\n").trim() || undefined },
          position: viewportCenter(),
        });
        select([node.id]);
      }
    };

    const copy = (e: ClipboardEvent) => onCopy(e, false);
    const cut = (e: ClipboardEvent) => onCopy(e, true);
    window.addEventListener("copy", copy);
    window.addEventListener("cut", cut);
    window.addEventListener("paste", onPaste);
    return () => {
      window.removeEventListener("copy", copy);
      window.removeEventListener("cut", cut);
      window.removeEventListener("paste", onPaste);
    };
  }, [doc, actions, selectedNodes, select, paste, insertImages, viewportCenter]);

  return { duplicate };
}
