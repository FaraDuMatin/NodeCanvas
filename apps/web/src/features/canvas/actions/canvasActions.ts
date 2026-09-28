import type * as Y from "yjs";
import type { CanvasEdge, NodePatch } from "@node-canvas/schema";
import {
  applyLayout,
  createNode,
  deleteEdges,
  deleteNodes,
  groupNodes,
  linkNodes,
  reparentNode,
  ungroupNodes,
  updateEdge,
  updateNode,
  type CreateNodeInput,
  type LayoutDirection,
  type LinkInput,
} from "@node-canvas/graph";

/** Transaction origin for this browser. Only these edits are undoable locally. */
export const LOCAL_ORIGIN = Symbol("local");

/**
 * Graph mutations bound to one board doc, tagged as local edits.
 * Discrete actions start a new undo step; updates (drag, resize) merge by time.
 */
export function createCanvasActions(doc: Y.Doc, undoManager: Y.UndoManager) {
  const discrete =
    <A extends unknown[], R>(fn: (...args: A) => R) =>
    (...args: A): R => {
      undoManager.stopCapturing();
      return fn(...args);
    };

  return {
    addNode: discrete((input: CreateNodeInput) => createNode(doc, input, LOCAL_ORIGIN)),
    updateNode: (id: string, patch: NodePatch) => updateNode(doc, id, patch, LOCAL_ORIGIN),
    deleteNodes: discrete((ids: string[]) => deleteNodes(doc, ids, LOCAL_ORIGIN)),
    link: discrete((input: LinkInput) => linkNodes(doc, input, LOCAL_ORIGIN)),
    updateEdge: discrete((id: string, patch: Partial<Omit<CanvasEdge, "id">>) => updateEdge(doc, id, patch, LOCAL_ORIGIN)),
    deleteEdges: discrete((ids: string[]) => deleteEdges(doc, ids, LOCAL_ORIGIN)),
    group: discrete((ids: string[]) => groupNodes(doc, ids, LOCAL_ORIGIN)),
    ungroup: discrete((ids: string[]) => ungroupNodes(doc, ids, LOCAL_ORIGIN)),
    reparent: (id: string, parentId?: string) => reparentNode(doc, id, parentId, LOCAL_ORIGIN),
    autoLayout: discrete((direction?: LayoutDirection) => applyLayout(doc, direction, LOCAL_ORIGIN)),
    /** Runs several actions as one transaction (and one undo step). */
    batch: (fn: () => void) => doc.transact(fn, LOCAL_ORIGIN),
    /** Starts a new undo step for the next edit. */
    newStep: () => undoManager.stopCapturing(),
  };
}

export type CanvasActions = ReturnType<typeof createCanvasActions>;
