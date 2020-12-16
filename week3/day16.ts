import { every, has, multiply, orderBy, range, some, sum, toNumber, toPairs } from "lodash";
import { ticketData } from "./day16_input";

type Range = { min: number; max: number };
type FieldDefinition = [string, Range[]];
function fieldName(fd: FieldDefinition) {
  return fd[0];
}
function rules(fd: FieldDefinition) {
  return fd[1];
}

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

function isValidValue(fd: FieldDefinition, n: number): boolean {
  return some(rules(fd), (r) => n <= r.max && n >= r.min);
}

function isValidForAtLeastOneField(n: number, fieldDefinitions: FieldDefinition[]): boolean {
  return some(fieldDefinitions, (fd) => isValidValue(fd, n));
}

function findInvalidValues(ticket: number[], fieldDefinitions: FieldDefinition[]): number[] {
  return ticket.filter((n) => !isValidForAtLeastOneField(n, fieldDefinitions));
}

function allValuesAreValid(fieldPosition: number, field: FieldDefinition, tickets: number[][]): boolean {
  const fieldValuesInPosition = tickets.map((t) => t[fieldPosition]);
  return every(fieldValuesInPosition, (v) => isValidValue(field, v));
}

function findValidFieldPositions(field: FieldDefinition, tickets: number[][]) {
  const possiblePositions = range(0, tickets[0].length);
  return possiblePositions.filter((pos) => allValuesAreValid(pos, field, tickets));
}

function addPossibilities(
  remainingFieldPositions: [FieldDefinition, number[]][],
  combinationsSoFar: { [position: number]: string }[]
): { [position: number]: string }[] {
  if (remainingFieldPositions.length === 0) {
    return combinationsSoFar;
  }

  const [[fieldDefinition, possibleFieldPosition], ...restOfFields] = remainingFieldPositions;

  return addPossibilities(
    restOfFields,
    combinationsSoFar.flatMap((combination) =>
      possibleFieldPosition
        .filter((possibilePosition) => !has(combination, possibilePosition))
        .map((position) => ({ ...combination, [position]: fieldName(fieldDefinition) }))
    )
  );
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
  const result = addPossibilities(vfpSorted, [{}])[0];

  const depFields = toPairs(result).filter(([, fieldName]) => /^departure/.test(fieldName));
  console.log("Day 16 part 2:", depFields.map(([fieldNumber]) => yourTicket[+fieldNumber]).reduce(multiply));
}
