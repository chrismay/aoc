import { Seq } from "immutable";
import { cloneDeep, isEqual, memoize } from "lodash";
import { iterate, notNull } from "../util";
import { day11Input } from "./day11_input";

type Seat = "L" | "." | "#";
type BoardData = Seat[][];
type Coord = { x: number; y: number };

function board(data: BoardData) {
  return {
    getSeatAt: function (c: Coord) {
      return data[c.y][c.x];
    },
    setSeatAt: function (coord: Coord, val: Seat): BoardData {
      data[coord.y][coord.x] = val;
      return data;
    },
    reduce: function <T>(f: (acc: T, c: Coord) => T, init: T): T {
      return data.reduce((acc, row, y) => row.reduce((rowAcc, _, x) => f(rowAcc, { x, y }), acc), init);
    },
  };
}

function toBoardData(s: string): BoardData {
  return s.split("\n").map((s) => s.split("")) as BoardData;
}

function adjacent(coords: Coord, boardData: BoardData): Coord[] {
  const rowAbove = coords.y - 1;
  const rowBelow = coords.y + 1;
  const colBefore = coords.x - 1;
  const colAfter = coords.x + 1;

  const allAdjacent = [colBefore, coords.x, colAfter].map((col) =>
    [rowAbove, coords.y, rowBelow].map((row) => ({ x: col, y: row }))
  );

  return allAdjacent.flatMap((row) =>
    row.filter(isOnBoard(boardData)).filter(({ x, y }) => !(x === coords.x && y === coords.y))
  );
}

function isOnBoard(boardData: BoardData) {
  return function (coord: Coord) {
    return coord.x >= 0 && coord.y >= 0 && coord.x < boardData[0].length && coord.y < boardData.length;
  };
}

function evolveSeatPart1(getAdjacent: (coords: Coord, boardData: BoardData) => Coord[]) {
  return function (coord: Coord, boardData: BoardData): Seat {
    const b = board(boardData);
    const current = b.getSeatAt(coord);
    if (current === ".") return ".";
    const surrounds = getAdjacent(coord, boardData);
    const adjacentOccupiedSeats = surrounds.map((coord) => b.getSeatAt(coord)).filter((s) => s === "#").length;

    if (current === "L" && adjacentOccupiedSeats === 0) return "#";
    if (current === "#" && adjacentOccupiedSeats >= 4) return "L";
    return current;
  };
}

function evolve(data: BoardData, evolveSeat: (c: Coord, b: BoardData) => Seat) {
  const newBoard = cloneDeep(data);
  return board(data).reduce((acc, c) => board(acc).setSeatAt(c, evolveSeat(c, data)), newBoard);
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

function findFirstSeat(boardData: BoardData, start: Coord, direction: Coord): Seat {
  const l = board(boardData);
  const freeSeat = (c: Coord) => isOnBoard(boardData)(c) && l.getSeatAt(c) === ".";
  const endCoord = notNull(
    Seq(iterate((coord) => move(coord, direction), move(start, direction))).find((s) => !freeSeat(s))
  );
  if (isOnBoard(boardData)(endCoord)) {
    return l.getSeatAt(endCoord);
  }
  return ".";
}

function findSeatsInAllDirections(board: BoardData, start: Coord) {
  return directions.map((dir) => findFirstSeat(board, start, dir));
}

function countOccupiedSeatsInAllDirections(board: BoardData, start: Coord): number {
  return findSeatsInAllDirections(board, start).filter((s) => s === "#").length;
}

function evolveSeatP2(coord: Coord, data: BoardData): Seat {
  const current = board(data).getSeatAt(coord);
  if (current === ".") return ".";

  const count = countOccupiedSeatsInAllDirections(data, coord);
  if (current === "L" && count === 0) return "#";
  if (current === "#" && count >= 5) return "L";
  return current;
}
type State = { prev?: BoardData; next: BoardData };

export function day11(): void {
  const day11Board: BoardData = toBoardData(day11Input);
  const getAdjacent = memoize(adjacent);
  const evolveSeatP1 = evolveSeatPart1(getAdjacent);

  const init: State = { next: day11Board };

  const evolveBoard = (s: State) => ({ prev: s.next, next: evolve(s.next, evolveSeatP1) });
  const result = Seq(iterate(evolveBoard, init)).find((s) => isEqual(s.next, s.prev), init);
  const occupied = notNull(result).next.reduce(
    (count, b) => count + b.reduce((count, s) => count + (s === "#" ? 1 : 0), 0),
    0
  );
  console.log("Day 11 Part 1:", occupied);

  const evolveBoard2 = (s: State) => ({ prev: s.next, next: evolve(s.next, evolveSeatP2) });
  const result2 = Seq(iterate(evolveBoard2, init)).find((s) => isEqual(s.next, s.prev), init);
  const occupied2 = notNull(result2).next.reduce(
    (count, b) => count + b.reduce((count, s) => count + (s === "#" ? 1 : 0), 0),
    0
  );
  console.log("Day 11 Part 2:", occupied2);
}
day11();
