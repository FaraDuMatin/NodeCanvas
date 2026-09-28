"use client";

import { ReactFlowProvider } from "@xyflow/react";
import { boardDocName } from "@node-canvas/schema";
import { useCollabDoc } from "@/lib/collab/useCollabDoc";
import { CanvasProvider } from "./CanvasContext";
import { Canvas } from "./Canvas";
import { BoardHeader } from "./BoardHeader";
import { FlowGraphProvider } from "./sync/FlowGraphProvider";

export function BoardCanvas({ boardId }: { boardId: string }) {
  const { collab, status } = useCollabDoc(boardDocName(boardId));

  if (!collab) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        {status === "unauthorized" ? "Invalid auth token." : "Connecting…"}
      </div>
    );
  }

  return (
    <ReactFlowProvider>
      <CanvasProvider key={collab.doc.guid} doc={collab.doc}>
        <FlowGraphProvider>
          <div className="relative h-full w-full bg-canvas">
            <Canvas />
            <BoardHeader boardId={boardId} status={status} />
          </div>
        </FlowGraphProvider>
      </CanvasProvider>
    </ReactFlowProvider>
  );
}
