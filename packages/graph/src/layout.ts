import ELK from "elkjs/lib/elk.bundled.js";
import type * as Y from "yjs";
import type { CanvasEdge, CanvasNode, Position } from "@node-canvas/schema";
import { getNodesMap } from "./doc";
import { sizeOf } from "./geometry";
import { snapshot } from "./snapshot";

export const LAYOUT_DIRECTIONS = ["RIGHT", "DOWN", "LEFT", "UP"] as const;
export type LayoutDirection = (typeof LAYOUT_DIRECTIONS)[number];

const elk = new ELK();

/** Maps a node to its top-level ancestor (groups are laid out as one box). */
function topLevelId(byId: Map<string, CanvasNode>, id: string): string {
  let node = byId.get(id);
  const seen = new Set<string>();
  while (node?.parentId && byId.has(node.parentId) && !seen.has(node.id)) {
    seen.add(node.id);
    node = byId.get(node.parentId);
  }
  return node?.id ?? id;
}

/** Computes new positions for top-level nodes. Pure: does not touch the doc. */
export async function computeLayout(
  nodes: CanvasNode[],
  edges: CanvasEdge[],
  direction: LayoutDirection = "RIGHT",
): Promise<Map<string, Position>> {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const topLevel = nodes.filter((n) => !n.parentId);

  const elkEdges = new Map<string, { id: string; sources: string[]; targets: string[] }>();
  for (const edge of edges) {
    // Edges can outlive their nodes (e.g. a remote client undoes a node creation).
    if (!byId.has(edge.source) || !byId.has(edge.target)) continue;
    const source = topLevelId(byId, edge.source);
    const target = topLevelId(byId, edge.target);
    const key = `${source}->${target}`;
    if (source !== target && !elkEdges.has(key)) {
      elkEdges.set(key, { id: key, sources: [source], targets: [target] });
    }
  }

  const result = await elk.layout({
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": direction,
      "elk.spacing.nodeNode": "60",
      "elk.layered.spacing.nodeNodeBetweenLayers": "100",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    },
    children: topLevel.map((n) => ({ id: n.id, ...sizeOf(n) })),
    edges: [...elkEdges.values()],
  });

  return new Map((result.children ?? []).map((c) => [c.id, { x: c.x ?? 0, y: c.y ?? 0 }]));
}

/** Lays out the whole board and writes positions in one transaction. */
export async function applyLayout(
  doc: Y.Doc,
  direction: LayoutDirection = "RIGHT",
  origin?: unknown,
): Promise<number> {
  const { nodes, edges } = snapshot(doc);
  const positions = await computeLayout(nodes, edges, direction);
  const map = getNodesMap(doc);
  doc.transact(() => {
    for (const [id, position] of positions) {
      const node = map.get(id);
      if (node) map.set(id, { ...node, position });
    }
  }, origin);
  return positions.size;
}
