import { every, fromPairs, has, inRange } from "lodash";
import { passportFile } from "./day4_input";

type PassData = {
  byr: string;
  iyr: string;
  eyr: string;
  hgt: string;
  hcl: string;
  ecl: string;
  pid: string;
};

const split = (sep: string) => (str: string) => str.split(sep);

const presentIn = (o: unknown) => (f: string) => has(o, f);

const validates = (pd: PassData) => (v: (p: PassData) => boolean) => v(pd);

export function day4() {
  function fieldsPresent(passData: unknown): passData is PassData {
    const mandatoryFields = ["byr", "iyr", "eyr", "hgt", "hcl", "ecl", "pid"];
    return every(mandatoryFields, presentIn(passData));
  }

  function validData(passData: PassData): boolean {
    function validHeight(pd: PassData): boolean {
      const [, height, unit] = pd.hgt.split(/([0-9]+)([a-z]+)/);
      if (unit === "cm") return inRange(+height, 150, 194);
      if (unit === "in") return inRange(+height, 59, 77);
      return false;
    }

    const allowedEyeColours = ["amb", "blu", "brn", "gry", "grn", "hzl", "oth"];

    const validators: ((pd: PassData) => boolean)[] = [
      (pd) => inRange(+pd.byr, 1920, 2003),
      (pd) => inRange(+pd.iyr, 2010, 2021),
      (pd) => inRange(+pd.eyr, 2020, 2031),
      (pd) => validHeight(pd),
      (pd) => /#[0-9a-f]{6}/.test(pd.hcl),
      (pd) => allowedEyeColours.includes(pd.ecl),
      (pd) => /^[0-9]{9}$/.test(pd.pid),
    ];

    return every(validators, validates(passData));
  }

  const passData = passportFile
    .split("\n\n")
    .map((pass) => pass.replace(/\n/g, " ").split(" ").map(split(":")))
    .map(fromPairs);

  const validPassports = passData.filter(fieldsPresent);

  console.log("Day 4 part 1: ", validPassports.length);

  console.log("Day 4 part 2: ", validPassports.filter(validData).length);
}
