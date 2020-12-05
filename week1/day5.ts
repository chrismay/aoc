import { head, max, min, sortBy, tail } from "lodash";
import { tickets } from "./day5_inputs";

function seatId(ticket: string): number {
  return [...ticket].reduce((id, c) => (id << 1) + (/[BR]/.test(c) ? 1 : 0), 0);
}

export function day5(): void {
  const allocatedSeats = sortBy(tickets.split("\n").map(seatId));
  const highestSeat = max(allocatedSeats) || 0;

  console.log("Day 5 Part 1:", highestSeat);

  const lowestSeat = min(allocatedSeats) || 0;

  function findFreeSeat(seats: number[], curr: number): number {
    return head(seats) !== curr ? curr : findFreeSeat(tail(seats), ++curr);
  }

  console.log("Day 5 Part 2:", findFreeSeat(allocatedSeats, lowestSeat));
}
