import { fromPairs, last, memoize, orderBy, toNumber } from "lodash";
import { day10Adapters, longerAdapterList, shortAdapterList } from "./day10_input";

type NumberMap = { [k: number]: boolean };
type PathCounter = (n: number, source: NumberMap, countPaths: PathCounter) => number;

export function day10(): void {
  const testDataOrdered = orderBy(day10Adapters.split("\n").map(toNumber));
  const counts = testDataOrdered.reduce(
    (acc, n) => {
      const diff = n - acc.prev;
      return { ...acc, prev: n, [diff]: acc[diff] + 1 };
    },
    { 1: 0, 3: 0, prev: 0 } as { [k: number]: number; prev: number }
  );
  console.log("Day 10 Part 1:", counts[1] * (counts[3] + 1)); // add 1 three for the device's own adapter

  const countPathsTo: PathCounter = memoize((n, source, countPaths) => {
    if (n === 0) return 1;
    if (!source[n]) {
      return 0;
    }
    return (
      countPaths(n - 1, source, countPaths) +
      countPaths(n - 2, source, countPaths) +
      countPaths(n - 3, source, countPaths)
    );
  });

  const testDataMap: NumberMap = fromPairs(testDataOrdered.map((n) => [n, true]));
  console.log("Day 10 Part 2:", countPathsTo(last(testDataOrdered) || 0, testDataMap, countPathsTo));
}
