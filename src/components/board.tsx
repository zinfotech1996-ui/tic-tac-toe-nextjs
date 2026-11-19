"use client";

import type { RefObject } from "react";

import { cn } from "@/lib/cn";
import type { BoardState, Outcome, Player } from "@/lib/game";
import { Mark } from "@/components/marks";
import { SketchFrame, Tape } from "@/components/sketch";

type BoardProps = {
  board: BoardState;
  current: Player;
  outcome: Outcome;
  onPlay: (index: number) => void;
  boardRef: RefObject<HTMLDivElement | null>;
};

const GRID_PATHS = [
  "M33.6 1.5 C 32.9 22 34.1 44 33.2 64 C 32.8 79 33.6 91 33.4 98.5",
  "M66.7 1.5 C 66.1 24 67.2 45 66.4 66 C 66 81 66.8 92 66.6 98.5",
  "M1.5 33.5 C 20 32.8 44 34 64 33.3 C 80 32.8 92 33.6 98.5 33.4",
  "M1.5 66.6 C 22 66 44 67.1 65 66.4 C 81 65.9 92 66.7 98.5 66.5",
];

function GridLines() {
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full text-ink/80"
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.78"
      >
        {GRID_PATHS.map((d) => (
          <path key={d} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.22"
        transform="translate(0.55 0.4)"
      >
        {GRID_PATHS.map((d) => (
          <path key={d} d={d} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
    </svg>
  );
}

function cellCenter(index: number) {
  return {
    x: (index % 3) * (100 / 3) + 100 / 6,
    y: Math.floor(index / 3) * (100 / 3) + 100 / 6,
  };
}

function WinningLine({ line }: { line: number[] }) {
  const start = cellCenter(line[0]);
  const end = cellCenter(line[2]);
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const length = Math.hypot(dx, dy) || 1;
  const overhang = 9;
  const x1 = start.x - (dx / length) * overhang;
  const y1 = start.y - (dy / length) * overhang;
  const x2 = end.x + (dx / length) * overhang;
  const y2 = end.y + (dy / length) * overhang;
  const d = `M ${x1} ${y1} L ${x2} ${y2}`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 h-full w-full"
      style={{ mixBlendMode: "multiply" }}
    >
      <path
        d={d}
        fill="none"
        stroke="#ffdd6b"
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.85"
        pathLength={1}
        vectorEffect="non-scaling-stroke"
        className="marker-line"
      />
      <path
        d={d}
        fill="none"
        stroke="#fff1a8"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.7"
        pathLength={1}
        vectorEffect="non-scaling-stroke"
        className="marker-line"
        style={{ animationDelay: "0.22s" }}
      />
    </svg>
  );
}

type CellProps = {
  index: number;
  value: Player | null;
  current: Player;
  finished: boolean;
  winning: boolean;
  onPlay: (index: number) => void;
};

function Cell({
  index,
  value,
  current,
  finished,
  winning,
  onPlay,
}: CellProps) {
  const row = Math.floor(index / 3) + 1;
  const column = (index % 3) + 1;
  const playable = value === null && !finished;

  return (
    <button
      type="button"
      onClick={() => onPlay(index)}
      aria-disabled={!playable}
      aria-label={`Row ${row}, column ${column}: ${
        value ? `player ${value}` : "empty"
      }`}
      className={cn(
        "group relative flex items-center justify-center rounded-[14px] transition-colors duration-150",
        "focus-visible:outline-2 focus-visible:outline-offset-[-8px] focus-visible:outline-dashed focus-visible:outline-ink/45",
        playable ? "cursor-pointer" : "cursor-default",
      )}
    >
      {winning && (
        <span
          aria-hidden="true"
          className="winning-blob absolute inset-[11%] bg-marker/70"
          style={{ borderRadius: "47% 53% 43% 57% / 54% 44% 56% 46%" }}
        />
      )}

      {value && (
        <span
          className={cn(
            "mark-pop relative z-10 block h-[62%] w-[62%]",
            value === "X" ? "text-blue-ink" : "text-pink-ink",
          )}
        >
          <Mark player={value} className="h-full w-full" />
        </span>
      )}

      {!value && !finished && (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-[12%] rounded-[46%] bg-marker/0 transition-colors duration-150 group-hover:bg-marker/25 group-focus-visible:bg-marker/25"
            style={{ borderRadius: "48% 52% 45% 55% / 55% 46% 54% 45%" }}
          />
          <span
            aria-hidden="true"
            className={cn(
              "relative z-10 block h-[56%] w-[56%] opacity-0 transition-opacity duration-150 group-hover:opacity-20 group-focus-visible:opacity-20",
              current === "X" ? "text-blue-ink" : "text-pink-ink",
            )}
          >
            <Mark player={current} animate={false} className="h-full w-full" />
          </span>
        </>
      )}
    </button>
  );
}

export function Board({
  board,
  current,
  outcome,
  onPlay,
  boardRef,
}: BoardProps) {
  const finished = outcome.kind !== "playing";
  const winningCells =
    outcome.kind === "win" ? new Set(outcome.line) : new Set<number>();

  return (
    <div
      ref={boardRef}
      className="paper relative mx-auto aspect-square w-full max-w-[540px] p-[6.5%] shadow-[0_28px_60px_-38px_rgba(44,39,35,0.65)]"
    >
      <SketchFrame className="text-ink/80" />
      <Tape className="-top-3 left-[11%] -rotate-6" />
      <Tape className="-top-3 right-[11%] rotate-3" />

      <div className="relative h-full w-full">
        <GridLines />
        <div
          role="group"
          aria-label="Tic tac toe board"
          className="relative z-10 grid h-full w-full grid-cols-3 grid-rows-3"
        >
          {board.map((value, index) => (
            <Cell
              key={index}
              index={index}
              value={value}
              current={current}
              finished={finished}
              winning={winningCells.has(index)}
              onPlay={onPlay}
            />
          ))}
        </div>
        {outcome.kind === "win" && <WinningLine line={outcome.line} />}
      </div>
    </div>
  );
}
