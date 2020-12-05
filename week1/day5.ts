import { max, min, sortBy } from "lodash";
import { tickets } from "./day5_inputs";

function seatId(ticket: string): number {
  return [...ticket].reduce((id, c) => (id << 1) + (/[BR]/.test(c) ? 1 : 0), 0);
}

export function day5(): void {
  const allocatedSeats = sortBy(tickets.split("\n").map(seatId));
  const highestSeat = max(allocatedSeats) || 0;

  console.log("Day 5 Part 1:", highestSeat);

  const lowestSeat = min(allocatedSeats) || 0;

  const firstFreeSeat =
    lowestSeat +
    allocatedSeats.findIndex((seatId, idx) => seatId !== idx + lowestSeat);

  console.log("Day 5 Part 2:", firstFreeSeat);
}
