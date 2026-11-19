"use client";

import { cn } from "@/lib/cn";
import type { Scores } from "@/lib/game";
import { DrawMark, Mark } from "@/components/marks";
import { SketchFrame, Tape } from "@/components/sketch";

type ScorecardProps = {
  scores: Scores;
  round: number;
  starter: "X" | "O";
  onReset: () => void;
};

type ScoreItemProps = {
  label: string;
  value: number;
  children: React.ReactNode;
};

function ScoreItem({ label, value, children }: ScoreItemProps) {
  return (
    <div className="flex flex-col items-center gap-1 px-1">
      <div className="flex h-10 items-center justify-center">{children}</div>
      <span
        key={value}
        className="score-pop font-display text-[3.1rem] font-semibold leading-none tabular-nums"
      >
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-[0.24em] text-ink-soft">
        {label}
      </span>
    </div>
  );
}

export function Scorecard({ scores, round, starter, onReset }: ScorecardProps) {
  return (
    <aside className="paper relative -rotate-[0.8deg] px-5 pb-3.5 pt-5 shadow-[0_22px_45px_-32px_rgba(44,39,35,0.7)] sm:px-7">
      <SketchFrame />
      <Tape className="-top-3 left-1/2 w-28 -translate-x-1/2 -rotate-2" />

      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-[2rem] font-semibold leading-none">
          The score
        </h2>
        <p className="text-[9px] uppercase tracking-[0.22em] text-ink-soft">
          Round {round}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-dashed divide-ink/15">
        <ScoreItem label="X wins" value={scores.X}>
          <Mark
            player="X"
            animate={false}
            strokeWidth={10}
            className="h-9 w-9 text-blue-ink"
          />
        </ScoreItem>

        <ScoreItem label="Draws" value={scores.draws}>
          <DrawMark className="h-9 w-16" />
        </ScoreItem>

        <ScoreItem label="O wins" value={scores.O}>
          <Mark
            player="O"
            animate={false}
            strokeWidth={10}
            className="h-9 w-9 text-pink-ink"
          />
        </ScoreItem>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-dashed border-ink/15 pt-2.5 text-sm text-ink-soft">
        <p>
          <span className={cn("font-semibold", starter === "X" ? "text-blue-ink" : "text-pink-ink")}>
            {starter}
          </span>{" "}
          starts this round
        </p>
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset the scoreboard to zero"
          className="rounded-sm text-[10px] uppercase tracking-[0.18em] text-ink-soft underline decoration-dotted underline-offset-4 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink/40"
        >
          reset
        </button>
      </div>
    </aside>
  );
}
