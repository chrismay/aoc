import { multiply, orderBy, range, sum, toNumber, toPairs, uniq, values } from "lodash";
import { ticketData } from "./day16_input";

type Range = { min: number; max: number };
type FieldDefinition = [string, Range[]];

function toRange(s: string): Range {
  const [min, max] = s.split("-");
  return { min: +min, max: +max };
}
function parseInput(input: string) {
  const [fields, yours, others] = input.split("\n\n");
  const fieldDefinitions: FieldDefinition[] = fields
    .split("\n")
    .map((line) => line.split(":"))
    .map(([fieldName, constraints]) => [fieldName, constraints.split("or").map(toRange)]);

  const yourTicket = yours.split("\n")[1].split(",").map(toNumber);

  const otherTickets = others
    .split("\n")
    .splice(1)
    .map((t) => t.split(",").map(toNumber));

  return { fieldDefinitions, yourTicket, otherTickets };
}

function rangeContains(n: number) {
  return function (r: Range): boolean {
    return n <= r.max && n >= r.min;
  };
}

function isValidValue(n: number, fd: FieldDefinition): boolean {
  return fd[1].find((r) => rangeContains(n)(r)) !== undefined;
}

function isValidForAtLeastOneField(n: number, fieldDefinitions: FieldDefinition[]): boolean {
  const allRanges = fieldDefinitions.flatMap((fd) => fd[1]);
  const f = allRanges.find(rangeContains(n));
  return f !== undefined;
}

function findInvalidValues(ticket: number[], fieldDefinitions: FieldDefinition[]): number[] {
  return ticket.filter((n) => !isValidForAtLeastOneField(n, fieldDefinitions));
}

function allValuesAreValid(fieldPosition: number, field: FieldDefinition, tickets: number[][]): boolean {
  const fieldValuesInPosition = tickets.map((t) => t[fieldPosition]);
  return fieldValuesInPosition.find((v) => !isValidValue(v, field)) === undefined;
}

function findValidFieldPositions(field: FieldDefinition, tickets: number[][]) {
  const possiblePositions = range(0, tickets[0].length);
  return possiblePositions.filter((pos) => allValuesAreValid(pos, field, tickets));
}

function addPossibilities(
  remainingFieldPositions: [FieldDefinition, number[]][],
  combinationsSoFar: { [fieldName: string]: number }[]
): { [fieldName: string]: number }[] {
  if (remainingFieldPositions.length === 0) {
    return combinationsSoFar;
  }

  const [fd, ...restOfFields] = remainingFieldPositions;
  const possibilities = fd[1];
  const possSoFar = combinationsSoFar
    .flatMap((combination) => possibilities.map((p) => ({ ...combination, [fd[0][0]]: p })))
    .filter((p) => uniq(values(p)).length === values(p).length);
  return addPossibilities(restOfFields, possSoFar);
}

export function day16(): void {
  const { fieldDefinitions, yourTicket, otherTickets } = parseInput(ticketData);

  console.log("Day 16 Part 1:", sum(otherTickets.flatMap((t) => findInvalidValues(t, fieldDefinitions))));

  const validTickets = otherTickets.filter((t) => findInvalidValues(t, fieldDefinitions).length === 0);
  const validFieldPositions: [FieldDefinition, number[]][] = fieldDefinitions.map((fd) => [
    fd,
    findValidFieldPositions(fd, validTickets),
  ]);

  const vfpSorted = orderBy(validFieldPositions, (vfp) => vfp[1].length);
  const res = addPossibilities(vfpSorted, [{}]);

  const depFields = toPairs(res[0]).filter(([fieldName]) => /^departure/.test(fieldName));

  console.log("Day 16 part 2:", depFields.map(([, fieldNumber]) => yourTicket[fieldNumber]).reduce(multiply));
}
