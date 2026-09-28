import type { Edge, Node } from "@xyflow/react";
import type { NodeData } from "@node-canvas/schema";

export type TextFlowNode = Node<NodeData, "text">;
export type ImageFlowNode = Node<NodeData, "image">;
export type GroupFlowNode = Node<NodeData, "group">;
export type FlowNode = TextFlowNode | ImageFlowNode | GroupFlowNode;

export type FlowEdge = Edge<{ label?: string }, "labeled">;
