"use client";

import { motion } from "motion/react";

/** Shown on an empty board. */
export function EmptyHint() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      <div className="text-center text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Empty board</p>
        <p className="mt-1">
          Press <kbd className="rounded border px-1.5 py-0.5 text-xs">N</kbd> or double-click to add a node.
        </p>
        <p className="mt-1">Drop or paste images. Or ask your AI through MCP.</p>
      </div>
    </motion.div>
  );
}
