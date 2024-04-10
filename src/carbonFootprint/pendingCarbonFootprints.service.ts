import { Inject, Injectable } from "@nestjs/common";
import { FoodProductsService } from "../foodProduct/foodProducts.service";
import { IFoodProductsService } from "../foodProduct/interface/foodProducts.service";
import { CarbonFootprintContribution } from "./carbonFootprintContribution.entity";
import { CarbonFootprintService } from "./carbonFootprints.service";
import { ICarbonFootprintService } from "./interface/carbonFootprints.service";
import { IPendingCarbonFootprintService } from "./interface/pendingCarbonFootprint.service";
import { IPendingCarbonFootprintRepository } from "./interface/pendingCarbonFootprints.repository";
import { PendingCarbonFootprintRepository } from "./pendingCarbonFootprints.repository";

@Injectable()
export class PendingCarbonFootprintService
  implements IPendingCarbonFootprintService
{
  constructor(
    @Inject(PendingCarbonFootprintRepository)
    private pendingCarbonFootprintRepository: IPendingCarbonFootprintRepository,
    @Inject(FoodProductsService)
    private foodProductsService: IFoodProductsService,
    @Inject(CarbonFootprintService)
    private carbonFootprintService: ICarbonFootprintService,
  ) {}

  async processPending(): Promise<
    Record<string, CarbonFootprintContribution[] | null>
  > {
    // FIXME: This is inefficient, we should process the whole batch
    // and update the whole batch rather than performing UPDATE/DELETE one at a time
    const pendings =
      await this.pendingCarbonFootprintRepository.findPendingCarbonFootprints(
        100,
      );
    const updated = {} as Record<string, CarbonFootprintContribution[] | null>;
    for (const pending of pendings) {
      if (pending.factor_id != null) {
        // If it's a factor, we need to find all products that use it
        const products = await this.foodProductsService.findAllByIngredient(
          pending.factor,
        );
        // And save them
        for (const product of products) {
          const contributions =
            await this.carbonFootprintService.updateFootprintForProduct(
              product.name,
            );
          updated[product.name] = contributions;
          await this.pendingCarbonFootprintRepository.deletePendingCarbonFootprints(
            [pending.id],
          );
        }
      } else {
        // If it's a product, we need to save it
        const contributions =
          await this.carbonFootprintService.updateFootprintForProduct(
            pending.product.name,
          );
        updated[pending.product.name] = contributions;
        await this.pendingCarbonFootprintRepository.deletePendingCarbonFootprints(
          [pending.id],
        );
      }
    }
    return updated;
  }
}
