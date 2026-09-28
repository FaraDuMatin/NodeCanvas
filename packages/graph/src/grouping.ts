import type * as Y from "yjs";
import type { CanvasNode, Position } from "@node-canvas/schema";
import { getNodesMap, type NodesMap } from "./doc";
import { absolutePosition, absoluteRect } from "./geometry";
import { GROUP_PADDING } from "./defaults";
import { newId } from "./ids";


const isAncestor = (nodes: NodesMap, ancestorId: string, node: CanvasNode): boolean => {
  let parentId = node.parentId;
  const seen = new Set<string>();
  while (parentId && !seen.has(parentId)) {
    if (parentId === ancestorId) return true;
    seen.add(parentId);
    parentId = nodes.get(parentId)?.parentId;
  }
  return false;
};

const originOf = (nodes: NodesMap, parentId?: string): Position => {
  const parent = parentId ? nodes.get(parentId) : undefined;
  return parent ? absolutePosition(nodes, parent) : { x: 0, y: 0 };
};

/** Wraps nodes in a new group sized to fit them. Returns the group, or undefined if nothing to group. */
export function groupNodes(
  doc: Y.Doc,
  ids: string[],
  origin?: unknown,
  label = "Group",
): CanvasNode | undefined {
  const nodes = getNodesMap(doc);
  const picked = ids.flatMap((id) => nodes.get(id) ?? []);
  const roots = picked.filter((n) => !picked.some((other) => isAncestor(nodes, other.id, n)));
  if (roots.length === 0) return undefined;

  const parentIds = new Set(roots.map((n) => n.parentId));
  const parentId = parentIds.size === 1 ? roots[0]!.parentId : undefined;

  const rects = roots.map((n) => absoluteRect(nodes, n));
  const minX = Math.min(...rects.map((r) => r.x)) - GROUP_PADDING;
  const minY = Math.min(...rects.map((r) => r.y)) - GROUP_PADDING;
  const maxX = Math.max(...rects.map((r) => r.x + r.width)) + GROUP_PADDING;
  const maxY = Math.max(...rects.map((r) => r.y + r.height)) + GROUP_PADDING;
  const parentOrigin = originOf(nodes, parentId);

  const group: CanvasNode = {
    id: newId(),
    type: "group",
    position: { x: minX - parentOrigin.x, y: minY - parentOrigin.y },
    width: maxX - minX,
    height: maxY - minY,
    ...(parentId ? { parentId } : {}),
    data: { label },
  };

  doc.transact(() => {
    nodes.set(group.id, group);
    roots.forEach((node, i) => {
      const rect = rects[i]!;
      nodes.set(node.id, { ...node, parentId: group.id, position: { x: rect.x - minX, y: rect.y - minY } });
    });
  }, origin);
  return group;
}

/** Removes groups but keeps their children in place. Returns the freed child ids. */
export function ungroupNodes(doc: Y.Doc, groupIds: string[], origin?: unknown): string[] {
  const nodes = getNodesMap(doc);
  const freed: string[] = [];

  doc.transact(() => {
    for (const groupId of groupIds) {
      const group = nodes.get(groupId);
      if (group?.type !== "group") continue;
      for (const child of [...nodes.values()]) {
        if (child.parentId !== groupId) continue;
        const next: CanvasNode = {
          ...child,
          position: { x: child.position.x + group.position.x, y: child.position.y + group.position.y },
        };
        if (group.parentId) next.parentId = group.parentId;
        else delete next.parentId;
        nodes.set(child.id, next);
        freed.push(child.id);
      }
      nodes.delete(groupId);
    }
  }, origin);
  return freed;
}

/** Moves a node into another group (or to the top level) without moving it on screen. */
export function reparentNode(doc: Y.Doc, id: string, parentId: string | undefined, origin?: unknown): boolean {
  const nodes = getNodesMap(doc);
  const node = nodes.get(id);
  if (!node || node.parentId === parentId || id === parentId) return false;
  if (parentId) {
    const parent = nodes.get(parentId);
    if (!parent || isAncestor(nodes, id, parent)) return false;
  }

  const abs = absolutePosition(nodes, node);
  const base = originOf(nodes, parentId);
  const next: CanvasNode = { ...node, position: { x: abs.x - base.x, y: abs.y - base.y } };
  if (parentId) next.parentId = parentId;
  else delete next.parentId;

  doc.transact(() => nodes.set(id, next), origin);
  return true;
}
