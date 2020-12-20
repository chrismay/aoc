import { cloneDeep, mapValues, reverse, values } from "lodash";
import { puzzleInput, sm } from "./day20_input";

type MatchedEdge = { edge: string; matches: number[] };
type MatchedEdges = { top: MatchedEdge; left: MatchedEdge; right: MatchedEdge; bottom: MatchedEdge };
type TileEdges = { id: number; tile: string[]; edges: MatchedEdges; transformation: string };

const strRev = (str: string) => reverse(str.split("")).join("");

function transpose<T>(array: T[][]): T[][] {
  return array[0].map((_, colIndex) => array.map((row) => row[colIndex]));
}

function printTile(t: string[]) {
  t.forEach((l) => console.log(l));
}
function flipTile(tile: string[]): string[] {
  const array = tile.map((l) => l.split(""));
  const max = array.length - 1;
  const target = cloneDeep(array);
  array.forEach((row, rowIdx) => {
    target[max - rowIdx] = row;
  });
  return target.map((l) => l.join(""));
}

function rotateTile(tile: string[]): string[] {
  const array = tile.map((l) => l.split(""));

  return rotateMatrix(array).map((l) => l.join(""));
}

function rotateMatrix(array: string[][]): string[][] {
  const max = array.length - 1;
  const target = cloneDeep(array);
  array.forEach((row, rowIdx) =>
    row.forEach((cell, colIdx) => {
      target[colIdx][max - rowIdx] = cell;
    })
  );
  return target;
}

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
    transformation: tile.transformation + "F",
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
    transformation: tile.transformation === "RRR" ? "" : tile.transformation + "R",
    edges: {
      top: { edge: strRev(tile.edges.left.edge), matches: tile.edges.left.matches },
      bottom: { edge: strRev(tile.edges.right.edge), matches: tile.edges.right.matches },
      left: tile.edges.bottom,
      right: tile.edges.top,
    },
  };
}

function applyTransforms(t: TileEdges): TileEdges {
  return [...t.transformation].reduce((te, trans) => {
    switch (trans) {
      case "F":
        return { ...te, tile: flipTile(te.tile) };
      case "R":
        return { ...te, tile: rotateTile(te.tile) };
      default:
        throw "what?";
    }
  }, t);
}

function stripBorder(t: TileEdges): TileEdges {
  function sb(tile: string[]) {
    return tile.slice(1, tile.length - 1).map((line) => line.slice(1, line.length - 1));
  }
  return { ...t, tile: sb(t.tile) };
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

  let picture: TileEdges[][] = [];
  // now work downwards
  topRow.forEach((tile, index) => {
    let col: TileEdges[] = [tile];
    while (col.length < width) {
      const curr = col[col.length - 1];
      const nextId = curr.edges.bottom.matches[0];
      const next = transformToMatchBottonEdge(curr.edges.bottom.edge, tilesWithMatches.find((t) => t.id === nextId)!!);
      col = [...col, next];
    }
    picture[index] = col;
  });
  picture = transpose(picture);
  transpose(picture).map((row) => {
    console.log(row.map((cell) => cell.id + cell.transformation).join(","));
  });

  console.log("------");
  printTile(picture[0][0].tile);
  printTile(stripBorder(picture[0][0]).tile);

  // strip the borders and rotate the pieces
  const pic2 = picture.map((row) => row.map((cell) => stripBorder(applyTransforms(cell))));
  const image: string[][] = [];
  // create a blank image
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
        tL.split("").forEach((ch, chNum) => {
          const lineNumber = lineNum * 8 + tLNum;
          const colNumber = cNum * 8 + chNum;
          image[lineNumber][colNumber] = ch;
        });
      });
    });
  });
  console.log();
  printTile(picture[0][0].tile);
  image.forEach((l) => console.log(l.join("")));

  console.log(isSeaMonster(sm, { row: 0, col: 0 }));
  console.log(isSeaMonster(sm, { row: 1, col: 0 }));

  const imageWithMonsters = rotateMatrix(rotateMatrix(image));
  const monsters = findSeaMonsters(imageWithMonsters);
  monsters.forEach((m) => removeSeaMonster(imageWithMonsters, m));

  console.log("---MONSTERS---");
  imageWithMonsters.forEach((l) => console.log(l.join("")));
  const hashes = imageWithMonsters.reduce(
    (c, line) => c + line.reduce((acc, ch) => (ch === "#" ? acc + 1 : acc), 0),
    0
  );
  console.log(hashes);
}
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
        console.log(i, j);
        monsterCoords.push({ row: i, col: j });
      }
    }
  }
  return monsterCoords;
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
function isSeaMonster(image: string[][], start: { row: number; col: number }) {
  return monsterMap.reduce((match, coord) => {
    const ch = image[start.row + coord[0]][start.col + coord[1]];
    return ch === "#" && match;
  }, true);
}

day20();
