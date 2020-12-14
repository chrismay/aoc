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
      .filter(([n]) => isFinite(n)),
  };
}

// modulo function that always returns positive values
function absMod(val: number, mod: number): number {
  return ((val % mod) + mod) % mod;
}

export function day13(): void {
  const part1 = parseInput(day13Input);
  const closestDeparture = part1.departures.reduce(findNearest(part1.target), { nearestId: -1, diff: part1.target });
  console.log("Day 13 Part 1:", closestDeparture.nearestId * closestDeparture.diff);

  const part2 = parseInputPart2(day13Input);

  function bruteForceModInverse(factor: number, modulus: number, remainder: number): number {
    return findIndex(range(0, modulus), (x) => (factor * x) % modulus === absMod(remainder, modulus));
  }

  function findCRTTerms(interval: number, offset: number, allIntervalsProduct: number) {
    const product = allIntervalsProduct / interval;
    const inverse = bruteForceModInverse(product, interval, interval - offset);

    return product * inverse;
  }

  const intervalProduct = part2.departures.map(([interval]) => interval).reduce(multiply);

  const result = part2.departures
    .map(([interval, offset]) => findCRTTerms(interval, offset, intervalProduct))
    .reduce(add);

  console.log("Day 13 Part 2:", result % intervalProduct);
}
