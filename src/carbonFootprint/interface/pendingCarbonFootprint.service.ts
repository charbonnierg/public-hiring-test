import { CarbonFootprintContribution } from "../carbonFootprintContribution.entity";

export interface IPendingCarbonFootprintService {
  processPending(): Promise<
    Record<string, CarbonFootprintContribution[] | null>
  >;
}
