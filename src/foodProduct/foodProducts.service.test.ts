import { Test, TestingModule } from "@nestjs/testing";
import { GreenlyDataSource, dataSource } from "../../config/dataSource";
import { UnitT } from "../measurementSystem/unit";
import { getTestEmissionFactor } from "../seed-dev-data";
import { ReadFoodProductDto } from "./dto/read-foodProduct.dto";
import { FoodProduct } from "./foodProduct.entity";
import {
  FoodProductRepository,
  InMemoryFoodProductRepository,
} from "./foodProducts.repository";
import { FoodProductsService } from "./foodProducts.service";
import { IFoodProductRepository } from "./interface/foodProducts.repository";

beforeAll(async () => {
  await dataSource.initialize();
});

afterAll(async () => {
  await dataSource.destroy();
});

describe("FoodProductService", () => {
  let module: TestingModule;
  let repository: IFoodProductRepository;
  let service: FoodProductsService;
  afterEach(async () => {
    await module.close();
  });
  beforeEach(async () => {
    await GreenlyDataSource.cleanDatabase();
    module = await Test.createTestingModule({
      providers: [
        FoodProductsService,
        {
          provide: FoodProductRepository,
          useClass: InMemoryFoodProductRepository,
        },
      ],
    }).compile();
    service = module.get<FoodProductsService>(FoodProductsService);
    repository = module.get<FoodProductRepository>(FoodProductRepository);
  });
  const expectFoodProduct = async (obj: { name: string }) => {
    const retrieved = await repository.findOne(obj.name);
    expect(retrieved).not.toBeNull();
    expect(
      ReadFoodProductDto.fromEntity(retrieved as FoodProduct),
    ).toMatchObject(obj);
  };
  describe("save", () => {
    it("should save a new food product", async () => {
      // Arrange
      const foodProduct = {
        name: "Pizza",
        ingredients: [
          { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
          { name: "ham", unit: "kg" as UnitT, quantity: 0.2 },
          { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
        ],
      };
      // Act
      const result = await service.save(foodProduct);

      // Assert
      expect(result).toBeInstanceOf(FoodProduct);
      expect(ReadFoodProductDto.fromEntity(result)).toMatchObject(foodProduct);
      await expectFoodProduct(foodProduct);
    });
    it("should refuse to save a food product with an existing name", async () => {
      // Arrange
      const foodProduct = {
        name: "Pizza",
        ingredients: [
          { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
          { name: "ham", unit: "kg" as UnitT, quantity: 0.2 },
          { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
        ],
      };
      await service.save(foodProduct);
      // Act
      const result = service.save(foodProduct);

      // Assert
      await expect(result).rejects.toThrow();
    });
    it("should refuse to save a food product with invalid ingredient units", async () => {
      // Arrange
      const foodProduct = {
        name: "Pizza",
        ingredients: [
          { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
          { name: "ham", unit: "kg" as UnitT, quantity: 0.2 },
          { name: "olive oil", unit: "INVALID" as UnitT, quantity: 100 },
        ],
      };
      // Act
      const result = service.save(foodProduct);

      // Assert
      await expect(result).rejects.toThrow();
    });
    it("should refuse to create a food product with same ingredient twice", async () => {
      // Arrange
      const foodProduct = {
        name: "Pizza",
        ingredients: [
          { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
          { name: "flour", unit: "kg" as UnitT, quantity: 0.2 },
          { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
        ],
      };
      // Act
      const result = service.save(foodProduct);

      // Assert
      await expect(result).rejects.toThrow();
    });
    it("should convert ingredient quantity when ingredient already exists with different unit", async () => {
      // Arrange
      const foodProductInKg = {
        name: "Pizza",
        ingredients: [
          { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
          { name: "ham", unit: "kg" as UnitT, quantity: 0.2 },
          { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
        ],
      };
      await service.save(foodProductInKg);
      const foodProductInG = {
        name: "The same pizza",
        ingredients: [
          { name: "flour", unit: "g" as UnitT, quantity: 100 },
          { name: "ham", unit: "g" as UnitT, quantity: 200 },
          { name: "olive oil", unit: "g" as UnitT, quantity: 100 },
        ],
      };
      // Act
      await service.save(foodProductInG);

      // Assert
      const retrieved = await repository.findOne(foodProductInG.name);
      expect(retrieved).not.toBeNull();
      expect(
        ReadFoodProductDto.fromEntity(retrieved as FoodProduct),
      ).toMatchObject({
        ...foodProductInKg,
        name: foodProductInG.name,
      });
    });
    it("should create many products with overlapping ingredients", async () => {
      // Arrange
      const foodProducts = [
        {
          name: "Pizza",
          ingredients: [
            { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
            { name: "ham", unit: "kg" as UnitT, quantity: 0.2 },
            { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
          ],
        },
        {
          name: "Pasta",
          ingredients: [
            { name: "flour", unit: "kg" as UnitT, quantity: 0.2 },
            { name: "ham", unit: "kg" as UnitT, quantity: 0.1 },
            { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
          ],
        },
      ];
      // Act
      for (const product of foodProducts) {
        await service.save(product);
      }
      // Assert
      expect(await repository.find()).toHaveLength(2);
      await expectFoodProduct(foodProducts[0]);
      await expectFoodProduct(foodProducts[1]);
    });
  });
  describe("findAll", () => {
    it("should return an empty array of products", async () => {
      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toHaveLength(0);
    });
    it("should return all food products", async () => {
      // Arrange
      const foodProducts = [
        {
          name: "Pizza",
          ingredients: [
            { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
            { name: "ham", unit: "kg" as UnitT, quantity: 0.2 },
            { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
          ],
        },
        {
          name: "Pasta",
          ingredients: [
            { name: "flour", unit: "kg" as UnitT, quantity: 0.2 },
            { name: "ham", unit: "kg" as UnitT, quantity: 0.1 },
            { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
          ],
        },
      ];
      for (const product of foodProducts) {
        await service.save(product);
      }
      // Act
      const result = await service.findAll();
      // Assert
      expect(result).toHaveLength(2);
      await expectFoodProduct(foodProducts[0]);
      await expectFoodProduct(foodProducts[1]);
    });
  });
  describe("find", () => {
    it("should return a food product", async () => {
      // Arrange
      const foodProduct = {
        name: "Pizza",
        ingredients: [
          { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
          { name: "ham", unit: "kg" as UnitT, quantity: 0.2 },
          { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
        ],
      };
      await service.save(foodProduct);
      // Act
      const result = await service.find({ name: "Pizza" });
      // Assert
      if (!result) {
        fail("Food product not found");
      }
      expect(ReadFoodProductDto.fromEntity(result)).toMatchObject(foodProduct);
    });
    it("should return a food product among many", async () => {
      // Arrange
      const foodProducts = [
        {
          name: "Pizza",
          ingredients: [
            { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
            { name: "ham", unit: "kg" as UnitT, quantity: 0.2 },
            { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
          ],
        },
        {
          name: "Pasta",
          ingredients: [
            { name: "flour", unit: "kg" as UnitT, quantity: 0.2 },
            { name: "ham", unit: "kg" as UnitT, quantity: 0.1 },
            { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
          ],
        },
      ];
      for (const product of foodProducts) {
        await service.save(product);
      }
      // Act
      const result = await service.find({ name: "Pizza" });
      // Assert
      if (!result) {
        fail("Food product not found");
      }
      expect(ReadFoodProductDto.fromEntity(result)).toMatchObject(
        foodProducts[0],
      );
    });
    it("should return null if the food product does not exist", async () => {
      // Act
      const result = await service.find({ name: "Not an existing product" });
      // Assert
      expect(result).toBeNull();
    });
  });
  describe("findAllByIngredient", () => {
    it("should return an empty array of products", async () => {
      const factor = getTestEmissionFactor("flour");
      // Act
      const result = await service.findAllByIngredient(factor);

      // Assert
      expect(result).toHaveLength(0);
    });
    it("should return a single product with the ingredient", async () => {
      // Arrange
      const foodProducts = [
        {
          name: "Pizza",
          ingredients: [
            { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
            { name: "ham", unit: "kg" as UnitT, quantity: 0.2 },
            { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
          ],
        },
        {
          name: "HamSalad",
          ingredients: [
            { name: "lettuce", unit: "kg" as UnitT, quantity: 0.2 },
            { name: "ham", unit: "kg" as UnitT, quantity: 0.1 },
            { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
          ],
        },
      ];
      for (const product of foodProducts) {
        await service.save(product);
      }
      // Act
      const factor = getTestEmissionFactor("flour");
      const result = await service.findAllByIngredient(factor);

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        name: "Pizza",
      });
    });
    it("should return all products with the ingredient", async () => {
      // Arrange
      const foodProducts = [
        {
          name: "Pizza",
          ingredients: [
            { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
            { name: "ham", unit: "kg" as UnitT, quantity: 0.2 },
            { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
          ],
        },
        {
          name: "Pasta",
          ingredients: [
            { name: "flour", unit: "kg" as UnitT, quantity: 0.2 },
            { name: "ham", unit: "kg" as UnitT, quantity: 0.1 },
            { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
          ],
        },
      ];
      for (const product of foodProducts) {
        await service.save(product);
      }
      // Act
      const factor = getTestEmissionFactor("flour");
      const result = await service.findAllByIngredient(factor);

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toMatchObject([{ name: "Pizza" }, { name: "Pasta" }]);
    });
  });
  describe("delete", () => {
    it("should return false when product does not exist", async () => {
      // Act
      const result = await service.delete({ name: "Pizza" });

      // Assert
      expect(result).toBe(false);
    });
    it("should return true and delete product when it exists", async () => {
      // Arrange
      const foodProduct = {
        name: "Pizza",
        ingredients: [
          { name: "flour", unit: "kg" as UnitT, quantity: 0.1 },
          { name: "ham", unit: "kg" as UnitT, quantity: 0.2 },
          { name: "olive oil", unit: "kg" as UnitT, quantity: 0.1 },
        ],
      };
      await service.save(foodProduct);
      // Act
      const result = await service.delete({ name: "Pizza" });

      // Assert
      expect(result).toBe(true);
      expect(await repository.find()).toHaveLength(0);
    });
  });
});
