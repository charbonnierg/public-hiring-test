import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FoodIngredient } from "./foodIngredient.entity";
import { FoodProduct } from "./foodProduct.entity";
import { FoodProductIngredientQuantity } from "./foodProductIngredientQuantity.entity";
import { FoodProductsController } from "./foodProducts.controller";
import { FoodProductRepository } from "./foodProducts.repository";
import { FoodProductsService } from "./foodProducts.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FoodProduct,
      FoodIngredient,
      FoodProductIngredientQuantity,
    ]),
  ],
  providers: [FoodProductsService, FoodProductRepository],
  controllers: [FoodProductsController],
  exports: [FoodProductsService],
})
export class FoodProductsModule {}
