"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Board } from "@/components/board";
import { Confetti, type Burst } from "@/components/confetti";
import { DrawMark, Mark } from "@/components/marks";
import { Scorecard } from "@/components/scorecard";
import { PageDoodles, TitleUnderline } from "@/components/sketch";
import { cn } from "@/lib/cn";
import {
  countMoves,
  createBoard,
  EMPTY_SCORES,
  getOutcome,
  otherPlayer,
  type BoardState,
  type Outcome,
  type Player,
  type Scores,
} from "@/lib/game";
import { sfx } from "@/lib/sfx";

const SCORE_KEY = "tic-tac-toe:scores:v1";
const MUTE_KEY = "tic-tac-toe:muted:v1";
const ROUND_KEY = "tic-tac-toe:round:v1";

type Session = { round: number; starter: Player };

function readSession(): Session | null {
  try {
    const raw = window.localStorage.getItem(ROUND_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      round?: unknown;
      starter?: unknown;
    };

    if (
      typeof parsed.round === "number" &&
      Number.isInteger(parsed.round) &&
      parsed.round >= 1 &&
      (parsed.starter === "X" || parsed.starter === "O")
    ) {
      return { round: parsed.round, starter: parsed.starter };
    }
  } catch {
    // Ignore unreadable storage and start a fresh session.
  }

  return null;
}

function readScores(): Scores | null {
  try {
    const raw = window.localStorage.getItem(SCORE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<Scores>;
    const values = [parsed.X, parsed.O, parsed.draws];

    if (
      values.every(
        (value) =>
          typeof value === "number" &&
          Number.isFinite(value) &&
          value >= 0,
      )
    ) {
      return {
        X: Math.floor(parsed.X as number),
        O: Math.floor(parsed.O as number),
        draws: Math.floor(parsed.draws as number),
      };
    }
  } catch {
    // Ignore unreadable storage and start fresh.
  }

  return null;
}

export default function Game() {
  const [board, setBoard] = useState<BoardState>(createBoard);
  const [current, setCurrent] = useState<Player>("X");
  const [starter, setStarter] = useState<Player>("X");
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState<Scores>({ ...EMPTY_SCORES });
  const [muted, setMuted] = useState(false);
  const [ready, setReady] = useState(false);
  const [burst, setBurst] = useState<Burst | null>(null);

  const boardRef = useRef<HTMLDivElement | null>(null);
  const burstId = useRef(0);

  const outcome = useMemo(() => getOutcome(board), [board]);
  const moves = countMoves(board);
  const finished = outcome.kind !== "playing";

  // Hydrate saved preferences after mount so server and client markup match.
  /* eslint-disable react-hooks/set-state-in-effect -- Persisted state can only
     be read on the client; applying it after mount avoids hydration mismatches. */
  useEffect(() => {
    const storedScores = readScores();
    if (storedScores) setScores(storedScores);

    const storedSession = readSession();
    if (storedSession) {
      setRound(storedSession.round);
      setStarter(storedSession.starter);
      setCurrent(storedSession.starter);
    }

    try {
      setMuted(window.localStorage.getItem(MUTE_KEY) === "1");
    } catch {
      // Storage can be blocked; defaults are fine.
    }

    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(SCORE_KEY, JSON.stringify(scores));
    } catch {
      // Ignore storage failures.
    }
  }, [scores, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
    } catch {
      // Ignore storage failures.
    }
  }, [muted, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        ROUND_KEY,
        JSON.stringify({ round, starter }),
      );
    } catch {
      // Ignore storage failures.
    }
  }, [round, starter, ready]);

  const newGame = useCallback(() => {
    const nextStarter = otherPlayer(starter);

    setBoard(createBoard());
    setStarter(nextStarter);
    setCurrent(nextStarter);
    setRound((value) => value + 1);

    if (!muted) sfx.newGame();
  }, [muted, starter]);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target as HTMLElement | null;
      if (
        target?.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        newGame();
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [newGame]);

  const play = (index: number) => {
    if (board[index] !== null || finished) return;

    const next = [...board];
    next[index] = current;
    const nextOutcome = getOutcome(next);

    setBoard(next);

    if (!muted) sfx.place(current);

    if (nextOutcome.kind === "win") {
      setScores((previous) => ({
        ...previous,
        [nextOutcome.player]: previous[nextOutcome.player] + 1,
      }));

      if (!muted) sfx.win();

      const rect = boardRef.current?.getBoundingClientRect();
      setBurst({
        id: burstId.current++,
        x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
        y: rect ? rect.top + rect.height / 2 : window.innerHeight / 2,
      });
      return;
    }

    if (nextOutcome.kind === "draw") {
      setScores((previous) => ({
        ...previous,
        draws: previous.draws + 1,
      }));

      if (!muted) sfx.draw();
      return;
    }

    setCurrent(otherPlayer(current));
  };

  const resetScores = () => {
    setScores({ ...EMPTY_SCORES });
  };

  const toggleMuted = () => {
    const next = !muted;
    setMuted(next);
    if (!next) sfx.toggle();
  };

  return (
    <>
      <main className="relative flex flex-1 flex-col overflow-x-clip px-5 pb-6 pt-6 sm:px-8 lg:px-10 lg:py-10">
        <div
          aria-hidden="true"
          className="ambient pointer-events-none absolute inset-0 -z-10"
        />
        <PageDoodles />

        <button
          type="button"
          onClick={toggleMuted}
          aria-pressed={muted}
          aria-label={muted ? "Unmute game sounds" : "Mute game sounds"}
          title={muted ? "Unmute sounds" : "Mute sounds"}
          className="absolute right-4 top-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-ink/30 bg-card/80 text-ink-soft shadow-sm backdrop-blur-sm transition-colors hover:border-ink/60 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink/40 sm:right-6 sm:top-6"
        >
          {muted ? (
            <MutedIcon className="h-5 w-5" />
          ) : (
            <SoundIcon className="h-5 w-5" />
          )}
        </button>

        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center">
          <div className="grid w-full items-center gap-10 lg:grid-cols-2 lg:gap-16 xl:gap-24">
            <section className="mx-auto w-full max-w-[560px] lg:mx-0 lg:max-w-[500px]">
              <Header />

              <div className="mt-9 hidden lg:block">
                <Scorecard
                  scores={scores}
                  round={round}
                  starter={starter}
                  onReset={resetScores}
                />
              </div>
            </section>

            <section className="mx-auto w-full max-w-[560px]">
              <StatusBanner
                outcome={outcome}
                current={current}
                moves={moves}
              />

              <Board
                board={board}
                current={current}
                outcome={outcome}
                onPlay={play}
                boardRef={boardRef}
              />

              <div className="mt-7 flex flex-wrap items-center gap-4">
                <NewGameButton finished={finished} onClick={newGame} />
                <p className="min-w-[150px] max-w-[172px] text-sm leading-snug text-ink-soft sm:text-[15px]">
                  Fresh board, same score. Keep the streak alive.
                </p>
              </div>

              <div className="mt-9 lg:hidden">
                <Scorecard
                  scores={scores}
                  round={round}
                  starter={starter}
                  onReset={resetScores}
                />
              </div>
            </section>
          </div>
        </div>

        <footer className="relative z-10 mx-auto mt-8 flex w-full max-w-6xl flex-col items-center justify-between gap-1 text-[9px] uppercase tracking-[0.22em] text-ink-soft sm:flex-row">
          <p>Ink, paper &amp; React · Next.js</p>
          <p className="hidden sm:block">Press N for a new round</p>
        </footer>
      </main>

      <Confetti burst={burst} />
    </>
  );
}

function Header() {
  return (
    <header>
      <p className="flex items-center gap-2.5 text-[9px] uppercase tracking-[0.3em] text-ink-soft">
        <span aria-hidden="true" className="h-px w-7 bg-ink/25" />
        Two players · one screen
      </p>

      <div className="relative mt-4 inline-block">
        <h1 className="font-display text-[clamp(3.5rem,7vw,5.4rem)] font-bold leading-[0.85] tracking-[-0.01em]">
          Tic Tac Toe
        </h1>
        <TitleUnderline />

        <span
          aria-hidden="true"
          className="absolute -right-9 -top-6 hidden rotate-12 sm:block"
        >
          <Mark
            player="O"
            animate={false}
            strokeWidth={10}
            className="h-10 w-10 text-pink-ink"
          />
        </span>
      </div>

      <p className="mt-6 max-w-[22rem] text-lg leading-snug text-ink-soft">
        Line up three and you win. Try not to gloat about it.
      </p>
    </header>
  );
}

function StatusBanner({
  outcome,
  current,
  moves,
}: {
  outcome: Outcome;
  current: Player;
  moves: number;
}) {
  const player =
    outcome.kind === "win"
      ? outcome.player
      : outcome.kind === "playing"
        ? current
        : null;

  const title =
    outcome.kind === "win"
      ? `${outcome.player} wins!`
      : outcome.kind === "draw"
        ? "It's a draw!"
        : `${current}'s turn`;

  const subtitle =
    outcome.kind === "win"
      ? "Three in a row. Very tidy."
      : outcome.kind === "draw"
        ? "Nine squares, no winner. Run it back?"
        : "Tap any open square.";

  return (
    <div className="mb-6 flex min-h-[4.25rem] items-center gap-3 sm:mb-7 sm:gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center sm:h-16 sm:w-16">
        {player ? (
          <span
            key={`${player}-${moves}-${outcome.kind}`}
            className={cn(
              "mark-pop block h-full w-full",
              player === "X" ? "text-blue-ink" : "text-pink-ink",
            )}
          >
            <Mark player={player} className="h-full w-full" />
          </span>
        ) : (
          <DrawMark className="h-12 w-20" />
        )}
      </div>

      <div role="status" aria-live="polite" aria-atomic="true">
        <p
          key={title}
          className={cn(
            "font-display text-[2.1rem] font-semibold leading-none sm:text-[2.5rem]",
            player === "X"
              ? "text-blue-ink"
              : player === "O"
                ? "text-pink-ink"
                : "text-ink",
          )}
        >
          {title}
        </p>
        <p className="mt-1 text-sm leading-tight text-ink-soft sm:text-base">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function NewGameButton({
  finished,
  onClick,
}: {
  finished: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-keyshortcuts="N"
      className="sketch-btn group relative inline-flex shrink-0 items-center gap-2.5 border-2 border-ink bg-marker px-5 py-3 font-hand text-lg leading-none text-ink shadow-[4px_4px_0_var(--color-ink)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-[2px_2px_0_var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink sm:px-6"
    >
      <RestartIcon className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-180" />
      <span>{finished ? "Play again" : "New game"}</span>
      <kbd className="ml-0.5 rounded-[3px] border border-ink/25 bg-card/70 px-1.5 py-0.5 font-sans text-[9px] font-semibold uppercase tracking-wider text-ink/70">
        N
      </kbd>
    </button>
  );
}

function SoundIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4z" />
      <path d="M15.5 8.5c1.6 1.2 1.6 5.8 0 7" />
      <path d="M18.5 6c3 1.8 3 10.2 0 12" />
    </svg>
  );
}

function MutedIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M4 9.5h3l4.5-3.5v12L7 14.5H4z" />
      <path d="M15.5 9.5l5 5" />
      <path d="M20.5 9.5l-5 5" />
    </svg>
  );
}

function RestartIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 11a8 8 0 1 0-2.4 6.4" />
      <path d="M20 4v7h-7" />
    </svg>
  );
}
