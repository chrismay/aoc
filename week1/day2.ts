import { passwd } from "./day2_input";
import * as _ from "lodash";

type Pwent = {
  max: number;
  min: number;
  letter: string;
  password: string;
};

const eq = _.curry(_.eq);

export function day2(): void {
  function toPwent(line: string): Pwent {
    const passwordLineFormat = /(\d+)-(\d+) ([a-z]): ([a-z]+)/;
    const [, min, max, letter, password] = line.match(passwordLineFormat) || [];
    return { min: +min, max: +max, letter, password };
  }

  function isValid_Part1Rule(pwent: Pwent): boolean {
    const letterCount = [...pwent.password].filter(eq(pwent.letter)).length;
    return letterCount >= pwent.min && letterCount <= pwent.max;
  }

  function isValid_Part2Rule(pwent: Pwent): boolean {
    const letterAtPostion = (pos: number) => pwent.password.substr(pos - 1, 1);
    return (
      [pwent.min, pwent.max].map(letterAtPostion).filter(eq(pwent.letter))
        .length === 1
    );
  }

  const passwordEntries = passwd.split("\n").map(toPwent);

  const validForPart1 = passwordEntries.filter(isValid_Part1Rule);
  console.log("Day 2 Part 1:", validForPart1.length);

  const validForPart2 = passwordEntries.filter(isValid_Part2Rule);
  console.log("Day 2 Part 2:", validForPart2.length);
}
