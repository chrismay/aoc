import { curry, findIndex, isEqual, memoize, range } from "lodash";
import { directions } from "./day12_input";

type Coord = { x: number; y: number };
type State = { pos: Coord; waypointPos: Coord };
type Direction = "N" | "S" | "E" | "W";
type TurnDirection = "L" | "R";
type OpCode = Direction | TurnDirection | "F";
type Instruction = { opCode: OpCode; value: number };
type DirectionMove = (s: State, dir: Direction, distance: number) => State;

const eq = curry(isEqual);

const directionVector = memoize((dir: Direction) => {
  const directionNames = ["N", "E", "S", "W"];
  return range(0, findIndex(directionNames, eq(dir))).reduce((c) => ({ x: c.y, y: -c.x }), { x: 0, y: 1 });
});

function multiply(dir: Coord, speed: number): Coord {
  return { x: dir.x * speed, y: dir.y * speed };
}
function translate(fromPos: Coord, translation: Coord): Coord {
  return { x: fromPos.x + translation.x, y: fromPos.y + translation.y };
}

function turn(currentDir: Coord, turnDir: TurnDirection, degrees: number): Coord {
  if (degrees % 90 !== 0) throw "Unexpected angle:" + degrees;

  const rightAngles = Math.floor(degrees / 90);
  const turnsToMake = turnDir === "R" ? rightAngles % 4 : 4 - (rightAngles % 4);

  return range(0, turnsToMake).reduce((c) => ({ x: c.y, y: -c.x }), currentDir);
}

function parseInstruction(s: string): Instruction {
  const [, op, val] = s.match(/([A-Z])([0-9]+)/) || [];
  return { opCode: op as OpCode, value: +val };
}

function applyInstruction(directionInstruction: DirectionMove) {
  return function (state: State, instruction: Instruction): State {
    const { opCode, value } = instruction;
    //console.log(instruction, state);
    switch (opCode) {
      case "N":
      case "S":
      case "E":
      case "W":
        return directionInstruction(state, opCode, value);

      case "L":
      case "R":
        return { ...state, waypointPos: turn(state.waypointPos, opCode, value) };

      case "F":
        return { ...state, pos: translate(state.pos, multiply(state.waypointPos, value)) };
    }
  };
}

function part1DirectionInstruction(state: State, dir: Direction, distance: number) {
  return { ...state, pos: translate(state.pos, multiply(directionVector(dir), distance)) };
}
function part2DirectionInstruction(state: State, dir: Direction, distance: number) {
  return { ...state, waypointPos: translate(state.waypointPos, multiply(directionVector(dir), distance)) };
}

function manhattanDistance(pos: Coord) {
  return Math.abs(pos.x) + Math.abs(pos.y);
}

export function day12() {
  const origin = { x: 0, y: 0 };
  const instructions = directions.split("\n").map(parseInstruction);

  const start: State = { pos: origin, waypointPos: directionVector("E") };
  const endPart1 = instructions.reduce(applyInstruction(part1DirectionInstruction), start);
  console.log("Day 12 part 1:", manhattanDistance(endPart1.pos));

  const startPart2: State = { pos: origin, waypointPos: { x: 10, y: 1 } };
  const endPart2 = instructions.reduce(applyInstruction(part2DirectionInstruction), startPart2);
  console.log("Day 12 part 1:", manhattanDistance(endPart2.pos));
}
