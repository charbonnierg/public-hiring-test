import { CarbonEmissionFactor } from "../carbonEmissionFactor/carbonEmissionFactor.entity";
import { FoodProduct } from "../foodProduct/foodProduct.entity";
import { FoodProductIngredientQuantity } from "../foodProduct/foodProductIngredientQuantity.entity";
import { convertUnit } from "../measurementSystem/unit";
import { CarbonFootprintContribution } from "./carbonFootprintContribution.entity";

/**
 * Compute the carbon footprint of a product given factors.
 *
 * @param product The product to compute the footprint for
 * @param factors The factors to use for the computation
 * @returns The contributions of the product to the carbon footprint if score was computed, null otherwise
 */
export const computeFootprintForProductAndFactors = (
  product: FoodProduct,
  factors: CarbonEmissionFactor[],
): CarbonFootprintContribution[] | null => {
  // Let's rearrange the list of factors into a map
  const factorsMap = Object.fromEntries(factors.map((f) => [f.name, f]));
  // Let's rearrange the factor emission into a map
  const emissionMap = Object.fromEntries(
    factors.map((f) => [f.name, f.emissionCO2eInKgPerUnit]),
  );
  // Let's define a function to convert quantities
  const makeQuantity = (
    ingredientQuantity: FoodProductIngredientQuantity,
  ): number => {
    const name = ingredientQuantity.ingredient.name;
    const factor = factorsMap[name];
    const factorUnit = factor.unit;
    const quantityUnit = ingredientQuantity.ingredient.unit;
    const quantity = convertUnit(
      ingredientQuantity.quantity,
      quantityUnit,
      factorUnit,
    );
    return quantity;
  };
  // And let's create a map of quantities
  const quantitiesMap = Object.fromEntries(
    product.ingredients.map((i) => [i.ingredient.name, makeQuantity(i)]),
  );
  // Let's compute the footprint contributions
  const scores = computeFootprintForQuantitiesAndEmissions(
    quantitiesMap,
    emissionMap,
  );
  // Return null if the values are missing
  if (!scores) return null;
  // Define a function to build a contribution
  const makeContribution = (
    i: FoodProductIngredientQuantity,
  ): CarbonFootprintContribution => {
    const name = i.ingredient.name;
    const factor = factorsMap[name];
    const score = scores[name];
    const contribution = new CarbonFootprintContribution();
    contribution.score = score;
    contribution.quantity = i;
    contribution.factor = factor;
    contribution.factor_id = factor.id;
    contribution.quantity_id = i.id;
    return contribution;
  };
  // Return the contributions
  return product.ingredients.map((i) => makeContribution(i));
};

/**
 * Compute the carbon footprint of a recipe given the quantities of ingredients.
 * *
 * @warning This function assumes that quantities units are the same as the
 *        emission factors units. This is why this function is not exported
 *        and is only used internally to compute the carbon footprint of a
 *        product.
 *
 * @param quantities A record of ingredient names and quantities
 * @param emissions A record of ingredient names and their emission factors
 * @returns A record of ingredient names and their carbon footprints if score was computed, null otherwise
 */
const computeFootprintForQuantitiesAndEmissions = (
  quantities: Record<string, number>,
  emissions: Record<string, number | undefined>,
): Record<string, number> | null => {
  // Initialize the scores
  const scores = {} as Record<string, number>;
  // Iterate over the ingredient quantities
  for (const [ingredient, quantity] of Object.entries(quantities)) {
    // Get the factor for the ingredient
    const factor = emissions[ingredient];
    // If the factor does not exist, we return null
    if (!factor) return null;
    // Compute the emission for the ingredient
    const emissionCO2eInKg = quantity * factor;
    // Store the emission in the scores
    scores[ingredient] = emissionCO2eInKg;
  }
  // Return the scores
  return scores;
};
