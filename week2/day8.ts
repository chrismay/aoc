import { doWhile } from "../util";
import { day8Program, normalExit, part1Test } from "./day8_input";

type ProgramState = {
  instructionPointer: number;
  accumulator: number;
  halt: "NO" | "OK" | "ERR";
};

type TrackingProgramState = ProgramState & {
  visitedInstructions: { [address: number]: boolean };
};

function modifiedPrograms(program: string[]): string[][] {
  function mapOpCode(from: string, to: string): string[][] {
    return program
      .map((line, idx) => {
        const [opcode, arg] = line.split(" ");
        if (opcode !== from) {
          return [];
        } else {
          return Object.assign([], program, { [idx]: to + " " + arg });
        }
      })
      .filter((prog) => prog.length === program.length);
  }
  return [...mapOpCode("nop", "jmp"), ...mapOpCode("jmp", "nop")];
}

export function day8() {
  function executeInstruction(
    program: string[],
    state: ProgramState
  ): ProgramState {
    const [opCode, arg] = program[state.instructionPointer].split(" ");
    switch (opCode) {
      case "nop":
        return {
          ...state,
          instructionPointer: 1 + state.instructionPointer,
        };
      case "acc":
        return {
          ...state,
          accumulator: state.accumulator + +arg,
          instructionPointer: 1 + state.instructionPointer,
        };
      case "jmp":
        return {
          ...state,
          instructionPointer: state.instructionPointer + +arg,
        };
      default:
        throw "unrecognised instruction";
    }
  }

  const initialState: ProgramState & {
    visitedInstructions: { [address: number]: boolean };
  } = {
    accumulator: 0,
    instructionPointer: 0,
    visitedInstructions: {},
    halt: "NO",
  };

  function loopGuard(
    instruction: (state: ProgramState) => ProgramState,
    state: TrackingProgramState
  ): TrackingProgramState {
    if (state.visitedInstructions[state.instructionPointer]) {
      return { ...state, halt: "ERR" };
    }
    const visitedInstructions = {
      ...state.visitedInstructions,
      [state.instructionPointer]: true,
    };

    return { ...instruction(state), visitedInstructions };
  }

  function terminationGuard(
    instruction: (state: ProgramState) => ProgramState,
    state: ProgramState,
    programLength: number
  ): ProgramState {
    if (state.instructionPointer === programLength) {
      return { ...state, halt: "OK" };
    }
    return instruction(state);
  }

  function evaluate(
    program: string[],
    state: TrackingProgramState
  ): TrackingProgramState {
    return doWhile(
      (st) =>
        loopGuard(
          (s) =>
            terminationGuard(
              (s) => executeInstruction(program, s),
              s,
              program.length
            ),
          st
        ),
      (st) => st.halt === "NO",
      state
    );
  }

  const program = day8Program.split("\n");
  const result = evaluate(program, initialState);
  console.log("Day 8 Part 1:", result.halt, result.accumulator);

  const modified = modifiedPrograms(day8Program.split("\n"));

  const successful =
    modified.find((p) => evaluate(p, initialState).halt === "OK") || [];
  const successResult = evaluate(successful, initialState);

  console.log("Day 8 Part 2:", successResult.halt, successResult.accumulator);
}
