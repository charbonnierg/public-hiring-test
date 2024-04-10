import { Units } from "../../measurementSystem/unit";
import { CreateCarbonEmissionFactorDto } from "./create-carbonEmissionFactor.dto";

describe("CreateCarbonEmissionFactorDto", () => {
  describe("fromObject", () => {
    it("should create a new carbon emission factor dto", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      const dto = await CreateCarbonEmissionFactorDto.fromObject(
        carbonEmissionFactorArgs,
      );
      expect(dto).toMatchObject(carbonEmissionFactorArgs);
    });
  });
  describe("name validation", () => {
    it("should refuse to create a new carbon emission factor dto with an empty name", async () => {
      const carbonEmissionFactorArgs = {
        name: "",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      expect.assertions(1);
      await CreateCarbonEmissionFactorDto.fromObject(
        carbonEmissionFactorArgs,
      ).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              minLength: "name must be longer than or equal to 2 characters",
            },
            property: "name",
          },
        ]);
      });
    });
    it("should refuse to create a new carbon emission factor dto with a name of length 1", async () => {
      const carbonEmissionFactorArgs = {
        name: "a",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      expect.assertions(1);
      await CreateCarbonEmissionFactorDto.fromObject(
        carbonEmissionFactorArgs,
      ).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              minLength: "name must be longer than or equal to 2 characters",
            },
            property: "name",
          },
        ]);
      });
    });
    it("should allow to create a new carbon emission factor dto with a name of length 2", async () => {
      const carbonEmissionFactorArgs = {
        name: "ab",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      const dto = await CreateCarbonEmissionFactorDto.fromObject(
        carbonEmissionFactorArgs,
      );
      expect(dto).toMatchObject(carbonEmissionFactorArgs);
    });
  });
  describe("unit validation", () => {
    it.each(Units)(
      "should create a new carbon emission factor dto with unit %s",
      async (unit: string) => {
        const carbonEmissionFactorArgs = {
          name: "Test Carbon Emission Factor",
          unit,
          emissionCO2eInKgPerUnit: 12,
          source: "Test Source",
        };
        const dto = await CreateCarbonEmissionFactorDto.fromObject(
          carbonEmissionFactorArgs,
        );
        expect(dto).toMatchObject(carbonEmissionFactorArgs);
      },
    );
    it("should refuse to create a new carbon emission factor dto with an invalid unit", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "invalid",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      expect.assertions(1);
      await CreateCarbonEmissionFactorDto.fromObject(
        carbonEmissionFactorArgs,
      ).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              isIn: "unit must be one of the following values: mg, g, kg, oz, cup, ml, cl, l",
            },
            property: "unit",
          },
        ]);
      });
    });
    it("should refuse to create a new carbon emission factor dto with an empty unit", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "",
        emissionCO2eInKgPerUnit: 12,
        source: "Test Source",
      };
      expect.assertions(1);
      await CreateCarbonEmissionFactorDto.fromObject(
        carbonEmissionFactorArgs,
      ).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              isIn: "unit must be one of the following values: mg, g, kg, oz, cup, ml, cl, l",
            },
            property: "unit",
          },
        ]);
      });
    });
  });
  describe("emissionCO2eInKgPerUnit validation", () => {
    it("should refuse to create a new carbon emission factor dto with a negative emissionCO2eInKgPerUnit", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: -12,
        source: "Test Source",
      };
      expect.assertions(1);
      await CreateCarbonEmissionFactorDto.fromObject(
        carbonEmissionFactorArgs,
      ).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              isPositive: "emissionCO2eInKgPerUnit must be a positive number",
            },
            property: "emissionCO2eInKgPerUnit",
          },
        ]);
      });
    });
    it("should refuse to create a new carbon emission factor dto with a zero emissionCO2eInKgPerUnit", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 0,
        source: "Test Source",
      };
      expect.assertions(1);
      await CreateCarbonEmissionFactorDto.fromObject(
        carbonEmissionFactorArgs,
      ).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              isPositive: "emissionCO2eInKgPerUnit must be a positive number",
            },
            property: "emissionCO2eInKgPerUnit",
          },
        ]);
      });
    });
  });
  describe("source validation", () => {
    it("should refuse to create a new carbon emission factor dto with an empty source", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "",
      };
      expect.assertions(1);
      await CreateCarbonEmissionFactorDto.fromObject(
        carbonEmissionFactorArgs,
      ).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              minLength: "source must be longer than or equal to 2 characters",
            },
            property: "source",
          },
        ]);
      });
    });
    it("should refuse to create a new carbon emission factor dto with a source of length 1", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "a",
      };
      expect.assertions(1);
      await CreateCarbonEmissionFactorDto.fromObject(
        carbonEmissionFactorArgs,
      ).catch((err) => {
        expect(err).toMatchObject([
          {
            constraints: {
              minLength: "source must be longer than or equal to 2 characters",
            },
            property: "source",
          },
        ]);
      });
    });
    it("should allow to create a new carbon emission factor dto with a source of length 2", async () => {
      const carbonEmissionFactorArgs = {
        name: "Test Carbon Emission Factor",
        unit: "kg",
        emissionCO2eInKgPerUnit: 12,
        source: "ab",
      };
      const dto = await CreateCarbonEmissionFactorDto.fromObject(
        carbonEmissionFactorArgs,
      );
      expect(dto).toMatchObject(carbonEmissionFactorArgs);
    });
  });
});
