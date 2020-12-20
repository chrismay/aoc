import { fromPairs, reverse, toPairs, uniq, values } from "lodash";
import { puzzleInput } from "./day20_input";
const strRev = (str: string) => reverse(str.split("")).join("");

function getEdges(tile: string[]) {
  const top = tile[0];
  const bottom = tile[tile.length - 1];
  const left = tile.map((l) => l[0]).join("");
  const right = tile.map((l) => l[l.length - 1]).join("");
  return { top, bottom, left, right };
}

function parseInput(input: string) {
  const tiles = input.split("\n\n");
  return fromPairs(
    tiles.map((tile) => {
      const [idLine, ...rest] = tile.split("\n");
      const [, id] = idLine.match(/Tile ([0-9]+):/) || [];
      return [id, { tile: rest, edges: getEdges(rest) }];
    })
  );
}

export function day20(): void {
  const tiles = parseInput(puzzleInput);
  console.log("Day 20", tiles);

  const edgeMap: { [edge: string]: number[] } = {};
  toPairs(tiles).forEach(([id, { edges }]) => {
    values(edges).forEach((edge) => {
      const reversed: string = strRev(edge);
      edgeMap[edge] = [...(edgeMap[edge] || []), +id];
      edgeMap[reversed] = [...(edgeMap[reversed] || []), +id];
    });
  });
  console.log(edgeMap);

  const matchingEdges = toPairs(tiles).map(([id, { edges }]) => {
    const matches = uniq(values(edges).flatMap((e) => edgeMap[e].filter((otherId) => +id !== otherId)));
    return [id, matches];
  });

  console.log(matchingEdges.filter(([, matches]) => matches.length === 2));
  console.log(matchingEdges.filter(([, matches]) => matches.length === 2).reduce((acc, [id]) => acc * +id, 1));
}

day20();
