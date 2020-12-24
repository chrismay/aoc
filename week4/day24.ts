import { countBy, keys, range, toNumber, toPairs, uniq, values } from "lodash";
import { tileInput } from "./day24_input";

type Coord = { x: number; y: number; z: number };
const allDirections: { [dir: string]: Coord } = {
  e: { x: 1, y: -1, z: 0 },
  w: { x: -1, y: 1, z: 0 },
  ne: { x: 1, y: 0, z: -1 },
  nw: { x: 0, y: 1, z: -1 },
  sw: { x: -1, y: 0, z: 1 },
  se: { x: 0, y: -1, z: +1 },
} as const;

type Move = keyof typeof allDirections;
type Pattern = Set<string>;

function add(c1: Coord, c2: Coord): Coord {
  return { x: c1.x + c2.x, y: c1.y + c2.y, z: c1.z + c2.z };
}
function c2s(c: Coord): string {
  return `${c.x},${c.y},${c.z}`;
}
function s2c(s: string): Coord {
  const [x, y, z] = s.split(",").map(toNumber);
  return { x, y, z };
}

const inputMatcher = new RegExp(`(${keys(allDirections).join("|")})`, "g");

function parseMoves(input: string): Move[] {
  return input.match(inputMatcher) || [];
}

function applyMove(from: Coord, move: Move): Coord {
  return add(from, allDirections[move]);
}

function getOffset(moves: Move[]) {
  return moves.reduce(applyMove, { x: 0, y: 0, z: 0 });
}

function getSurrounding(position: Coord): Coord[] {
  return values(allDirections).map((dir) => add(position, dir));
}
function countSurroundingBlackPieces(pattern: Pattern, position: Coord) {
  return getSurrounding(position).filter((pos) => pattern.has(c2s(pos))).length;
}

function getNextRoundPieces(pattern: Pattern) {
  return uniq([...pattern].map(s2c).flatMap(getSurrounding));
}

function determinePieceColour(pattern: Pattern, pos: Coord): boolean {
  const count = countSurroundingBlackPieces(pattern, pos);
  const currentlyBlack = pattern.has(c2s(pos));
  if (currentlyBlack && (count === 0 || count > 2)) {
    return false;
  }
  if (!currentlyBlack && count === 2) {
    return true;
  }
  return currentlyBlack;
}

function nextPattern(pattern: Pattern): Pattern {
  const newState = getNextRoundPieces(pattern)
    .map((pos) => [c2s(pos), determinePieceColour(pattern, pos)])
    .filter(([, v]) => v)
    .map(([k]) => k as string);
  return new Set(newState);
}

export function day24() {
  const modifications = tileInput.split("\n").map((moves) => c2s(getOffset(parseMoves(moves))));
  const blackPieces = toPairs(countBy(modifications))
    .filter(([, v]) => v % 2 === 1) //ignore any piece which is changed and then changed back again.
    .map(([k]) => k);
  const pattern: Pattern = new Set(blackPieces);

  console.log("Day 24 Part 1:", pattern.size);

  const finalPattern = range(0, 100).reduce(nextPattern, pattern);
  console.log("Day 24 Part 2:", finalPattern.size);
}

day24();
