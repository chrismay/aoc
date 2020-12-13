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

  function bruteForceModInverse(f: (n: number) => number, max: number): number {
    const result = findIndex(range(0, max), (i) => {
      //      console.log(`testing ${i} : ${f(i)}`);
      return f(i) === 0;
    });
    //  console.log(`f(${result}) = 0`);
    return result;
  }

  function printConstraint(interval: number, offset: number, input: number[][]) {
    //console.log(`>x === ${interval - offset} ( mod ${interval})`);

    const otherCoefficients = input.filter(([i]) => interval !== i).map(([i]) => i);

    //console.log(`(${otherCoefficients.join("*")} * N )(mod ${interval}) = ${offset}`);
    const product = otherCoefficients.reduce((x, y) => x * y);
    //console.log(`(${product} * N) (mod ${interval}) - ${interval - offset}= 0`);
    const inverse = bruteForceModInverse(
      (x) => (((product * x) % interval) - (interval - offset)) % interval,
      interval
    );
    // console.log(`term=  ${product} * ${inverse} = ${product * inverse}`);
    //console.log("");

    return product * inverse;
  }

  console.log(Date.now());
  const intervalProduct = part2.departures.map(([interval, offset]) => interval).reduce(multiply);
  const elements = part2.departures
    .map(([interval, offset]) => printConstraint(interval, offset, part2.departures))
    .reduce(add);
  console.log(elements);
  console.log(elements % intervalProduct);
  console.log(Date.now());

  //   console.log(3417 % 17);
  //   console.log(3417 % 13, 13 - 2);
  //   console.log(3417 % 19, 19 - 3);
}
