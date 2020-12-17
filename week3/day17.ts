import { fromPairs, isEqual, keys, memoize, range, toPairs, uniqBy } from "lodash";
import { cartesianProduct } from "../util";
import { puzzle } from "./day17_input";

type Coord = { x: number; y: number; z: number; w: number };
type Space = { [coord: string]: boolean };

function c2s(c: Coord) {
  return `${c.x}:${c.y}:${c.z}:${c.w}`;
}

function s2c(s: string): Coord {
  const [x, y, z, w] = s.split(":");
  return { x: +x, y: +y, z: +z, w: +w };
}

function surroundingCoordsF(c: Coord, dimensions: 3 | 4): Coord[] {
  const wRange = dimensions === 3 ? [0] : range(c.w - 1, c.w + 2);

  return cartesianProduct(
    range(c.x - 1, c.x + 2),
    range(c.y - 1, c.y + 2),
    range(c.z - 1, c.z + 2),
    wRange
  ).map(([x, y, z, w]) => ({ x, y, z, w }));
}

const surroundingCoords = memoize(surroundingCoordsF, (...args) => JSON.stringify(args));

function getSurroundingCells(start: Coord, s: Space, dimensions: 3 | 4): [string, boolean][] {
  return surroundingCoords(start, dimensions)
    .filter((c) => !isEqual(start, c))
    .map((c) => {
      const k = c2s(c);
      return [k, s[k]];
    });
}

function parseInput(input: string): Space {
  const z = 0;
  const w = 0;
  const space: Space = {};
  input.split("\n").forEach((line, y) =>
    line.split("").forEach((char, x) => {
      const coord = c2s({ x, y, z, w });
      space[coord] = char === "#";
    })
  );
  return space;
}

function evolveCell(c: Coord, s: Space, dimensions: 3 | 4): boolean {
  const surroundingActive = getSurroundingCells(c, s, dimensions).filter(([, v]) => v).length;
  const cell = s[c2s(c)] || false;
  if (cell) {
    return surroundingActive === 2 || surroundingActive === 3;
  } else {
    return surroundingActive === 3;
  }
}

function runIterations(space: Space, iterations: number, dimensions: 3 | 4) {
  const result = range(0, iterations).reduce((s) => {
    const affectedRegion = uniqBy(
      toPairs(s).flatMap(([c]) => surroundingCoords(s2c(c), dimensions)),
      c2s
    );
    const evolved = affectedRegion
      .map((c) => [c, evolveCell(c, s, dimensions)])
      .filter(([, v]) => v)
      .map(([c, v]) => [c2s(c as Coord), v]);
    return fromPairs(evolved);
  }, space);

  return keys(result).length;
}

export function day17() {
  var startingSpace = parseInput(puzzle);

  console.log("Day 17 part 1:", runIterations(startingSpace, 6, 3));
  console.log("Day 17 part 2:", runIterations(startingSpace, 6, 4));
}
