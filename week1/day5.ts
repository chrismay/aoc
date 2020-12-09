import { sortBy } from "lodash";
import { partialReduce } from "../util";
import { tickets } from "./day5_inputs";

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
    partialReduce(allocatedSeats, (curr, alloc) => (curr === alloc ? ++curr : undefined), lowestSeat)
  );
}
