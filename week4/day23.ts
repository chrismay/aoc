import { toNumber } from "lodash";
import { absMod, notNull } from "../util";

type Cup = { value: number; next: Cup };
type CupRing = { currentCup: Cup; allCups: { [value: number]: Cup }; maxValue: number };

function removeNext(cup: Cup): Cup {
  const removed = cup.next;
  cup.next = cup.next.next;
  return removed;
}
function buildRing(input: string, padTo?: number): CupRing {
  const allCups = {} as { [value: number]: Cup };
  const inputNumbers = input.split("").map(toNumber);
  if (padTo) {
    for (let i = input.length; i <= padTo - 1; i++) {
      inputNumbers[i] = i + 1;
    }
  }
  const values: Cup[] = inputNumbers.map((n) => {
    const cup = {
      value: n,
      next: {} as Cup,
    };
    allCups[n] = cup;
    return cup;
  });
  for (let i = 0; i < values.length; i++) {
    values[i].next = values[(i + 1) % values.length];
  }
  return { currentCup: values[0], allCups, maxValue: values.length };
}

function playRound(ring: CupRing) {
  const c1 = removeNext(ring.currentCup);
  const c2 = removeNext(ring.currentCup);
  const c3 = removeNext(ring.currentCup);

  let destination = ring.currentCup.value;
  do {
    // have to bugger about with the numbers because we start from 1, not zero.
    destination = absMod(destination - 2, ring.maxValue) + 1;
  } while ([c1.value, c2.value, c3.value].includes(destination));

  const destCup = notNull(ring.allCups[destination]);
  const prev = destCup.next;
  destCup.next = c1;
  c3.next = prev;
  ring.currentCup = ring.currentCup.next;
}

function printRing(ring: CupRing): string {
  let c = ring.currentCup;
  let str = "";
  do {
    str = str + c.value;
    c = c.next;
  } while (c.value !== ring.currentCup.value);
  return str;
}
export function day23(): void {
  const p1Ring = buildRing("418976235");
  for (let index = 0; index < 100; index++) {
    playRound(p1Ring);
  }
  console.log("Day 23 Part 1:", printRing({ ...p1Ring, currentCup: p1Ring.allCups[1] }).substr(1));

  const p2Ring = buildRing("418976235", 1000000);

  for (let index = 0; index < 10000000; index++) {
    playRound(p2Ring);
  }
  const cup1 = p2Ring.allCups[1];
  console.log("Day 23 Part 2:", cup1.next.value * cup1.next.next.value);
}
