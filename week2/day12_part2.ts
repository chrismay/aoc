import { dir } from "console";
import { findIndex, isEqual, range } from "lodash";
import { directions, testDirections } from "./day12_input";

type Coord = { x: number; y: number };
type State = { pos: Coord; dir: Coord; waypointPos: Coord };
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
function rotate90Clockwise(c: Coord) {
  return { x: -c.y, y: c.x };
}

function turn(currentDir: Coord, turnDir: TurnDirection, degrees: number): Coord {
  if (degrees % 90 !== 0) throw "Unexpected angle! " + degrees;
  const rightAngles = turnDir === "L" ? Math.floor(degrees / 90) % 4 : 4 - (Math.floor(degrees / 90) % 4);

  return range(0, rightAngles).reduce(rotate90Clockwise, currentDir);
}

function parseInstruction(s: string): Instruction {
  const [, op, val] = s.match(/([A-Z])([0-9]+)/) || [];
  return { opCode: op as OpCode, value: +val };
}
function applyInstruction(state: State, instruction: Instruction): State {
  // console.log(instruction, state);
  switch (instruction.opCode) {
    case "N":
      return { ...state, waypointPos: { ...state.waypointPos, y: state.waypointPos.y + instruction.value } };
    case "S":
      return { ...state, waypointPos: { ...state.waypointPos, y: state.waypointPos.y - instruction.value } };
    case "E":
      return { ...state, waypointPos: { ...state.waypointPos, x: state.waypointPos.x + instruction.value } };
    case "W": {
      return { ...state, waypointPos: { ...state.waypointPos, x: state.waypointPos.x - instruction.value } };
    }
    case "L":
    case "R": {
      return { ...state, waypointPos: turn(state.waypointPos, instruction.opCode, instruction.value) };
    }
    case "F": {
      return { ...state, pos: move(state.pos, velocity(state.waypointPos, instruction.value)) };
    }
  }
}
function manhattanDistance(pos: Coord) {
  return Math.abs(pos.x) + Math.abs(pos.y);
}

export function day12p2() {
  const instructions = directions.split("\n").map(parseInstruction);
  //console.log(instructions);
  const start: State = { pos: { x: 0, y: 0 }, dir: directionToCoord("E"), waypointPos: { x: 10, y: 1 } };
  const end = instructions.reduce(applyInstruction, start);
  console.log(manhattanDistance(end.pos));
  // console.log(turn({ x: 1, y: 10 }, "L", 90));
}
