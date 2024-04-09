import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { instanceToInstance } from "class-transformer";
import {
  GreenlyDataSource,
  dataSource,
  typeorm,
} from "../../config/dataSource";
import { getTestEmissionFactor } from "../seed-dev-data";
import { CarbonEmissionFactor } from "./carbonEmissionFactor.entity";
import {
  CarbonEmissionFactorsRepository,
  InMemoryCarbonEmissionFactorsRepository,
} from "./carbonEmissionFactors.repository";
import { ICarbonEmissionFactorsRepository } from "./interface/carbonEmissionFactors.repository";

let repository: ICarbonEmissionFactorsRepository;
let moduleRef: TestingModule;

beforeAll(async () => {
  await dataSource.initialize();
});

afterAll(async () => {
  await dataSource.destroy();
});

const initializeTypeormRepository = async () => {
  await GreenlyDataSource.cleanDatabase();
  moduleRef = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [typeorm],
      }),
      TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) =>
          configService.getOrThrow("typeorm"),
      }),
      TypeOrmModule.forFeature([CarbonEmissionFactor]),
    ],
    providers: [CarbonEmissionFactorsRepository],
  }).compile();

  repository = moduleRef.get<CarbonEmissionFactorsRepository>(
    CarbonEmissionFactorsRepository,
  );
};

const initializeInMemoryRepository = async () => {
  moduleRef = await Test.createTestingModule({
    providers: [
      {
        provide: CarbonEmissionFactorsRepository,
        useClass: InMemoryCarbonEmissionFactorsRepository,
      },
    ],
  }).compile();
  repository = moduleRef.get<InMemoryCarbonEmissionFactorsRepository>(
    CarbonEmissionFactorsRepository,
  );
};

describe("CarbonEmissionFactors.repository", () => {
  describe.each(["typeorm", "in-memory"])(
    "with %s repository",
    (repositoryType: string) => {
      beforeEach(async () => {
        if (repositoryType === "typeorm") {
          await initializeTypeormRepository();
        } else {
          await initializeInMemoryRepository();
        }
      });
      afterEach(async () => {
        await moduleRef.close();
      });
      describe("save", () => {
        it("should save a carbon emission factor", async () => {
          const factor = getTestEmissionFactor("flour");
          await repository.saveOne(factor);
          const carbonEmissionFactors = await repository.find();
          expect(carbonEmissionFactors).toHaveLength(1);
          expect(carbonEmissionFactors).toContainEqual(factor);
        });
        it("should save a carbon emission factor among others", async () => {
          const factor1 = getTestEmissionFactor("flour");
          const factor2 = getTestEmissionFactor("ham");
          await repository.saveOne(factor1);
          await repository.saveOne(factor2);
          const carbonEmissionFactors = await repository.find();
          expect(carbonEmissionFactors).toHaveLength(2);
          expect(carbonEmissionFactors).toContainEqual(factor1);
          expect(carbonEmissionFactors).toContainEqual(factor2);
        });
        it("should fail to create an item with the same name", async () => {
          const factor = getTestEmissionFactor("flour");
          await repository.saveOne(instanceToInstance(factor));
          await expect(repository.saveOne(factor)).rejects.toThrow();
          await expect(repository.find()).resolves.toHaveLength(1);
        });
      });
      describe("saveMany", () => {
        it("should save multiple carbon emission factors", async () => {
          const factor1 = getTestEmissionFactor("flour");
          const factor2 = getTestEmissionFactor("ham");
          await repository.saveMany([factor1, factor2]);
          const carbonEmissionFactors = await repository.find();
          expect(carbonEmissionFactors).toHaveLength(2);
          expect(carbonEmissionFactors).toContainEqual(factor1);
          expect(carbonEmissionFactors).toContainEqual(factor2);
        });
        it("should save multiple carbon emission factors among others", async () => {
          const factor1 = getTestEmissionFactor("flour");
          const factor2 = getTestEmissionFactor("ham");
          const factor3 = getTestEmissionFactor("vinegar");
          await repository.saveOne(factor3);
          await repository.saveMany([factor1, factor2]);
          const carbonEmissionFactors = await repository.find();
          expect(carbonEmissionFactors).toHaveLength(3);
          expect(carbonEmissionFactors).toContainEqual(factor1);
          expect(carbonEmissionFactors).toContainEqual(factor2);
          expect(carbonEmissionFactors).toContainEqual(factor3);
        });
        it("should fail to create multiple items with same name", async () => {
          const factor1 = getTestEmissionFactor("flour");
          const factor2 = getTestEmissionFactor("flour");
          await expect(
            repository.saveMany([factor1, factor2]),
          ).rejects.toThrow();
          await expect(repository.find()).resolves.toHaveLength(0);
        });
      });
      describe("findOne", () => {
        it("should return null if the carbon emission factor does not exist", async () => {
          const carbonEmissionFactor = await repository.findOne("non-existing");
          expect(carbonEmissionFactor).toBeNull();
        });
        it("should return the carbon emission factor if it exists", async () => {
          const factor = getTestEmissionFactor("flour");
          await repository.saveOne(factor);
          const carbonEmissionFactor = await repository.findOne("flour");
          expect(carbonEmissionFactor).not.toBeNull();
          expect(carbonEmissionFactor).toMatchObject(factor);
        });
        it("should return the carbon emission factor if it exists among others", async () => {
          const factor1 = getTestEmissionFactor("flour");
          const factor2 = getTestEmissionFactor("ham");
          await repository.saveMany([factor1, factor2]);
          const carbonEmissionFactor = await repository.findOne("ham");
          expect(carbonEmissionFactor).not.toBeNull();
          expect(carbonEmissionFactor).toMatchObject(factor2);
        });
      });
      describe("find", () => {
        describe("without names filter", () => {
          it("should return an empty array if there are no carbon emission factors", async () => {
            const carbonEmissionFactors = await repository.find();
            expect(carbonEmissionFactors).toHaveLength(0);
          });
          it("should return all carbon emission factors", async () => {
            const factor1 = getTestEmissionFactor("flour");
            const factor2 = getTestEmissionFactor("ham");
            await repository.saveMany([factor1, factor2]);
            const carbonEmissionFactors = await repository.find();
            expect(carbonEmissionFactors).toHaveLength(2);
            expect(carbonEmissionFactors).toContainEqual(factor1);
            expect(carbonEmissionFactors).toContainEqual(factor2);
          });
        });
        describe("with names filter", () => {
          it("should return an empty array if there are no carbon emission factors", async () => {
            const carbonEmissionFactors = await repository.find(["unknown"]);
            expect(carbonEmissionFactors).toHaveLength(0);
          });
          it("should return an empty array if no carbon emission factors match the names", async () => {
            const factor1 = getTestEmissionFactor("flour");
            const factor2 = getTestEmissionFactor("ham");
            await repository.saveMany([factor1, factor2]);
            const carbonEmissionFactors = await repository.find(["unknown"]);
            expect(carbonEmissionFactors).toHaveLength(0);
          });
          it("should return an array with a single item if a single carbon emission factor matches the name", async () => {
            const factor1 = getTestEmissionFactor("flour");
            const factor2 = getTestEmissionFactor("ham");
            await repository.saveMany([factor1, factor2]);
            const carbonEmissionFactors = await repository.find(["ham"]);
            expect(carbonEmissionFactors).toHaveLength(1);
            expect(carbonEmissionFactors).toContainEqual(factor2);
          });
          it("should return an array with multiple items if multiple carbon emission factors match the names", async () => {
            const factor1 = getTestEmissionFactor("flour");
            const factor2 = getTestEmissionFactor("ham");
            const factor3 = getTestEmissionFactor("vinegar");
            await repository.saveMany([factor1, factor2, factor3]);
            const carbonEmissionFactors = await repository.find([
              "flour",
              "ham",
            ]);
            expect(carbonEmissionFactors).toHaveLength(2);
            expect(carbonEmissionFactors).toContainEqual(factor1);
            expect(carbonEmissionFactors).toContainEqual(factor2);
          });
          it("should return an array with all items if all carbon emission factors match the names", async () => {
            const factor1 = getTestEmissionFactor("flour");
            const factor2 = getTestEmissionFactor("ham");
            const factor3 = getTestEmissionFactor("vinegar");
            await repository.saveMany([factor1, factor2, factor3]);
            const carbonEmissionFactors = await repository.find([
              "flour",
              "ham",
              "vinegar",
            ]);
            expect(carbonEmissionFactors).toHaveLength(3);
            expect(carbonEmissionFactors).toContainEqual(factor1);
            expect(carbonEmissionFactors).toContainEqual(factor2);
            expect(carbonEmissionFactors).toContainEqual(factor3);
          });
        });
      });
      describe("deleteOne", () => {
        it("should return false if the carbon emission factor does not exist", async () => {
          const didDelete = await repository.deleteOne("non-existing");
          expect(didDelete).toBe(false);
        });
        it("should return true if the carbon emission factor exists", async () => {
          const factor = getTestEmissionFactor("flour");
          await repository.saveOne(factor);
          const didDelete = await repository.deleteOne("flour");
          expect(didDelete).toBe(true);
          const carbonEmissionFactors = await repository.find();
          expect(carbonEmissionFactors).toHaveLength(0);
        });
        it("should return true if the carbon emission factor exists among others", async () => {
          const factor1 = getTestEmissionFactor("flour");
          const factor2 = getTestEmissionFactor("ham");
          await repository.saveMany([factor1, factor2]);
          const didDelete = await repository.deleteOne("ham");
          expect(didDelete).toBe(true);
          const carbonEmissionFactors = await repository.find();
          expect(carbonEmissionFactors).toHaveLength(1);
          expect(carbonEmissionFactors).toContainEqual(factor1);
        });
      });
      describe("indices", () => {
        it("must have an index on name", async () => {
          const indices = await repository.indices();
          expect(indices).toEqual([
            {
              columns: ["name"],
              unique: true,
            },
          ]);
        });
      });
    },
  );
});
