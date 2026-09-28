"use client";

import { useEffect, useState } from "react";

/** True while `key` (KeyboardEvent.key) is held down. */
export function useKeyHeld(key: string): boolean {
  const [held, setHeld] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => e.key === key && setHeld(true);
    const up = (e: KeyboardEvent) => e.key === key && setHeld(false);
    const reset = () => setHeld(false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
    };
  }, [key]);

  return held;
}
