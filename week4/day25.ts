import { Seq } from "immutable";
import { curry, range } from "lodash";
import { iterate } from "../util";

function hash(subject: number, value: number): number {
  return (value * subject) % 20201227;
}

function transformUntilMatch(publicKey: number) {
  const hashSubject = curry(hash);
  return Seq(iterate(hashSubject(7), 1)).findIndex((value) => value === publicKey);
}

function transformRepeatedly(subject: number, iterations: number): number {
  return range(0, iterations).reduce((value) => hash(subject, value), 1);
}

export function day25(): void {
  const key1 = 17607508;
  const key2 = 15065270;
  const key2Iterations = transformUntilMatch(key2);
  //  console.log(key2Iterations);
  const pk1 = transformRepeatedly(key1, key2Iterations);

  console.log("Day 25 Part 1:", pk1);
}
