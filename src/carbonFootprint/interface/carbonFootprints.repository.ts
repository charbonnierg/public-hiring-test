import { CarbonFootprintContribution } from "../carbonFootprintContribution.entity";

export interface ICarbonFootprintRepository {
  findContributions: (
    product: string,
  ) => Promise<CarbonFootprintContribution[]>;

  saveContributions: (
    contributions: CarbonFootprintContribution[],
  ) => Promise<CarbonFootprintContribution[]>;

  deleteContributions: (product: string) => Promise<number>;
}
