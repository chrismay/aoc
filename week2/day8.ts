import { day8Program, normalExit, part1Test } from "./day8_input";

type ProgramState = {
  instructionPointer: number;
  accumulator: number;
  visitedInstructions: { [address: number]: boolean };
  halt: "NO" | "OK" | "ERR";
};

function modifiedPrograms(program: string[]): string[][] {
  const jmpToNop = program
    .map((line, idx) => {
      const [opcode, arg] = line.split(" ");
      if (opcode !== "jmp") {
        return [];
      } else {
        return Object.assign([], program, { [idx]: "nop " + arg });
      }
    })
    .filter((prog) => prog.length === program.length);

  const nopToJmp = program
    .map((line, idx) => {
      const [opcode, arg] = line.split(" ");
      if (opcode !== "nop") {
        return [];
      } else {
        return Object.assign([], program, { [idx]: "jmp " + arg });
      }
    })
    .filter((prog) => prog.length === program.length);

  return [...nopToJmp, ...jmpToNop];
}

export function day8() {
  function instruction(program: string[], state: ProgramState): ProgramState {
    if (state.instructionPointer === program.length) {
      return { ...state, halt: "OK" };
    }
    if (state.visitedInstructions[state.instructionPointer]) {
      return { ...state, halt: "ERR" };
    }
    const visitedInstructions = {
      ...state.visitedInstructions,
      [state.instructionPointer]: true,
    };
    const [opCode, arg] = program[state.instructionPointer].split(" ");
    switch (opCode) {
      case "nop":
        return {
          ...state,
          instructionPointer: 1 + state.instructionPointer,
          visitedInstructions,
        };
      case "acc":
        return {
          ...state,
          accumulator: state.accumulator + +arg,
          instructionPointer: 1 + state.instructionPointer,
          visitedInstructions,
        };
      case "jmp":
        return {
          ...state,
          instructionPointer: state.instructionPointer + +arg,
          visitedInstructions,
        };
      default:
        throw "unrecognised instruction";
    }
  }

  const initialState: ProgramState = {
    accumulator: 0,
    instructionPointer: 0,
    visitedInstructions: {},
    halt: "NO",
  };

  function evaluate(program: string[], state: ProgramState): ProgramState {
    if (state.halt !== "NO") {
      return state;
    }
    const nextState = instruction(program, state);
    return evaluate(program, nextState);
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
