import { Test, TestingModule } from "@nestjs/testing";
import {
  CarbonEmissionFactorsRepository,
  InMemoryCarbonEmissionFactorsRepository,
} from "../carbonEmissionFactor/carbonEmissionFactors.repository";
import { CarbonEmissionFactorsService } from "../carbonEmissionFactor/carbonEmissionFactors.service";
import { ICarbonEmissionFactorService } from "../carbonEmissionFactor/interface/carbonEmissionFactors.service";
import {
  FoodProductRepository,
  InMemoryFoodProductRepository,
} from "../foodProduct/foodProducts.repository";
import { FoodProductsService } from "../foodProduct/foodProducts.service";
import { IFoodProductsService } from "../foodProduct/interface/foodProducts.service";
import { getTestEmissionFactor } from "../seed-dev-data";
import {
  CarbonFootprintRepository,
  InMemoryCarbonFootprintRepository,
} from "./carbonFootprints.repository";
import { CarbonFootprintService } from "./carbonFootprints.service";
import { ICarbonFootprintRepository } from "./interface/carbonFootprints.repository";
import { ICarbonFootprintService } from "./interface/carbonFootprints.service";

describe("CarbonFootprint.Service", () => {
  let module: TestingModule;
  let repository: ICarbonFootprintRepository;
  let service: ICarbonFootprintService;
  let carbonEmissionService: ICarbonEmissionFactorService;
  let foodProductService: IFoodProductsService;
  afterEach(async () => {
    await module.close();
  });
  beforeEach(async () => {
    module = await Test.createTestingModule({
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
        CarbonFootprintService,
        CarbonEmissionFactorsService,
      ],
    }).compile();
    carbonEmissionService = module.get<ICarbonEmissionFactorService>(
      CarbonEmissionFactorsService,
    );
    foodProductService = module.get<IFoodProductsService>(FoodProductsService);
    repository = module.get<ICarbonFootprintRepository>(
      CarbonFootprintRepository,
    );
    service = module.get<ICarbonFootprintService>(CarbonFootprintService);
  });
  describe("getFootprintForProduct", () => {
    it("should return null where there is no footprint contribution", async () => {
      const result = await service.getFootprintForProduct("non-existent");
      expect(result).toBeNull();
    });
    it("should return the footprint contributions", async () => {
      const flour = getTestEmissionFactor("flour");
      const ham = getTestEmissionFactor("ham");
      const oliveOil = getTestEmissionFactor("oliveOil");
      await carbonEmissionService.saveBulk([flour, ham, oliveOil]);
      await foodProductService.save({
        name: "pizza",
        ingredients: [
          { name: "flour", quantity: 100, unit: "g" },
          { name: "ham", quantity: 50, unit: "g" },
          { name: "oliveOil", quantity: 10, unit: "g" },
        ],
      });
      await service.updateFootprintForProduct("pizza");
      const result = await service.getFootprintForProduct("pizza");
      expect(result).toHaveLength(3);
      // TODO: Better assertions
    });
  });
  describe("updateFootprintForProduct", () => {
    it("should do nothing when factors are not available", async () => {
      await foodProductService.save({
        name: "pizza",
        ingredients: [
          { name: "flour", quantity: 100, unit: "g" },
          { name: "ham", quantity: 50, unit: "g" },
          { name: "oliveOil", quantity: 10, unit: "g" },
        ],
      });
      const computed = await service.updateFootprintForProduct("pizza");
      expect(computed).toBeNull();
      const saved = await service.getFootprintForProduct("pizza");
      expect(saved).toBeNull();
    });
    it("should update the footprint when factors are available", async () => {
      const flour = getTestEmissionFactor("flour");
      const ham = getTestEmissionFactor("ham");
      const oliveOil = getTestEmissionFactor("oliveOil");
      await carbonEmissionService.saveBulk([flour, ham, oliveOil]);
      await foodProductService.save({
        name: "pizza",
        ingredients: [
          { name: "flour", quantity: 0.1, unit: "kg" },
          { name: "ham", quantity: 0.05, unit: "kg" },
          { name: "oliveOil", quantity: 0.01, unit: "kg" },
        ],
      });
      const computed = await service.updateFootprintForProduct("pizza");
      expect(computed).toHaveLength(3);
      const saved = await service.getFootprintForProduct("pizza");
      expect(saved).toHaveLength(3);
      // TODO: Better assertions
    });
    it("should convert quantities before computing score", async () => {
      const flour = getTestEmissionFactor("flour");
      const ham = getTestEmissionFactor("ham");
      const oliveOil = getTestEmissionFactor("oliveOil");
      await carbonEmissionService.saveBulk([flour, ham, oliveOil]);
      await foodProductService.save({
        name: "pizza",
        ingredients: [
          { name: "flour", quantity: 100, unit: "g" },
          { name: "ham", quantity: 50, unit: "g" },
          { name: "oliveOil", quantity: 10, unit: "g" },
        ],
      });
      await foodProductService.save({
        name: "samePizza",
        ingredients: [
          { name: "flour", quantity: 100, unit: "g" },
          { name: "ham", quantity: 50, unit: "g" },
          { name: "oliveOil", quantity: 10, unit: "g" },
        ],
      });
      const first = await service.updateFootprintForProduct("pizza");
      const second = await service.updateFootprintForProduct("samePizza");
      if (!first || !second) {
        fail("Expected both to be defined");
      }
      expect(first).toHaveLength(3);
      expect(second).toHaveLength(3);
      for (let i = 0; i < 3; i++) {
        expect(first[i].score).toBeCloseTo(second[i].score);
      }
    });
  });
});
