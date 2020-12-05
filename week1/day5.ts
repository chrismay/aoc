import { max, min, range, sortBy, zip } from "lodash";
import { tickets } from "./day5_inputs";

function toNumber(s: string): number {
  return parseInt(s.replace(/[FL]/g, "0").replace(/[BR]/g, "1"), 2);
}
const ticketPattern = /^([BF]{7})([LR]{3})$/;

function seatID(ticket: string): number {
  const [, row, col] = ticket.match(ticketPattern) || [];
  return toNumber(row) * 8 + toNumber(col);
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
