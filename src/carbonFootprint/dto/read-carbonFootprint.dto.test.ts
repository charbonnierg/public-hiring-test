import { FoodIngredient } from "../../foodProduct/foodIngredient.entity";
import { FoodProductIngredientQuantity } from "../../foodProduct/foodProductIngredientQuantity.entity";
import { CarbonFootprintContribution } from "../carbonFootprintContribution.entity";
import { ReadCarbonFootprintDto } from "./read-carbonFootprint.dto";

describe("ReadCarbonFootprintDto", () => {
  describe("fromEntity", () => {
    // This test should be reworked
    it("should return a ReadCarbonFootprintDto", () => {
      // Arrange
      const product = "Pizza";
      const flourIngredient = new FoodIngredient();
      flourIngredient.name = "flour";
      flourIngredient.unit = "kg";
      const hamIngredient = new FoodIngredient();
      hamIngredient.name = "ham";
      hamIngredient.unit = "kg";
      const flourQuantity = new FoodProductIngredientQuantity();
      flourQuantity.ingredient = flourIngredient;
      flourQuantity.quantity = 1;
      const hamQuantity = new FoodProductIngredientQuantity();
      hamQuantity.ingredient = hamIngredient;
      hamQuantity.quantity = 2;
      const flourContribution = new CarbonFootprintContribution();
      flourContribution.quantity = flourQuantity;
      flourContribution.score = 1;
      const hamContribution = new CarbonFootprintContribution();
      hamContribution.quantity = hamQuantity;
      hamContribution.score = 3;
      const entities = [hamContribution, flourContribution];
      // Act
      const result = ReadCarbonFootprintDto.fromEntity(product, entities);
      // Assert
      expect(result).toMatchObject({
        product,
        score: 4,
        contributions: [
          { ingredient: "ham", score: 3, percentage: 75 },
          { ingredient: "flour", score: 1, percentage: 25 },
        ],
      });
    });
  });
});
