import { assign, fromPairs, last, max, range } from "lodash";
import { doWhile, time } from "../util";

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
  const p1 = time("dw", doWhile)(turn, (state) => state.turn !== 2021, time("st", start)([12, 1, 16, 3, 11, 0]));
  console.log("Day 15 Part 1:", p1.lastSpoken);
  const p2 = time("dw", doWhile)(turn, (state) => state.turn !== 30000001, time("st", start)([12, 1, 16, 3, 11, 0]));
  console.log("Day 15 Part 2:", p2.lastSpoken);
}
const sTime = Date.now();
