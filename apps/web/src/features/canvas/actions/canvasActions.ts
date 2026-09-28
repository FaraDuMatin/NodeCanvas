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

/** Graph mutations bound to one board doc, tagged as local edits. */
export function createCanvasActions(doc: Y.Doc) {
  return {
    addNode: (input: CreateNodeInput) => createNode(doc, input, LOCAL_ORIGIN),
    updateNode: (id: string, patch: NodePatch) => updateNode(doc, id, patch, LOCAL_ORIGIN),
    deleteNodes: (ids: string[]) => deleteNodes(doc, ids, LOCAL_ORIGIN),
    link: (input: LinkInput) => linkNodes(doc, input, LOCAL_ORIGIN),
    updateEdge: (id: string, patch: Partial<Omit<CanvasEdge, "id">>) => updateEdge(doc, id, patch, LOCAL_ORIGIN),
    deleteEdges: (ids: string[]) => deleteEdges(doc, ids, LOCAL_ORIGIN),
    group: (ids: string[]) => groupNodes(doc, ids, LOCAL_ORIGIN),
    ungroup: (ids: string[]) => ungroupNodes(doc, ids, LOCAL_ORIGIN),
    reparent: (id: string, parentId?: string) => reparentNode(doc, id, parentId, LOCAL_ORIGIN),
    autoLayout: (direction?: LayoutDirection) => applyLayout(doc, direction, LOCAL_ORIGIN),
    /** Groups several actions into one undo step. */
    batch: (fn: () => void) => doc.transact(fn, LOCAL_ORIGIN),
  };
}

export type CanvasActions = ReturnType<typeof createCanvasActions>;
