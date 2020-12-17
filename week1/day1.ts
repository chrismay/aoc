import { Dictionary, fromPairs, multiply, toNumber } from "lodash";
import { cartesianProduct } from "../util";
import { expensesInput } from "./day1_input";

export function day1(): void {
  const expenses: number[] = expensesInput.split("\n").map(toNumber);

  // find all possible pairs of expenses and store them in a dictionary, keyed by their sum.
  const pairs: Dictionary<[number, number]> = fromPairs(
    cartesianProduct(expenses, expenses).map(([e1, e2]) => [e1 + e2, [e1, e2]])
  );

  const part1 = pairs[2020]; // answer to part 1 is the two values that add to 2020
  console.log("Day 1 Part 1:", ...part1, part1.reduce(multiply));

  // find any value in the expenses list which can be added to one of the sums that we've already calculated
  // to give 2020.
  const thirdValue = expenses.find((e) => pairs[2020 - e]);

  // If there's no such value then something's gone wrong, because the instructions said there should be.
  if (thirdValue != undefined) {
    const part2 = [thirdValue, ...pairs[2020 - thirdValue]]; // answer to part 2 is the 3 values that add to 2020
    console.log("Day 1 Part 2:", ...part2, part2.reduce(multiply));
  }
}
