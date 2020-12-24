import { countBy, keys, pickBy, range, toNumber, uniq, values } from "lodash";
import { tileInput } from "./day24_input";

type Coord = { x: number; y: number; z: number };
const origin: Coord = { x: 0, y: 0, z: 0 };

// cubic co-ordinates for hexagonal grids.
const allDirections: { [dir: string]: Coord } = {
  e: { x: 1, y: -1, z: 0 },
  w: { x: -1, y: 1, z: 0 },
  ne: { x: 1, y: 0, z: -1 },
  nw: { x: 0, y: 1, z: -1 },
  sw: { x: -1, y: 0, z: 1 },
  se: { x: 0, y: -1, z: +1 },
} as const;

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

function toMoves(input: string): Coord[] {
  return (input.match(inputMatcher) || []).map((dir) => allDirections[dir]);
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

function becomesBlackTile(pattern: Pattern) {
  return function (pos: Coord): Coord[] {
    const count = countSurroundingBlackPieces(pattern, pos);
    const currentlyBlack = pattern.has(c2s(pos));
    if (currentlyBlack && (count === 0 || count > 2)) {
      return [];
    }
    if (!currentlyBlack && count === 2) {
      return [pos];
    }
    return currentlyBlack ? [pos] : [];
  };
}

function nextPattern(pattern: Pattern): Pattern {
  const newState = getNextRoundPieces(pattern).flatMap(becomesBlackTile(pattern));
  return new Set(newState.map(c2s));
}

export function day24(): void {
  const modifications = tileInput.split("\n").map((moveNames) => c2s(toMoves(moveNames).reduce(add, origin)));
  const blackPieces = keys(pickBy(countBy(modifications), (count) => count % 2 === 1));

  console.log("Day 24 Part 1:", blackPieces.length);

  const finalPattern = range(0, 100).reduce(nextPattern, new Set(blackPieces));
  console.log("Day 24 Part 2:", finalPattern.size);
}
