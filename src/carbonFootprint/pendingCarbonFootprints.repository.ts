import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import {
  IPendingCarbonFootprintRepository,
  IPendingCarbonFootprintsRepositoryForTesting,
} from "./interface/pendingCarbonFootprints.repository";
import { PendingCarbonFootprint } from "./pendingCarbonFootprint.entity";

export class PendingCarbonFootprintRepository
  implements
    IPendingCarbonFootprintRepository,
    IPendingCarbonFootprintsRepositoryForTesting
{
  constructor(
    @InjectRepository(PendingCarbonFootprint)
    private pendingFootprintScoreRepository: Repository<PendingCarbonFootprint>,
  ) {}

  async savePendingCarbonFootprints(
    pendingCarbonFootprints: PendingCarbonFootprint[],
  ) {
    await this.pendingFootprintScoreRepository.save(pendingCarbonFootprints);
  }

  async findPendingCarbonFootprints(limit: number) {
    const result = await this.pendingFootprintScoreRepository.query(
      `WITH ids AS MATERIALIZED (
          SELECT id FROM pending_carbon_footprint
          WHERE status = $2
          ORDER BY last_update
          /* Process pending entries by batch */
          LIMIT $1
          FOR UPDATE SKIP LOCKED
      )
      UPDATE pending_carbon_footprint
      SET status = $3
      WHERE id = ANY(SELECT id FROM ids)
      RETURNING id;
    `,
      [limit, "pending", "processing"],
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
  async deletePendingCarbonFootprints(foodIngredientQuantityIds: number[]) {
    this.pendingFootprintScoreRepository.delete({
      id: In(foodIngredientQuantityIds),
    });
  }
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
