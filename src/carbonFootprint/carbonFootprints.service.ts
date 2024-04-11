import { Inject, Injectable } from "@nestjs/common";
import { CarbonEmissionFactorsService } from "../carbonEmissionFactor/carbonEmissionFactors.service";
import { ICarbonEmissionFactorService } from "../carbonEmissionFactor/interface/carbonEmissionFactors.service";
import { FoodProduct } from "../foodProduct/foodProduct.entity";
import { FoodProductsService } from "../foodProduct/foodProducts.service";
import { IFoodProductsService } from "../foodProduct/interface/foodProducts.service";
import { CarbonFootprintContribution } from "./carbonFootprintContribution.entity";
import { CarbonFootprintRepository } from "./carbonFootprints.repository";
import { computeFootprintForProductAndFactors } from "./carbonFootprints.score";
import { ICarbonFootprintRepository } from "./interface/carbonFootprints.repository";
import { ICarbonFootprintService } from "./interface/carbonFootprints.service";

/**
 * A service to compute the carbon footprint of a product
 *
 * This service is responsible for computing the carbon footprint of a product
 * given the quantities of ingredients and their emission factors, and saving
 * the contributions to the database.
 */
@Injectable()
export class CarbonFootprintService implements ICarbonFootprintService {
  constructor(
    @Inject(FoodProductsService)
    private foodProductsService: IFoodProductsService,
    @Inject(CarbonEmissionFactorsService)
    private carbonEmissionFactorsService: ICarbonEmissionFactorService,
    @Inject(CarbonFootprintRepository)
    private carbonFootprintRepository: ICarbonFootprintRepository,
  ) {}

  /**
   * Update the carbon footprint of a product
   *
   * This method will update the carbon footprint of a product by recomputing the
   * contributions of the product to the carbon footprint based on the quantities
   * of ingredients and their emission factors.
   *
   * @param product The name of the product to update the footprint for
   * @returns The contributions of the product to the carbon footprint if found, null otherwise
   */
  async updateFootprintForProduct(
    product: string,
  ): Promise<CarbonFootprintContribution[] | null> {
    // Let's start by finding the product
    const entity = await this.foodProductsService.find({ name: product });
    // If the product does not exist, we return null
    if (!entity) return null;
    // We need the list of ingredients
    const ingredients = entity.ingredients.map((c) => c.ingredient.name);
    // And then query a list of factors. If any factor is missing, factors will be null
    const factors =
      await this.carbonEmissionFactorsService.findAllByNamesOrNothing({
        names: ingredients,
      });
    // If factors are missing, we clear the contributions and return null
    if (!factors) return this.clearContributionsForProduct(entity);
    // Let's build the array of contributions
    const contributions = computeFootprintForProductAndFactors(entity, factors);
    // If contributions are missing, we clear the contributions and return null
    if (!contributions) return this.clearContributionsForProduct(entity);
    // Otherwise, we save the contributions
    return await this.carbonFootprintRepository.saveContributions(
      contributions,
    );
  }

  /**
   * Get the carbon footprint of a product
   *
   * @param product The name of the product to get the footprint for
   * @returns The contributions of the product to the carbon footprint if found, null otherwise
   */
  async getFootprintForProduct(
    product: string,
  ): Promise<CarbonFootprintContribution[] | null> {
    const contributions =
      await this.carbonFootprintRepository.findContributions(product);
    if (contributions.length === 0) {
      return null;
    }
    return contributions;
  }

  /**
   * Clear the contributions for a product. This is a private method used by the service itself.
   *
   * @param product The product to clear the contributions for
   * @returns A promise that resolves to null (useful to return early in async functions)
   */
  private async clearContributionsForProduct(
    product: FoodProduct,
  ): Promise<null> {
    await this.carbonFootprintRepository.deleteContributions(product.name);
    return null;
  }
}
