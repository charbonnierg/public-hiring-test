import { CarbonEmissionFactor } from "../carbonEmissionFactor.entity";

export interface Indice {
  columns: string[];
  unique: boolean;
}

/**
 * Repository for managing carbon emission factors.
 */
export interface ICarbonEmissionFactorsRepository {
  /**
   * Find a carbon emission factor by name.
   *
   * @param name The name of the carbon emission factor to find.
   * @returns The carbon emission factor if found, null otherwise.
   */
  findOne: (name: string) => Promise<CarbonEmissionFactor | null>;
  /**
   * Find many carbon emission factors, optionally filtering by name.
   *
   * @param names The names of the carbon emission factors to find. May be empty to find all.
   * @returns The list of all carbon emission factors (possibly empty if none are found)
   */
  find: (names?: string[]) => Promise<CarbonEmissionFactor[]>;
  /**
   * Save a carbon emission factor.
   */
  saveOne: (factor: CarbonEmissionFactor) => Promise<CarbonEmissionFactor>;
  /**
   * Save many carbon emission factors.
   */
  saveMany: (
    factors: CarbonEmissionFactor[],
  ) => Promise<CarbonEmissionFactor[]>;
  /**
   * Delete a single carbon emission factor.
   */
  deleteOne: (name: string) => Promise<boolean>;
  /**
   * Get all indices on the underlying table.
   * Mainly used for testing.
   */
  indices: () => Promise<Indice[]>;
}
