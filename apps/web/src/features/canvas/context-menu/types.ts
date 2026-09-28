import type { XYPosition } from "@xyflow/react";

export type MenuTarget =
  | { kind: "pane" }
  | { kind: "node"; id: string }
  | { kind: "edge"; id: string }
  | { kind: "selection" };

export interface MenuState {
  target: MenuTarget;
  /** Screen position of the click. */
  screen: XYPosition;
  /** Canvas position of the click. */
  flow: XYPosition;
}

export type MenuItem =
  | { label: string; shortcut?: string; danger?: boolean; onSelect: () => void }
  | { colors: readonly string[]; onPick: (color: string) => void }
  | "separator";
