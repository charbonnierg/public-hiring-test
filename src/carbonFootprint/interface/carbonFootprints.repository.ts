import { CarbonFootprintContribution } from "../carbonFootprintContribution.entity";

export interface ICarbonFootprintRepository {
  findContributions: (
    foodIngredientQuantityIds: number[],
  ) => Promise<CarbonFootprintContribution[]>;

  saveContributions: (
    contributions: CarbonFootprintContribution[],
  ) => Promise<CarbonFootprintContribution[]>;

  deleteContributions: (foodIngredientQuantityIds: number[]) => Promise<void>;
}
