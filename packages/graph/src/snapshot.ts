import type * as Y from "yjs";
import type { CanvasEdge, CanvasNode } from "@node-canvas/schema";
import { getEdgesMap, getNodesMap } from "./doc";

export interface GraphSnapshot {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}

export const snapshot = (doc: Y.Doc): GraphSnapshot => ({
  nodes: [...getNodesMap(doc).values()],
  edges: [...getEdgesMap(doc).values()],
});
