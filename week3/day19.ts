import { every, fromPairs, some, uniq } from "lodash";
import { loopPuzzle, puzzle } from "./day19_input";
type RulesMap = { [n: number]: string[] };

function parseInput(inputData: string) {
  /// FIRST PASS
  const input = inputData.split("\n");
  const resolved: RulesMap = {};
  const remaining: string[] = [];
  input.forEach((line) => {
    const [ruleNumber, rule] = line.split(":");
    const isLetter = rule.match(/\"([a-z])\"/);
    if (isLetter != null) {
      resolved[+ruleNumber] = [isLetter[1]];
    } else {
      remaining.push(line);
    }
  });
  return { resolved, remaining };
}

function resolveRule(rule: string[], resolved: RulesMap): string[] {
  function resolveRuleR(soFar: string[], remaining: string[], resolved: RulesMap): string[] {
    if (remaining.length === 0) {
      return soFar;
    } else {
      const [next, ...rest] = remaining;
      const nextRule = resolved[+next] || [];
      const acc = nextRule.flatMap((r) => soFar.map((s) => s + r));
      return resolveRuleR(acc, rest, resolved);
    }
  }
  return resolveRuleR([""], rule, resolved);
}

function refineList(rulesList: string[], resolved: RulesMap) {
  const remaining: string[] = [];
  rulesList.forEach((line) => {
    const [ruleNumber, rule] = line.split(":");
    const orParts = rule.split("|");
    const lineChars = orParts.flatMap((rule) => rule.split(" ")).filter((c) => c.length > 0);
    //console.log("lineChars", lineChars);
    const isResolvable = every(lineChars, (num) => resolved[+num] !== undefined);
    // console.log(line, isResolvable);
    if (isResolvable) {
      const resolvedRule: string[] = orParts.flatMap((op) => {
        const rule = op.split(" ").filter((c) => c.length > 0);
        return resolveRule(rule, resolved);
      });
      // console.log("Resolved Rule", resolvedRule);
      resolved[+ruleNumber] = resolvedRule;
    } else {
      remaining.push(line);
    }
  });
  return { resolved, remaining };
}

function isSelfReferentialRule(ruleLine: string) {
  const [ruleNum, rule] = ruleLine.split(":");
  const ruleElements = rule.split(" ");
  return some(ruleElements, (e) => e === ruleNum);
}

function getSubRules(ruleLine: string) {
  const [ruleNum, rule] = ruleLine.split(":");
  return rule
    .split(" ")
    .filter((ch) => ch.length > 0)
    .filter((ch) => isFinite(+ch))
    .filter((ch) => ch !== ruleNum);
}

function match(input: string, resolved: RulesMap, ruleLen: number) {
  // must end in a string of 31s. Then there must be at least one more 42 in front

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
  while (some(recursionInputs, (n) => resolved[+n] === undefined)) {
    const r = refineList(remaining, resolved);
    resolved = r.resolved;
    remaining = r.remaining;
  }
  //console.log(resolved, remaining);

  const matches = messages.split("\n").filter((m) => match(m, resolved, 8));
  console.log("Day 19 part 2:", matches.length);
}

day19();
