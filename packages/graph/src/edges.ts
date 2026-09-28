import type * as Y from "yjs";
import type { CanvasEdge } from "@node-canvas/schema";
import { getEdgesMap, getNodesMap } from "./doc";
import { newId } from "./ids";

export interface LinkInput {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  label?: string;
  id?: string;
}

export class GraphError extends Error {}

export function linkNodes(doc: Y.Doc, input: LinkInput, origin?: unknown): CanvasEdge {
  const nodes = getNodesMap(doc);
  if (!nodes.has(input.source)) throw new GraphError(`Source node not found: ${input.source}`);
  if (!nodes.has(input.target)) throw new GraphError(`Target node not found: ${input.target}`);

  const edge: CanvasEdge = {
    id: input.id ?? newId(),
    source: input.source,
    target: input.target,
    ...(input.sourceHandle ? { sourceHandle: input.sourceHandle } : {}),
    ...(input.targetHandle ? { targetHandle: input.targetHandle } : {}),
    ...(input.label ? { label: input.label } : {}),
  };
  doc.transact(() => getEdgesMap(doc).set(edge.id, edge), origin);
  return edge;
}

export function updateEdge(
  doc: Y.Doc,
  id: string,
  patch: Partial<Omit<CanvasEdge, "id">>,
  origin?: unknown,
): CanvasEdge | undefined {
  const edges = getEdgesMap(doc);
  const current = edges.get(id);
  if (!current) return undefined;
  const next = { ...current, ...patch };
  doc.transact(() => edges.set(id, next), origin);
  return next;
}

export function deleteEdges(doc: Y.Doc, ids: string[], origin?: unknown): string[] {
  const edges = getEdgesMap(doc);
  const existing = ids.filter((id) => edges.has(id));
  doc.transact(() => existing.forEach((id) => edges.delete(id)), origin);
  return existing;
}
