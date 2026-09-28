"use client";

import { useCallback } from "react";
import { useCanvas } from "../CanvasContext";
import { useSelection } from "../selection/useSelection";

export function useGroupCommands() {
  const { actions } = useCanvas();
  const { selectedNodes, select } = useSelection();

  const group = useCallback(() => {
    const ids = selectedNodes().map((n) => n.id);
    if (!ids.length) return;
    const created = actions.group(ids);
    if (created) select([created.id]);
  }, [actions, selectedNodes, select]);

  const ungroup = useCallback(() => {
    const groups = selectedNodes().filter((n) => n.type === "group");
    if (groups.length) select(actions.ungroup(groups.map((n) => n.id)));
  }, [actions, selectedNodes, select]);

  return { group, ungroup };
}
