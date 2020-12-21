import { cloneDeep, mapValues, reverse, values } from "lodash";
import { notNull } from "../util";
import { puzzleInput } from "./day20_input";

type TileId = number;
type MatchedEdge = { edge: string; match?: TileId }; // Every edge has at most one matching edge.
type MatchedEdges = { top: MatchedEdge; left: MatchedEdge; right: MatchedEdge; bottom: MatchedEdge };
type Tile = string[][];
type TileEdges = { id: TileId; tile: Tile; edges: MatchedEdges };
type EdgeMap = { [edge: string]: number[] };

const strRev = (str: string) => reverse(str.split("")).join("");

function transpose<T>(array: T[][]): T[][] {
  return array[0].map((_, colIndex) => array.map((row) => row[colIndex]));
}

function flipTile(array: Tile): Tile {
  const max = array.length - 1;
  const target = cloneDeep(array);
  array.forEach((row, rowIdx) => {
    target[max - rowIdx] = row;
  });
  return target;
}

function rotateTile(array: Tile): Tile {
  const max = array.length - 1;
  const target = cloneDeep(array);
  array.forEach((row, rowIdx) =>
    row.forEach((cell, colIdx) => {
      target[colIdx][max - rowIdx] = cell;
    })
  );
  return target;
}

function getEdges(tile: Tile): MatchedEdges {
  const top = { edge: tile[0].join("") };
  const bottom = { edge: tile[tile.length - 1].join("") };
  const left = { edge: tile.map((l) => l[0]).join("") };
  const right = { edge: tile.map((l) => l[l.length - 1]).join("") };
  return { top, bottom, left, right };
}

function parseInput(input: string): TileEdges[] {
  const tiles = input.split("\n\n");
  return tiles.map((tileData) => {
    const [idLine, ...rest] = tileData.split("\n");
    const tile = rest.map((l) => [...l]);
    const [, id] = idLine.match(/Tile ([0-9]+):/) || [];
    return { id: +id, tile, edges: getEdges(tile), transformation: "" };
  });
}

function findEdgeMatches(tiles: TileEdges[]): EdgeMap {
  const edgeMap: { [edge: string]: number[] } = {};
  tiles.forEach((t) => {
    values(t.edges).forEach((edge) => {
      const reversed: string = strRev(edge.edge);

      edgeMap[edge.edge] = [...(edgeMap[edge.edge] || []), t.id];
      edgeMap[reversed] = [...(edgeMap[reversed] || []), t.id];
    });
  });
  return edgeMap;
}

function addMatchingEdges(tile: TileEdges, edgeMap: { [edge: string]: number[] }): TileEdges {
  return {
    ...tile,
    edges: mapValues(tile.edges, (e) => ({
      ...e,
      match: edgeMap[e.edge].find((otherId) => tile.id !== otherId),
    })),
  };
}
function transformToMatchEdge(
  edge: string,
  tile: TileEdges,
  getTargetEdge: (t: TileEdges) => string,
  edgeMap: EdgeMap
): TileEdges {
  let transf = tile;
  let rotations = 0;
  while (getTargetEdge(transf) !== edge && rotations < 4) {
    transf = rotate(transf, edgeMap);
    rotations++;
  }

  if (getTargetEdge(transf) !== edge) {
    transf = flip(transf, edgeMap);
  }
  while (getTargetEdge(transf) !== edge) {
    transf = rotate(transf, edgeMap);
  }
  return transf;
}

function flip(tile: TileEdges, edgeMap: EdgeMap): TileEdges {
  const flipped = flipTile(tile.tile);
  return addMatchingEdges(
    {
      id: tile.id,
      tile: flipped,
      edges: getEdges(flipped),
    },
    edgeMap
  );
}

function rotate(tile: TileEdges, edgeMap: EdgeMap): TileEdges {
  const rotated = rotateTile(tile.tile);
  return addMatchingEdges(
    {
      id: tile.id,
      tile: rotated,
      edges: getEdges(rotated),
    },
    edgeMap
  );
}

function stripBorder(t: TileEdges): TileEdges {
  function sb(tile: Tile): Tile {
    return tile.slice(1, tile.length - 1).map((line) => line.slice(1, line.length - 1));
  }
  return { ...t, tile: sb(t.tile) };
}
const monsterMap = [
  [0, 18],
  [1, 0],
  [1, 5],
  [1, 6],
  [1, 11],
  [1, 12],
  [1, 17],
  [1, 18],
  [1, 19],
  [2, 1],
  [2, 4],
  [2, 7],
  [2, 10],
  [2, 13],
  [2, 16],
];
function removeSeaMonster(image: string[][], start: { row: number; col: number }) {
  monsterMap.forEach((coord) => {
    image[start.row + coord[0]][start.col + coord[1]] = "X";
  });
}

function findSeaMonsters(image: string[][]) {
  const monsterCoords = [];
  for (let i = 0; i < 93; i++) {
    for (let j = 0; j < 76; j++) {
      if (isSeaMonster(image, { row: i, col: j })) {
        monsterCoords.push({ row: i, col: j });
      }
    }
  }
  return monsterCoords;
}

function isSeaMonster(image: string[][], start: { row: number; col: number }) {
  return monsterMap.reduce((match, coord) => {
    const ch = image[start.row + coord[0]][start.col + coord[1]];
    return ch === "#" && match;
  }, true);
}

export function day20(): void {
  const tiles = parseInput(puzzleInput);
  const width = Math.sqrt(tiles.length);

  const edgeMap = findEdgeMatches(tiles);

  // List of all of the tiles, with each edge linking to the ID of the edge that matches it
  const tilesWithMatches: TileEdges[] = tiles.map((tile) => addMatchingEdges(tile, edgeMap));

  // corners only have matches for two of their edges.
  const corners = tilesWithMatches.filter((t) => {
    return values(t.edges).filter((e) => e.match === undefined).length === 2;
  });

  console.log(
    "Day 20 Part 1:",
    corners.map((c) => c.id).reduce((acc, id) => acc * id, 1)
  );

  const topLeft = notNull(
    tilesWithMatches.find((t) => {
      return t.edges.top.match === undefined && t.edges.left.match === undefined;
    })
  );

  // Work out the top row of the puzzle first.
  let topRow: TileEdges[] = [topLeft];
  while (topRow.length < width) {
    const curr = topRow[topRow.length - 1];
    const nextId = curr.edges.right.match;
    const next = transformToMatchEdge(
      curr.edges.right.edge,
      notNull(tilesWithMatches.find((t) => t.id === nextId)),
      (te) => te.edges.left.edge,
      edgeMap
    );
    topRow = [...topRow, next];
  }
  //  console.log(topRow.map((t) => t.id));

  let picture: TileEdges[][] = [];
  // now work downwards
  topRow.forEach((tile, index) => {
    let col: TileEdges[] = [tile];
    while (col.length < width) {
      const curr = col[col.length - 1];
      const nextId = curr.edges.bottom.match;
      const next = transformToMatchEdge(
        curr.edges.bottom.edge,
        notNull(tilesWithMatches.find((t) => t.id === nextId)),
        (te) => te.edges.top.edge,
        edgeMap
      );
      col = [...col, next];
    }
    picture[index] = col;
  });

  // We applied the picture in columns rather than rows, so transpose it the right way round.
  picture = transpose(picture);

  // strip the borders
  const pic2 = picture.map((row) => row.map((cell) => stripBorder(cell)));

  // create an empty array to apply the image into
  const image: string[][] = [];
  for (let i = 0; i < 96; i++) {
    const rw = [];
    for (let j = 0; j < 96; j++) {
      rw[j] = " ";
    }
    image[i] = rw;
  }
  // map the pieces into the image
  pic2.forEach((line, lineNum) => {
    line.forEach((t, cNum) => {
      t.tile.forEach((tL, tLNum) => {
        tL.forEach((ch, chNum) => {
          const lineNumber = lineNum * 8 + tLNum;
          const colNumber = cNum * 8 + chNum;
          image[lineNumber][colNumber] = ch;
        });
      });
    });
  });

  // turn it the right way up
  const imageWithMonsters = rotateTile(rotateTile(image));
  const monsters = findSeaMonsters(imageWithMonsters);
  monsters.forEach((m) => removeSeaMonster(imageWithMonsters, m));

  //  find the number of # characters remaining in the image
  const hashes = imageWithMonsters.reduce(
    (c, line) => c + line.reduce((acc, ch) => (ch === "#" ? acc + 1 : acc), 0),
    0
  );
  console.log("Day 20 Part 2:", hashes);
}
