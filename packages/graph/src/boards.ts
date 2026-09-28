import type * as Y from "yjs";
import type { Board } from "@node-canvas/schema";
import { getBoardsMap } from "./doc";
import { newId } from "./ids";

export const listBoards = (doc: Y.Doc): Board[] =>
  [...getBoardsMap(doc).values()].sort((a, b) => b.createdAt - a.createdAt);

export function createBoard(doc: Y.Doc, name: string): Board {
  const board: Board = { id: newId(), name, createdAt: Date.now() };
  getBoardsMap(doc).set(board.id, board);
  return board;
}

export function renameBoard(doc: Y.Doc, id: string, name: string): Board | undefined {
  const boards = getBoardsMap(doc);
  const current = boards.get(id);
  if (!current) return undefined;
  const next = { ...current, name };
  boards.set(id, next);
  return next;
}

export function deleteBoard(doc: Y.Doc, id: string): boolean {
  const boards = getBoardsMap(doc);
  if (!boards.has(id)) return false;
  boards.delete(id);
  return true;
}
