import type * as Y from "yjs";
import { getEdgesMap, getNodesMap, newId } from "@node-canvas/graph";
import type { CanvasEdge, CanvasNode, Position } from "@node-canvas/schema";

export interface GraphFragment {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

/** The given nodes, all their descendants, and edges fully inside that set. */
export function fragmentOf(doc: Y.Doc, roots: CanvasNode[]): GraphFragment {
  const nodes = getNodesMap(doc);
  const ids = new Set(roots.map((n) => n.id));
  let grew = true;
  while (grew) {
    grew = false;
    for (const n of nodes.values()) {
      if (n.parentId && ids.has(n.parentId) && !ids.has(n.id)) {
        ids.add(n.id);
        grew = true;
      }
    }
  }
  return {
    nodes: [...ids].flatMap((id) => nodes.get(id) ?? []),
    edges: [...getEdgesMap(doc).values()].filter((e) => ids.has(e.source) && ids.has(e.target)),
  };
}

/**
 * Inserts a copy of a fragment with fresh ids. Top-level nodes of the fragment
 * are shifted by `offset`. Returns the new top-level node ids.
 */
export function insertFragment(doc: Y.Doc, fragment: GraphFragment, offset: Position, origin: unknown): string[] {
  const nodes = getNodesMap(doc);
  const edges = getEdgesMap(doc);
  const idMap = new Map(fragment.nodes.map((n) => [n.id, newId()]));
  const roots: string[] = [];

  doc.transact(() => {
    for (const node of fragment.nodes) {
      const id = idMap.get(node.id)!;
      const parentInFragment = node.parentId ? idMap.get(node.parentId) : undefined;
      const parentExists = node.parentId && nodes.has(node.parentId);
      const isRoot = !parentInFragment;
      if (isRoot) roots.push(id);

      const copy: CanvasNode = {
        ...node,
        id,
        position: isRoot ? { x: node.position.x + offset.x, y: node.position.y + offset.y } : node.position,
      };
      if (parentInFragment) copy.parentId = parentInFragment;
      else if (!parentExists) delete copy.parentId;
      nodes.set(id, copy);
    }
    for (const edge of fragment.edges) {
      const id = newId();
      edges.set(id, { ...edge, id, source: idMap.get(edge.source)!, target: idMap.get(edge.target)! });
    }
  }, origin);

  return roots;
}
