import { every, fromPairs, has, isEqual, some, uniq } from "lodash";
import { loopPuzzle, puzzle } from "./day19_input";
type RulesMap = { [n: number]: string[] };

const eq = (a: unknown) => (b: unknown) => isEqual(a, b);
const neq = (a: unknown) => (b: unknown) => !isEqual(a, b);

function parseInput(inputData: string): { resolved: RulesMap; remaining: string[] } {
  return inputData.split("\n").reduce(
    ({ resolved, remaining }, line) => {
      const [ruleNumber, rule] = line.split(":");
      const [, letter] = rule.match(/\"([a-z])\"/) || [];
      if (letter !== undefined) {
        return { remaining, resolved: { ...resolved, [+ruleNumber]: [letter] } };
      } else {
        return { resolved, remaining: [...remaining, line] };
      }
    },
    { resolved: {} as RulesMap, remaining: [] as string[] }
  );
}
//
// Assumes that the rule is resolvable i.e. all numbers in the rule exist in the resolved RulesMap
//
function resolveRule(rule: string[], resolved: RulesMap): string[] {
  function resolveRuleR(soFar: string[], remaining: string[], resolved: RulesMap): string[] {
    if (remaining.length === 0) {
      return soFar;
    } else {
      const [next, ...rest] = remaining;
      const nextRule = resolved[+next] || [];
      return resolveRuleR(
        nextRule.flatMap((r) => soFar.map((s) => s + r)),
        rest,
        resolved
      );
    }
  }
  return resolveRuleR([""], rule, resolved);
}

function parseRule(rule: string): string[] {
  return rule.split(" ").filter((c) => c.length > 0);
}

// Go through the list, refining any rules that can be refined.
function refineList(rulesList: string[], resolvedP: RulesMap): { resolved: RulesMap; remaining: string[] } {
  return rulesList.reduce(
    ({ resolved, remaining }, line) => {
      const [ruleNumber, rule] = line.split(":");
      const alternates = rule.split("|");
      const isResolvable = every(alternates.flatMap(parseRule), (num) => has(resolved, +num));
      if (isResolvable) {
        const resolvedRule: string[] = alternates.flatMap((ruleStr) => resolveRule(parseRule(ruleStr), resolved));
        return { remaining, resolved: { ...resolved, [+ruleNumber]: resolvedRule } };
      } else {
        return { remaining: [...remaining, line], resolved };
      }
    },
    { resolved: resolvedP, remaining: [] as string[] }
  );
}

function isSelfReferentialRule(ruleLine: string) {
  const [ruleNum, rule] = ruleLine.split(":");
  const ruleElements = rule.split(" ");
  return some(ruleElements, eq(ruleNum));
}

function getSubRules(ruleLine: string) {
  const [ruleNum, rule] = ruleLine.split(":");
  return rule
    .split(" ")
    .filter((ch) => ch.length > 0)
    .filter((ch) => isFinite(+ch))
    .filter(neq(ruleNum));
}

function match(input: string, resolved: RulesMap, ruleLen: number) {
  // Must begin with N 41s and end with M 31s, with nothing else in between. M must be >1 and N must be at least M+1

  const match42 = fromPairs(resolved[42].map((s) => [s, true]));
  const match31 = fromPairs(resolved[31].map((s) => [s, true]));
  let remainder = input;
  // eat off the 31s from the end
  const endRegex = new RegExp("(.*)([a-z]{" + ruleLen + "})$");

  let c31 = 0;
  let eating31s = true;
  while (remainder.length > 0 && eating31s) {
    const [, prefix, ending] = remainder.match(endRegex) || [];
    if (match31[ending] === undefined) {
      eating31s = false;
    } else {
      //console.log("Ate a 31 from the end");
      c31++;
      remainder = prefix;
    }
  }
  if (c31 === 0) {
    return false;
  }
  //  console.log(`at ${c31} 31s from the end`);

  //now eat off the 42s...
  let c42 = 0;
  let eating42s = true;
  while (remainder.length > 0 && eating42s) {
    const beginRegex = new RegExp("^([a-z]{" + ruleLen + "})(.*)");

    const [, next, rest] = remainder.match(beginRegex) || [];
    remainder = rest;
    if (match42[next]) {
      c42++;
    } else {
      eating42s = false;
    }
    //    console.log(`ate ${c42} 42s`);
  }
  if (remainder.length > 0) {
    //console.log(`${input} had a remainder ${remainder}`);
    return false;
  }
  if (c42 - c31 < 1) {
    //console.log(`${input} had a mismatch :42 {}`);
    return false;
  }
  return true;
}

export function day19() {
  const [ruleInput1, messages1] = puzzle.split("\n\n");
  /// FIRST PASS
  var { resolved, remaining } = parseInput(ruleInput1);
  //// REPEATED PASS
  while (remaining.length > 0) {
    const r = refineList(remaining, resolved);
    resolved = r.resolved;
    remaining = r.remaining;
  }
  const allowedMessages = fromPairs(resolved[0].map((s) => [s, true]));
  console.log("Day 19 part 1:", messages1.split("\n").filter((m) => allowedMessages[m]).length);

  const [ruleInput, messages] = loopPuzzle.split("\n\n");
  const recursionInputs = uniq(ruleInput.split("\n").filter(isSelfReferentialRule).flatMap(getSubRules));
  ///// FIRST PASS
  var { resolved, remaining } = parseInput(ruleInput);
  //// REPEATED PASS
  while (some(recursionInputs, (n) => !has(resolved, +n))) {
    const r = refineList(remaining, resolved);
    resolved = r.resolved;
    remaining = r.remaining;
  }
  //console.log(resolved, remaining);

  const matches = messages.split("\n").filter((m) => match(m, resolved, 8));
  console.log("Day 19 part 2:", matches.length);
}

day19();
