import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { FoodProductsService } from "../foodProduct/foodProducts.service";
import { IFoodProductsService } from "../foodProduct/interface/foodProducts.service";
import { CarbonFootprintContribution } from "./carbonFootprintContribution.entity";
import { CarbonFootprintService } from "./carbonFootprints.service";
import { ICarbonFootprintService } from "./interface/carbonFootprints.service";
import { IPendingCarbonFootprintService } from "./interface/pendingCarbonFootprint.service";
import { PendingCarbonFootprint } from "./pendingCarbonFootprint.entity";

@Injectable()
export class PendingCarbonFootprintService
  implements IPendingCarbonFootprintService
{
  constructor(
    @InjectRepository(PendingCarbonFootprint)
    private pendingFootprintScoreRepository: Repository<PendingCarbonFootprint>,
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
    const pendings = await this.getPending();
    const updated = {} as Record<string, CarbonFootprintContribution[] | null>;
    for (const pending of pendings) {
      if (pending.factor_id != null) {
        // If it's a factor, we need to find all products that use it
        const products = await this.foodProductsService.findAllByIngredient(
          pending.factor,
        );
        // And save them
        for (const product of products) {
          const contributions = await this.carbonFootprintService.save(
            product.name,
          );
          updated[product.name] = contributions;
          await this.resolvePending([pending]);
        }
      } else {
        // If it's a product, we need to save it
        const contributions = await this.carbonFootprintService.save(
          pending.product.name,
        );
        updated[pending.product.name] = contributions;
        await this.resolvePending([pending]);
      }
    }
    return updated;
  }

  private async getPending(): Promise<PendingCarbonFootprint[]> {
    const result = await this.pendingFootprintScoreRepository.query(
      `WITH ids AS MATERIALIZED (
        SELECT id FROM pending_carbon_footprint
        WHERE status = $1
        ORDER BY last_update
        /* Process pending entries by batch */
        LIMIT 100
        FOR UPDATE SKIP LOCKED
    )
    UPDATE pending_carbon_footprint
    SET status = $2
    WHERE id = ANY(SELECT id FROM ids)
    RETURNING id;
  `,
      ["pending", "processing"],
    );
    const [idsMap, size] = result as [{ id: number }[], number];
    if (size === 0) {
      return [];
    }
    const ids = idsMap.map((i) => i.id);
    return this.pendingFootprintScoreRepository.find({
      where: { id: In(ids) },
      relations: {
        product: {
          ingredients: {
            ingredient: true,
          },
        },
        factor: true,
      },
    });
  }

  private async resolvePending(
    pending: PendingCarbonFootprint[],
  ): Promise<void> {
    await this.pendingFootprintScoreRepository.delete({
      id: In(pending.map((p) => p.id)),
    });
  }

  /**
   * Get the deadlocked pending footprint scores.
   *
   * This is not used at the moment, but we should periodically
   * check for deadlocked pending footprint scores and mark them
   * as failed.
   * We also need to decide what to do with them: retry, ignore, etc.
   */
  // private async getDeadlocked(): Promise<PendingFootprintScore[]> {
  //   const result = await this.pendingFootprintScoreRepository.query(
  //     `WITH ids AS MATERIALIZED (
  //       SELECT id FROM pending_carbon_footprint
  //       WHERE status = $1 AND last_update < NOW() - INTERVAL '$2'
  //       ORDER BY last_update
  //       /* Process pending entries by batch */
  //       LIMIT 100
  //       FOR UPDATE SKIP LOCKED
  //   )
  //   UPDATE pending_carbon_footprint
  //   SET status = $3
  //   WHERE id = ANY(SELECT id FROM ids)
  //   RETURNING id;
  // `,
  //     ["pending", "1 minute", "failed"]
  //   );
  //   const [idsMap, size] = result as [{ id: number }[], number];
  //   if (size === 0) {
  //     return [];
  //   }
  //   const ids = idsMap.map((i) => i.id);
  //   return this.pendingFootprintScoreRepository.find({
  //     where: { id: In(ids) },
  //     relations: {
  //       product: {
  //         ingredients: {
  //           ingredient: true,
  //         },
  //       },
  //       factor: true,
  //     },
  //   });
  // }
}
