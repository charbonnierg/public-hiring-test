import { plainToInstance } from "class-transformer";
import {
  FoodProduct,
  Ingredient,
  IngredientQuantity,
} from "../foodProduct.entity";
import { ReadFoodProductDto } from "./read-foodProduct.dto";

describe("ReadFoodProductDto", () => {
  describe("fromEntity", () => {
    it("should return a new instance of ReadFoodProductDto", async () => {
      // Arrange
      const product = plainToInstance(FoodProduct, {
        id: 1,
        name: "product",
        composition: [],
      });
      const ingredient = plainToInstance(Ingredient, {
        id: 1,
        name: "ingredient",
        unit: "kg",
      });
      const quantity = plainToInstance(IngredientQuantity, {
        ingredient_id: 1,
        product_id: 1,
        quantity: 1,
      });
      product.composition.push(quantity);
      quantity.ingredient = ingredient;
      // Act
      const result = ReadFoodProductDto.fromEntity(product);

      // Assert
      expect(result).toBeInstanceOf(ReadFoodProductDto);
      expect(result).toMatchObject({
        name: product.name,
        composition: [
          {
            name: ingredient.name,
            quantity: quantity.quantity,
            unit: ingredient.unit,
          },
        ],
      });
    });
  });
});
