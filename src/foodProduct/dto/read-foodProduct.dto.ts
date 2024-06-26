import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { UnitT } from "../../measurementSystem/unit";
import { FoodIngredient } from "../foodIngredient.entity";
import { FoodProduct } from "../foodProduct.entity";
import { FoodProductIngredientQuantity } from "../foodProductIngredientQuantity.entity";

/**
 * Data transfer object for an ingredient quantity
 */
@Exclude()
export class ReadIngredientQuantityDto {
  @Expose()
  @IsString()
  @ApiProperty()
  name: string;

  @Expose()
  @IsString()
  @ApiProperty()
  unit: UnitT;

  @Expose()
  @IsNumber()
  @ApiProperty()
  quantity: number;

  static fromEntity(
    factor: FoodProductIngredientQuantity,
    ingredient: FoodIngredient,
  ) {
    const dto = new ReadIngredientQuantityDto();
    dto.name = ingredient.name;
    dto.unit = ingredient.unit;
    dto.quantity = factor.quantity;
    return dto;
  }
}

/**
 * Data transfer object for creating a food product
 */
@Exclude()
export class ReadFoodProductDto {
  @Expose()
  @IsString()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty({
    type: [ReadIngredientQuantityDto],
  })
  ingredients: ReadIngredientQuantityDto[];

  static fromEntity(product: FoodProduct): ReadFoodProductDto {
    const dto = new ReadFoodProductDto();
    dto.name = product.name;
    dto.ingredients = product.ingredients.map((factor) =>
      ReadIngredientQuantityDto.fromEntity(factor, factor.ingredient),
    );
    return dto;
  }
}
