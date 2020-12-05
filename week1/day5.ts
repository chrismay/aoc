import { max, min, range, sortBy, zip } from "lodash";
import { tickets } from "./day5_inputs";

function seatID(ticket: string): number {
  return parseInt(ticket.replace(/[FL]/g, "0").replace(/[BR]/g, "1"), 2);
}

export function day5(): void {
  const allocatedSeats = sortBy([...tickets.split("\n").map(seatID)]);
  const lowestSeat = min(allocatedSeats) || 0;
  const highestSeat = max(allocatedSeats);
  const allPossibleSeats = range(lowestSeat, highestSeat);

  console.log("Day 5 Part 1:", highestSeat);

  const [, firstAvailableSeat] =
    zip(allocatedSeats, allPossibleSeats).find(
      ([alloc, poss]) => alloc !== poss
    ) || [];

  console.log("Day 5 Part 2:", firstAvailableSeat);
}
