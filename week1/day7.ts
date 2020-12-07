import { add, fromPairs, sum, uniq } from "lodash";
import { rules } from "./day7_input";

type Colour = string;
type ColourMap = { [key: string]: Colour[] }; // index signatures can't be type aliases. Should be container: Colour

function day7Part1() {
  //Source: dark orange bags contain 3 bright white bags, 1 muted yellow bag
  // ["dark orange",["bright white","muted yellow"]]
  // ["pale blue",["bright white","light green"]]
  const containingMap: [Colour, Colour[]][] = rules
    .split("\n")
    .map((line) => line.split(" bags contain "))
    .map(([container, contained]) => [
      container,
      contained
        .replace(".", "")
        .split(",")
        .filter((content) => content !== "no other bags")
        .map((bagSpec) => (bagSpec.match(/^ *[\d]+ (.*) bags?/) || [])[1]),
    ]);

  // Invert the map, so that instead of container->[contained], it holds contained->[container]
  // {
  //  "bright white":["dark orange", "pale blue"]
  //  "muted yellow":["dark orange"]
  //  "light green":["pale blue"]
  //  }
  const containedByMap: ColourMap = containingMap.reduce(
    (acc: ColourMap, [container, contained]) => {
      const containedBy = fromPairs(
        contained.map((b) => [b, [container, ...(acc[b] || [])]])
      );
      return { ...acc, ...containedBy };
    },
    {}
  );

  // recurse through the map finding the colours that are contained by the target colour.
  function findContainersRec(
    containedByMap: ColourMap,
    targetColour: Colour,
    acc: Colour[]
  ): Colour[] {
    const containedByTarget = (
      containedByMap[targetColour] || []
    ).flatMap((c: Colour) => findContainersRec(containedByMap, c, acc));

    return [...acc, targetColour, ...containedByTarget];
  }

  const targetColour = "shiny gold";

  const colours = uniq(
    findContainersRec(containedByMap, targetColour, [])
  ).filter((c) => c !== targetColour);
  console.log("Day 7 Part 1", colours.length);
}

type CountColour = { count: number; colour: Colour };
type ContainsMap = { [container: string]: CountColour[] }; // index signatures can't be type aliases. Should be container: Colour

function day7Part2() {
  // Source: dark orange bags contain 3 bright white bags, 1 muted yellow bag
  // ["dark orage",[{count:3, colour:"bright white"}, {count:1, colour:"muted yellow"}]]
  const parsedRules: [Colour, CountColour[]][] = rules
    .split("\n")
    .map((line) => line.split(" bags contain "))
    .map(([container, contained]) => [
      container,
      contained
        .replace(".", "")
        .split(",")
        .filter((content) => content !== "no other bags")
        .map((bag) => bag.match(/([\d]+) (.*) bag/) || [])
        .map(([, c, colour]) => ({ count: +c, colour })),
    ]);

  const containsMap: ContainsMap = fromPairs(parsedRules);

  function countContainedRec(
    containsMap: ContainsMap,
    targetColour: Colour,
    total: number
  ): number {
    const contents = containsMap[targetColour] || [];

    const subContentTotals = contents.map(
      ({ count, colour }) =>
        // 1 for the current colour, plus however many bags it contains.
        count * (1 + countContainedRec(containsMap, colour, total))
    );
    return total + sum(subContentTotals);
  }

  console.log("Day 7 Part 2", countContainedRec(containsMap, "shiny gold", 0));
}

export function day7(): void {
  day7Part1();
  day7Part2();
}
