import { assign, fromPairs, padStart, sum, values, zipWith } from "lodash";
import { day14program } from "./day14_input";

function cat(s: string) {
  return function (t: string) {
    return t + s;
  };
}

const binToInt = (s: string) => parseInt(s, 2);

const uncons = (s: string) => [s.substr(0, 1), s.slice(1)];

function maskp1(input: number, mask: string): number {
  const inputString = padStart(input.toString(2), mask.length, "0");

  return parseInt(zipWith([...mask], [...inputString], (m, d) => (m === "X" ? d : m)).join(""), 2);
}

type State = { mask: string; mem: { [addr: number]: number } };

function applyInstruction(state: State, instruction: string): State {
  //console.log(instruction);
  if (instruction.startsWith("mask")) {
    return { ...state, mask: instruction.replace("mask = ", "") };
  } else {
    const [, address, value] = instruction.match(/mem\[([0-9]+)\] = ([0-9]+)/) || [];
    return { ...state, mem: assign(state.mem, { [+address]: maskp1(+value, state.mask) }) };
  }
}

function p2Mask(input: number, mask: string) {
  const inputString = padStart(input.toString(2), mask.length, "0");

  function maskToAddresses(outputs: string[], input: string, mask: string): string[] {
    if (mask.length === 0) return outputs;

    const [maskChar, maskRest] = uncons(mask);
    const [inputChar, inputRest] = uncons(input);

    switch (maskChar) {
      case "1":
        return maskToAddresses(outputs.map(cat("1")), inputRest, maskRest);
      case "0":
        return maskToAddresses(outputs.map(cat(inputChar)), inputRest, maskRest);
      case "X":
        return maskToAddresses(
          outputs.flatMap((o) => ["0", "1"].map((d) => o + d)),
          inputRest,
          maskRest
        );
      default:
        throw "unrecognized mask char " + maskChar;
    }
  }

  return maskToAddresses([""], inputString, mask);
}

function applyP2Instruction(state: State, instruction: string): State {
  if (instruction.startsWith("mask")) {
    return { ...state, mask: instruction.replace("mask = ", "") };
  } else {
    const [, address, value] = instruction.match(/mem\[([0-9]+)\] = ([0-9]+)/) || [];

    const maskedAddresses = p2Mask(+address, state.mask).map(binToInt);
    const updatedMemory = fromPairs(maskedAddresses.map((a) => [a, +value]));
    return { ...state, mem: assign(state.mem, updatedMemory) };
  }
}

export function day14(): void {
  const program = day14program.split("\n");
  const result = program.reduce(applyInstruction, { mem: {}, mask: "" });
  console.log("Day 14 Part 1:", sum(values(result.mem)));

  const p2Result = day14program.split("\n").reduce(applyP2Instruction, { mem: {}, mask: "" });
  console.log("day 14 Part 2:", sum(values(p2Result.mem)));
}
