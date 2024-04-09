import { dataSource } from "../config/dataSource";
import { CarbonEmissionFactor } from "./carbonEmissionFactor/carbonEmissionFactor.entity";
import { TEST_CARBON_EMISSION_FACTORS } from "./seed-dev-data";

export const seedTestCarbonEmissionFactors = async () => {
  if (!dataSource.isInitialized) {
    await dataSource.initialize();
  }
  const factorsRepository = dataSource.getRepository(CarbonEmissionFactor);

  await factorsRepository.save(TEST_CARBON_EMISSION_FACTORS);
};

if (require.main === module) {
  seedTestCarbonEmissionFactors().catch((e) => console.error(e));
}
