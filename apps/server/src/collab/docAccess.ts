import type * as Y from "yjs";
import type { Hocuspocus } from "@hocuspocus/server";
import { BOARDS_DOC, boardDocName } from "@node-canvas/schema";
import { getBoardsMap } from "@node-canvas/graph";

/** Transaction origin for edits made by the server (MCP tools). */
export const SERVER_ORIGIN = "server";

export class NotFoundError extends Error {}

/**
 * Server-side access to live Y.Docs. Edits go through Hocuspocus,
 * so they persist and reach every connected browser.
 */
export class DocAccess {
  constructor(private readonly hocuspocus: Hocuspocus) {}

  /** Runs `fn` against a document. `fn` may be async (e.g. compute, then write). */
  async withDoc<T>(name: string, fn: (doc: Y.Doc) => T | Promise<T>): Promise<T> {
    const connection = await this.hocuspocus.openDirectConnection(name);
    try {
      const doc = connection.document;
      if (!doc) throw new Error(`Document unavailable: ${name}`);
      return await fn(doc);
    } finally {
      await connection.disconnect();
    }
  }

  withBoards<T>(fn: (doc: Y.Doc) => T | Promise<T>): Promise<T> {
    return this.withDoc(BOARDS_DOC, fn);
  }

  /** Like `withDoc`, but fails if the board is not in the registry. */
  async withBoard<T>(boardId: string, fn: (doc: Y.Doc) => T | Promise<T>): Promise<T> {
    const exists = await this.withBoards((doc) => getBoardsMap(doc).has(boardId));
    if (!exists) throw new NotFoundError(`Board not found: ${boardId}. Call list_boards.`);
    return this.withDoc(boardDocName(boardId), fn);
  }
}
