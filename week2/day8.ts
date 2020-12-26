import { Seq } from "immutable";
import { iterate, notNull } from "../util";
import { day8Program } from "./day8_input";

type ProgramState = {
  instructionPointer: number;
  accumulator: number;
};

type ControlState = { halt: "NO" | "OK" | "ERR" };

type ControlledProgramState = ProgramState & ControlState;

type TrackingProgramState = ProgramState &
  ControlState & {
    visitedInstructions: { [address: number]: boolean };
  };
type Change<T> = (t: T) => T;

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

function loopGuard(instruction: Change<ControlledProgramState>): Change<TrackingProgramState> {
  return (state) => {
    if (state.visitedInstructions[state.instructionPointer]) {
      return { ...state, halt: "ERR" };
    }
    const visitedInstructions = {
      ...state.visitedInstructions,
      [state.instructionPointer]: true,
    };

    return { ...state, ...instruction(state), visitedInstructions };
  };
}

function terminationGuard(instruction: Change<ProgramState>, programLength: number): Change<ControlledProgramState> {
  return (state) => {
    if (state.instructionPointer === programLength) {
      return { ...state, halt: "OK" };
    }
    return { ...instruction(state), halt: "NO" };
  };
}

function executeInstruction(program: string[]): Change<ProgramState> {
  return (state) => {
    const [opCode, arg] = program[state.instructionPointer].split(" ");
    const instructionPointer = 1 + state.instructionPointer;
    switch (opCode) {
      case "nop":
        return {
          ...state,
          instructionPointer,
        };
      case "acc":
        return {
          ...state,
          accumulator: state.accumulator + +arg,
          instructionPointer,
        };
      case "jmp":
        return {
          ...state,
          instructionPointer: state.instructionPointer + +arg,
        };
      default:
        throw "unrecognised instruction";
    }
  };
}

export function day8(): void {
  const initialState: TrackingProgramState = {
    accumulator: 0,
    instructionPointer: 0,
    visitedInstructions: {},
    halt: "NO",
  };

  function evaluate(program: string[]): TrackingProgramState {
    const computations = Seq(
      iterate(loopGuard(terminationGuard(executeInstruction(program), program.length)), initialState)
    );

    const endState = computations.find((st) => st.halt !== "NO");

    return notNull(endState);
  }

  const program = day8Program.split("\n");
  const result = evaluate(program);
  console.log("Day 8 Part 1:", result.halt, result.accumulator);

  const successResult = modifiedPrograms(program)
    .map(evaluate)
    .find((s) => s.halt === "OK");

  console.log("Day 8 Part 2:", successResult?.halt, successResult?.accumulator);
}
