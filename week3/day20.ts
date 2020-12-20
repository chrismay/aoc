import { fromPairs, mapValues, reverse, toPairs, uniq, values } from "lodash";
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
type MatchedEdge = { edge: string; matches: number[] };
type MatchedEdges = { top: MatchedEdge; left: MatchedEdge; right: MatchedEdge; bottom: MatchedEdge };
function transformToMatchRightEdge(edge: string, tile: { id: number; edges: MatchedEdges }) {
  let transf = tile;
  console.log(tile);
  let rotations = 0;
  let transform = "";
  while (transf.edges.left.edge !== edge && rotations < 4) {
    transf = rotate(transf);
    transform = transform + "R";
    rotations++;
  }
  if (transf.edges.left.edge !== edge) {
    transf = flip(transf);
    transform = transform + "F";
  }
  while (transf.edges.left.edge !== edge && rotations < 4) {
    transf = rotate(transf);
    transform = transform + "R";
    rotations++;
  }
  console.log("Got a match", transform);
  return { tile: transf, transform };
}

function flip(tile: { id: number; edges: MatchedEdges }): { id: number; edges: MatchedEdges } {
  return {
    id: tile.id,
    edges: {
      top: tile.edges.bottom,
      bottom: tile.edges.top,
      left: { edge: strRev(tile.edges.left.edge), matches: tile.edges.left.matches },
      right: { edge: strRev(tile.edges.right.edge), matches: tile.edges.right.matches },
    },
  };
}

function rotate(tile: { id: number; edges: MatchedEdges }): { id: number; edges: MatchedEdges } {
  return {
    id: tile.id,
    edges: {
      top: { edge: strRev(tile.edges.left.edge), matches: tile.edges.left.matches },
      bottom: { edge: strRev(tile.edges.right.edge), matches: tile.edges.right.matches },
      left: tile.edges.bottom,
      right: tile.edges.top,
    },
  };
}

export function day20(): void {
  const tiles = parseInput(puzzleInput);
  const width = 12;
  // console.log("Day 20", tiles);

  const edgeMap: { [edge: string]: number[] } = {};
  toPairs(tiles).forEach(([id, { edges }]) => {
    values(edges).forEach((edge) => {
      const reversed: string = strRev(edge);

      edgeMap[edge] = [...(edgeMap[edge] || []), +id];
      edgeMap[reversed] = [...(edgeMap[reversed] || []), +id];
    });
  });

  const matchingEdges = toPairs(tiles).map(([id, { edges }]) => {
    const matches = uniq(values(edges).flatMap((e) => edgeMap[e].filter((otherId) => +id !== otherId)));
    return { id, edges, matches };
  });

  //   const corners = matchingEdges.filter(({ id, edges, matches }) => matches.length === 2);
  //   console.log(
  //     "Day 20 Part 1:",
  //     corners.reduce((acc, { id }) => acc * +id, 1)
  //   );

  const xx = toPairs(tiles).map(([id, { edges }]) => {
    return {
      id,
      edges: mapValues(edges, (e) => ({ edge: e, matches: edgeMap[e].filter((otherId) => +id !== otherId) })),
    };
  });
  const tilesWithEdgeMatches = fromPairs(xx.map(({ id, edges }) => [+id, edges]));

  const corners = xx.filter(({ id, edges }) => values(edges).flatMap((v) => v.matches).length === 2);
  corners.forEach((c) => {
    console.log(c.id);
    toPairs(c.edges).forEach(([n, detail]) => {
      if (detail.matches.length > 0) {
        console.log(n, detail);
      }
    });
  });

  let currentTiles: any = corners.filter((corner) => corner.edges.right.matches.length > 0)!!;
  let currentTile = currentTiles[0];
  let matchedTiles: any[] = [currentTile];
  while (matchedTiles.length < width) {
    console.log(`current tile ID is ${currentTile.id}`);
    console.log(`possible edge matches are ${edgeMap[currentTile.edges.right.edge]}`);
    const matchTileIds = matchedTiles.map((mt) => +mt.id);
    const nextTiles = edgeMap[currentTile.edges.right.edge].filter(
      (match) => matchTileIds.find((m) => m === match) === undefined
    );
    console.log(`filtered matches are ${nextTiles}`);
    switch (nextTiles.length) {
      case 0:
        throw "Failed to find an edge match";
      case 1:
        console.log(`Match for ${currentTile.edges.right.edge} is ${nextTiles[0]} `);
        const transformed = transformToMatchRightEdge(currentTile.edges.right.edge, {
          id: nextTiles[0],
          edges: tilesWithEdgeMatches[nextTiles[0]],
        });
        currentTile = transformed.tile;
        matchedTiles.push(currentTile);
        break;
      default:
        throw `Multiple matches (${nextTiles.length}) for ${currentTile.edges.right.edge} - picking the first??`;
    }
  }
  console.log(
    "First row: ",
    matchedTiles.map((m) => +m.id)
  );
}

day20();
