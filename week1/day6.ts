import { countBy, sum, toPairs, uniq } from "lodash";
import { customsDeclarations } from "./day6_input";

function day6Part1() {
  console.log(
    "Day 6 part 1:",
    sum(
      customsDeclarations
        .split("\n\n")
        .map((decl) => uniq([...decl.replace(/\n/g, "")]).length)
    )
  );
}

function day6Part2() {
  console.log(
    "Day 6 Part 2",
    sum(
      customsDeclarations.split("\n\n").map((decl) => {
        const submissions = decl.split("\n");
        const questionsByCount = countBy([...decl.replace(/\n/g, "")]);
        return toPairs(questionsByCount)
          .filter(([, c]) => c === submissions.length)
          .map(([q]) => q).length;
      })
    )
  );
}

export function day6(): void {
  day6Part1();
  day6Part2();
}
