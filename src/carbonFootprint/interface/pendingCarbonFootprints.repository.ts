import { PendingCarbonFootprint } from "../pendingCarbonFootprint.entity";

export interface IPendingCarbonFootprintRepository {
  findPendingCarbonFootprints: (
    limit: number,
  ) => Promise<PendingCarbonFootprint[]>;

  deletePendingCarbonFootprints: (
    foodIngredientQuantityIds: number[],
  ) => Promise<void>;
}

export interface IPendingCarbonFootprintsRepositoryForTesting {
  savePendingCarbonFootprints: (
    pendingCarbonFootprints: PendingCarbonFootprint[],
  ) => Promise<void>;
}
