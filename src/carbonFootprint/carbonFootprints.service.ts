import { Inject, Injectable } from "@nestjs/common";
import { CarbonEmissionFactorsService } from "../carbonEmissionFactor/carbonEmissionFactors.service";
import { ICarbonEmissionFactorService } from "../carbonEmissionFactor/interface/carbonEmissionFactors.service";
import { FoodProductIngredientQuantity } from "../foodProduct/foodProductIngredientQuantity.entity";
import { FoodProductsService } from "../foodProduct/foodProducts.service";
import { IFoodProductsService } from "../foodProduct/interface/foodProducts.service";
import { CarbonFootprintContribution } from "./carbonFootprintContribution.entity";
import { CarbonFootprintRepository } from "./carbonFootprints.repository";
import { ICarbonFootprintRepository } from "./interface/carbonFootprints.repository";
import { ICarbonFootprintService } from "./interface/carbonFootprints.service";

@Injectable()
export class CarbonFootprintService implements ICarbonFootprintService {
  constructor(
    @Inject(FoodProductsService)
    private foodProductsService: IFoodProductsService,
    @Inject(CarbonFootprintRepository)
    private carbonFootprintRepository: ICarbonFootprintRepository,
    @Inject(CarbonEmissionFactorsService)
    private carbonEmissionFactorsService: ICarbonEmissionFactorService,
  ) {}

  computeScore(
    ingredients: FoodProductIngredientQuantity[],
    factors: Record<string, number | undefined>,
  ): Record<string, number> | null {
    const scores = {} as Record<string, number>;
    for (const item of ingredients) {
      const factor = factors[item.ingredient.name];
      if (!factor) {
        return null;
      }
      const emissionCO2eInKg = item.quantity * factor;
      scores[item.ingredient.name] = emissionCO2eInKg;
    }
    return scores;
  }

  async get(product: string): Promise<CarbonFootprintContribution[] | null> {
    // TODO: Do not query product first but use a single SQL query
    // using product name.

    // First find the product
    const entity = await this.foodProductsService.find({ name: product });
    if (!entity) {
      return null;
    }
    // Then find the contributions for the product ingredients
    const contributions =
      await this.carbonFootprintRepository.findContributions(
        entity.ingredients.map((i) => i.id),
      );
    // This should never happen, but let's be safe
    if (contributions.length !== entity.ingredients.length) {
      throw new Error("Missing contributions for some ingredients");
    }
    return contributions;
  }

  async save(product: string): Promise<CarbonFootprintContribution[] | null> {
    // Let's start by finding the product
    const entity = await this.foodProductsService.find({ name: product });
    if (!entity) {
      return null;
    }
    // We can then get a list of ingredient names
    const ingredientNames = entity.ingredients.map((c) => c.ingredient.name);
    const ingredientIds = entity.ingredients.map((i) => i.id);
    // And then query a list of factors
    const factors = await this.carbonEmissionFactorsService.findSetByNames({
      names: ingredientNames,
    });
    if (!factors) {
      // Make sure that we remove all contributions for the product
      // before returning null
      await this.carbonFootprintRepository.deleteContributions(ingredientIds);
      return null;
    }
    // Let's rearrange the list of factors into a map
    const factorsMap = Object.fromEntries(factors.map((f) => [f.name, f]));
    const emissionsPerUnit = Object.fromEntries(
      factors.map((f) => [f.name, f.emissionCO2eInKgPerUnit]),
    );
    const scores = this.computeScore(entity.ingredients, emissionsPerUnit);
    // Let's rearrange the list of ingredients into a map
    const quantities = Object.fromEntries(
      entity.ingredients.map((c) => [c.ingredient.name, c]),
    );
    if (!scores) {
      // Make sure that we remove all contributions for the product
      // before returning null
      await this.carbonFootprintRepository.deleteContributions(ingredientIds);
      return null;
    }
    // Finally let's build the array of contributions
    const contributions = Object.entries(scores).map(([ingredient, score]) => {
      const quantity = quantities[ingredient];
      const factor = factorsMap[ingredient];
      const contribution = new CarbonFootprintContribution();
      contribution.score = score;
      contribution.quantity = quantity;
      contribution.factor = factor;
      contribution.factor_id = factor.id;
      contribution.quantity_id = quantity.id;
      return contribution;
    });
    // Save contributions in database
    this.carbonFootprintRepository.saveContributions(contributions);
    return contributions;
  }
}
