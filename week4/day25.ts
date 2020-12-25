import { range } from "lodash";
import { doWhile } from "../util";

function transform(value: number, subject: number): number {
  return (value * subject) % 20201227;
}

function transformUntilMatch(publicKey: number) {
  return doWhile(
    ({ value, loops: loops }) => ({ value: transform(value, 7), loops: ++loops }),
    ({ value }) => value !== publicKey,
    { value: 1, loops: 0 }
  ).loops;
}

function transformRepeatedly(subject: number, iterations: number): number {
  return range(0, iterations).reduce((value) => transform(value, subject), 1);
}

export function day25(): void {
  const key1 = 17607508;
  const key2 = 15065270;
  const key2Iterations = transformUntilMatch(key2);

  const pk1 = transformRepeatedly(key1, key2Iterations);

  console.log("Day 25 Part 1:", pk1);
}
