import { fromPairs, sum, uniq } from "lodash";
import { rules } from "./day7_input";

type Colour = string;
type ColourMap = { [key: string]: Colour[] }; // index signatures can't be type aliases. Should be container: Colour
type CountColour = { count: number; colour: Colour };
type CountColourMap = { [container: string]: CountColour[] }; // index signatures can't be type aliases. Should be container: Colour

export function day7(): void {
  const countColours: [Colour, CountColour[]][] = rules
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

  // Invert the map, so that instead of container->[contained], it holds contained->[container]
  // {
  //  "bright white":["dark orange", "pale blue"]
  //  "muted yellow":["dark orange"]
  //  "light green":["pale blue"]
  //  }
  const containedByMap: ColourMap = countColours.reduce(
    (acc: ColourMap, [container, contained]) => {
      const containedBy = fromPairs(
        contained.map(({ colour }) => [
          colour,
          [container, ...(acc[colour] || [])],
        ])
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

  function countContainedRec(
    CountColourMap: CountColourMap,
    targetColour: Colour,
    total: number
  ): number {
    const contents = CountColourMap[targetColour] || [];

    const subContentTotals = contents.map(
      ({ count, colour }) =>
        // 1 for the current colour, plus however many bags it contains.
        count * (1 + countContainedRec(CountColourMap, colour, total))
    );
    return total + sum(subContentTotals);
  }

  const countColourMap: CountColourMap = fromPairs(countColours);

  console.log(
    "Day 7 Part 2",
    countContainedRec(countColourMap, "shiny gold", 0)
  );
}
