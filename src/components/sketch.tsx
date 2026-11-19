import { cn } from "@/lib/cn";

/** A double-stroke, slightly wobbly frame that makes cards feel hand ruled. */
export function SketchFrame({
  className,
  radius = 1.6,
}: {
  className?: string;
  radius?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full text-ink/70",
        className,
      )}
    >
      <rect
        x="0.6"
        y="0.6"
        width="98.8"
        height="98.8"
        rx={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
      />
      <rect
        x="1.15"
        y="0.85"
        width="97.7"
        height="98.3"
        rx={radius * 1.8}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        vectorEffect="non-scaling-stroke"
        opacity="0.4"
      />
    </svg>
  );
}

/** Semi-transparent washi tape. */
export function Tape({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "tape pointer-events-none absolute h-7 w-24 rounded-[1px]",
        className,
      )}
    />
  );
}

/** The marker swipe under the title. */
export function TitleUnderline() {
  return (
    <svg
      viewBox="0 0 320 22"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-2 left-0 h-4 w-full overflow-visible text-marker"
    >
      <path
        d="M5 15 C 70 7 165 6 315 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="11"
        strokeLinecap="round"
        pathLength={1}
        className="stroke-draw"
        style={{ animationDelay: "250ms", mixBlendMode: "multiply" }}
        opacity="0.8"
      />
    </svg>
  );
}

/** Loose margin doodles for wide screens only. */
export function PageDoodles() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 hidden overflow-hidden xl:block"
    >
      <span className="absolute left-5 top-28 -rotate-12 font-display text-4xl text-ink/10">
        xoxo
      </span>

      <svg
        viewBox="0 0 100 100"
        fill="none"
        className="absolute right-8 top-24 h-14 w-14 -rotate-12 text-pink-ink/25"
      >
        <path
          d="M50 9 C 53 32 56 35 80 39 C 56 43 53 46 50 70 C 46 46 43 43 20 39 C 43 35 46 32 50 9 Z"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinejoin="round"
        />
      </svg>

      <svg
        viewBox="0 0 120 80"
        fill="none"
        className="absolute bottom-24 right-9 h-16 w-24 -rotate-6 text-blue-ink/25"
      >
        <path
          d="M8 22 C 40 8 72 10 104 26"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M92 12 L106 27 L87 34"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span className="absolute bottom-16 left-8 rotate-6 font-display text-3xl text-ink/10">
        your move
      </span>
    </div>
  );
}
