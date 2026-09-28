"use client";

import { memo, type SyntheticEvent } from "react";
import { NodeResizer, type NodeProps } from "@xyflow/react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCanvas } from "../CanvasContext";
import type { ImageFlowNode } from "../sync/flowTypes";
import { NodeHandles } from "./NodeHandles";

export const ImageNode = memo(function ImageNode({ id, data, selected, width }: NodeProps<ImageFlowNode>) {
  const { actions } = useCanvas();

  /** First load: record the aspect ratio and fit the node height to it. */
  const onLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    if (data.aspectRatio) return;
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (!naturalWidth || !naturalHeight) return;
    const aspectRatio = naturalWidth / naturalHeight;
    const w = width ?? 320;
    actions.updateNode(id, { height: Math.round(w / aspectRatio), data: { aspectRatio } });
  };

  return (
    <div
      className={cn(
        "size-full animate-in overflow-hidden rounded-lg bg-muted shadow-sm fade-in-0 zoom-in-95",
        selected && "ring-2 ring-brand",
      )}
    >
      <NodeResizer isVisible={selected} minWidth={40} minHeight={40} keepAspectRatio color="var(--brand)" />
      <NodeHandles visible={!!selected} />
      {data.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- arbitrary remote URLs
        <img
          src={data.url}
          alt={data.label}
          draggable={false}
          onLoad={onLoad}
          className="pointer-events-none size-full object-cover select-none"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <ImageOff className="size-6" />
        </div>
      )}
    </div>
  );
});
