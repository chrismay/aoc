import { every, fromPairs } from "lodash";
import { puzzle } from "./day19_input";
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

export function day19() {
  console.log("Day 19 part 1:");

  const [ruleInput, messages] = puzzle.split("\n\n");

  /// FIRST PASS
  var { resolved, remaining } = parseInput(ruleInput);

  //// REPEATED PASS
  while (remaining.length > 0) {
    const r = refineList(remaining, resolved);
    resolved = r.resolved;
    remaining = r.remaining;
  }
  console.log(resolved[0][0]);
  console.log(remaining);

  const allowedMessages = fromPairs(resolved[0].map((s) => [s, true]));

  console.log("built map");
  console.log("Day 19 part 1:", messages.split("\n").filter((m) => allowedMessages[m]).length);
}

day19();
