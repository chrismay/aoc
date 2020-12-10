import { fromPairs, last, orderBy, toNumber } from "lodash";
import { day10Adapters, longerAdapterList, shortAdapterList } from "./day10_input";

export function day10() {
  console.log((last(orderBy(shortAdapterList.split("\n").map(toNumber))) || 0) + 3);

  console.log(orderBy(shortAdapterList.split("\n").map(toNumber)));
  const counts = orderBy(longerAdapterList.split("\n").map(toNumber)).reduce(
    (acc, n) => {
      const diff = n - acc.prev;
      if (diff === 1) return { ...acc, prev: n, ones: acc.ones + 1 };
      if (diff === 2) return { ...acc, prev: n, twos: acc.twos + 1 };
      if (diff === 3) return { ...acc, prev: n, threes: acc.threes + 1 };
      throw "Invalid input";
    },
    { ones: 0, twos: 0, threes: 0, prev: 0 }
  );
  console.log(counts);
  console.log(counts.ones * (counts.threes + 1)); // 1 three for the device's own adapter

  var calculatedPaths: { [k: number]: number } = { 0: 1 };
  const source: number[] = orderBy(longerAdapterList.split("\n").map(toNumber));
  console.log(source);

  function countPathsTo(n: number, source: { [k: number]: boolean }): number {
    if (n < 0) return 0;
    if (calculatedPaths[n] !== undefined) {
      // already calculated this one
      return calculatedPaths[n];
    }
    if (!source[n]) {
      // trying to find paths to an adapter we dont have
      calculatedPaths[n] = 0;
      return 0;
    }
    const pathsToMe = countPathsTo(n - 1, source) + countPathsTo(n - 2, source) + countPathsTo(n - 3, source);
    calculatedPaths[n] = pathsToMe;
    // console.log(pathsToMe, "paths to...", n, calculatedPaths);
    return pathsToMe;
  }

  //   const short = orderBy(shortAdapterList.split("\n").map(toNumber));
  //   console.log(countPathsTo(last(short) || 0, short));
  const testOrdered = orderBy(day10Adapters.split("\n").map(toNumber));
  const test: { [k: number]: boolean } = fromPairs(testOrdered.map((n) => [n, true]));
  console.log(countPathsTo(last(testOrdered) || 0, test));
}
