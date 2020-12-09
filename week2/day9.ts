import { add, orderBy, sum, toNumber, uniq } from "lodash";
import { day9Data } from "./day9_input";

function pairSums(l: number[]) {
  return uniq(l.flatMap((n) => l.map((m) => [m, n]))).map(sum);
}

function verify(index: number, windowSize: number, data: number[]): boolean {
  const window = data.slice(index - windowSize, index);
  const value = data[index];
  const ps = pairSums(window);
  return ps.find((n) => n === value) !== undefined;
}

function findRangeSummingTo(target: number, data: number[]) {
  /// data: [1,2,4,6,8]
  const rangeGroups = data
    .map((_, startIndex) =>
      data
        .slice(startIndex, data.length)
        .map((_, idx) => data.slice(startIndex, startIndex + idx + 1))
        .filter((arr) => arr.length > 1)
    )
    .filter((arr) => arr.length > 1);
  //   console.log(rangeGroups);
  const groupWithMatch = rangeGroups.find((rg) => rg.find((r) => r.reduce(add, 0) === target)) || [];
  return groupWithMatch.find((g) => g.reduce(add, 0) === target);
}

export function day9() {
  const testData = day9Data.split("\n").map(toNumber);
  const windowSize = 25;
  console.log(testData.find((v, idx) => idx >= windowSize && !verify(idx, windowSize, testData)));

  //  findRangeSummingTo(10, [1, 2, 4, 6, 8]);
  const part2 = orderBy(findRangeSummingTo(85848519, testData));
  console.log(part2[0], part2[part2.length - 1], part2[0] + part2[part2.length - 1]);
}
