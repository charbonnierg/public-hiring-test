import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  FoodProduct,
  Ingredient,
  IngredientQuantity,
} from "./foodProduct.entity";
import { IFoodProductsService } from "./interface/foodProducts.service";

@Injectable()
export class FoodProductsService implements IFoodProductsService {
  constructor(
    @InjectRepository(FoodProduct)
    private foodProductRepository: Repository<FoodProduct>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(IngredientQuantity)
    private ingredientQuantityRepository: Repository<IngredientQuantity>,
  ) {}
  async save(props: {
    name: string;
    composition: { name: string; unit: string; quantity: number }[];
  }): Promise<FoodProduct> {
    // FIXME: Use a transaction
    const product = new FoodProduct();
    product.name = props.name;
    product.composition = [];
    await this.foodProductRepository.save(product);
    for (const ingredient of props.composition) {
      let ingredientEntity = await this.ingredientRepository.findOne({
        where: { name: ingredient.name, unit: ingredient.unit },
      });
      if (!ingredientEntity) {
        ingredientEntity = new Ingredient();
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
        quantityEntity = new IngredientQuantity();
        quantityEntity.product_id = product.id;
        quantityEntity.ingredient_id = ingredientEntity.id;
        quantityEntity.ingredient = ingredientEntity;
        quantityEntity.product = product;
      }
      quantityEntity.quantity = ingredient.quantity;
      // Make sure the quantity is saved
      await quantityEntity.save();
      // Add the quantity to the product composition
      product.composition.push(quantityEntity);
    }
    return product;
  }

  find(query: { name: string }): Promise<FoodProduct | null> {
    return this.foodProductRepository.findOne({
      where: { name: query.name },
      relations: {
        composition: {
          ingredient: true,
        },
      },
    });
  }

  findAll(): Promise<FoodProduct[]> {
    return this.foodProductRepository.find({
      relations: {
        composition: {
          ingredient: true,
        },
      },
    });
  }

  findAllByIngredient(query: { name: string }): Promise<FoodProduct[]> {
    // NOTE: This does not return ingredients for a product
    return this.foodProductRepository.find({
      where: {
        composition: {
          ingredient: {
            name: query.name,
          },
        },
      },
      relations: {
        composition: {
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
