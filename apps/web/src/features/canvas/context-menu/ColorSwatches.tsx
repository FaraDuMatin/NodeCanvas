import { Ban } from "lucide-react";

interface Props {
  colors: readonly string[];
  onPick: (color: string) => void;
}

/** Row of color dots. Empty string = no color. */
export function ColorSwatches({ colors, onPick }: Props) {
  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5">
      {colors.map((color) => (
        <button
          key={color || "none"}
          type="button"
          role="menuitem"
          aria-label={color ? `Color ${color}` : "No color"}
          onClick={() => onPick(color)}
          className="flex size-5 items-center justify-center rounded-full border transition-transform hover:scale-110"
          style={color ? { background: color } : undefined}
        >
          {!color && <Ban className="size-3 text-muted-foreground" />}
        </button>
      ))}
    </div>
  );
}
