"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Trash2 } from "lucide-react";
import { CreateBoardForm } from "./CreateBoardForm";
import { useBoards } from "./useBoards";

export function BoardList() {
  const router = useRouter();
  const { boards, ready, status, create, remove } = useBoards();

  const onCreate = (name: string) => {
    const board = create(name);
    if (board) router.push(`/board/${board.id}`);
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Boards</h1>
          <p className="text-sm text-muted-foreground">
            {status === "unauthorized" ? "Invalid auth token." : ready ? `${boards.length} boards` : "Connecting…"}
          </p>
        </div>
        <CreateBoardForm disabled={!ready} onCreate={onCreate} />
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence initial={false}>
          {boards.map((board) => (
            <motion.li
              key={board.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="group relative rounded-xl border bg-card transition-colors hover:border-brand"
            >
              <Link href={`/board/${board.id}`} className="block p-5">
                <div className="font-medium">{board.name}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {new Date(board.createdAt).toLocaleDateString()}
                </div>
              </Link>
              <button
                type="button"
                aria-label={`Delete ${board.name}`}
                onClick={() => confirm(`Delete "${board.name}"?`) && remove(board.id)}
                className="absolute top-3 right-3 rounded-md p-1.5 text-muted-foreground opacity-0 transition hover:bg-accent hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="size-4" />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </main>
  );
}
