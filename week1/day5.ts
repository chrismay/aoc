import { difference, differenceBy, max, min, range, sortBy, zip } from "lodash";
import { tickets } from "./day5_inputs";

function seatID(ticket: string): number {
  return parseInt(ticket.replace(/[FL]/g, "0").replace(/[BR]/g, "1"), 2);
}

export function day5(): void {
  const allocatedSeats = sortBy([...tickets.split("\n").map(seatID)]);
  const lowestSeat = min(allocatedSeats) || 0;
  const highestSeat = max(allocatedSeats) || 0;
  const allPossibleSeats = range(lowestSeat, highestSeat + 1);

  const [firstAvailableSeat] = difference(allPossibleSeats, allocatedSeats);

  console.log("Day 5 Part 2:", firstAvailableSeat);
}
