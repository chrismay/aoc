import { Seq } from "immutable";
import { assign, fromPairs, last, max, range } from "lodash";
import { iterate, time } from "../util";

type State = {
  turn: number;
  seen: { [n: number]: { lastSpokenTurn: number; prevSpokenTurn?: number } };
  lastSpoken: number;
  maxSpoken: number;
};

function turn(state: State): State {
  const num = state.lastSpoken;
  const seen = state.seen[num];
  const prevSeen = seen?.prevSpokenTurn;
  const speakNumber = prevSeen === undefined ? 0 : seen.lastSpokenTurn - prevSeen;

  state.seen[speakNumber] = { lastSpokenTurn: state.turn, prevSpokenTurn: state.seen[speakNumber]?.lastSpokenTurn };
  state.lastSpoken = speakNumber;
  state.turn = state.turn + 1;
  state.maxSpoken = max([state.maxSpoken, speakNumber]) || 0;

  return state;
}

function start(nums: number[]): State {
  const init: { [k: number]: number | undefined } = {};
  time("range", () => range(0, 30000000).forEach((i) => (init[i] = undefined)))();

  return {
    maxSpoken: 0,
    turn: nums.length + 1,
    lastSpoken: last(nums) || -1,
    seen: assign(init, fromPairs(nums.map((n, i) => [n, { lastSpokenTurn: i + 1 }]))),
  };
}

export function day15(): void {
  const hand = [12, 1, 16, 3, 11, 0];

  const index = 2020 - hand.length; // want the result after hands played; the first <hand.length> turns are played in "start".
  const ls = Seq(iterate(turn, start(hand))).get(index)?.lastSpoken;
  console.log("Day 15 Part 1:", ls);

  const index2 = 30000000 - hand.length;
  const ls2 = Seq(iterate(turn, start(hand))).get(index2)?.lastSpoken;
  console.log("Day 15 Part 2:", ls2);
}

day15();
