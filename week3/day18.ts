import { sum, toNumber } from "lodash";
import { sums } from "./day18_input";

function evaluate(input: string[], total: number, currentOperator?: string): { value: number; remaining: string[] } {
  if (input.length === 0) {
    return { value: total, remaining: [] };
  }
  const [next, ...rest] = input;
  if (next === "+" || next === "*") {
    return evaluate(rest, total, next);
  }
  if (next === "(") {
    const { value, remaining } = evaluate(rest, 0, "+");
    return evaluate([value + "", ...remaining], total, currentOperator);
  }
  if (next === ")") {
    return { value: total, remaining: rest };
  }
  const val = toNumber(next);
  switch (currentOperator) {
    case "+":
      return evaluate(rest, total + val, undefined);
    case "*":
      return evaluate(rest, total * val, undefined);
    default:
      throw "Unknown current operator " + currentOperator;
  }
}
function parse(s: string): string[] {
  const parsed = s.replace(/\(/g, "( ").replace(/\)/g, " )").split(" ");
  //  console.log(parsed);
  return parsed;
}

export function day18() {
  console.log(evaluate(parse("1 + 2 * 3 + 4 * 5 + 6"), 0, "+")); // 71
  console.log(evaluate(parse("1 + (2 * 3) + (4 * (5 + 6))"), 0, "+")); //51
  console.log(evaluate(parse("((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2"), 0, "+"));
  console.log(
    "Day 18 Part 1:",
    sum(
      sums
        .split("\n")
        .map((s) => parse(s))
        .map((expr) => evaluate(expr, 0, "+").value)
    )
  );
}
