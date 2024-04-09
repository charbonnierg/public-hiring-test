import {
  Ingredient,
  IngredientQuantity,
} from "../../foodProduct/foodProduct.entity";
import { FootprintScoreContribution } from "../footprintScore.entity";
import { ReadFootprintScoreDto } from "./read-footprintScore.dto";

describe("ReadFootprintScoreDto", () => {
  describe("fromEntity", () => {
    // This test should be reworked
    it("should return a ReadFootprintScoreDto", () => {
      // Arrange
      const product = "Pizza";
      const flourIngredient = new Ingredient();
      flourIngredient.name = "flour";
      flourIngredient.unit = "kg";
      const hamIngredient = new Ingredient();
      hamIngredient.name = "ham";
      hamIngredient.unit = "kg";
      const flourQuantity = new IngredientQuantity();
      flourQuantity.ingredient = flourIngredient;
      flourQuantity.quantity = 1;
      const hamQuantity = new IngredientQuantity();
      hamQuantity.ingredient = hamIngredient;
      hamQuantity.quantity = 2;
      const flourContribution = new FootprintScoreContribution();
      flourContribution.quantity = flourQuantity;
      flourContribution.score = 1;
      const hamContribution = new FootprintScoreContribution();
      hamContribution.quantity = hamQuantity;
      hamContribution.score = 3;
      const entities = [hamContribution, flourContribution];
      // Act
      const result = ReadFootprintScoreDto.fromEntity(product, entities);
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
