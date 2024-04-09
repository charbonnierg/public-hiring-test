import { CarbonEmissionFactor } from "../carbonEmissionFactor.entity";
import { ReadCarbonEmissionFactorDto } from "./read-carbonEmissionFactor.dto";

describe("ReadCarbonEmissionFactorDto", () => {
  describe("fromEntity", () => {
    it("should create a new carbon emission factor read dto", async () => {
      const entity = new CarbonEmissionFactor();
      entity.name = "Test Carbon Emission Factor";
      entity.unit = "kg";
      entity.emissionCO2eInKgPerUnit = 12;
      entity.source = "Test Source";
      entity.id = 12;
      const dto = ReadCarbonEmissionFactorDto.fromEntity(entity);
      expect(dto).toEqual({
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      });
    });
  });
});
