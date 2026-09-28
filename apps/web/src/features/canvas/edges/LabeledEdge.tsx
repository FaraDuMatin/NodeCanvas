"use client";

import { memo, useState } from "react";
import { BaseEdge, EdgeLabelRenderer, getBezierPath, useInternalNode, type EdgeProps } from "@xyflow/react";
import { cn } from "@/lib/utils";
import { useCanvas } from "../CanvasContext";
import { EditableText } from "../nodes/EditableText";
import type { FlowEdge } from "../sync/flowTypes";
import { floatingEdgeParams } from "./floatingGeometry";

/** Floating edge: attaches to the facing sides of its nodes. Double-click the label to edit. */
export const LabeledEdge = memo(function LabeledEdge({ id, source, target, data, selected, markerEnd, style }: EdgeProps<FlowEdge>) {
  const { actions } = useCanvas();
  const [editing, setEditing] = useState(false);
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);
  if (!sourceNode || !targetNode) return null;

  const [path, labelX, labelY] = getBezierPath(floatingEdgeParams(sourceNode, targetNode));
  const label = data?.label ?? "";

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        interactionWidth={16}
        style={{ ...style, strokeWidth: selected ? 2.5 : 1.5, stroke: selected ? "var(--brand)" : undefined }}
      />
      <EdgeLabelRenderer>
        {(label || editing || selected) && (
          <div
            className="nodrag nopan absolute"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: "all" }}
          >
            <EditableText
              value={label}
              placeholder="Label"
              editing={editing}
              onEditingChange={setEditing}
              className={cn(
                "min-w-12 rounded-md border bg-card px-2 py-0.5 text-center text-xs shadow-sm",
                selected && "border-brand",
              )}
              onCommit={(value) => actions.updateEdge(id, { label: value || undefined })}
            />
          </div>
        )}
      </EdgeLabelRenderer>
    </>
  );
});

export const edgeTypes = { labeled: LabeledEdge };
