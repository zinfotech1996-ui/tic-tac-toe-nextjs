export type Player = "X" | "O";
export type CellValue = Player | null;
export type BoardState = CellValue[];

export type Scores = {
  X: number;
  O: number;
  draws: number;
};

export type Outcome =
  | { kind: "playing" }
  | { kind: "win"; player: Player; line: number[] }
  | { kind: "draw" };

export const WINNING_LINES: ReadonlyArray<readonly [number, number, number]> = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const EMPTY_SCORES: Scores = { X: 0, O: 0, draws: 0 };

export function createBoard(): BoardState {
  return Array<CellValue>(9).fill(null);
}

export function otherPlayer(player: Player): Player {
  return player === "X" ? "O" : "X";
}

export function countMoves(board: BoardState): number {
  return board.reduce((total, cell) => (cell ? total + 1 : total), 0);
}

export function getOutcome(board: BoardState): Outcome {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const value = board[a];

    if (value && value === board[b] && value === board[c]) {
      return { kind: "win", player: value, line: [...line] };
    }
  }

  if (board.every((cell) => cell !== null)) {
    return { kind: "draw" };
  }

  return { kind: "playing" };
}
