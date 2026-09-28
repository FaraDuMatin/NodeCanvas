"use client";

import { useMemo } from "react";
import { BOARDS_DOC } from "@node-canvas/schema";
import { createBoard, deleteBoard, getBoardsMap, renameBoard } from "@node-canvas/graph";
import { useCollabDoc } from "@/lib/collab/useCollabDoc";
import { useYMapValues } from "@/lib/collab/useYMap";

/** Live list of boards plus actions on the board registry. */
export function useBoards() {
  const { collab, status } = useCollabDoc(BOARDS_DOC);
  const doc = collab?.doc ?? null;
  const map = useMemo(() => (doc ? getBoardsMap(doc) : null), [doc]);
  const values = useYMapValues(map);
  const boards = useMemo(() => [...values].sort((a, b) => b.createdAt - a.createdAt), [values]);

  const actions = useMemo(
    () => ({
      create: (name: string) => (doc ? createBoard(doc, name) : undefined),
      rename: (id: string, name: string) => doc && renameBoard(doc, id, name),
      remove: (id: string) => doc && deleteBoard(doc, id),
    }),
    [doc],
  );

  return { boards, ready: !!doc, status, ...actions };
}
