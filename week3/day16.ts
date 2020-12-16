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
    const found = n <= r.max && n >= r.min;
    //if (found) console.log(`${n} matches ${r}`);
    return found;
  };
}
function isValidValue(n: number, fd: FieldDefinition) {
  const valid = fd[1].find((r) => rangeContains(n)(r));
  //console.log("isValid", n, fd, valid);
  return valid !== undefined;
}
function isValidForAnyField(n: number, fieldDefinitions: FieldDefinition[]): boolean {
  const allRanges = fieldDefinitions.flatMap((fd) => fd[1]);
  //console.log(allRanges);
  const f = allRanges.find(rangeContains(n));
  //console.log(f);
  return f !== undefined;
}
function findInvalidValues(ticket: number[], fieldDefinitions: FieldDefinition[]): number[] {
  return ticket.filter((n) => !isValidForAnyField(n, fieldDefinitions));
}

function allValuesAreValid(fieldPosition: number, field: FieldDefinition, otherTickets: number[][]): boolean {
  const fieldValues = otherTickets.map((t) => t[fieldPosition]);
  //console.log("Field values in position ", fieldPosition, "are", fieldValues);
  const allValid = fieldValues.find((v) => !isValidValue(v, field)) === undefined;
  const invalid = fieldValues.map((v, i) => [v, i]).filter(([v, i]) => !isValidValue(v, field));
  if (!allValid) {
    console.log(
      `Field ${field[0]} with definition ${field[1].map(
        (r) => r.min + "-" + r.max
      )} is not valid in position ${fieldPosition}`
    );
    console.log("Invalid values", invalid);
  } else {
    console.log(`Field ${field[0]} is valid  in position ${fieldPosition}`);
  }
  return allValid;
}

function findValidFieldPositions(field: FieldDefinition, tickets: number[][]) {
  const possiblePositions = range(0, tickets[0].length);
  //console.log("FVFP: field:", field);
  //console.log("FVFP: possible positions", possiblePositions);
  const validPositions = possiblePositions.filter((pos) => allValuesAreValid(pos, field, tickets));
  console.log("FVFP: valid", validPositions);
  return validPositions;
}

export function day16() {
  const { fieldDefinitions, yourTicket, otherTickets } = parseInput(ticketData);

  console.log(isValidForAnyField(2, fieldDefinitions));
  console.log("Day 16 Part 1", sum(otherTickets.flatMap((t) => findInvalidValues(t, fieldDefinitions))));
  const validTickets = otherTickets.filter((t) => findInvalidValues(t, fieldDefinitions).length === 0);
  //console.log(validTickets[0].length);

  console.log(fieldDefinitions);
  const possiblePositions = range(0, fieldDefinitions.length);
  const field = fieldDefinitions[0];
  console.log(findValidFieldPositions(fieldDefinitions[0], validTickets));

  const validFieldPositions: [FieldDefinition, number[]][] = fieldDefinitions.map((fd) => [
    fd,
    findValidFieldPositions(fd, validTickets),
  ]);
  console.log(validFieldPositions);

  function addPossibilities(
    remainingFieldPositions: [FieldDefinition, number[]][],
    combinationsSoFar: { [fieldName: string]: number }[]
  ): { [fieldName: string]: number }[] {
    if (remainingFieldPositions.length === 0) {
      return combinationsSoFar;
    }
    const [fd, ...restOfFields] = remainingFieldPositions;
    const possibilities = fd[1];
    let possSoFar;
    if (combinationsSoFar.length === 0) {
      possSoFar = possibilities.map((p) => ({ [fd[0][0]]: p }));
    } else {
      possSoFar = combinationsSoFar.flatMap((combo) =>
        possibilities.map((p) => {
          const fname = fd[0][0];
          if (combo[fname] === undefined) {
            return { ...combo, [fname]: p };
          } else {
            return combo;
          }
        })
      );
    }
    const reduced = possSoFar.filter((p) => uniq(values(p)).length === values(p).length);
    return addPossibilities(restOfFields, reduced);
  }

  const vfpSorted = orderBy(validFieldPositions, (vfp) => vfp[1].length);
  const res = addPossibilities(vfpSorted, []).filter((p) => uniq(values(p)).length === fieldDefinitions.length);
  console.log("Result", res);
  const depFields = toPairs(res[0]).filter(([k, v]) => /^departure/.test(k));

  console.log("DepFields", depFields);
  console.log(depFields.map(([k, v]) => v));

  console.log("Yourticket", yourTicket);

  console.log(depFields.map(([k, v]) => v).map((pos) => yourTicket[pos]));

  console.log(
    depFields
      .map(([k, v]) => v)
      .map((v) => yourTicket[v])
      .reduce(multiply)
  );
}
