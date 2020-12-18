import { sum } from "lodash";
import { sums } from "./day18_input";

function precedence(s: string): number {
  const precedences: { [k: string]: number } = { "+": 100, "*": 10 };
  return precedences[s] || -1;
}
const outputQueue: string[] = [];
var operatorStack: string[] = [];

function shunt(expr: string[]): string[] {
  expr.forEach((token) => {
    if (isFinite(+token)) {
      outputQueue.push(token);
    } else if (token === "+" || token === "*") {
      while (
        operatorStack.length > 0 &&
        precedence(token) < +precedence(operatorStack[0]) &&
        operatorStack[0] !== "("
      ) {
        const [op, ...rest] = operatorStack;
        operatorStack = rest;
        outputQueue.push(op);
      }
      operatorStack = [token, ...operatorStack];
    } else if (token === "(") {
      operatorStack = [token, ...operatorStack];
    } else if (token === ")") {
      while (operatorStack[0] !== "(") {
        const [op, ...rest] = operatorStack;
        outputQueue.push(op);
        operatorStack = rest;
      }
      if (operatorStack[0] === "(") {
        operatorStack = operatorStack.slice(1);
      }
    }
  });
  while (operatorStack.length > 0) {
    const [op, ...rest] = operatorStack;
    outputQueue.push(op);
    operatorStack = rest;
  }
  //console.log(outputQueue);
  return outputQueue;
}

function evaluate(rpn: string[]): number {
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
  console.log("231?", evaluate(shunt(parse("1 + 2 * 3 + 4 * 5 + 6")))); // 231;
  console.log("51?", evaluate(shunt(parse("1 + (2 * 3) + (4 * (5 + 6))")))); // 51;
  console.log("1445?", evaluate(shunt(parse("5 + (8 * 3 + 9 + 3 * 4 * 3)")))); // 1445;
  console.log("669060", evaluate(shunt(parse("5 * 9 * (7 * 3 * 3 + 9 * 3 + (8 + 6 * 4))")))); // 669060;
  console.log("23340?", evaluate(shunt(parse("((2 + 4 * 9) * (6 + 9 * 8 + 6) + 6) + 2 + 4 * 2")))); // 23340;

  console.log(
    "Day 18 Part 2:",
    sum(
      sums
        .split("\n")
        .map((s) => parse(s))
        .map((expr) => evaluate(shunt(expr)))
    )
  );
}
