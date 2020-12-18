import { last, sum } from "lodash";
import { sums } from "./day18_input";

type Stack<T> = T[];
type Queue<T> = T[];
function p1Precedence(s: string): number {
  const precedences: { [k: string]: number } = { "+": 10, "*": 10 };
  return precedences[s] || -1;
}

function p2Precedence(s: string): number {
  const precedences: { [k: string]: number } = { "+": 100, "*": 10 };
  return precedences[s] || -1;
}

function peek<T>(s: Stack<T>): T {
  if (s.length === 0) throw "Cannot peek an empty stack";
  return last(s)!!;
}

function push<T>(t: T, s: Stack<T>): Stack<T> {
  s.push(t);
  return s;
}

function pop<T>(s: Stack<T>): [t: T, s: Stack<T>] {
  const t = s.pop()!!;
  return [t, s];
}

type State = { outputQueue: Queue<string>; operatorStack: Stack<string> };

function shunt(expr: string[], precedence: (s: string) => number): string[] {
  const state: State = { outputQueue: [], operatorStack: [] };

  const result = expr.reduce((s, token) => {
    if (isFinite(+token)) {
      return { ...s, outputQueue: push(token, s.outputQueue) };
    } else if (token === "+" || token === "*") {
      while (
        s.operatorStack.length > 0 &&
        precedence(token) <= +precedence(peek(s.operatorStack)) &&
        peek(s.operatorStack) !== "("
      ) {
        s.outputQueue.push(s.operatorStack.pop()!!);
      }
      s.operatorStack.push(token);
      return s;
    } else if (token === "(") {
      return { ...s, operatorStack: push(token, s.operatorStack) };
    } else if (token === ")") {
      while (peek(s.operatorStack) !== "(") {
        s.outputQueue.push(s.operatorStack.pop()!!);
      }
      if (peek(s.operatorStack) === "(") {
        const [, popped] = pop(s.operatorStack);
        return { ...s, operatorStack: popped };
      }
      return s;
    }
    throw "Unparseable token " + token;
  }, state);
  while (result.operatorStack.length > 0) {
    result.outputQueue.push(result.operatorStack.pop()!!);
  }
  return result.outputQueue;
}

function evaluate(rpn: string[]): number {
  //console.log(rpn);
  var stack: number[] = [];
  rpn.forEach((token) => {
    if (isFinite(+token)) {
      stack.push(+token);
    } else {
      const a = stack.pop()!!;
      const b = stack.pop()!!;
      switch (token) {
        case "+":
          stack.push(+a + b);
          break;
        case "*":
          stack.push(a * b);
          break;
        default:
          throw "Unrecognised operator " + token;
      }
    }
    //console.log(`${token}: ${stack}`);
  });
  return stack.pop()!!;
}

function parse(s: string): string[] {
  const parsed = s.replace(/\(/g, "( ").replace(/\)/g, " )").split(" ");
  //  console.log(parsed);
  return parsed;
}

export function day18() {
  console.log("26?", evaluate(shunt(parse("2 * 3 + (4 * 5)"), p1Precedence)));
  console.log("437?", evaluate(shunt(parse("5 + (8 * 3 + 9 + 3 * 4 * 3)"), p1Precedence)));

  console.log(
    "Day 18 Part 1:",
    sum(
      sums
        .split("\n")
        .map((s) => parse(s))
        .map((expr) => evaluate(shunt(expr, p1Precedence)))
    )
  );

  console.log("231?", evaluate(shunt(parse("1 + 2 * 3 + 4 * 5 + 6"), p2Precedence))); // 231;
  console.log("51?", evaluate(shunt(parse("1 + (2 * 3) + (4 * (5 + 6))"), p2Precedence))); // 51;
  console.log("1445?", evaluate(shunt(parse("5 + (8 * 3 + 9 + 3 * 4 * 3)"), p2Precedence))); // 1445;
  console.log("669060", evaluate(shunt(parse("5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))"), p2Precedence))); // 669060;
  console.log("23340?", evaluate(shunt(parse("((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2"), p2Precedence))); // 23340;

  console.log(
    "Day 18 Part 2:",
    sum(
      sums
        .split("\n")
        .map((s) => parse(s))
        .map((expr) => evaluate(shunt(expr, p2Precedence)))
    )
  );
}
