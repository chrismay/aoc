import { List, Set } from "immutable";
import { toNumber } from "lodash";
import { notNull } from "../util";
import { gameInput } from "./day22_input";

type Deck = List<number>;
type Game = { p1: Deck; p2: Deck; prevP1: Set<string>; winner?: Player };
type FinishedGame = { p1: Deck; p2: Deck; prevP1: Set<string>; winner: Player };
type Player = "p1" | "p2";

function playRound(prevRound: Game, playingRecusiveRule: boolean): Game {
  // Check that we aren't looping.
  // For unclear reasons, it's enough to check if the same cards have appeared in one hand
  // in any order.
  const p1Hand = prevRound.p1.sort().join(",");
  if (prevRound.prevP1.has(p1Hand)) {
    // Loop detection defaults the game to P1
    return { ...prevRound, winner: "p1" };
  } else {
    const p1Card = notNull(prevRound.p1.first()); // assume we'll never be called with an empty list
    const p2Card = notNull(prevRound.p2.first());

    if (playingRecusiveRule && prevRound.p1.size > p1Card && prevRound.p2.size > p2Card) {
      const subGame: Game = {
        p1: prevRound.p1.slice(1, p1Card + 1),
        p2: prevRound.p2.slice(1, p2Card + 1),
        prevP1: Set(),
      };
      const result = playGame(subGame, true);
      return exchangeCards(prevRound, result.winner);
    } else {
      const winner = p1Card > p2Card ? "p1" : "p2";
      return exchangeCards(prevRound, winner);
    }
  }
}

function exchangeCards(round: Game, roundWinner: Player): Game {
  const prevP1 = round.prevP1.add(round.p1.sort().join(","));
  const p1Card = notNull(round.p1.first()); // assume we'll never be called with an empty list
  const p2Card = notNull(round.p2.first());

  if (roundWinner === "p1") {
    return checkForGameWinner({
      prevP1,
      p1: round.p1.shift().push(p1Card, p2Card),
      p2: round.p2.shift(),
    });
  } else {
    return checkForGameWinner({
      prevP1,
      p1: round.p1.shift(),
      p2: round.p2.shift().push(p2Card, p1Card),
    });
  }
}

function checkForGameWinner(game: Game): Game {
  if (game.p1.size === 0) {
    return { ...game, winner: "p2" };
  } else if (game.p2.size === 0) {
    return { ...game, winner: "p1" };
  } else {
    return game;
  }
}

function playGame(start: Game, recursive: boolean): FinishedGame {
  let game = start;
  while (game.winner === undefined) {
    game = playRound(game, recursive);
  }

  return game as FinishedGame;
}

function parseInput(s: string): Game {
  const [p1, p2] = s.split("\n\n").map((g) =>
    g
      .split("\n")
      .filter((l) => /^[0-9]+$/.test(l))
      .map(toNumber)
  );
  return { p1: List(p1), p2: List(p2), prevP1: Set() };
}

function scoreGame(g: Game): number {
  const winningHand = g.p1.size === 0 ? g.p2 : g.p1;
  return winningHand.reverse().reduce((score, card, idx) => score + card * (idx + 1), 0);
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
