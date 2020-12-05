import { multiply } from "lodash";
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
};

const startPosition: Progress = {
  // always start in the top left corner.
  xPos: 0,
  treeCount: 0,
};

export function day3(): void {
  function charAt(line: string, xPos: number) {
    return line.substr(xPos % line.length, 1); // If you read off the end of the line, just start again at the beginning.
  }

  const lines = skiMap.split("\n");

  // if we're starting at row 0 and moving down e.g. 2 rows at a time, we can ignore rows 1,3,5,7 etc.
  function ignoreSkippedLines(move: Move) {
    return function (_: string, index: number) {
      return index % move.down === 0;
    };
  }

  function processLine(move: Move) {
    return function (progress: Progress, line: string): Progress {
      const isTree = charAt(line, progress.xPos) === "#";
      return {
        xPos: progress.xPos + move.right,
        treeCount: progress.treeCount + (isTree ? 1 : 0),
      };
    };
  }

  const part1Move = { right: 3, down: 1 };

  const part1Result = lines.reduce(processLine(part1Move), startPosition);
  console.log("Day 3 Part 1:", part1Result.treeCount);

  const part2Moves: Move[] = [
    { right: 1, down: 1 },
    { right: 3, down: 1 },
    { right: 5, down: 1 },
    { right: 7, down: 1 },
    { right: 1, down: 2 },
  ];

  const part2Result = part2Moves
    .map((move) =>
      lines
        .filter(ignoreSkippedLines(move))
        .reduce(processLine(move), startPosition)
    )
    .map((p) => p.treeCount)
    .reduce(multiply, 1); //part 2 is only interested in the product of all the tree-counts.

  console.log("Day 3 part 2:", part2Result);
}
