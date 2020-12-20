import { mapValues, reverse, values } from "lodash";
import { puzzleInput } from "./day20_input";

type MatchedEdge = { edge: string; matches: number[] };
type MatchedEdges = { top: MatchedEdge; left: MatchedEdge; right: MatchedEdge; bottom: MatchedEdge };
type TileEdges = { id: number; tile: string[]; edges: MatchedEdges; transformation: string };

const strRev = (str: string) => reverse(str.split("")).join("");

function getEdges(tile: string[]): MatchedEdges {
  const top = { edge: tile[0], matches: [] };
  const bottom = { edge: tile[tile.length - 1], matches: [] };
  const left = { edge: tile.map((l) => l[0]).join(""), matches: [] };
  const right = { edge: tile.map((l) => l[l.length - 1]).join(""), matches: [] };
  return { top, bottom, left, right };
}

function parseInput(input: string): TileEdges[] {
  const tiles = input.split("\n\n");
  return tiles.map((tile) => {
    const [idLine, ...rest] = tile.split("\n");
    const [, id] = idLine.match(/Tile ([0-9]+):/) || [];
    return { id: +id, tile: rest, edges: getEdges(rest), transformation: "" };
  });
}

function transformToMatchBottonEdge(edge: string, tile: TileEdges): TileEdges {
  let transf = tile;
  // console.log(tile);
  let rotations = 0;
  while (transf.edges.top.edge !== edge && rotations < 4) {
    transf = rotate(transf);
    rotations++;
  }
  if (transf.edges.top.edge !== edge) {
    transf = flip(transf);
  }
  while (transf.edges.top.edge !== edge && rotations < 8) {
    transf = rotate(transf);
    rotations++;
  }
  // console.log("Got a match", transf.transformation);
  return transf;
}

function transformToMatchRightEdge(edge: string, tile: TileEdges): TileEdges {
  let transf = tile;
  // console.log(tile);
  let rotations = 0;
  while (transf.edges.left.edge !== edge && rotations < 4) {
    transf = rotate(transf);
    rotations++;
  }
  if (transf.edges.left.edge !== edge) {
    transf = flip(transf);
  }
  while (transf.edges.left.edge !== edge && rotations < 8) {
    transf = rotate(transf);
    rotations++;
  }
  // console.log("Got a match", transf.transformation);
  return transf;
}

function flip(tile: TileEdges): TileEdges {
  return {
    ...tile,
    transformation: tile.transformation + "R",
    edges: {
      top: tile.edges.bottom,
      bottom: tile.edges.top,
      left: { edge: strRev(tile.edges.left.edge), matches: tile.edges.left.matches },
      right: { edge: strRev(tile.edges.right.edge), matches: tile.edges.right.matches },
    },
  };
}

function rotate(tile: TileEdges): TileEdges {
  return {
    ...tile,
    transformation: tile.transformation + "F",
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
  tiles.forEach((t) => {
    values(t.edges).forEach((edge) => {
      const reversed: string = strRev(edge.edge);

      edgeMap[edge.edge] = [...(edgeMap[edge.edge] || []), t.id];
      edgeMap[reversed] = [...(edgeMap[reversed] || []), t.id];
    });
  });

  const tilesWithMatches: TileEdges[] = tiles.map((tile) => {
    return {
      ...tile,
      edges: mapValues(tile.edges, (e) => ({
        ...e,
        matches: edgeMap[e.edge].filter((otherId) => tile.id !== otherId),
      })),
    };
  });

  const corners = tilesWithMatches.filter((t) => {
    return values(t.edges).flatMap((e) => e.matches).length === 2;
  });

  const topLeft = tilesWithMatches.find((t) => {
    return t.edges.top.matches.length === 0 && t.edges.left.matches.length === 0;
  })!!;

  console.log(topLeft);

  tilesWithMatches.forEach((t) => {
    values(t.edges).forEach((edge) => {
      if (edge.matches.length > 1) {
        throw "Edge Ambiguous";
      }
    });
  });
  let topRow: TileEdges[] = [topLeft];
  while (topRow.length < width) {
    const curr = topRow[topRow.length - 1];
    const nextId = curr.edges.right.matches[0];
    const next = transformToMatchRightEdge(curr.edges.right.edge, tilesWithMatches.find((t) => t.id === nextId)!!);
    topRow = [...topRow, next];
  }
  console.log(topRow.map((t) => t.id));

  let picture: TileEdges[][] = [topRow];
  // now work downwards
  topRow.forEach((tile, index) => {
    let col: TileEdges[] = [tile];
    while (col.length < width) {
      const curr = col[col.length - 1];
      const nextId = curr.edges.bottom.matches[0];
      const next = transformToMatchBottonEdge(curr.edges.bottom.edge, tilesWithMatches.find((t) => t.id === nextId)!!);
      col = [...col, next];
    }
    console.log(
      "col " + index,
      col.map((t) => t.id)
    );
  });
}

day20();
