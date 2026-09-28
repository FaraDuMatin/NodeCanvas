"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Id of the node whose label should open in edit mode (set right after creating it). */
let pendingId: string | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export function requestAutoEdit(id: string) {
  pendingId = id;
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useAutoEdit(id: string) {
  const active = useSyncExternalStore(
    subscribe,
    () => pendingId === id,
    () => false,
  );

  const onEditingChange = useCallback(
    (editing: boolean) => {
      if (!editing && pendingId === id) {
        pendingId = null;
        emit();
      }
    },
    [id],
  );

  return { active, onEditingChange };
}
