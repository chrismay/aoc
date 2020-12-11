import { cloneDeep, isEqual, memoize } from "lodash";
import { doWhile } from "../util";
import { day11Input } from "./day11_input";

type Seat = "L" | "." | "#";
type Board = Seat[][];
type Coord = { x: number; y: number };

function lens(board: Board) {
  return {
    getSeatAt: function (c: Coord) {
      return board[c.y][c.x];
    },
    setSeatAt: function (coord: Coord, val: Seat): Board {
      board[coord.y][coord.x] = val;
      return board;
    },
    reduce: function <T>(f: (acc: T, c: Coord) => T, init: T): T {
      return board.reduce((acc, row, y) => row.reduce((rowAcc, _, x) => f(rowAcc, { x, y }), acc), init);
    },
  };
}

function printBoard(board: Board) {
  const rowLen = board[0].length;
  const cols = board.length;
  console.log("board", rowLen, "x", cols);
  console.log(
    board.map((row, idx) => {
      if (row.length !== rowLen) {
        console.log("Unexpected row length!", idx, row.length);
      }
      const r = row.join(" ");
      return r;
    })
  );
}

function toBoard(s: string): Board {
  return s.split("\n").map((s) => s.split("")) as Board;
}

function adjacent(coords: Coord, board: Board): Coord[] {
  const rowAbove = coords.y - 1;
  const rowBelow = coords.y + 1;
  const colBefore = coords.x - 1;
  const colAfter = coords.x + 1;

  const allAdjacent = [colBefore, coords.x, colAfter].map((col) =>
    [rowAbove, coords.y, rowBelow].map((row) => ({ x: col, y: row }))
  );

  return allAdjacent.flatMap((row) =>
    row.filter(isOnBoard(board)).filter(({ x, y }) => !(x === coords.x && y === coords.y))
  );
}

function isOnBoard(board: Board) {
  return function (coord: Coord) {
    return coord.x >= 0 && coord.y >= 0 && coord.x < board[0].length && coord.y < board.length;
  };
}

function evolveSeatPart1(getAdjacent: (coords: Coord, board: Board) => Coord[]) {
  return function (coord: Coord, board: Board): Seat {
    const b = lens(board);
    const current = b.getSeatAt(coord);
    if (current === ".") return ".";
    const surrounds = getAdjacent(coord, board);
    const adjacentOccupiedSeats = surrounds.map((coord) => b.getSeatAt(coord)).filter((s) => s === "#").length;

    if (current === "L" && adjacentOccupiedSeats === 0) return "#";
    if (current === "#" && adjacentOccupiedSeats >= 4) return "L";
    return current;
  };
}

function evolve(board: Board, evolveSeat: (c: Coord, b: Board) => Seat) {
  const newBoard = cloneDeep(board);
  return lens(board).reduce((acc, c) => lens(acc).setSeatAt(c, evolveSeat(c, board)), newBoard);
}

const directions = [
  { y: -1, x: 0 },
  { y: -1, x: 1 },
  { y: 0, x: 1 },
  { y: 1, x: 1 },
  { y: 1, x: 0 },
  { y: 1, x: -1 },
  { y: 0, x: -1 },
  { y: -1, x: -1 },
];

function move(from: Coord, dir: Coord): Coord {
  return { x: from.x + dir.x, y: from.y + dir.y };
}

function findFirstSeat(board: Board, start: Coord, direction: Coord): Seat {
  const l = lens(board);
  const keepSearching = (c: Coord) => isOnBoard(board)(c) && l.getSeatAt(c) === ".";
  const endCoord = doWhile((coord) => move(coord, direction), keepSearching, move(start, direction));
  if (isOnBoard(board)(endCoord)) {
    return l.getSeatAt(endCoord);
  }
  return ".";
}

function findSeatsInAllDirections(board: Board, start: Coord) {
  return directions.map((dir) => findFirstSeat(board, start, dir));
}

function countOccupiedSeatsInAllDirections(board: Board, start: Coord): number {
  return findSeatsInAllDirections(board, start).filter((s) => s === "#").length;
}

function evolveSeatP2(coord: Coord, board: Board): Seat {
  const current = lens(board).getSeatAt(coord);
  if (current === ".") return ".";

  const count = countOccupiedSeatsInAllDirections(board, coord);
  if (current === "L" && count === 0) return "#";
  if (current === "#" && count >= 5) return "L";
  return current;
}
type State = { prev?: Board; next: Board };

export function day11() {
  const day11Board: Board = toBoard(day11Input);
  const getAdjacent = memoize(adjacent);
  const evolveSeatP1 = evolveSeatPart1(getAdjacent);

  const init: State = { next: day11Board };

  const evolveBoard = (s: State) => ({ prev: s.next, next: evolve(s.next, evolveSeatP1) });
  const result = doWhile(evolveBoard, (s) => !isEqual(s.next, s.prev), init);
  const occupied = result.next.reduce((count, b) => count + b.reduce((count, s) => count + (s === "#" ? 1 : 0), 0), 0);
  console.log("Day 11 Part 1:", occupied);

  const evolveBoard2 = (s: State) => ({ prev: s.next, next: evolve(s.next, evolveSeatP2) });
  const result2 = doWhile(evolveBoard2, (s) => !isEqual(s.next, s.prev), init);
  const occupied2 = result2.next.reduce(
    (count, b) => count + b.reduce((count, s) => count + (s === "#" ? 1 : 0), 0),
    0
  );
  console.log("Day 11 Part 2:", occupied2);
}
