import { chunk, Dictionary, every, fromPairs, has, isEqual, reverse, some, uniq } from "lodash";
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
  const [ruleNum, ruleStr] = ruleLine.split(":");
  return ruleStr.split("|").flatMap(parseRule).filter(neq(ruleNum));
}

function countMatches(matches: Dictionary<boolean>) {
  return function (acc: { continueCounting: boolean; remainder: string[]; count: number }, part: string) {
    if (matches[part] && acc.continueCounting) {
      return { continueCounting: true, remainder: acc.remainder, count: ++acc.count };
    } else {
      return { continueCounting: false, remainder: [...acc.remainder, part], count: acc.count };
    }
  };
}

// Part 2 matching rule.
// Must begin with "N" 41s and end with "M" 31s, with nothing else in between. M must be >1 and N must be at least M+1
function match(input: string, resolved: RulesMap, ruleLen: number) {
  const match42 = fromPairs(resolved[42].map((s) => [s, true]));
  const match31 = fromPairs(resolved[31].map((s) => [s, true]));
  const parts = chunk([...input], ruleLen).map((s) => s.join(""));
  if (parts.length < 3) {
    return false;
  }
  // eat the 31s from the end of the list
  const match31s = reverse(parts).reduce(countMatches(match31), {
    continueCounting: true,
    remainder: [] as string[],
    count: 0,
  });

  if (match31s.count === 0) {
    return false;
  }
  const match42s = match31s.remainder.reduce(countMatches(match42), {
    continueCounting: true,
    remainder: [] as string[],
    count: 0,
  });

  if (match42s.remainder.length > 0) {
    //console.log(`${input} did not all match 42: ${remainder}`);
    return false;
  }
  if (match42s.count - match31s.count < 1) {
    //console.log(`${input} was not balanced`);
    return false;
  }

  return true;
}

export function day19(): void {
  const [ruleInput1, messages1] = puzzle.split("\n\n");
  // can't quite be bothered to turn this into a reduce.
  let { resolved: resolvedP1, remaining: remainingP1 } = parseInput(ruleInput1);
  while (remainingP1.length > 0) {
    const r = refineList(remainingP1, resolvedP1);
    resolvedP1 = r.resolved;
    remainingP1 = r.remaining;
  }
  const allowedMessages = fromPairs(resolvedP1[0].map((s) => [s, true]));
  console.log("Day 19 part 1:", messages1.split("\n").filter((m) => allowedMessages[m]).length);

  /// ---- Part 2----

  const [ruleInput, messages] = loopPuzzle.split("\n\n");
  let { resolved, remaining } = parseInput(ruleInput);

  // The starting points to resolve from are the inputs to the recursive rules.
  const recursionInputs = uniq(ruleInput.split("\n").filter(isSelfReferentialRule).flatMap(getSubRules));

  while (some(recursionInputs, (n) => !has(resolved, +n))) {
    const r = refineList(remaining, resolved);
    resolved = r.resolved;
    remaining = r.remaining;
  }
  //console.log(resolved, remaining);

  const matches = messages.split("\n").filter((m) => match(m, resolved, resolved[31][0].length));
  console.log("Day 19 part 2:", matches.length);
}

day19();
