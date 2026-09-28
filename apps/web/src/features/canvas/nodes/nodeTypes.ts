import type { NodeTypes } from "@xyflow/react";
import { GroupNode } from "./GroupNode";
import { ImageNode } from "./ImageNode";
import { TextNode } from "./TextNode";

export const nodeTypes = {
  text: TextNode,
  image: ImageNode,
  group: GroupNode,
} satisfies NodeTypes;
