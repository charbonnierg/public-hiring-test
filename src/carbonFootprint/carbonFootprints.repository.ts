import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CarbonFootprintContribution } from "./carbonFootprintContribution.entity";
import { ICarbonFootprintRepository } from "./interface/carbonFootprints.repository";

export class CarbonFootprintRepository implements ICarbonFootprintRepository {
  constructor(
    @InjectRepository(CarbonFootprintContribution)
    private footprintScoreRepository: Repository<CarbonFootprintContribution>,
  ) {}

  async findContributions(foodIngredientQuantityIds: number[]) {
    return await this.footprintScoreRepository.find({
      where: { quantity_id: In(foodIngredientQuantityIds) },
      relations: {
        quantity: {
          ingredient: true,
        },
      },
    });
  }

  async deleteContributions(foodIngredientQuantityIds: number[]) {
    await this.footprintScoreRepository.delete({
      quantity_id: In(foodIngredientQuantityIds),
    });
  }

  async saveContributions(contributions: CarbonFootprintContribution[]) {
    return this.footprintScoreRepository.save(contributions);
  }
}
