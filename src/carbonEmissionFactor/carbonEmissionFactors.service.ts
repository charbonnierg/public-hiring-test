import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CarbonEmissionFactor } from "./carbonEmissionFactor.entity";
import { ICarbonEmissionFactorService } from "./interface/carbonEmissionFactors.service";

/**
 * Service for managing carbon emission factors.
 */
@Injectable()
export class CarbonEmissionFactorsService
  implements ICarbonEmissionFactorService
{
  constructor(
    @InjectRepository(CarbonEmissionFactor)
    private carbonEmissionFactorRepository: Repository<CarbonEmissionFactor>,
  ) {}

  /**
   * Find a carbon emission factor by name.
   *
   * @param query An object with a field `name` to search for.
   * @returns The carbon emission factor if found, null otherwise.
   */
  find(query: { name: string }): Promise<CarbonEmissionFactor | null> {
    return this.carbonEmissionFactorRepository.findOne({
      where: { name: query.name },
    });
  }

  /**
   * Find a list of carbon emission factors by name.
   *
   * @param query An object with a field `names` to search for.
   * @returns The carbon emission factors if all factors are found, null otherwise.
   */
  async findList(query: {
    names: string[];
  }): Promise<CarbonEmissionFactor[] | null> {
    const factors = await this.carbonEmissionFactorRepository.findBy({
      name: In(query.names),
    });
    if (factors.length !== query.names.length) {
      return null;
    }
    return factors;
  }

  /**
   * Find all carbon emission factors.
   *
   * @returns All carbon emission factors.
   */
  findAll(): Promise<CarbonEmissionFactor[]> {
    return this.carbonEmissionFactorRepository.find();
  }

  /**
   * Create a carbon emission factor.
   *
   * @param carbonEmissionFactor The carbon emission factor to create.
   * @returns The created carbon emission factor.
   */
  async save(
    carbonEmissionFactor: CarbonEmissionFactor,
  ): Promise<CarbonEmissionFactor> {
    const result =
      this.carbonEmissionFactorRepository.save(carbonEmissionFactor);
    if (!result) {
      throw new Error("CarbonEmissionFactor not created");
    }
    return result;
  }

  /**
   * Create multiple carbon emission factors at once.
   *
   * @param carbonEmissionFactors The carbon emission factors to create.
   * @returns A list of the created carbon emission factors.
   */
  async saveBulk(
    carbonEmissionFactors: CarbonEmissionFactor[],
  ): Promise<CarbonEmissionFactor[]> {
    const result = this.carbonEmissionFactorRepository.save(
      carbonEmissionFactors,
    );
    if (!result) {
      throw new Error("CarbonEmissionFactor not created");
    }
    return result;
  }

  /**
   * Delete a carbon emission factor by name.
   *
   * @param query An object with a field `name` to search for.
   * @returns `true` if the carbon emission factor was deleted, `false` otherwise.
   */
  async delete(query: { name: string }): Promise<boolean> {
    const result = await this.carbonEmissionFactorRepository.delete({
      name: query.name,
    });
    // Postgres supports this
    const affectedRows = result.affected as number;
    return affectedRows > 0;
  }
}
