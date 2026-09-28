import type { CanvasCommands } from "../commands/useCanvasCommands";
import type { MenuItem, MenuState } from "./types";

/** Node accent colors. Empty string clears the color. */
export const NODE_COLORS = ["", "#ef4444", "#f59e0b", "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899"] as const;

const MOD = typeof navigator !== "undefined" && /Mac/.test(navigator.platform) ? "⌘" : "Ctrl+";

/** Menu entries for what was right-clicked. The target is already selected. */
export function buildMenuItems(menu: MenuState, c: CanvasCommands): MenuItem[] {
  const { target, flow } = menu;

  if (target.kind === "pane") {
    return [
      { label: "Add text node", shortcut: "N", onSelect: () => c.addText(flow) },
      { label: "Add group", onSelect: () => c.addGroup(flow) },
      { label: "Add image…", onSelect: () => void c.addImages(flow) },
      "separator",
      { label: "Select all", shortcut: `${MOD}A`, onSelect: c.selectAll },
      { label: "Auto-layout →", onSelect: () => void c.autoLayout("RIGHT") },
      { label: "Auto-layout ↓", onSelect: () => void c.autoLayout("DOWN") },
      "separator",
      { label: "Undo", shortcut: `${MOD}Z`, onSelect: c.undo },
      { label: "Redo", shortcut: `${MOD}⇧Z`, onSelect: c.redo },
    ];
  }

  if (target.kind === "edge") {
    return [{ label: "Delete edge", shortcut: "Del", danger: true, onSelect: c.deleteSelection }];
  }

  const ids = () => c.selectedNodes().map((n) => n.id);
  const hasGroup = c.selectedNodes().some((n) => n.type === "group");
  return [
    { label: "Duplicate", shortcut: `${MOD}D`, onSelect: c.duplicate },
    { label: "Group", shortcut: `${MOD}G`, onSelect: c.group },
    ...(hasGroup ? [{ label: "Ungroup", shortcut: `${MOD}⇧G`, onSelect: c.ungroup }] : []),
    "separator",
    { colors: NODE_COLORS, onPick: (color) => c.setColor(ids(), color) },
    "separator",
    { label: "Bring to front", onSelect: () => c.bringToFront(ids()) },
    { label: "Send to back", onSelect: () => c.sendToBack(ids()) },
    "separator",
    { label: "Delete", shortcut: "Del", danger: true, onSelect: c.deleteSelection },
  ];
}
