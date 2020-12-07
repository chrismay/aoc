import { fromPairs, uniq } from "lodash";
import { rules } from "./day7_input";

type RulesDictionary = { [key: string]: string[] };
function day7Part1() {
  const parsedRules: [string, string[]][] = rules
    .split("\n")
    .map((line) => line.split(" bags contain "))
    .map(([container, contained]) => [
      container,
      contained.replace(".", "").split(","),
    ]);

  const containedByMap = parsedRules.reduce(
    (acc: RulesDictionary, [container, contained]) => {
      const bags = contained
        .map((c) => c.replace(/^ *[\d]+ (.*) bags?/, "$1"))
        .filter((b) => b !== "no other bags");
      //   console.log(container, bags);
      const containedBy = fromPairs(
        bags.map((b) => [b, [container, ...(acc[b] || [])]])
      );
      return { ...acc, ...containedBy };
    },
    {}
  );

  function findContainersRec(
    containedByMap: RulesDictionary,
    targetColour: string,
    acc: string[]
  ): string[] {
    const containedByTarget = containedByMap[targetColour] || [];
    const nextLevelDown = containedByTarget.flatMap((c: string) =>
      findContainersRec(containedByMap, c, acc)
    );
    // console.log(
    //   "finding containers of " + targetColour + " found " + nextLevelDown
    // );
    return [...acc, targetColour, ...nextLevelDown];
  }

  const targetColour = "shiny gold";
  const colours = uniq(
    findContainersRec(containedByMap, targetColour, [])
  ).filter((c) => c !== targetColour);
  console.log("Day 7 Part 1", colours.length);
}

function day7Part2() {
  const parsedRules: [string, string[]][] = rules
    .split("\n")
    .map((line) => line.split(" bags contain "))
    .map(([container, contained]) => [
      container,
      contained.replace(".", "").split(","),
    ]);

  const containsMap = fromPairs(parsedRules);

  function countContainedRec(
    containsMap: RulesDictionary,
    colour: string,
    total: number
  ): number {
    const contents = (containsMap[colour] || []).filter(
      (c: string) => c !== "no other bags"
    );
    //console.log("countContainedRed", colour, total, contents);
    const subContentTotal = contents.map((c: string) => {
      const [, count, col] = c.match(/([\d]+) (.*) bag/) || [];
      return +count * (1 + countContainedRec(containsMap, col, total));
    });
    return (
      total + subContentTotal.reduce((acc: number, t: number) => acc + t, 0)
    );
  }

  console.log("Day 7 Part 2", countContainedRec(containsMap, "shiny gold", 0));
}

export function day7(): void {
  day7Part1();
  day7Part2();
}
