import { last, sum } from "lodash";
import { doWhile } from "../util";
import { sums } from "./day18_input";

type Stack<T> = T[];
type Queue<T> = T[];

function notNull<T>(t: T | undefined): T {
  if (t === undefined) {
    throw "NullPointerException!";
  }
  return t;
}

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
  return notNull(last(s));
}

function push<T>(t: T, s: Stack<T>): Stack<T> {
  return [...s, t];
}

function pop<T>(s: Stack<T>): { e: T; remaining: Stack<T> } {
  const remaining = [...s];
  return { e: notNull(remaining.pop()), remaining };
}

function pop2<T>(s: Stack<T>): { e1: T; e2: T; remaining: Stack<T> } {
  const p1 = pop(s);
  const p2 = pop(p1.remaining);
  return { e1: p1.e, e2: p2.e, remaining: p2.remaining };
}

type State = { outputQueue: Queue<string>; operatorStack: Stack<string> };

function shunt(expr: string[], precedence: (s: string) => number): string[] {
  const state: State = { outputQueue: [], operatorStack: [] };

  const result = expr.reduce((s, token) => {
    if (isFinite(+token)) {
      return { ...s, outputQueue: push(token, s.outputQueue) };
    } else if (token === "+" || token === "*") {
      const os = doWhile(
        (os) => {
          const { e: operator, remaining } = pop(os.operatorStack);
          return { outputQueue: push(operator, os.outputQueue), operatorStack: remaining };
        },
        (os) =>
          os.operatorStack.length > 0 &&
          precedence(token) <= +precedence(peek(os.operatorStack)) &&
          peek(os.operatorStack) !== "(",
        s
      );
      return { ...os, operatorStack: push(token, os.operatorStack) };
    } else if (token === "(") {
      return { ...s, operatorStack: push(token, s.operatorStack) };
    } else if (token === ")") {
      const bs = doWhile(
        (bs) => {
          const { e: operator, remaining } = pop(bs.operatorStack);
          return { outputQueue: push(operator, bs.outputQueue), operatorStack: remaining };
        },
        (bs) => peek(bs.operatorStack) !== "(",
        { ...s }
      );
      if (peek(bs.operatorStack) === "(") {
        return { ...bs, operatorStack: pop(bs.operatorStack).remaining };
      } else {
        return bs;
      }
    }
    throw "Unparseable token " + token;
  }, state);

  // push the remainder of the operator stack into the end of the output queue.
  return doWhile(
    (res) => {
      const { e, remaining } = pop(res.operatorStack);
      return { operatorStack: remaining, outputQueue: push(e, res.outputQueue) };
    },
    (res) => res.operatorStack.length > 0,
    result
  ).outputQueue;
}

function evaluate(rpn: string[]): number {
  const s = rpn.reduce((stack, token) => {
    if (isFinite(+token)) {
      return push(+token, stack);
    } else {
      const { e1, e2, remaining } = pop2(stack);
      switch (token) {
        case "+":
          return push(e1 + e2, remaining);
        case "*":
          return push(e1 * e2, remaining);
        default:
          throw "Unrecognised operator " + token;
      }
    }
  }, [] as number[]);
  return pop(s).e;
}

function parse(s: string): string[] {
  const parsed = s.replace(/\(/g, "( ").replace(/\)/g, " )").split(" ");
  return parsed;
}

export function day18(): void {
  //   console.log("26?", evaluate(shunt(parse("2 * 3 + (4 * 5)"), p1Precedence)));
  //   console.log("437?", evaluate(shunt(parse("5 + (8 * 3 + 9 + 3 * 4 * 3)"), p1Precedence)));

  console.log(
    "Day 18 Part 1:",
    sum(
      sums
        .split("\n")
        .map((s) => parse(s))
        .map((expr) => evaluate(shunt(expr, p1Precedence)))
    )
  );

  //   console.log("231?", evaluate(shunt(parse("1 + 2 * 3 + 4 * 5 + 6"), p2Precedence))); // 231;
  //   console.log("51?", evaluate(shunt(parse("1 + (2 * 3) + (4 * (5 + 6))"), p2Precedence))); // 51;
  //   console.log("1445?", evaluate(shunt(parse("5 + (8 * 3 + 9 + 3 * 4 * 3)"), p2Precedence))); // 1445;
  //   console.log("669060", evaluate(shunt(parse("5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))"), p2Precedence))); // 669060;
  //   console.log("23340?", evaluate(shunt(parse("((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2"), p2Precedence))); // 23340;

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

day18();
