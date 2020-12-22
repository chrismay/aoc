import { reverse, toNumber } from "lodash";
import { notNull } from "../util";
import { gameInput } from "./day22_input";

type Deck = number[];
type Game = { p1: Deck; p2: Deck; prevP1: Set<string>; winner?: Player };
type Player = "p1" | "p2";

function playRound(game: Game, playingRecusiveRule: boolean): Game {
  // Check that we aren't looping.
  const p1Hand = game.p1.join(",");
  if (game.prevP1.has(p1Hand)) {
    // Loop detection defaults the game to P1
    return { ...game, winner: "p1" };
  } else {
    const prevP1 = new Set([...game.prevP1, p1Hand]);

    // construct the input state for the next round
    const nextGame = { p1: [...game.p1], p2: [...game.p2], prevP1 };
    const p1Card = notNull(nextGame.p1.shift());
    const p2Card = notNull(nextGame.p2.shift());
    if (playingRecusiveRule && nextGame.p1.length >= p1Card && nextGame.p2.length >= p2Card) {
      const recursiveGame: Game = {
        p1: [...nextGame.p1].slice(0, p1Card),
        p2: [...nextGame.p2].slice(0, p2Card),
        prevP1: new Set(),
      };
      const result = playGame(recursiveGame, true);
      if (result.winner === "p1") {
        nextGame.p1.push(p1Card);
        nextGame.p1.push(p2Card);
      } else {
        nextGame.p2.push(p2Card);
        nextGame.p2.push(p1Card);
      }
    } else {
      //    Non-recursive; play normally
      if (p1Card > p2Card) {
        nextGame.p1.push(p1Card);
        nextGame.p1.push(p2Card);
      } else {
        nextGame.p2.push(p2Card);
        nextGame.p2.push(p1Card);
      }
    }
    if (nextGame.p1.length === 0) {
      return { ...nextGame, winner: "p2" };
    }
    if (nextGame.p2.length === 0) {
      return { ...nextGame, winner: "p1" };
    }
    return nextGame;
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
