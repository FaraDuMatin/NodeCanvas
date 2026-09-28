import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

const SIDES = [
  { id: "t", position: Position.Top },
  { id: "r", position: Position.Right },
  { id: "b", position: Position.Bottom },
  { id: "l", position: Position.Left },
] as const;

/** One handle per side. The canvas uses loose mode, so any handle can start or end an edge. */
export function NodeHandles({ visible }: { visible: boolean }) {
  return SIDES.map(({ id, position }) => (
    <Handle
      key={id}
      id={id}
      type="source"
      position={position}
      className={cn(
        "!size-2.5 !border-2 !border-background !bg-brand transition-opacity",
        visible ? "opacity-100" : "opacity-0",
      )}
    />
  ));
}
