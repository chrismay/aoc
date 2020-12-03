import { skiMap } from "./day3_input";

// describes the kind of moves we can make on the map. They're always "down Y, right X".
type Move = {
  right: number;
  down: number;
};

// Holds our progress through the map.
type Progress = {
  xPos: number; // How far right have we travelled so far?
  treeCount: number; // how many trees have we seen so far?
  skipCountDown: number; // Do we need to skip this line (e.g. because we're doing "down 2")?
};

const initProgress: Progress = {
  // always start in the top left corner.
  xPos: 0,
  treeCount: 0,
  skipCountDown: 0, // never skip the first line.
};

export function day3() {
  function charAt(line: string, xPos: number) {
    return line.substr(xPos % line.length, 1); // If you read off the end of the line, just start again at the beginning.
  }

  const lines = skiMap.split("\n");

  function processLine(move: Move) {
    return function (progress: Progress, line: string): Progress {
      if (progress.skipCountDown > 0) {
        // We're doing "Down 2" or something like that, so skip this line and decrement the skip counter.
        return { ...progress, skipCountDown: progress.skipCountDown - 1 };
      } else {
        // We're on a line that we need to look for trees on
        const isTree = charAt(line, progress.xPos) === "#";
        return {
          xPos: progress.xPos + move.right,
          treeCount: progress.treeCount + (isTree ? 1 : 0),
          skipCountDown: move.down - 1,
        };
      }
    };
  }

  const part1Move = { right: 3, down: 1 };

  const part1Result = lines.reduce(processLine(part1Move), initProgress);
  console.log("Day 3 Part 1:", part1Result.treeCount);

  const part2Moves: Move[] = [
    { right: 1, down: 1 },
    { right: 3, down: 1 },
    { right: 5, down: 1 },
    { right: 7, down: 1 },
    { right: 1, down: 2 },
  ];

  const part2Result = part2Moves
    .map((move) => lines.reduce(processLine(move), initProgress))
    .reduce((prod, progress) => prod * progress.treeCount, 1); //part 2 is only interested in the product of all the tree-counts.

  console.log("Day 3 part 2:", part2Result);
}
