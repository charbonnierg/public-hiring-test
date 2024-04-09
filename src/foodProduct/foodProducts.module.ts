import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
  FoodProduct,
  Ingredient,
  IngredientQuantity,
} from "./foodProduct.entity";
import { FoodProductsController } from "./foodProducts.controller";
import { FoodProductsService } from "./foodProducts.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([FoodProduct, Ingredient, IngredientQuantity]),
  ],
  providers: [FoodProductsService],
  controllers: [FoodProductsController],
  exports: [FoodProductsService],
})
export class FoodProductsModule {}
