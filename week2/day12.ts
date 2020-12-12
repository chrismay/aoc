import { findIndex, isEqual } from "lodash";
import { directions, testDirections } from "./day12_input";

type Coord = { x: number; y: number };
type State = { pos: Coord; dir: Coord };
type Direction = "N" | "S" | "E" | "W";
type TurnDirection = "L" | "R";
type OpCode = Direction | TurnDirection | "F";
type Instruction = { opCode: OpCode; value: number };

const directionsToCoords: [Direction, Coord][] = [
  ["N", { x: 0, y: 1 }],
  ["E", { x: 1, y: 0 }],
  ["S", { x: 0, y: -1 }],
  ["W", { x: -1, y: 0 }],
];

function coordToDirection(coord: Coord): Direction {
  const found = directionsToCoords.find(([d, c]) => isEqual(c, coord));
  if (found) {
    return found[0];
  } else {
    throw "No direction matches coord " + coord;
  }
}

function directionToCoord(dir: Direction): Coord {
  const found = directionsToCoords.find(([d, c]) => d === dir);
  if (found) {
    return found[1];
  } else {
    throw "No coord matches direction " + dir;
  }
}

function findDirectionIndex(dir: Direction): number {
  return findIndex(directionsToCoords, ([d, c]) => d === dir);
}

function velocity(dir: Coord, speed: number): Coord {
  return { x: dir.x * speed, y: dir.y * speed };
}
function move(pos: Coord, velocity: Coord): Coord {
  return { x: pos.x + velocity.x, y: pos.y + velocity.y };
}
function turn(currentDir: Coord, turnDir: TurnDirection, degrees: number): Coord {
  if (degrees % 90 !== 0) throw "Unexpected angle! " + degrees;
  const rightAngles = turnDir === "R" ? Math.floor(degrees / 90) % 4 : 4 - (Math.floor(degrees / 90) % 4);

  const currentCompassDir = coordToDirection(currentDir);
  const directionIndex = (findDirectionIndex(currentCompassDir) + rightAngles) % 4;
  return directionsToCoords[directionIndex][1];
}

function parseInstruction(s: string): Instruction {
  const [, op, val] = s.match(/([A-Z])([0-9]+)/) || [];
  return { opCode: op as OpCode, value: +val };
}
function applyInstruction(state: State, instruction: Instruction): State {
  //console.log(instruction, state);
  switch (instruction.opCode) {
    case "N":
    case "S":
    case "E":
    case "W": {
      const tranlation = velocity(directionToCoord(instruction.opCode), instruction.value);
      return { ...state, pos: move(state.pos, tranlation) };
    }
    case "L":
    case "R": {
      return { ...state, dir: turn(state.dir, instruction.opCode, instruction.value) };
    }
    case "F": {
      return { ...state, pos: move(state.pos, velocity(state.dir, instruction.value)) };
    }
  }
}
function manhattanDistance(pos: Coord) {
  return Math.abs(pos.x) + Math.abs(pos.y);
}

export function day12() {
  const instructions = directions.split("\n").map(parseInstruction);
  //  console.log(instructions);
  const start: State = { pos: { x: 0, y: 0 }, dir: directionToCoord("E") };
  const end = instructions.reduce(applyInstruction, start);
  console.log(manhattanDistance(end.pos));
}
