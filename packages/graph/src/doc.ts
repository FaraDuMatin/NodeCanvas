import * as Y from "yjs";
import type { Board, CanvasEdge, CanvasNode } from "@node-canvas/schema";

export type NodesMap = Y.Map<CanvasNode>;
export type EdgesMap = Y.Map<CanvasEdge>;
export type BoardsMap = Y.Map<Board>;

export const getNodesMap = (doc: Y.Doc): NodesMap => doc.getMap<CanvasNode>("nodes");
export const getEdgesMap = (doc: Y.Doc): EdgesMap => doc.getMap<CanvasEdge>("edges");
export const getBoardsMap = (doc: Y.Doc): BoardsMap => doc.getMap<Board>("boards");
