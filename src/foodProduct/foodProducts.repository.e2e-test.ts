import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  GreenlyDataSource,
  dataSource,
  typeorm,
} from "../../config/dataSource";
import { UnitT } from "../measurementSystem/unit";
import { ReadFoodProductDto } from "./dto/read-foodProduct.dto";
import { FoodIngredient } from "./foodIngredient.entity";
import { FoodProduct } from "./foodProduct.entity";
import { FoodProductIngredientQuantity } from "./foodProductIngredientQuantity.entity";
import {
  FoodProductRepository,
  InMemoryFoodProductRepository,
} from "./foodProducts.repository";
import { IFoodProductRepository } from "./interface/foodProducts.repository";

let repository: IFoodProductRepository;
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
      TypeOrmModule.forFeature([
        FoodProduct,
        FoodIngredient,
        FoodProductIngredientQuantity,
      ]),
    ],
    providers: [FoodProductRepository],
  }).compile();

  repository = moduleRef.get<FoodProductRepository>(FoodProductRepository);
};

const initializeInMemoryRepository = async () => {
  moduleRef = await Test.createTestingModule({
    providers: [
      {
        provide: FoodProductRepository,
        useClass: InMemoryFoodProductRepository,
      },
    ],
  }).compile();
  repository = moduleRef.get<InMemoryFoodProductRepository>(
    FoodProductRepository,
  );
};

const expectFoodProductEqual = (obj: any, expected: ReadFoodProductDto) => {
  expect(ReadFoodProductDto.fromEntity(obj as FoodProduct)).toMatchObject(
    expected,
  );
};

describe("FoodProduct.repository", () => {
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
        it("should save a food product", async () => {
          const product = {
            name: "Pizza",
            ingredients: [
              {
                name: "flour",
                quantity: 100,
                unit: "g" as UnitT,
              },
              {
                name: "ham",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          await repository.saveOne(product);
          const foodProducts = await repository.find();
          expect(foodProducts).toHaveLength(1);
          expectFoodProductEqual(foodProducts[0], product);
        });
        it("should save a food product among others", async () => {
          const pizza = {
            name: "Pizza",
            ingredients: [
              {
                name: "flour",
                quantity: 100,
                unit: "g" as UnitT,
              },
              {
                name: "ham",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          const greekSalad = {
            name: "Greek Salad",
            ingredients: [
              {
                name: "oliveOil",
                quantity: 50,
                unit: "g" as UnitT,
              },
              {
                name: "tomato",
                quantity: 50,
                unit: "g" as UnitT,
              },
              {
                name: "cucumber",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          await repository.saveOne(pizza);
          await repository.saveOne(greekSalad);
          const foodProducts = await repository.find();
          expect(foodProducts).toHaveLength(2);
          expectFoodProductEqual(
            foodProducts.find((f) => f.name === "Pizza"),
            pizza,
          );
          expectFoodProductEqual(
            foodProducts.find((f) => f.name === "Greek Salad"),
            greekSalad,
          );
        });
        it("should fail to create a food product with an existing name", async () => {
          const pizza = {
            name: "Pizza",
            ingredients: [
              {
                name: "flour",
                quantity: 100,
                unit: "g" as UnitT,
              },
              {
                name: "ham",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          await repository.saveOne(pizza);
          await expect(repository.saveOne(pizza)).rejects.toThrow();
          await expect(repository.find()).resolves.toHaveLength(1);
        });
      });
      describe("findOne", () => {
        it("should return null if the food product does not exist", async () => {
          const foodProduct = await repository.findOne("non-existing");
          expect(foodProduct).toBeNull();
        });
        it("should return the food product if it exists", async () => {
          const pizza = {
            name: "Pizza",
            ingredients: [
              {
                name: "flour",
                quantity: 100,
                unit: "g" as UnitT,
              },
              {
                name: "ham",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          await repository.saveOne(pizza);
          const foodProduct = await repository.findOne(pizza.name);
          expectFoodProductEqual(foodProduct, pizza);
        });
        it("should return the food product if it exists among others", async () => {
          const pizza = {
            name: "Pizza",
            ingredients: [
              {
                name: "flour",
                quantity: 100,
                unit: "g" as UnitT,
              },
              {
                name: "ham",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          const greekSalad = {
            name: "Greek Salad",
            ingredients: [
              {
                name: "oliveOil",
                quantity: 50,
                unit: "g" as UnitT,
              },
              {
                name: "tomato",
                quantity: 50,
                unit: "g" as UnitT,
              },
              {
                name: "cucumber",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          await repository.saveOne(pizza);
          await repository.saveOne(greekSalad);
          const foodProduct = await repository.findOne(greekSalad.name);
          expectFoodProductEqual(foodProduct, greekSalad);
        });
      });
      describe("find", () => {
        describe("without names filter", () => {
          it("should return an empty array if there is no food product", async () => {
            const foodProducts = await repository.find();
            expect(foodProducts).toHaveLength(0);
          });
          it("should return all food products", async () => {
            const pizza = {
              name: "Pizza",
              ingredients: [
                {
                  name: "flour",
                  quantity: 100,
                  unit: "g" as UnitT,
                },
                {
                  name: "ham",
                  quantity: 50,
                  unit: "g" as UnitT,
                },
              ],
            };
            const greekSalad = {
              name: "Greek Salad",
              ingredients: [
                {
                  name: "oliveOil",
                  quantity: 50,
                  unit: "g" as UnitT,
                },
                {
                  name: "tomato",
                  quantity: 50,
                  unit: "g" as UnitT,
                },
                {
                  name: "cucumber",
                  quantity: 50,
                  unit: "g" as UnitT,
                },
              ],
            };
            await repository.saveOne(pizza);
            await repository.saveOne(greekSalad);
            const foodProducts = await repository.find();
            expect(foodProducts).toHaveLength(2);
            expectFoodProductEqual(
              foodProducts.find((f) => f.name === "Pizza"),
              pizza,
            );
            expectFoodProductEqual(
              foodProducts.find((f) => f.name === "Greek Salad"),
              greekSalad,
            );
          });
        });
      });
      describe("findIngredients", () => {
        it("should return an empty array if there is no ingredient", async () => {
          const ingredients = await repository.findIngredients([
            "ham",
            "flour",
          ]);
          expect(ingredients).toEqual({});
        });
        it("should return a single ingredient if a single ingredient matches", async () => {
          const product = {
            name: "Pizza",
            ingredients: [
              {
                name: "flour",
                quantity: 100,
                unit: "g" as UnitT,
              },
              {
                name: "ham",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          await repository.saveOne(product);
          const ingredients = await repository.findIngredients(["ham"]);
          expect(Object.keys(ingredients).length).toEqual(1);
          expect(ingredients).toMatchObject({
            ham: { name: "ham", unit: "g" },
          });
        });
        it("should return all ingredients if all matches", async () => {
          const product = {
            name: "Pizza",
            ingredients: [
              {
                name: "flour",
                quantity: 100,
                unit: "g" as UnitT,
              },
              {
                name: "ham",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          await repository.saveOne(product);
          const ingredients = await repository.findIngredients([
            "ham",
            "flour",
          ]);
          expect(Object.keys(ingredients).length).toEqual(2);
          expect(ingredients).toMatchObject({
            flour: { name: "flour", unit: "g" },
            ham: { name: "ham", unit: "g" },
          });
        });
      });
      describe("deleteOne", () => {
        it("should return false if the carbon emission factor does not exist", async () => {
          const didDelete = await repository.deleteOne("non-existing");
          expect(didDelete).toBe(false);
        });
        it("should return true if the food product exists", async () => {
          const pizza = {
            name: "Pizza",
            ingredients: [
              {
                name: "flour",
                quantity: 100,
                unit: "g" as UnitT,
              },
              {
                name: "ham",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          await repository.saveOne(pizza);
          const didDelete = await repository.deleteOne(pizza.name);
          expect(didDelete).toBe(true);
          const carbonEmissionFactors = await repository.find();
          expect(carbonEmissionFactors).toHaveLength(0);
        });
        it("should return true if the carbon emission factor exists among others", async () => {
          const pizza = {
            name: "Pizza",
            ingredients: [
              {
                name: "flour",
                quantity: 100,
                unit: "g" as UnitT,
              },
              {
                name: "ham",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          const greekSalad = {
            name: "Greek Salad",
            ingredients: [
              {
                name: "oliveOil",
                quantity: 50,
                unit: "g" as UnitT,
              },
              {
                name: "tomato",
                quantity: 50,
                unit: "g" as UnitT,
              },
              {
                name: "cucumber",
                quantity: 50,
                unit: "g" as UnitT,
              },
            ],
          };
          await repository.saveOne(pizza);
          await repository.saveOne(greekSalad);
          const didDelete = await repository.deleteOne(pizza.name);
          expect(didDelete).toBe(true);
          const carbonEmissionFactors = await repository.find();
          expect(carbonEmissionFactors).toHaveLength(1);
          expectFoodProductEqual(
            carbonEmissionFactors.find((f) => f.name === "Greek Salad"),
            greekSalad,
          );
        });
      });
      describe("indices", () => {
        it("must have an index on name", async () => {
          const indices = await repository.indices();
          expect(indices).toEqual({
            food_product: [
              {
                columns: ["name"],
                unique: true,
              },
            ],
            food_ingredient: [
              {
                columns: ["name"],
                unique: true,
              },
            ],
            food_product_ingredient_quantity: [],
          });
        });
      });
    },
  );
});
