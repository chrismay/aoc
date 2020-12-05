import { sortBy } from "lodash";
import { tickets } from "./day5_inputs";

// reduce that will exit early if the reducing function ever returns undefined
// in which case, the last value of the accumulator is returned and the remainder
// of the list is ignored.
function partialReduce<T, A>(
  arr: T[],
  f: (a: A, t: T) => A | undefined,
  seed: A
): A {
  if (arr === []) return seed;
  const [h, ...t] = arr;
  const acc = f(seed, h);
  return acc === undefined ? seed : partialReduce(t, f, acc);
}

function seatId(ticket: string): number {
  return [...ticket].reduce((id, c) => (id << 1) + (/[BR]/.test(c) ? 1 : 0), 0);
}

export function day5(): void {
  const allocatedSeats = sortBy(tickets.split("\n").map(seatId));
  const highestSeat = allocatedSeats[allocatedSeats.length - 1];

  console.log("Day 5 Part 1:", highestSeat);

  const lowestSeat = allocatedSeats[0];

  console.log(
    "Day 5 Part 2:",
    partialReduce(
      allocatedSeats,
      (curr, alloc) => (curr === alloc ? ++curr : undefined),
      lowestSeat
    )
  );
}
