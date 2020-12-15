import { fromPairs, last } from "lodash";
import { doWhile } from "../util";

type State = {
  turn: number;
  seen: { [n: number]: { lastSpokenTurn: number; prevSpokenTurn?: number } };
  lastSpoken: number;
};

function sayNumber(state: State, n: number): State {
  //console.log("Say:", n);
  const prevState = state.seen[n];
  const newState = { lastSpokenTurn: state.turn, prevSpokenTurn: prevState?.lastSpokenTurn };
  state.seen[n] = newState;
  return { ...state, lastSpoken: n };
}
function playNumber(state: State, num: number): State {
  //   console.log("play", num);
  if (state.seen[num] === undefined) {
    return { ...sayNumber(state, 0), turn: state.turn + 1 };
  } else {
    const prevSeen = state.seen[num].prevSpokenTurn;
    if (prevSeen === undefined) {
      return { ...sayNumber(state, 0), turn: state.turn + 1 };
    } else {
      return {
        ...sayNumber(state, state.seen[num].lastSpokenTurn - prevSeen),
        turn: state.turn + 1,
      };
    }
  }
}
function play(state: State): State {
  const s = playNumber(state, state.lastSpoken);
  if ((s.turn - 1) % 1000000 === 0) console.log("Turn / Spoke", s.turn - 1, s.lastSpoken);
  return s;
}

function start(nums: number[]): State {
  return {
    turn: nums.length + 1,
    lastSpoken: last(nums) || -1,
    seen: fromPairs(nums.map((n, i) => [n, { lastSpokenTurn: i + 1 }])),
  };
}
export function day15(): void {
  console.log("Day 15 Part 1");

  // const state = [0, 3, 6].reduce(play, { seen: {}, lastSpoken: -1, turn: 1 });
  const state = start([0, 3, 6]);
  console.log("Starting play");
  const t4 = play(state);
  const t5 = play(t4);
  const t6 = play(t5);
  const t7 = play(t6);
  play(t7);
  const p1 = doWhile(play, (state) => state.turn !== 30000001, start([12, 1, 16, 3, 11, 0]));
  console.log(p1.turn, p1.lastSpoken);
}
