import { cn } from "@/lib/cn";
import type { Player } from "@/lib/game";

type MarkProps = {
  player: Player;
  className?: string;
  animate?: boolean;
  strokeWidth?: number;
};

/**
 * Hand-drawn SVG marks. `pathLength={1}` lets every stroke use the same
 * CSS draw-in animation regardless of its real length.
 */
export function Mark({
  player,
  className,
  animate = true,
  strokeWidth = 8.5,
}: MarkProps) {
  if (player === "O") {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        aria-hidden="true"
        className={cn("overflow-visible", className)}
      >
        <path
          d="M51 10.5 C 74 7.5 90 25 89 47 C 87.5 71 69 90 46 87.5 C 24 85 10 64 14.5 42 C 18 23 34.5 10.5 53 12.5 C 64 13.5 72.5 19.5 77 26.5"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className={animate ? "mark-stroke" : undefined}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={cn("overflow-visible", className)}
    >
      <path
        d="M20 17 C 33 31.5 48 48 65 65 C 71.5 72 76 76.5 80.5 81"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className={animate ? "mark-stroke" : undefined}
      />
      <path
        d="M80.5 17 C 67.5 31.5 51.5 48.5 34.5 65 C 28 71.5 23.5 76.5 19.5 81"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        className={animate ? "mark-stroke" : undefined}
        style={animate ? { animationDelay: "90ms" } : undefined}
      />
    </svg>
  );
}

/** A little crossed-pens doodle used for the draw column. */
export function DrawMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex items-center justify-center gap-[2%]",
        className,
      )}
    >
      <Mark
        player="X"
        animate={false}
        strokeWidth={10}
        className="h-[66%] w-[46%] text-blue-ink"
      />
      <Mark
        player="O"
        animate={false}
        strokeWidth={10}
        className="h-[66%] w-[46%] text-pink-ink"
      />
    </span>
  );
}
