import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CarbonEmissionFactor } from "./carbonEmissionFactor.entity";
import { ICarbonEmissionFactorsRepository } from "./interface/carbonEmissionFactors.repository";

/**
 * A thin wrapper around the TypeORM repository for carbon emission factors.
 *
 * This class implements the CarbonEmissionFactorsRepository interface.
 */
export class CarbonEmissionFactorsRepository
  implements ICarbonEmissionFactorsRepository
{
  constructor(
    @InjectRepository(CarbonEmissionFactor)
    private typeormRepository: Repository<CarbonEmissionFactor>,
  ) {}

  /**
   * Find a carbon emission factor by name.
   *
   * @param name The name of the carbon emission factor to find.
   * @returns The carbon emission factor if found, null otherwise.
   */
  findOne(name: string) {
    return this.typeormRepository.findOne({ where: { name } });
  }
  /**
   * Find many carbon emission factors, optionally filtering by name.
   *
   * @param names The names of the carbon emission factors to find. May be empty to find all.
   * @returns The list of all carbon emission factors (possibly empty if none are found)
   */
  find(names?: string[] | undefined) {
    if (!names) {
      return this.typeormRepository.find();
    }
    return this.typeormRepository.find({
      where: { name: In(names) },
    });
  }
  /**
   * Save a carbon emission factor.
   * @param factor The carbon emission factor to save.
   * @returns The saved carbon emission factor.
   */
  saveOne(factor: CarbonEmissionFactor) {
    return this.typeormRepository.save(factor);
  }
  /**
   * Save many carbon emission factors.
   * @param factors The carbon emission factors to save.
   * @returns The saved carbon emission factors.
   */
  saveMany(factors: CarbonEmissionFactor[]) {
    return this.typeormRepository.save(factors);
  }
  /**
   * Delete a single carbon emission factor.
   * @param name The name of the carbon emission factor to delete.
   * @returns True if the factor was deleted, false otherwise.
   */
  async deleteOne(name: string) {
    const result = await this.typeormRepository.delete({ name });
    // Postgres supports this
    const affectedRows = result.affected as number;
    return affectedRows > 0;
  }

  /**
   * Get all indices on the underlying table.
   * Mainly used for testing.
   * @returns The list of indices on the table.
   */
  async indices() {
    return this.typeormRepository.metadata.indices.map((i) => ({
      columns: i.columns.map((c) => c.databaseNameWithoutPrefixes),
      unique: i.isUnique,
    }));
  }
}

/**
 * An in-memory repository for carbon emission factors.
 *
 * This class implements the CarbonEmissionFactorsRepository interface.
 *
 * @note: This class is reserved for testing purposes.
 */
export class InMemoryCarbonEmissionFactorsRepository
  implements ICarbonEmissionFactorsRepository
{
  private factors: CarbonEmissionFactor[] = [];

  /**
   * Find a carbon emission factor by name.
   * @param name The name of the carbon emission factor to find.
   * @returns The carbon emission factor if found, null otherwise.
   */
  async findOne(name: string) {
    return this.factors.find((factor) => factor.name === name) ?? null;
  }

  /**
   * Find many carbon emission factors, optionally filtering by name.
   * @param names The names of the carbon emission factors to find. May be empty to find all.
   * @returns The list of all carbon emission factors (possibly empty if none are found)
   */
  async find(names?: string[]) {
    if (!names) {
      return this.factors;
    }
    return this.factors.filter((factor) => names.includes(factor.name));
  }

  /**
   * Save a carbon emission factor.
   * @param factor The carbon emission factor to save.
   * @returns The saved carbon emission factor.
   */
  async saveOne(factor: CarbonEmissionFactor) {
    const existing = this.factors.find(
      (existingFactor) => existingFactor.name === factor.name,
    );
    if (existing != null) {
      throw new Error(`Factor with name ${factor.name} already exists`);
    }
    this.factors.push(factor);
    return factor;
  }

  /**
   * Save many carbon emission factors.
   * @param factors The carbon emission factors to save.
   * @returns The saved carbon emission factors.
   */
  async saveMany(factors: CarbonEmissionFactor[]) {
    const counts = factors.reduce(
      (acc, factor) => {
        acc[factor.name] = (acc[factor.name] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
    Object.entries(counts).forEach(([name, count]) => {
      if (count > 1) {
        throw new Error(`Duplicate factor name: ${name}`);
      }
    });
    this.factors.push(...factors);
    return factors;
  }

  /**
   * Delete a single carbon emission factor.
   * @param name The name of the carbon emission factor to delete.
   * @returns True if the factor was deleted, false otherwise.
   */
  async deleteOne(name: string) {
    const initialLength = this.factors.length;
    this.factors = this.factors.filter((factor) => factor.name !== name);
    return this.factors.length < initialLength;
  }

  /**
   * Get all indices on the underlying table.
   * @returns The list of indices on the table.
   */
  async indices() {
    // fake value
    return [{ columns: ["name"], unique: true }];
  }
}
