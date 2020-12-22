import { reverse, toNumber } from "lodash";
import { notNull } from "../util";
import { gameInput } from "./day22_input";

type Deck = number[];
type Game = { p1: Deck; p2: Deck; prevP1: Set<string>; winner?: Player };
type Player = "p1" | "p2";

function playRound(prevRound: Game, playingRecusiveRule: boolean): Game {
  // Check that we aren't looping.
  const p1Hand = prevRound.p1.join(",");
  if (prevRound.prevP1.has(p1Hand)) {
    // Loop detection defaults the game to P1
    return { ...prevRound, winner: "p1" };
  } else {
    const prevP1 = new Set([...prevRound.prevP1, p1Hand]);

    // construct the input state for the next round, initially just a clone of the current state
    const nextRound = { p1: [...prevRound.p1], p2: [...prevRound.p2], prevP1 };
    const p1Card = notNull(nextRound.p1.shift());
    const p2Card = notNull(nextRound.p2.shift());
    if (playingRecusiveRule && nextRound.p1.length >= p1Card && nextRound.p2.length >= p2Card) {
      const recursiveGame: Game = {
        p1: [...nextRound.p1].slice(0, p1Card),
        p2: [...nextRound.p2].slice(0, p2Card),
        prevP1: new Set(),
      };
      const result = playGame(recursiveGame, true);
      if (result.winner === "p1") {
        nextRound.p1.push(p1Card);
        nextRound.p1.push(p2Card);
      } else {
        nextRound.p2.push(p2Card);
        nextRound.p2.push(p1Card);
      }
    } else {
      //    Non-recursive; play normally
      if (p1Card > p2Card) {
        nextRound.p1.push(p1Card);
        nextRound.p1.push(p2Card);
      } else {
        nextRound.p2.push(p2Card);
        nextRound.p2.push(p1Card);
      }
    }
    // determine whether anyone's won yet.
    if (nextRound.p1.length === 0) {
      return { ...nextRound, winner: "p2" };
    } else if (nextRound.p2.length === 0) {
      return { ...nextRound, winner: "p1" };
    } else {
      return nextRound;
    }
  }
}

function playGame(start: Game, recursive: boolean) {
  let game = start;
  while (game.winner === undefined) {
    game = playRound(game, recursive);
  }
  return game;
}

function parseInput(s: string): Game {
  const [p1, p2] = s.split("\n\n").map((g) =>
    g
      .split("\n")
      .filter((l) => /^[0-9]+$/.test(l))
      .map(toNumber)
  );
  return { p1, p2, prevP1: new Set() };
}

function scoreGame(g: Game): number {
  const winningHand = g.p1.length === 0 ? g.p2 : g.p1;
  return reverse(winningHand).reduce((score, card, idx) => score + card * (idx + 1), 0);
}
export function day22(): void {
  let regularGame = parseInput(gameInput);
  regularGame = playGame(regularGame, false);
  console.log("Day 22 Part 1:", scoreGame(regularGame));

  let recursiveGame = parseInput(gameInput);
  recursiveGame = playGame(recursiveGame, true);
  console.log("Day 22 Part 2:", scoreGame(recursiveGame));
}
day22();
