import { add, findIndex, multiply, range, toNumber } from "lodash";
import { day13Input } from "./day13_input";

function parseInput(input: string) {
  const [target, line2] = input.split("\n");

  return {
    target: +target,
    departures: line2
      .split(",")
      .filter((n) => n !== "x")
      .map(toNumber),
  };
}

function findNearest(target: number) {
  return function (acc: { nearestId: number; diff: number }, curr: number) {
    const diff = curr - (target % curr);
    console.log(target, curr, diff);
    if (diff < acc.diff) {
      return { nearestId: curr, diff };
    } else {
      return acc;
    }
  };
}

function parseInputPart2(input: string) {
  const [target, line2] = input.split("\n");

  return {
    target: +target,
    departures: line2
      .split(",")
      .map((n, i) => [toNumber(n), i])
      .filter(([n, i]) => isFinite(n)),
  };
}

export function day13() {
  //   const part1 = parseInput(day13Input);
  //   const closestDeparture = part1.departures.reduce(findNearest(part1.target), { nearestId: -1, diff: part1.target });
  //   console.log(closestDeparture.nearestId * closestDeparture.diff);

  const part2 = parseInputPart2(day13Input);

  console.log(part2);

  function bruteForceModInverse(f: (n: number) => boolean, max: number): number {
    return findIndex(range(0, max), (i) => {
      return f(i);
    });
  }

  function findCRTTerms(interval: number, offset: number, input: number[][]) {
    const otherCoefficients = input.filter(([i]) => interval !== i).map(([i]) => i);
    const product = otherCoefficients.reduce((x, y) => x * y);
    const inverse = bruteForceModInverse(
      (x) => (((product * x) % interval) - (interval - offset)) % interval === 0,
      interval
    );

    return product * inverse;
  }

  const intervalProduct = part2.departures.map(([interval]) => interval).reduce(multiply);
  const start = Date.now();
  const elements = part2.departures
    .map(([interval, offset]) => findCRTTerms(interval, offset, part2.departures))
    .reduce(add);
  console.log("Day 13 Part 2:", elements % intervalProduct);
  console.log(`in ${Date.now() - start}ms`);
}
