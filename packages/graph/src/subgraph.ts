import type * as Y from "yjs";
import type { CanvasEdge, CanvasNode, NodeData, NodeType, Position } from "@node-canvas/schema";
import { GROUP_PADDING } from "./defaults";
import { getNodesMap } from "./doc";
import { GraphError, linkNodes } from "./edges";
import { createNode } from "./nodes";

export interface SubgraphNodeInput {
  /** Temporary key used by edges in the same call. */
  ref: string;
  type?: NodeType;
  data: Partial<NodeData>;
  position?: Position;
  /** Ref of a node in this call, or id of an existing group. */
  parent?: string;
}

export interface SubgraphEdgeInput {
  /** Ref from this call, or id of an existing node. */
  from: string;
  to: string;
  label?: string;
}

export interface SubgraphResult {
  /** ref -> created node id */
  ids: Record<string, string>;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

/**
 * Creates many nodes and edges in one transaction.
 * Nodes without a position are placed next to the first node they link to.
 */
export function addSubgraph(
  doc: Y.Doc,
  input: { nodes: SubgraphNodeInput[]; edges: SubgraphEdgeInput[] },
  origin?: unknown,
): SubgraphResult {
  const existing = getNodesMap(doc);
  const ids: Record<string, string> = {};
  const resolve = (key: string) => ids[key] ?? (existing.has(key) ? key : undefined);

  const refs = new Set<string>();
  for (const n of input.nodes) {
    if (refs.has(n.ref)) throw new GraphError(`Duplicate ref: ${n.ref}`);
    refs.add(n.ref);
  }
  const isKnown = (key: string) => refs.has(key) || existing.has(key);
  for (const e of input.edges) {
    if (!isKnown(e.from)) throw new GraphError(`Unknown edge source: ${e.from}`);
    if (!isKnown(e.to)) throw new GraphError(`Unknown edge target: ${e.to}`);
  }

  /** First node this ref links to (or from) that already exists. */
  const neighbourOf = (ref: string) => {
    for (const e of input.edges) {
      const other = e.from === ref ? e.to : e.to === ref ? e.from : undefined;
      const id = other && resolve(other);
      if (id) return id;
    }
    return undefined;
  };

  const nodes: CanvasNode[] = [];
  const edges: CanvasEdge[] = [];
  doc.transact(() => {
    // Parents first (by nesting depth), so children can reference them.
    const byRef = new Map(input.nodes.map((n) => [n.ref, n]));
    const depth = (n: SubgraphNodeInput, seen = 0): number => {
      const parent = n.parent ? byRef.get(n.parent) : undefined;
      return parent && seen < 32 ? 1 + depth(parent, seen + 1) : 0;
    };
    const ordered = [...input.nodes].sort((a, b) => depth(a) - depth(b));
    const hasChildren = new Set(input.nodes.flatMap((n) => (n.parent ? [n.parent] : [])));
    for (const n of ordered) {
      const parentId = n.parent ? resolve(n.parent) : undefined;
      const node = createNode(
        doc,
        {
          type: n.type ?? "text",
          data: n.data,
          position: n.position,
          // Groups filled in this call start minimal and grow to fit their children.
          size: hasChildren.has(n.ref) ? { width: GROUP_PADDING * 2, height: GROUP_PADDING * 2 } : undefined,
          nearId: n.position ? undefined : neighbourOf(n.ref),
          parentId,
        },
        origin,
      );
      ids[n.ref] = node.id;
      nodes.push(node);
    }
    for (const e of input.edges) {
      edges.push(linkNodes(doc, { source: resolve(e.from)!, target: resolve(e.to)!, label: e.label }, origin));
    }
  }, origin);

  return { ids, nodes, edges };
}
