import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  GreenlyDataSource,
  dataSource,
  typeorm,
} from "../../config/dataSource";

import { CarbonEmissionFactorsModule } from "../carbonEmissionFactor/carbonEmissionFactors.module";
import {
  CarbonEmissionFactorsRepository,
  InMemoryCarbonEmissionFactorsRepository,
} from "../carbonEmissionFactor/carbonEmissionFactors.repository";
import { CarbonEmissionFactorsService } from "../carbonEmissionFactor/carbonEmissionFactors.service";
import { ICarbonEmissionFactorService } from "../carbonEmissionFactor/interface/carbonEmissionFactors.service";
import { FoodProductsModule } from "../foodProduct/foodProducts.module";
import {
  FoodProductRepository,
  InMemoryFoodProductRepository,
} from "../foodProduct/foodProducts.repository";
import { FoodProductsService } from "../foodProduct/foodProducts.service";
import { IFoodProductsService } from "../foodProduct/interface/foodProducts.service";
import { getTestEmissionFactor } from "../seed-dev-data";
import { CarbonFootprintContribution } from "./carbonFootprintContribution.entity";
import {
  CarbonFootprintRepository,
  InMemoryCarbonFootprintRepository,
} from "./carbonFootprints.repository";
import { computeFootprintForProductAndFactors } from "./carbonFootprints.score";
import { ICarbonFootprintRepository } from "./interface/carbonFootprints.repository";

let carbonEmissionService: ICarbonEmissionFactorService;
let foodProductService: IFoodProductsService;
let repository: ICarbonFootprintRepository;
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
      TypeOrmModule.forFeature([CarbonFootprintContribution]),
      CarbonEmissionFactorsModule,
      FoodProductsModule,
    ],
    providers: [CarbonFootprintRepository],
  }).compile();

  foodProductService = moduleRef.get<IFoodProductsService>(FoodProductsService);
  carbonEmissionService = moduleRef.get<ICarbonEmissionFactorService>(
    CarbonEmissionFactorsService,
  );
  repository = moduleRef.get<CarbonFootprintRepository>(
    CarbonFootprintRepository,
  );
};

const initializeInMemoryRepository = async () => {
  moduleRef = await Test.createTestingModule({
    providers: [
      {
        provide: CarbonFootprintRepository,
        useClass: InMemoryCarbonFootprintRepository,
      },
      {
        provide: FoodProductRepository,
        useClass: InMemoryFoodProductRepository,
      },
      {
        provide: CarbonEmissionFactorsRepository,
        useClass: InMemoryCarbonEmissionFactorsRepository,
      },
      FoodProductsService,
      CarbonEmissionFactorsService,
    ],
  }).compile();
  foodProductService = moduleRef.get<IFoodProductsService>(FoodProductsService);
  carbonEmissionService = moduleRef.get<ICarbonEmissionFactorService>(
    CarbonEmissionFactorsService,
  );
  repository = moduleRef.get<InMemoryCarbonFootprintRepository>(
    CarbonFootprintRepository,
  );
};

describe("CarbonFootprint.repository", () => {
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
      describe("saveContributions and findContributions", () => {
        it("should return an empty array if no contributions exist for product", async () => {
          const contributions = await repository.findContributions("pizza");
          expect(contributions).toEqual([]);
        });
        it("should return an empty array if no contributions exist for product but others exist", async () => {
          const flour = getTestEmissionFactor("flour");
          const ham = getTestEmissionFactor("ham");
          await carbonEmissionService.saveBulk([flour, ham]);
          const testProduct = await foodProductService.save({
            name: "pizza",
            ingredients: [
              { name: "flour", quantity: 100, unit: "g" },
              { name: "ham", quantity: 50, unit: "g" },
            ],
          });
          const contributions = computeFootprintForProductAndFactors(
            testProduct,
            [flour, ham],
          );
          if (!contributions) {
            fail("Contributions should not be null");
          }
          await repository.saveContributions(contributions);
          const retrieved = await repository.findContributions("not-a-product");
          expect(retrieved).toHaveLength(0);
        });
        it("should return an array of contributions", async () => {
          const flour = getTestEmissionFactor("flour");
          const ham = getTestEmissionFactor("ham");
          const oliveOil = getTestEmissionFactor("oliveOil");
          await carbonEmissionService.saveBulk([flour, ham, oliveOil]);
          const testProduct = await foodProductService.save({
            name: "pizza",
            ingredients: [
              { name: "flour", quantity: 100, unit: "g" },
              { name: "ham", quantity: 50, unit: "g" },
              { name: "oliveOil", quantity: 10, unit: "g" },
            ],
          });
          const contributions = computeFootprintForProductAndFactors(
            testProduct,
            [flour, ham, oliveOil],
          );
          if (!contributions) {
            fail("Contributions should not be null");
          }
          const saved = await repository.saveContributions(contributions);
          expect(saved).toHaveLength(3);
          expect(saved).toMatchObject(contributions);

          const retrieved = await repository.findContributions(
            testProduct.name,
          );
          expect(retrieved).toHaveLength(3);
          // TODO: Better assertions
        });
      });
      describe("deleteContributions", () => {
        it("should return 0 if no contributions are deleted", async () => {
          const deleted = await repository.deleteContributions("not-a-product");
          expect(deleted).toBe(0);
        });
        it("should return the number of deleted contributions", async () => {
          const flour = getTestEmissionFactor("flour");
          const ham = getTestEmissionFactor("ham");
          await carbonEmissionService.saveBulk([flour, ham]);
          const testProduct = await foodProductService.save({
            name: "pizza",
            ingredients: [
              { name: "flour", quantity: 100, unit: "g" },
              { name: "ham", quantity: 50, unit: "g" },
            ],
          });
          const otherProduct = await foodProductService.save({
            name: "other",
            ingredients: [
              { name: "flour", quantity: 200, unit: "g" },
              { name: "ham", quantity: 60, unit: "g" },
            ],
          });
          for (const product of [testProduct, otherProduct]) {
            const contributions = computeFootprintForProductAndFactors(
              product,
              [flour, ham],
            );
            if (!contributions) {
              fail("Contributions should not be null");
            }
            await repository.saveContributions(contributions);
          }
          const deleted = await repository.deleteContributions(
            testProduct.name,
          );
          expect(deleted).toBe(2);
          expect(
            await repository.findContributions(testProduct.name),
          ).toHaveLength(0);
          expect(
            await repository.findContributions(otherProduct.name),
          ).toHaveLength(2);
        });
      });
    },
  );
});
