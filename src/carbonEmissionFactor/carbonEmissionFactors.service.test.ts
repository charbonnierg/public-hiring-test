import { instanceToPlain } from "class-transformer";
import { Repository } from "typeorm";
import { dataSource, GreenlyDataSource } from "../../config/dataSource";
import { getTestEmissionFactor } from "../seed-dev-data";
import { CarbonEmissionFactor } from "./carbonEmissionFactor.entity";
import { CarbonEmissionFactorsService } from "./carbonEmissionFactors.service";

let flourEmissionFactor = getTestEmissionFactor("flour");
let hamEmissionFactor = getTestEmissionFactor("ham");
let olivedOilEmissionFactor = getTestEmissionFactor("oliveOil");
let repository: Repository<CarbonEmissionFactor>;
let service: CarbonEmissionFactorsService;

beforeAll(async () => {
  await dataSource.initialize();
  repository = dataSource.getRepository(CarbonEmissionFactor);
  service = new CarbonEmissionFactorsService(repository);
});

beforeEach(async () => {
  await GreenlyDataSource.cleanDatabase();
});

afterAll(async () => {
  await dataSource.destroy();
});

describe("CarbonEmissionFactors.service", () => {
  it("should save a new emission factor", async () => {
    const factor = await service.save(olivedOilEmissionFactor);
    expect(instanceToPlain(factor)).toMatchObject(
      instanceToPlain(olivedOilEmissionFactor),
    );
    expect(factor.hasId()).toBe(true);
    const retrievedFactor = await repository.findOneBy({
      name: olivedOilEmissionFactor.name,
    });
    expect(instanceToPlain(retrievedFactor)).toEqual(instanceToPlain(factor));
  });
  it("should save new emissionFactors in bulk", async () => {
    await service.saveBulk([hamEmissionFactor, flourEmissionFactor]);
    const retrieveChickenEmissionFactor = await dataSource
      .getRepository(CarbonEmissionFactor)
      .findOne({ where: { name: "flour" } });
    expect(retrieveChickenEmissionFactor?.name).toBe("flour");
  });
  it("should return an empty list when there is no factor", async () => {
    const factors = await service.findAll();
    expect(factors).toEqual([]);
  });
  it("should return a factor when there is a single factor", async () => {
    await service.save(olivedOilEmissionFactor);
    const carbonEmissionFactors = await service.findAll();
    expect(carbonEmissionFactors).toHaveLength(1);
    const factor = carbonEmissionFactors[0];
    expect(instanceToPlain(factor)).toEqual(
      instanceToPlain(olivedOilEmissionFactor),
    );
  });
  it("should return all factors when there are several factors", async () => {
    await service.saveBulk([olivedOilEmissionFactor, hamEmissionFactor]);
    const carbonEmissionFactors = await service.findAll();
    expect(carbonEmissionFactors).toHaveLength(2);
    expect(instanceToPlain(carbonEmissionFactors[0])).toEqual(
      instanceToPlain(olivedOilEmissionFactor),
    );
    expect(instanceToPlain(carbonEmissionFactors[1])).toEqual(
      instanceToPlain(hamEmissionFactor),
    );
  });
  it("should find a list of factors", async () => {
    await service.saveBulk([olivedOilEmissionFactor, hamEmissionFactor]);
    const factors = await service.findList({
      names: [olivedOilEmissionFactor.name, hamEmissionFactor.name],
    });
    if (!factors) {
      fail("factors should not be null");
    }
    expect(factors).toHaveLength(2);
    expect(factors).toContainEqual(instanceToPlain(olivedOilEmissionFactor));
    expect(factors).toContainEqual(instanceToPlain(hamEmissionFactor));
  });
  it("should return null when failing to find at least one factor", async () => {
    await service.saveBulk([olivedOilEmissionFactor, hamEmissionFactor]);
    const factors = await service.findList({
      names: [olivedOilEmissionFactor.name, "unknown-factor"],
    });
    expect(factors).toBeNull();
  });
  it("should delete a factor and return true", async () => {
    await service.save(olivedOilEmissionFactor);
    const didDelete = await service.delete(olivedOilEmissionFactor);
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
    const didDelete = await service.delete({ name: "unknown-factor" });
    expect(didDelete).toBe(false);
    const carbonEmissionFactors = await service.findAll();
    expect(carbonEmissionFactors).toHaveLength(3);
  });
  it("should update an emission factor", async () => {
    await service.save(olivedOilEmissionFactor);
    const retrieved = await service.find(olivedOilEmissionFactor);
    // Just to be sure in case seeder is updated
    expect(retrieved?.emissionCO2eInKgPerUnit).toEqual(0.15);
    olivedOilEmissionFactor.emissionCO2eInKgPerUnit = 0.25;
    await service.save(olivedOilEmissionFactor);
    const updated = await service.find(olivedOilEmissionFactor);
    expect(updated?.emissionCO2eInKgPerUnit).toEqual(0.25);
  });
});
