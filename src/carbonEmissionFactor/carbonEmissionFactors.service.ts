import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CarbonEmissionFactor } from "./carbonEmissionFactor.entity";
import { ICarbonEmissionFactorService } from "./interface/carbonEmissionFactors.service";

@Injectable()
export class CarbonEmissionFactorsService
  implements ICarbonEmissionFactorService
{
  constructor(
    @InjectRepository(CarbonEmissionFactor)
    private carbonEmissionFactorRepository: Repository<CarbonEmissionFactor>,
  ) {}

  find(query: { name: string }): Promise<CarbonEmissionFactor | null> {
    return this.carbonEmissionFactorRepository.findOne({
      where: { name: query.name },
    });
  }

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

  findAll(): Promise<CarbonEmissionFactor[]> {
    return this.carbonEmissionFactorRepository.find();
  }

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

  async saveBulk(
    carbonEmissionFactor: CarbonEmissionFactor[],
  ): Promise<CarbonEmissionFactor[]> {
    const result =
      this.carbonEmissionFactorRepository.save(carbonEmissionFactor);
    if (!result) {
      throw new Error("CarbonEmissionFactor not created");
    }
    return result;
  }

  async delete(query: { name: string }): Promise<boolean> {
    const result = await this.carbonEmissionFactorRepository.delete({
      name: query.name,
    });
    // Postgres supports this
    const affectedRows = result.affected as number;
    return affectedRows > 0;
  }
}
