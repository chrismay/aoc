import { keys, orderBy, toPairs, trim, uniq, values } from "lodash";
import { foodsList } from "./day21_inputs";

type Food = { ingredients: string[]; allergens: string[] };
type AllergenIngredients = { [allergen: string]: string[] };

function parseInput(input: string): Food[] {
  return input.split("\n").map((line) => {
    const [, ingredientsList, allergensList] = line.match(/(.*)\(contains(.*)\)/) || [];
    const ingredients = ingredientsList.split(" ").filter((i) => i.length > 0);
    const allergens = allergensList.split(",").map((a) => trim(a));
    return { ingredients, allergens };
  });
}

export function day21(): void {
  const foods = parseInput(foodsList);

  const allergenIngredients: AllergenIngredients = {};
  foods.forEach((food) => {
    food.allergens.forEach((allergen) => {
      if (allergenIngredients[allergen] === undefined) {
        allergenIngredients[allergen] = [...food.ingredients];
      } else {
        allergenIngredients[allergen] = allergenIngredients[allergen].filter((val) => food.ingredients.includes(val));
      }
    });
  });

  const dangerousIngreedients = new Set(values(allergenIngredients).flat());
  const safeIngredients = uniq(foods.flatMap((f) => f.ingredients).filter((i) => !dangerousIngreedients.has(i)));

  const safeIngredientOccurrences = safeIngredients.reduce(
    (acc, ing) => acc + foods.filter((f) => f.ingredients.includes(ing)).length,
    0
  );

  console.log("Day 21 part 1:", safeIngredientOccurrences);

  while (toPairs(allergenIngredients).find(([, ingredients]) => ingredients.length > 1)) {
    keys(allergenIngredients).forEach((allergen) => {
      let possibleIngredients = allergenIngredients[allergen];
      keys(allergenIngredients)
        .filter((k) => k !== allergen)
        .forEach((a2) => {
          const otherAllergenIngredients = allergenIngredients[a2];
          possibleIngredients = possibleIngredients.filter((i) => !otherAllergenIngredients.includes(i));
        });
      if (possibleIngredients.length === 1) allergenIngredients[allergen] = possibleIngredients;
    });
  }

  console.log(
    "Day 21 Part 2:",
    orderBy(toPairs(allergenIngredients), ([a]) => a)
      .map(([, ingredient]) => ingredient)
      .flat()
      .join()
  );
}
