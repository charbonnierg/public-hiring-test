import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CarbonEmissionFactorsService } from "../carbonEmissionFactor/carbonEmissionFactors.service";
import { ICarbonEmissionFactorService } from "../carbonEmissionFactor/interface/carbonEmissionFactors.service";
import { IngredientQuantity } from "../foodProduct/foodProduct.entity";
import { FoodProductsService } from "../foodProduct/foodProducts.service";
import { IFoodProductsService } from "../foodProduct/interface/foodProducts.service";
import {
  FootprintScoreContribution,
  PendingFootprintScore,
} from "./footprintScore.entity";
import { IFootprintScoreService } from "./interface/fooprintScore.service";

@Injectable()
export class FootprintScoreService implements IFootprintScoreService {
  constructor(
    @InjectRepository(FootprintScoreContribution)
    private footprintScoreRepository: Repository<FootprintScoreContribution>,
    @InjectRepository(PendingFootprintScore)
    private pendingFootprintScoreRepository: Repository<PendingFootprintScore>,
    @Inject(FoodProductsService)
    private foodProductsService: IFoodProductsService,
    @Inject(CarbonEmissionFactorsService)
    private carbonEmissionFactorsService: ICarbonEmissionFactorService,
  ) {}
  async get(product: string): Promise<FootprintScoreContribution[] | null> {
    // Let's do this in two steps for now, we can always join the tables
    // later if we need to.
    const entity = await this.foodProductsService.find({ name: product });
    if (!entity) {
      return null;
    }
    // FIXME: No need to query ingredients a second time, we already have them
    // in memory
    const contributions = await this.footprintScoreRepository.find({
      where: { quantity_id: In(entity.composition.map((i) => i.id)) },
      relations: {
        quantity: {
          ingredient: true,
        },
      },
    });
    // Check to be sure
    if (!contributions) {
      return null;
    }
    if (contributions.length !== entity.composition.length) {
      // This should never happen, but let's be safe
      return null;
    }
    return contributions;
  }

  computeScore(
    composition: IngredientQuantity[],
    factors: Record<string, number | undefined>,
  ): Record<string, number> | null {
    const scores = {} as Record<string, number>;
    for (const item of composition) {
      const factor = factors[item.ingredient.name];
      if (!factor) {
        return null;
      }
      const emissionCO2eInKg = item.quantity * factor;
      scores[item.ingredient.name] = emissionCO2eInKg;
    }
    return scores;
  }
  async save(product: string): Promise<FootprintScoreContribution[] | null> {
    // Let's start by finding the product
    const entity = await this.foodProductsService.find({ name: product });
    if (!entity) {
      return null;
    }
    // We can then get a list of ingredient names
    const ingredientNames = entity.composition.map((c) => c.ingredient.name);
    // And then query a list of factors
    const factors = await this.carbonEmissionFactorsService.findList({
      names: ingredientNames,
    });
    if (!factors) {
      // Make sure that we remove all contributions for the product
      // before returning null
      await this.footprintScoreRepository.delete({
        quantity_id: In(entity.composition.map((i) => i.id)),
      });
      return null;
    }
    // Let's rearrange the list of factors into a map
    const factorsMap = Object.fromEntries(factors.map((f) => [f.name, f]));
    const emissionsPerUnit = Object.fromEntries(
      factors.map((f) => [f.name, f.emissionCO2eInKgPerUnit]),
    );
    const scores = this.computeScore(entity.composition, emissionsPerUnit);
    // Let's rearrange the list of ingredients into a map
    const quantities = Object.fromEntries(
      entity.composition.map((c) => [c.ingredient.name, c]),
    );
    if (!scores) {
      // Make sure that we remove all contributions for the product
      // before returning null
      await this.footprintScoreRepository.delete({
        quantity_id: In(entity.composition.map((i) => i.id)),
      });
      return null;
    }
    // Finally let's build the array of contributions
    const contributions = Object.entries(scores).map(([ingredient, score]) => {
      const quantity = quantities[ingredient];
      const factor = factorsMap[ingredient];
      const contribution = new FootprintScoreContribution();
      contribution.score = score;
      contribution.quantity = quantity;
      contribution.factor = factor;
      contribution.factor_id = factor.id;
      contribution.quantity_id = quantity.id;
      return contribution;
    });
    // Save contributions in database
    this.footprintScoreRepository.save(contributions);
    return contributions;
  }

  async processPending(): Promise<
    Record<string, FootprintScoreContribution[] | null>
  > {
    // FIXME: This is inefficient, we should process the whole batch
    // and update the whole batch rather than performing UPDATE/DELETE one at a time
    const pendings = await this.getPending();
    const updated = {} as Record<string, FootprintScoreContribution[] | null>;
    for (const pending of pendings) {
      if (pending.factor_id != null) {
        // If it's a factor, we need to find all products that use it
        const products = await this.foodProductsService.findAllByIngredient(
          pending.factor,
        );
        // And save them
        for (const product of products) {
          const contributions = await this.save(product.name);
          updated[product.name] = contributions;
          await this.resolvePending([pending]);
        }
      } else {
        // If it's a product, we need to save it
        const contributions = await this.save(pending.product.name);
        updated[pending.product.name] = contributions;
        await this.resolvePending([pending]);
      }
    }
    return updated;
  }

  private async getPending(): Promise<PendingFootprintScore[]> {
    // INVESTIGATE: This can be done using TypeORM query builder
    // const last_update = new Date();
    // const qb =
    //   this.pendingFootprintScoreRepository.createQueryBuilder("pending");
    // const query = qb
    //   .subQuery()
    //   .setLock("pessimistic_write")
    //   .setOnLocked("skip_locked")
    //   .where("status = :status", { status: "pending" })
    //   .orderBy("last_update", "ASC")
    //   .take(100);

    // const result = await qb
    //   .update()
    //   .where("id IN (" + query.getQuery() + ")")
    //   .set({ status: "processing", last_update })
    //   .returning("id")
    //   .execute();
    const result = await this.pendingFootprintScoreRepository.query(
      `WITH ids AS MATERIALIZED (
        SELECT id FROM pending_footprint_score
        WHERE status = $1
        ORDER BY last_update
        /* Process pending entries by batch */
        LIMIT 100
        FOR UPDATE SKIP LOCKED
    )
    UPDATE pending_footprint_score
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
          composition: {
            ingredient: true,
          },
        },
        factor: true,
      },
    });
  }

  private async resolvePending(
    pending: PendingFootprintScore[],
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
  //       SELECT id FROM pending_footprint_score
  //       WHERE status = $1 AND last_update < NOW() - INTERVAL '$2'
  //       ORDER BY last_update
  //       /* Process pending entries by batch */
  //       LIMIT 100
  //       FOR UPDATE SKIP LOCKED
  //   )
  //   UPDATE pending_footprint_score
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
  //         composition: {
  //           ingredient: true,
  //         },
  //       },
  //       factor: true,
  //     },
  //   });
  // }
}
