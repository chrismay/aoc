import { fromPairs, has, inRange, isNumber } from "lodash";
import { passportFile } from "./day4_input";

export function day4() {
  const passData = passportFile
    .split("\n\n")
    .map((pass) =>
      pass
        .replace(/\n/g, " ")
        .split(" ")
        .map((field) => field.split(":"))
    )
    .map(fromPairs);

  const mandatoryFields = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"];

  function fieldsPresent(passData: unknown): passData is PassData {
    const valid = mandatoryFields.reduce(
      (valid, f) => valid && has(passData, f),
      true
    );
    return valid;
  }
  type PassData = {
    byr: string;
    iyr: string;
    eyr: string;
    hgt: string;
    hcl: string;
    ecl: string;
    pid: string;
  };

  /*
byr (Birth Year) - four digits; at least 1920 and at most 2002.
iyr (Issue Year) - four digits; at least 2010 and at most 2020.
eyr (Expiration Year) - four digits; at least 2020 and at most 2030.
hgt (Height) - a number followed by either cm or in:
If cm, the number must be at least 150 and at most 193.
If in, the number must be at least 59 and at most 76.
hcl (Hair Color) - a # followed by exactly six characters 0-9 or a-f.
ecl (Eye Color) - exactly one of: amb blu brn gry grn hzl oth.
pid (Passport ID) - a nine-digit number, including leading zeroes.
cid (Country ID) - ignored, missing or not.
*/
  type PassportValidator = (pd: PassData) => boolean;
  function and(a: boolean, b: boolean) {
    return a && b;
  }
  function validData(passData: PassData): boolean {
    function validHeight(pd: PassData): boolean {
      const [, height, unit] = pd.hgt.split(/([0-9]+)([a-z]+)/);

      if (unit === "cm") return inRange(+height, 150, 194);

      if (unit === "in") return inRange(+height, 59, 77);
      return false;
    }

    const validators: PassportValidator[] = [
      (pd) => inRange(+pd.byr, 1920, 2003),
      (pd) => inRange(+pd.iyr, 2010, 2021),
      (pd) => inRange(+pd.eyr, 2020, 2031),
      validHeight,
      (pd) => /#[0-9a-f]{6}/.test(pd.hcl),
      (pd) =>
        ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"].includes(pd.ecl),
      (pd) => /^[0-9]{9}$/.test(pd.pid),
      (pd) => +pd.pid > 0,
    ];

    return validators.map((v) => v(passData)).reduce(and, true);
  }

  const validPassports = passData.filter(fieldsPresent);

  console.log("Day 4 part 1: ", validPassports.length);

  console.log("Day 4 part 2: ", validPassports.filter(validData).length);
}
