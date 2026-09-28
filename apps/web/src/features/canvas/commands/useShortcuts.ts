"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { isEditableTarget } from "@/lib/dom";

export interface ShortcutHandlers {
  selectTool: () => void;
  handTool: () => void;
  newNode: () => void;
  undo: () => void;
  redo: () => void;
  duplicate: () => void;
  group: () => void;
  ungroup: () => void;
  selectAll: () => void;
  deselect: () => void;
}

/**
 * Global canvas shortcuts. Copy/paste/delete are handled elsewhere
 * (clipboard events and React Flow's deleteKeyCode).
 */
export function useShortcuts(handlers: ShortcutHandlers) {
  const ref = useRef(handlers);
  useLayoutEffect(() => {
    ref.current = handlers;
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target) || e.altKey) return;
      const h = ref.current;
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      const action = mod
        ? {
            z: e.shiftKey ? h.redo : h.undo,
            y: h.redo,
            d: h.duplicate,
            g: e.shiftKey ? h.ungroup : h.group,
            a: h.selectAll,
          }[key]
        : e.shiftKey
          ? undefined
          : { v: h.selectTool, h: h.handTool, n: h.newNode, escape: h.deselect }[key];

      if (!action) return;
      e.preventDefault();
      action();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);
}
