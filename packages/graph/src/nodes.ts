import type * as Y from "yjs";
import type { CanvasNode, NodeData, NodePatch, NodeType, Position, Size } from "@node-canvas/schema";
import { DEFAULT_SIZE } from "./defaults";
import { getEdgesMap, getNodesMap } from "./doc";
import { newId } from "./ids";
import { findFreePosition } from "./placement";

export interface CreateNodeInput {
  type: NodeType;
  data: Partial<NodeData>;
  position?: Position;
  size?: Partial<Size>;
  parentId?: string;
  /** Used to place the node when `position` is omitted. */
  nearId?: string;
  id?: string;
}

export function createNode(doc: Y.Doc, input: CreateNodeInput, origin?: unknown): CanvasNode {
  const nodes = getNodesMap(doc);
  const size = { ...DEFAULT_SIZE[input.type], ...input.size };
  const node: CanvasNode = {
    id: input.id ?? newId(),
    type: input.type,
    position: input.position ?? findFreePosition(nodes, size, input.nearId),
    width: size.width,
    height: size.height,
    ...(input.parentId ? { parentId: input.parentId } : {}),
    data: { label: "", ...input.data },
  };
  doc.transact(() => nodes.set(node.id, node), origin);
  return node;
}

/** Merges a patch into a node. Returns the new node, or undefined if missing. */
export function updateNode(
  doc: Y.Doc,
  id: string,
  patch: NodePatch,
  origin?: unknown,
): CanvasNode | undefined {
  const nodes = getNodesMap(doc);
  const current = nodes.get(id);
  if (!current) return undefined;

  const { data, parentId, ...rest } = patch;
  const next: CanvasNode = {
    ...current,
    ...stripUndefined(rest),
    data: { ...current.data, ...stripUndefined(data ?? {}) },
  };
  if (parentId === null) delete next.parentId;
  else if (parentId !== undefined) next.parentId = parentId;

  doc.transact(() => nodes.set(id, next), origin);
  return next;
}

/** Deletes nodes, their descendants and every edge touching them. */
export function deleteNodes(doc: Y.Doc, ids: string[], origin?: unknown): string[] {
  const nodes = getNodesMap(doc);
  const edges = getEdgesMap(doc);
  const doomed = collectDescendants(nodes, ids);

  doc.transact(() => {
    for (const id of doomed) nodes.delete(id);
    for (const [edgeId, edge] of edges) {
      if (doomed.has(edge.source) || doomed.has(edge.target)) edges.delete(edgeId);
    }
  }, origin);
  return [...doomed];
}

function collectDescendants(nodes: Y.Map<CanvasNode>, roots: string[]): Set<string> {
  const result = new Set(roots.filter((id) => nodes.has(id)));
  let grew = true;
  while (grew) {
    grew = false;
    for (const node of nodes.values()) {
      if (node.parentId && result.has(node.parentId) && !result.has(node.id)) {
        result.add(node.id);
        grew = true;
      }
    }
  }
  return result;
}

function stripUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}
