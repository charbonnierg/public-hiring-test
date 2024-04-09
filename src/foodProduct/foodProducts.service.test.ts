import { Repository } from "typeorm";
import { GreenlyDataSource, dataSource } from "../../config/dataSource";
import { getTestEmissionFactor } from "../seed-dev-data";
import { ReadFoodProductDto } from "./dto/read-foodProduct.dto";
import { FoodIngredient } from "./foodIngredient.entity";
import { FoodProduct } from "./foodProduct.entity";
import { FoodProductIngredientQuantity } from "./foodProductIngredientQuantity.entity";
import { FoodProductsService } from "./foodProducts.service";

const flourEmissionFactor = getTestEmissionFactor("flour");
let repository: Repository<FoodProduct>;
let service: FoodProductsService;

beforeAll(async () => {
  await dataSource.initialize();
  repository = dataSource.getRepository(FoodProduct);
});

beforeEach(async () => {
  service = new FoodProductsService(
    repository,
    dataSource.getRepository(FoodIngredient),
    dataSource.getRepository(FoodProductIngredientQuantity),
  );
  await GreenlyDataSource.cleanDatabase();
});

afterAll(async () => {
  await dataSource.destroy();
});

const expectFoodProduct = async (obj: { name: string }) => {
  const retrieved = await repository.findOne({
    where: { name: obj.name },
    relations: { ingredients: { ingredient: true } },
  });
  expect(retrieved).not.toBeNull();
  expect(ReadFoodProductDto.fromEntity(retrieved as FoodProduct)).toMatchObject(
    obj,
  );
};

describe("FoodProductService", () => {
  describe("save", () => {
    it("should save a new food product", async () => {
      // Arrange
      const foodProduct = {
        name: "Pizza",
        ingredients: [
          { name: "flour", unit: "kg", quantity: 0.1 },
          { name: "ham", unit: "kg", quantity: 0.2 },
          { name: "olive oil", unit: "kg", quantity: 0.1 },
        ],
      };
      // Act
      const result = await service.save(foodProduct);

      // Assert
      expect(result).toBeInstanceOf(FoodProduct);
      expect(result.hasId()).toBe(true);
      expect(ReadFoodProductDto.fromEntity(result)).toMatchObject(foodProduct);
      await expectFoodProduct(foodProduct);
    });
    it("should refuse to save a food product with an existing name", async () => {
      // Arrange
      const foodProduct = {
        name: "Pizza",
        ingredients: [
          { name: "flour", unit: "kg", quantity: 0.1 },
          { name: "ham", unit: "kg", quantity: 0.2 },
          { name: "olive oil", unit: "kg", quantity: 0.1 },
        ],
      };
      await service.save(foodProduct);
      // Act
      const result = service.save(foodProduct);

      // Assert
      await expect(result).rejects.toThrow();
    });
    it("should create many products with overlapping ingredients", async () => {
      // Arrange
      const foodProducts = [
        {
          name: "Pizza",
          ingredients: [
            { name: "flour", unit: "kg", quantity: 0.1 },
            { name: "ham", unit: "kg", quantity: 0.2 },
            { name: "olive oil", unit: "kg", quantity: 0.1 },
          ],
        },
        {
          name: "Pasta",
          ingredients: [
            { name: "flour", unit: "kg", quantity: 0.2 },
            { name: "ham", unit: "kg", quantity: 0.1 },
            { name: "olive oil", unit: "kg", quantity: 0.1 },
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
            { name: "flour", unit: "kg", quantity: 0.1 },
            { name: "ham", unit: "kg", quantity: 0.2 },
            { name: "olive oil", unit: "kg", quantity: 0.1 },
          ],
        },
        {
          name: "Pasta",
          ingredients: [
            { name: "flour", unit: "kg", quantity: 0.2 },
            { name: "ham", unit: "kg", quantity: 0.1 },
            { name: "olive oil", unit: "kg", quantity: 0.1 },
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
          { name: "flour", unit: "kg", quantity: 0.1 },
          { name: "ham", unit: "kg", quantity: 0.2 },
          { name: "olive oil", unit: "kg", quantity: 0.1 },
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
            { name: "flour", unit: "kg", quantity: 0.1 },
            { name: "ham", unit: "kg", quantity: 0.2 },
            { name: "olive oil", unit: "kg", quantity: 0.1 },
          ],
        },
        {
          name: "Pasta",
          ingredients: [
            { name: "flour", unit: "kg", quantity: 0.2 },
            { name: "ham", unit: "kg", quantity: 0.1 },
            { name: "olive oil", unit: "kg", quantity: 0.1 },
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
      // Act
      const result = await service.findAllByIngredient(flourEmissionFactor);

      // Assert
      expect(result).toHaveLength(0);
    });
    it("should return a single product with the ingredient", async () => {
      // Arrange
      const foodProducts = [
        {
          name: "Pizza",
          ingredients: [
            { name: "flour", unit: "kg", quantity: 0.1 },
            { name: "ham", unit: "kg", quantity: 0.2 },
            { name: "olive oil", unit: "kg", quantity: 0.1 },
          ],
        },
        {
          name: "HamSalad",
          ingredients: [
            { name: "lettuce", unit: "kg", quantity: 0.2 },
            { name: "ham", unit: "kg", quantity: 0.1 },
            { name: "olive oil", unit: "kg", quantity: 0.1 },
          ],
        },
      ];
      for (const product of foodProducts) {
        await service.save(product);
      }
      // Act
      const result = await service.findAllByIngredient(flourEmissionFactor);

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
            { name: "flour", unit: "kg", quantity: 0.1 },
            { name: "ham", unit: "kg", quantity: 0.2 },
            { name: "olive oil", unit: "kg", quantity: 0.1 },
          ],
        },
        {
          name: "Pasta",
          ingredients: [
            { name: "flour", unit: "kg", quantity: 0.2 },
            { name: "ham", unit: "kg", quantity: 0.1 },
            { name: "olive oil", unit: "kg", quantity: 0.1 },
          ],
        },
      ];
      for (const product of foodProducts) {
        await service.save(product);
      }
      // Act
      const result = await service.findAllByIngredient(flourEmissionFactor);

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
          { name: "flour", unit: "kg", quantity: 0.1 },
          { name: "ham", unit: "kg", quantity: 0.2 },
          { name: "olive oil", unit: "kg", quantity: 0.1 },
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
