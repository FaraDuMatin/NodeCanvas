"use client";

import { useEffect, useRef } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import type { MenuItem, MenuState } from "./types";

interface Props {
  menu: MenuState;
  items: MenuItem[];
  onClose: () => void;
}

export function ContextMenu({ menu, items, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      role="menu"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.1 }}
      style={{ left: menu.screen.x, top: menu.screen.y }}
      className="fixed z-50 min-w-48 origin-top-left rounded-lg border bg-popover p-1 text-sm text-popover-foreground shadow-lg"
      onContextMenu={(e) => e.preventDefault()}
    >
      {items.map((item, i) =>
        item === "separator" ? (
          <div key={i} className="-mx-1 my-1 h-px bg-border" />
        ) : (
          <button
            key={item.label}
            type="button"
            role="menuitem"
            onClick={() => {
              item.onSelect();
              onClose();
            }}
            className={cn(
              "flex w-full items-center justify-between gap-6 rounded-md px-2 py-1.5 text-left hover:bg-accent",
              item.danger && "text-destructive",
            )}
          >
            {item.label}
            {item.shortcut && <span className="text-xs text-muted-foreground">{item.shortcut}</span>}
          </button>
        ),
      )}
    </motion.div>
  );
}
