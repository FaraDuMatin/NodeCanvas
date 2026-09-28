import type { Position, Size } from "@node-canvas/schema";
import { GAP, GROUP_PADDING } from "./defaults";
import type { NodesMap } from "./doc";
import { sizeOf } from "./geometry";

const childrenOf = (nodes: NodesMap, groupId: string) =>
  [...nodes.values()].filter((n) => n.parentId === groupId);

/** Next free slot inside a group: to the right of its existing children. */
export function findChildPosition(nodes: NodesMap, groupId: string): Position {
  const kids = childrenOf(nodes, groupId);
  if (kids.length === 0) return { x: GROUP_PADDING, y: GROUP_PADDING };
  const right = Math.max(...kids.map((k) => k.position.x + sizeOf(k).width));
  const top = Math.min(...kids.map((k) => k.position.y));
  return { x: right + GAP / 2, y: top };
}

/** Enlarges a group so all children fit inside with padding. Call inside a transaction. */
export function growGroupToFit(nodes: NodesMap, groupId: string): void {
  const group = nodes.get(groupId);
  if (!group) return;
  const current: Size = sizeOf(group);
  const kids = childrenOf(nodes, groupId);
  const width = Math.max(current.width, ...kids.map((k) => k.position.x + sizeOf(k).width + GROUP_PADDING));
  const height = Math.max(current.height, ...kids.map((k) => k.position.y + sizeOf(k).height + GROUP_PADDING));
  if (width !== current.width || height !== current.height) {
    nodes.set(groupId, { ...group, width, height });
  }
}
