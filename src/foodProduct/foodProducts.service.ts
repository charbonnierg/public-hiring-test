import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UnitT } from "../measurementSystem/unit";
import { FoodIngredient } from "./foodIngredient.entity";
import { FoodProduct } from "./foodProduct.entity";
import { FoodProductIngredientQuantity } from "./foodProductIngredientQuantity.entity";
import { IFoodProductsService } from "./interface/foodProducts.service";

@Injectable()
export class FoodProductsService implements IFoodProductsService {
  constructor(
    @InjectRepository(FoodProduct)
    private foodProductRepository: Repository<FoodProduct>,
    @InjectRepository(FoodIngredient)
    private ingredientRepository: Repository<FoodIngredient>,
    @InjectRepository(FoodProductIngredientQuantity)
    private ingredientQuantityRepository: Repository<FoodProductIngredientQuantity>,
  ) {}
  async save(props: {
    name: string;
    ingredients: { name: string; unit: UnitT; quantity: number }[];
  }): Promise<FoodProduct> {
    // FIXME: Use a transaction
    const product = new FoodProduct();
    product.name = props.name;
    product.ingredients = [];
    await this.foodProductRepository.save(product);
    for (const ingredient of props.ingredients) {
      let ingredientEntity = await this.ingredientRepository.findOne({
        where: { name: ingredient.name, unit: ingredient.unit },
      });
      if (!ingredientEntity) {
        ingredientEntity = new FoodIngredient();
        ingredientEntity.name = ingredient.name;
        ingredientEntity.unit = ingredient.unit;
        // Make sure the ingredient is saved
        await ingredientEntity.save();
      }
      let quantityEntity = await this.ingredientQuantityRepository.findOne({
        where: { product_id: product.id, ingredient_id: ingredientEntity.id },
        relations: { ingredient: true },
      });
      if (!quantityEntity) {
        quantityEntity = new FoodProductIngredientQuantity();
        quantityEntity.product_id = product.id;
        quantityEntity.ingredient_id = ingredientEntity.id;
        quantityEntity.ingredient = ingredientEntity;
        quantityEntity.product = product;
      }
      quantityEntity.quantity = ingredient.quantity;
      // Make sure the quantity is saved
      await quantityEntity.save();
      // Add the quantity to the product ingredients
      product.ingredients.push(quantityEntity);
    }
    return product;
  }

  find(query: { name: string }): Promise<FoodProduct | null> {
    return this.foodProductRepository.findOne({
      where: { name: query.name },
      relations: {
        ingredients: {
          ingredient: true,
        },
      },
    });
  }

  findAll(): Promise<FoodProduct[]> {
    return this.foodProductRepository.find({
      relations: {
        ingredients: {
          ingredient: true,
        },
      },
    });
  }

  findAllByIngredient(query: { name: string }): Promise<FoodProduct[]> {
    // NOTE: This does not return ingredients for a product
    return this.foodProductRepository.find({
      where: {
        ingredients: {
          ingredient: {
            name: query.name,
          },
        },
      },
      relations: {
        ingredients: {
          ingredient: false,
        },
      },
    });
  }

  async delete(query: { name: string }): Promise<boolean> {
    const result = await this.foodProductRepository.delete({
      name: query.name,
    });
    // Postgres supports this
    const affectedRows = result.affected as number;
    return affectedRows > 0;
  }
}
