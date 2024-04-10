import { CarbonFootprintContribution } from "../carbonFootprintContribution.entity";

export interface ICarbonFootprintService {
  /**
   * Get the footprint score contributins for a product.
   *
   * @param product The name of the product for which to get the footprint score
   */
  getFootprintForProduct(
    product: string,
  ): Promise<CarbonFootprintContribution[] | null>;

  /**
   * Update the footprint score contributions for a product.
   *
   * It will calculate the footprint score contributions for the product
   * and either save them to the database or delete them if at least one
   * of the ingredients does not have a carbon emission factor.
   *
   * @param product The name of the product for which to update the footprint score
   */
  updateFootprintForProduct(
    product: string,
  ): Promise<CarbonFootprintContribution[] | null>;
}
