import { plainToInstance } from "class-transformer";
import { FoodIngredient } from "../foodIngredient.entity";
import { FoodProduct } from "../foodProduct.entity";
import { FoodProductIngredientQuantity } from "../foodProductIngredientQuantity.entity";
import { ReadFoodProductDto } from "./read-foodProduct.dto";

describe("ReadFoodProductDto", () => {
  describe("fromEntity", () => {
    it("should return a new instance of ReadFoodProductDto", async () => {
      // Arrange
      const product = plainToInstance(FoodProduct, {
        id: 1,
        name: "product",
        ingredients: [],
      });
      const ingredient = plainToInstance(FoodIngredient, {
        id: 1,
        name: "ingredient",
        unit: "kg",
      });
      const quantity = plainToInstance(FoodProductIngredientQuantity, {
        ingredient_id: 1,
        product_id: 1,
        quantity: 1,
      });
      product.ingredients.push(quantity);
      quantity.ingredient = ingredient;
      // Act
      const result = ReadFoodProductDto.fromEntity(product);

      // Assert
      expect(result).toBeInstanceOf(ReadFoodProductDto);
      expect(result).toMatchObject({
        name: product.name,
        ingredients: [
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
