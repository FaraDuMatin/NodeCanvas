"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import type * as Y from "yjs";

/** Live array of a Y.Map's values. Re-renders on any change to the map. */
export function useYMapValues<T>(map: Y.Map<T> | null): T[] {
  const cache = useRef<T[]>([]);

  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!map) return () => {};
      const handler = () => {
        cache.current = [...map.values()];
        onChange();
      };
      handler();
      map.observe(handler);
      return () => map.unobserve(handler);
    },
    [map],
  );

  return useSyncExternalStore(
    subscribe,
    () => cache.current,
    () => cache.current,
  );
}
