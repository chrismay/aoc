import { uniq } from "lodash";
import { tileInput } from "./day24_input";

type Coord = { x: number; y: number; z: number };
type Move = "e" | "w" | "ne" | "nw" | "se" | "sw";
type Pattern = Set<string>;

function nextToken(input: string): { token: Move; rest: string } {
  const s = input.substr(0, 1);
  if (s === "e" || s === "w") {
    return { token: s, rest: input.substr(1, input.length) };
  } else {
    return { token: input.substr(0, 2) as Move, rest: input.substr(2, input.length) };
  }
}
function parseMoves(input: string): Move[] {
  const moves: Move[] = [];
  let remaining = input;
  while (remaining.length > 0) {
    const result = nextToken(remaining);
    moves.push(result.token);
    remaining = result.rest;
  }
  return moves;
}

function applyMove(from: Coord, move: Move): Coord {
  // console.log(`Applying ${move} to ${from.x} ${from.y} ${from.z}`);
  switch (move) {
    case "e":
      return { x: from.x + 1, y: from.y - 1, z: from.z };
    case "w":
      return { x: from.x - 1, y: from.y + 1, z: from.z };
    case "ne":
      return { x: from.x + 1, y: from.y, z: from.z - 1 };
    case "sw":
      return { x: from.x - 1, y: from.y, z: from.z + 1 };
    case "nw":
      return { x: from.x, y: from.y + 1, z: from.z - 1 };
    case "se":
      return { x: from.x, y: from.y - 1, z: from.z + 1 };
  }
}
function getOffset(moves: Move[]) {
  const start = { x: 0, y: 0, z: 0 };
  return moves.reduce(applyMove, start);
}

function getSurrounding(position: Coord): Coord[] {
  const allDirections: Move[] = ["e", "w", "ne", "nw", "se", "sw"];
  return allDirections.map((dir) => applyMove(position, dir));
}
function countSurroundingBlackPieces(pattern: Pattern, position: Coord) {
  return getSurrounding(position).filter((pos) => getPiece(pattern, pos) || false).length;
}

function getNextRoundPieces(pattern: Pattern) {
  return uniq([...pattern].map((k) => JSON.parse(k) as Coord).flatMap(getSurrounding));
}
function getPiece(pattern: Pattern, pos: Coord): boolean {
  return pattern.has(JSON.stringify(pos));
}

function determinePieceColour(pattern: Pattern, pos: Coord): boolean {
  const count = countSurroundingBlackPieces(pattern, pos);
  const currentlyBlack = getPiece(pattern, pos);
  if ((currentlyBlack && count === 0) || count > 2) {
    return false;
  }
  if (!currentlyBlack && count === 2) {
    return true;
  }
  return currentlyBlack;
}

function evolvePattern(pattern: Pattern): Pattern {
  const pieces = getNextRoundPieces(pattern);
  const newState: [string, boolean][] = pieces.map((pos) => [JSON.stringify(pos), determinePieceColour(pattern, pos)]);
  return new Set([...newState.filter(([, v]) => v).map(([k]) => k)]);
}
function countBlackPieces(pattern: Pattern): number {
  return pattern.size;
}

export function day24() {
  const modifications = tileInput.split("\n").map((moves) => JSON.stringify(getOffset(parseMoves(moves))));
  const pattern: Pattern = new Set();
  modifications.forEach((m) => {
    if (pattern.has(m)) {
      pattern.delete(m);
    } else {
      pattern.add(m);
    }
  });

  console.log("Day 24 Part 1:", countBlackPieces(pattern));

  const d2StartPattern: Pattern = pattern;
  let evolvingPattern = d2StartPattern;
  for (let i = 1; i <= 100; i++) {
    evolvingPattern = evolvePattern(evolvingPattern);
  }
  console.log("Day 24 Part 2:", countBlackPieces(evolvingPattern));
}

day24();
