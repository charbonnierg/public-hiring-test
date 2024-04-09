import { CarbonEmissionFactor } from "../carbonEmissionFactor.entity";

/**
 * Interface that must be implemented by the CarbonEmissionFactorService.
 */
export interface ICarbonEmissionFactorService {
  /**
   * Create or update a carbon emission factor.
   *
   * @param carbonEmissionFactor The factor to save
   */
  save(
    carbonEmissionFactor: CarbonEmissionFactor,
  ): Promise<CarbonEmissionFactor>;

  /**
   * Create or update multiple carbon emission factors.
   *
   * @param carbonEmissionFactors The factors to save
   */
  saveBulk(
    carbonEmissionFactors: CarbonEmissionFactor[],
  ): Promise<CarbonEmissionFactor[]>;

  /**
   * Delete a carbon emission factor by its name.
   *
   * @param query An object with a property `name` to search for
   */
  deleteByName(query: { name: string }): Promise<boolean>;

  /**
   * Find a carbon emission factor by its name.
   *
   * @param query An object with a property `name` to search for
   */
  findByName(query: { name: string }): Promise<CarbonEmissionFactor | null>;

  /**
   * Find a list of carbon emission factors by their names.
   *
   * The function only returns when all factors are found.
   * If any of the names are not found, the function will return null.
   *
   * @param query An object with a property `names` to search for
   */
  findListByNames(query: {
    names: string[];
  }): Promise<CarbonEmissionFactor[] | null>;

  /**
   * Find all carbon emission factors.
   *
   */
  findAll(): Promise<CarbonEmissionFactor[]>;
}
