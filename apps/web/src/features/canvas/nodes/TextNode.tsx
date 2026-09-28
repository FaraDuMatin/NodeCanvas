"use client";

import { memo } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import { useKeyHeld } from "@/hooks/useKeyHeld";
import { cn } from "@/lib/utils";
import { useCanvas } from "../CanvasContext";
import type { TextFlowNode } from "../sync/flowTypes";
import { EditableText } from "./EditableText";
import { NodeHandles } from "./NodeHandles";
import { useAutoEdit } from "./useAutoEdit";

export const TextNode = memo(function TextNode({ id, data, selected }: NodeProps<TextFlowNode>) {
  const { actions } = useCanvas();
  const shiftHeld = useKeyHeld("Shift");
  const autoEdit = useAutoEdit(id);

  return (
    <div
      className={cn(
        "group flex size-full flex-col gap-1 overflow-hidden rounded-xl border bg-card px-4 py-3 shadow-sm transition-shadow",
        selected ? "border-brand shadow-lg ring-1 ring-brand" : "hover:shadow-md",
      )}
      style={data.color ? { borderTopColor: data.color, borderTopWidth: 4 } : undefined}
    >
      <NodeResizer isVisible={selected} minWidth={120} minHeight={60} keepAspectRatio={shiftHeld} color="var(--brand)" />
      <NodeHandles visible={!!selected} />
      <EditableText
        value={data.label}
        placeholder="Untitled"
        editing={autoEdit.active}
        onEditingChange={autoEdit.onEditingChange}
        className="text-sm font-semibold"
        onCommit={(label) => actions.updateNode(id, { data: { label } })}
      />
      <EditableText
        value={data.content ?? ""}
        placeholder="Double-click to add text"
        multiline
        className="nowheel flex-1 overflow-auto text-xs leading-relaxed text-muted-foreground"
        onCommit={(content) => actions.updateNode(id, { data: { content } })}
      />
    </div>
  );
});
