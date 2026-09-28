"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { CollabStatus } from "@/lib/collab/useCollabDoc";
import { cn } from "@/lib/utils";
import { useBoards } from "../boards/useBoards";
import { EditableText } from "./nodes/EditableText";

export function BoardHeader({ boardId, status }: { boardId: string; status: CollabStatus }) {
  const { boards, rename } = useBoards();
  const board = boards.find((b) => b.id === boardId);

  return (
    <div className="pointer-events-auto absolute top-3 left-3 z-10 flex items-center gap-2 rounded-lg border bg-card/90 px-2 py-1.5 shadow-sm backdrop-blur">
      <Link href="/" aria-label="All boards" className="rounded-md p-1 text-muted-foreground hover:bg-accent">
        <ChevronLeft className="size-4" />
      </Link>
      <EditableText
        value={board?.name ?? ""}
        placeholder="Untitled board"
        className="min-w-24 text-sm font-medium"
        onCommit={(name) => name.trim() && rename(boardId, name.trim())}
      />
      <span
        title={status}
        className={cn("size-2 rounded-full", status === "connected" ? "bg-emerald-500" : "bg-amber-500")}
      />
    </div>
  );
}
