import { fromPairs, isEqual, range, toPairs, uniqBy } from "lodash";
import { puzzle, testSpace } from "./day17_input";

type Coord = { x: number; y: number; z: number };
type Space = { [ccord: string]: boolean };

function c2s(c: Coord) {
  return `${c.x}:${c.y}:${c.z}`;
}

function s2c(s: string): Coord {
  const [x, y, z] = s.split(":");
  return { x: +x, y: +y, z: +z };
}
function surroundingCoords(c: Coord): Coord[] {
  // console.log(c);
  return range(c.x - 1, c.x + 2).flatMap((x) =>
    range(c.y - 1, c.y + 2).flatMap((y) =>
      range(c.z - 1, c.z + 2).map((z) => {
        return { x, y, z };
      })
    )
  );
}

function getSurrounding(start: Coord, s: Space): [string, boolean][] {
  return surroundingCoords(start)
    .filter((c) => !isEqual(start, c))
    .map((c) => {
      const k = c2s(c);
      // console.log(k);
      return [k, s[k]];
    });
}

function parseInput(input: string): Space {
  const z = 0;
  const space: Space = {};
  input.split("\n").forEach((line, y) =>
    line.split("").forEach((char, x) => {
      const coord = c2s({ x, y, z });
      space[coord] = char === "#";
    })
  );
  return space;
}

function evolveCell(c: Coord, s: Space): boolean {
  const surroundingActive = getSurrounding(c, s).filter(([c, v]) => v).length;
  const cell = s[c2s(c)] || false;
  if (cell) {
    if (surroundingActive === 2 || surroundingActive === 3) {
      return true;
    } else {
      return false;
    }
  } else {
    if (surroundingActive === 3) {
      return true;
    } else {
      return false;
    }
  }
}

export function day17() {
  console.log("Day 17");
  //console.log(surroundingCoords({ x: 0, y: 0, z: 0 }));
  //   console.log(parseInput(testSpace));
  const space = parseInput(testSpace);
  console.log("space:", space);

  const newSpacePairs = uniqBy(
    toPairs(space).flatMap(([c, v]) => surroundingCoords(s2c(c))),
    (c) => c2s(c)
  );
  const newSpace: [Coord, boolean][] = newSpacePairs.map((c) => [c, evolveCell(c, space)]).filter(([c, v]) => v) as [
    Coord,
    boolean
  ][];

  console.log("***");
  //  console.log(newSpace.filter(([{ x, y, z }, v]) => z === 0));

  var s = parseInput(puzzle);
  range(0, 6).forEach((loop) => {
    console.log(toPairs(s).length);
    var newPairs = uniqBy(
      toPairs(s).flatMap(([c, v]) => surroundingCoords(s2c(c))),
      (c) => c2s(c)
    );
    var evolved = newPairs
      .map((c) => [c, evolveCell(c, s)])
      .filter(([c, v]) => v)
      .map(([c, v]) => [c2s(c as Coord), v]);
    console.log(`iteration ${loop + 1} has ${evolved.length} active`);
    s = fromPairs(evolved);
  });
  console.log(toPairs(s));
}
