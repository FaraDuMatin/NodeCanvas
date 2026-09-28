"use client";

import { memo } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import { useKeyHeld } from "@/hooks/useKeyHeld";
import { cn } from "@/lib/utils";
import { useCanvas } from "../CanvasContext";
import type { GroupFlowNode } from "../sync/flowTypes";
import { EditableText } from "./EditableText";
import { useAutoEdit } from "./useAutoEdit";

export const GroupNode = memo(function GroupNode({ id, data, selected }: NodeProps<GroupFlowNode>) {
  const { actions } = useCanvas();
  const shiftHeld = useKeyHeld("Shift");
  const autoEdit = useAutoEdit(id);

  return (
    <div
      className={cn(
        "size-full rounded-2xl border-2 border-dashed bg-foreground/[0.03]",
        selected ? "border-brand" : "border-border",
      )}
      style={data.color ? { borderColor: data.color } : undefined}
    >
      <NodeResizer isVisible={selected} minWidth={160} minHeight={120} keepAspectRatio={shiftHeld} color="var(--brand)" />
      <div className="absolute -top-7 left-1 max-w-full">
        <EditableText
          value={data.label}
          placeholder="Group"
          editing={autoEdit.active}
          onEditingChange={autoEdit.onEditingChange}
          className="text-xs font-medium text-muted-foreground"
          onCommit={(label) => actions.updateNode(id, { data: { label } })}
        />
      </div>
    </div>
  );
});
