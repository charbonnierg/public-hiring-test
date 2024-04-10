import { Test, TestingModule } from "@nestjs/testing";

import { instanceToPlain } from "class-transformer";
import { getTestEmissionFactor } from "../seed-dev-data";
import { CarbonEmissionFactor } from "./carbonEmissionFactor.entity";
import {
  CarbonEmissionFactorsRepository,
  InMemoryCarbonEmissionFactorsRepository,
} from "./carbonEmissionFactors.repository";
import { CarbonEmissionFactorsService } from "./carbonEmissionFactors.service";

const flourEmissionFactor = getTestEmissionFactor("flour");
const hamEmissionFactor = getTestEmissionFactor("ham");
const olivedOilEmissionFactor = getTestEmissionFactor("oliveOil");

const expectFactorToMatch = (
  factor: CarbonEmissionFactor | null,
  expectedFactor: CarbonEmissionFactor,
) => {
  expect(factor).not.toBeNull();
  expect(instanceToPlain(factor)).toMatchObject(
    instanceToPlain(expectedFactor),
  );
};

const expectFactorsToMatch = (
  factors: CarbonEmissionFactor[] | null,
  expectedFactors: CarbonEmissionFactor[],
) => {
  expect(factors).not.toBeNull();
  expect(factors).toHaveLength(expectedFactors.length);
  for (let i = 0; i < expectedFactors.length; i++) {
    expect(factors).toContainEqual(instanceToPlain(expectedFactors[i]));
  }
};

describe("CarbonEmissionFactors.service", () => {
  let module: TestingModule;
  let repository: InMemoryCarbonEmissionFactorsRepository;
  let service: CarbonEmissionFactorsService;
  afterEach(async () => {
    await module.close();
  });
  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        {
          provide: CarbonEmissionFactorsRepository,
          useClass: InMemoryCarbonEmissionFactorsRepository,
        },
        CarbonEmissionFactorsService,
      ],
    }).compile();

    service = module.get<CarbonEmissionFactorsService>(
      CarbonEmissionFactorsService,
    );
    repository = module.get<InMemoryCarbonEmissionFactorsRepository>(
      CarbonEmissionFactorsRepository,
    );
  });
  it("should return null when there is no factor", async () => {
    const factor = await service.findByName({ name: "unknown-factor" });
    expect(factor).toBeNull();
  });
  it("should save a new emission factor", async () => {
    const factor = await service.save(olivedOilEmissionFactor);
    expectFactorToMatch(factor, olivedOilEmissionFactor);
    const retrievedFactor = await repository.findOne(
      olivedOilEmissionFactor.name,
    );
    expectFactorToMatch(retrievedFactor, factor);
  });
  it("should save new emissionFactors in bulk", async () => {
    await service.saveBulk([hamEmissionFactor, flourEmissionFactor]);
    const retrieveChickenEmissionFactor = await repository.findOne("flour");
    expectFactorToMatch(retrieveChickenEmissionFactor, flourEmissionFactor);
  });
  it("should return an empty list when there is no factor", async () => {
    const factors = await service.findAll();
    expect(factors).toEqual([]);
  });
  it("should return a factor when there is a single factor", async () => {
    await service.save(olivedOilEmissionFactor);
    const carbonEmissionFactors = await service.findAll();
    expect(carbonEmissionFactors).toHaveLength(1);
    expectFactorToMatch(carbonEmissionFactors[0], olivedOilEmissionFactor);
  });
  it("should return all factors when there are several factors", async () => {
    await service.saveBulk([olivedOilEmissionFactor, hamEmissionFactor]);
    const carbonEmissionFactors = await service.findAll();
    expect(carbonEmissionFactors).toHaveLength(2);
    expectFactorToMatch(carbonEmissionFactors[0], olivedOilEmissionFactor);
    expectFactorToMatch(carbonEmissionFactors[1], hamEmissionFactor);
  });
  it("should find a list of factors", async () => {
    await service.saveBulk([olivedOilEmissionFactor, hamEmissionFactor]);
    const factors = await service.findAllByNamesOrNothing({
      names: [olivedOilEmissionFactor.name, hamEmissionFactor.name],
    });
    if (!factors) {
      fail("factors should not be null");
    }
    expectFactorsToMatch(factors, [olivedOilEmissionFactor, hamEmissionFactor]);
  });
  it("should return null when failing to find at least one factor", async () => {
    await service.saveBulk([olivedOilEmissionFactor, hamEmissionFactor]);
    const factors = await service.findAllByNamesOrNothing({
      names: [olivedOilEmissionFactor.name, "unknown-factor"],
    });
    expect(factors).toBeNull();
  });
  it("should delete a factor and return true", async () => {
    await service.save(olivedOilEmissionFactor);
    const didDelete = await service.deleteByName(olivedOilEmissionFactor);
    expect(didDelete).toBe(true);
    const carbonEmissionFactors = await service.findAll();
    expect(carbonEmissionFactors).toHaveLength(0);
  });
  it("should not delete factor and return false", async () => {
    await service.saveBulk([
      olivedOilEmissionFactor,
      hamEmissionFactor,
      flourEmissionFactor,
    ]);
    const didDelete = await service.deleteByName({ name: "unknown-factor" });
    expect(didDelete).toBe(false);
    const carbonEmissionFactors = await service.findAll();
    expect(carbonEmissionFactors).toHaveLength(3);
  });
});
