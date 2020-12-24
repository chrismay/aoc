import { countBy, toPairs } from "lodash";
import { tileInput } from "./day24_input";

type Coord = { x: number; y: number; z: number };
type Move = "e" | "w" | "ne" | "nw" | "se" | "sw";

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

export function day24() {
  const modified = tileInput.split("\n").map((moves) => {
    return JSON.stringify(getOffset(parseMoves(moves)));
  });
  console.log("Day 24 Part 1:", toPairs(countBy(modified)).filter(([, v]) => v % 2 === 1).length);
}

day24();
