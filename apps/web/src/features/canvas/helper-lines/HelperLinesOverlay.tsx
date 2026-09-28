"use client";

import { useStore, type ReactFlowState } from "@xyflow/react";
import type { XYPosition } from "@xyflow/react";

const selector = (s: ReactFlowState) => ({ transform: s.transform, width: s.width, height: s.height });

/** Draws alignment guides. Positions are canvas-space; `origin` offsets child coordinates. */
export function HelperLinesOverlay({
  horizontal,
  vertical,
  origin = { x: 0, y: 0 },
}: {
  horizontal?: number;
  vertical?: number;
  origin?: XYPosition;
}) {
  const { transform, width, height } = useStore(selector);
  const [tx, ty, zoom] = transform;
  if (horizontal === undefined && vertical === undefined) return null;

  const x = vertical !== undefined ? (vertical + origin.x) * zoom + tx : undefined;
  const y = horizontal !== undefined ? (horizontal + origin.y) * zoom + ty : undefined;

  return (
    <svg className="pointer-events-none absolute inset-0 z-10" width={width} height={height}>
      {x !== undefined && <line x1={x} x2={x} y1={0} y2={height} stroke="var(--brand)" strokeWidth={1} />}
      {y !== undefined && <line x1={0} x2={width} y1={y} y2={y} stroke="var(--brand)" strokeWidth={1} />}
    </svg>
  );
}
