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
   */
  saveOne(factor: CarbonEmissionFactor) {
    return this.typeormRepository.save(factor);
  }
  /**
   * Save many carbon emission factors.
   */
  saveMany(factors: CarbonEmissionFactor[]) {
    return this.typeormRepository.save(factors);
  }
  /**
   * Delete a single carbon emission factor.
   */
  async deleteOne(name: string) {
    const result = await this.typeormRepository.delete({ name });
    // Postgres supports this
    const affectedRows = result.affected as number;
    return affectedRows > 0;
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

  async findOne(name: string) {
    return this.factors.find((factor) => factor.name === name) ?? null;
  }

  async find(names?: string[]) {
    if (!names) {
      return this.factors;
    }
    return this.factors.filter((factor) => names.includes(factor.name));
  }

  async saveOne(factor: CarbonEmissionFactor) {
    this.factors = this.factors.filter(
      (existingFactor) => existingFactor.name !== factor.name,
    );
    this.factors.push(factor);
    return factor;
  }

  async saveMany(factors: CarbonEmissionFactor[]) {
    factors.forEach((factor) => {
      this.factors = this.factors.filter(
        (existingFactor) => existingFactor.name !== factor.name,
      );
      this.factors.push(factor);
    });
    return factors;
  }

  async deleteOne(name: string) {
    const initialLength = this.factors.length;
    this.factors = this.factors.filter((factor) => factor.name !== name);
    return this.factors.length < initialLength;
  }
}
