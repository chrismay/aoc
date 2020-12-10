import { fromPairs, last, memoize, orderBy, toNumber } from "lodash";
import { day10Adapters, longerAdapterList, shortAdapterList } from "./day10_input";

type NumberMap = { [k: number]: boolean };
type PathCounter = (n: number, source: NumberMap, countPaths: PathCounter) => number;

export function day10() {
  const testDataOrdered = orderBy(day10Adapters.split("\n").map(toNumber));
  const counts = testDataOrdered.reduce(
    (acc, n) => {
      const diff = n - acc.prev;
      if (diff === 1) return { ...acc, prev: n, ones: acc.ones + 1 };
      if (diff === 2) return { ...acc, prev: n, twos: acc.twos + 1 };
      if (diff === 3) return { ...acc, prev: n, threes: acc.threes + 1 };
      throw "Invalid input";
    },
    { ones: 0, twos: 0, threes: 0, prev: 0 }
  );
  console.log("Day 10 Part 1:", counts.ones * (counts.threes + 1)); // 1 three for the device's own adapter

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
