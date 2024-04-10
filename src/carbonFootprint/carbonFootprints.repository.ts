import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CarbonFootprintContribution } from "./carbonFootprintContribution.entity";
import { ICarbonFootprintRepository } from "./interface/carbonFootprints.repository";

export class CarbonFootprintRepository implements ICarbonFootprintRepository {
  constructor(
    @InjectRepository(CarbonFootprintContribution)
    private footprintScoreRepository: Repository<CarbonFootprintContribution>,
  ) {}

  async findContributions(product: string) {
    return await this.footprintScoreRepository.find({
      where: {
        quantity: {
          product: {
            name: product,
          },
        },
      },
      relations: {
        quantity: {
          ingredient: true,
        },
      },
    });
  }

  async deleteContributions(product: string) {
    // FIXME: This is not optimized at all
    const existing = await this.footprintScoreRepository.find({
      where: {
        quantity: {
          product: {
            name: product,
          },
        },
      },
      relations: ["quantity", "quantity.product"],
    });
    const result = await this.footprintScoreRepository.delete({
      quantity_id: In(existing.map((r) => r.quantity_id)),
    });
    // postgres supports this
    return result.affected as number;
  }

  async saveContributions(contributions: CarbonFootprintContribution[]) {
    return this.footprintScoreRepository.save(contributions);
  }
}

export class InMemoryCarbonFootprintRepository
  implements ICarbonFootprintRepository
{
  private contributions: CarbonFootprintContribution[] = [];

  async findContributions(product: string) {
    return this.contributions.filter(
      (c) => c.quantity.product.name === product,
    );
  }

  async deleteContributions(product: string) {
    let deleted = 0;
    this.contributions = this.contributions.filter((c) => {
      if (c.quantity.product.name === product) {
        deleted += 1;
        return false;
      }
      return true;
    });
    return deleted;
  }

  async saveContributions(contributions: CarbonFootprintContribution[]) {
    this.contributions = this.contributions.concat(contributions);
    return contributions;
  }
}
