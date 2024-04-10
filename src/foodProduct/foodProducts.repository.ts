import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FoodIngredient } from "./foodIngredient.entity";
import { FoodProduct } from "./foodProduct.entity";
import { FoodProductIngredientQuantity } from "./foodProductIngredientQuantity.entity";
import {
  IFoodProduct,
  IFoodProductRepository,
} from "./interface/foodProducts.repository";

/**
 * A thin wrapper around the TypeORM repository for food products.
 *
 * This class implements the IFoodProductRepository interface.
 */
export class FoodProductRepository implements IFoodProductRepository {
  constructor(
    @InjectRepository(FoodProduct)
    private foodProductRepository: Repository<FoodProduct>,
    @InjectRepository(FoodIngredient)
    private ingredientRepository: Repository<FoodIngredient>,
    @InjectRepository(FoodProductIngredientQuantity)
    private ingredientQuantityRepository: Repository<FoodProductIngredientQuantity>,
  ) {}

  /**
   * Delete a food product by its name.
   *
   * @param name The name of the food product to delete.
   * @returns The result of the deletion operation.
   */
  async delete(name: string) {
    const result = await this.foodProductRepository.delete({ name });
    // Postgres supports this
    const affectedRows = result.affected as number;
    return affectedRows > 0;
  }

  /**
   * Find a food product by name.
   *
   * @note The FoodProduct must be returned with its ingredients.
   *
   * @param name The name of the food product to find.
   * @returns The food product if found, null otherwise.
   */
  findOne(name: string): Promise<FoodProduct | null> {
    return this.foodProductRepository.findOne({
      where: { name },
      relations: {
        ingredients: {
          ingredient: true,
        },
      },
    });
  }

  /**
   * Find all food products.
   *
   * @note The FoodProduct instances must be returned with their ingredients.
   *
   * @returns All food products.
   */
  findAll() {
    return this.foodProductRepository.find({
      relations: {
        ingredients: {
          ingredient: true,
        },
      },
    });
  }

  /**
   * Find all food products that contain a given ingredient.
   *
   * @note The FoodProduct instances must be returned without their ingredients.
   *
   * @param ingredientName The name of the ingredient to search for.
   * @returns All food products that contain the given ingredient.
   */
  findAllByIngredient(ingredientName: string) {
    return this.foodProductRepository.find({
      where: {
        ingredients: {
          ingredient: {
            name: ingredientName,
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

  /**
   * Save a food product.
   *
   * @param props The properties of the food product to save.
   * @returns The saved food product.
   */
  async save(props: IFoodProduct) {
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
        await this.ingredientRepository.save(ingredientEntity);
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
      await this.ingredientQuantityRepository.save(quantityEntity);
      // Add the quantity to the product ingredients
      product.ingredients.push(quantityEntity);
    }
    return product;
  }
}

/**
 * An in-memory implementation of the food product repository.
 *
 * This class is useful for testing purposes.
 */
export class InMemoryFoodProductRepository implements IFoodProductRepository {
  constructor(private products: FoodProduct[] = []) {}

  async delete(name: string) {
    const index = this.products.findIndex((product) => product.name === name);
    if (index === -1) {
      return false;
    }
    this.products.splice(index, 1);
    return true;
  }

  async findOne(name: string) {
    return this.products.find((product) => product.name === name) ?? null;
  }

  async findAll() {
    return this.products;
  }

  async findAllByIngredient(ingredientName: string) {
    return this.products.filter((product) =>
      product.ingredients.some(
        (ingredient) => ingredient.ingredient.name === ingredientName,
      ),
    );
  }

  async save(props: IFoodProduct) {
    const existing = this.products.find(
      (existingProduct) => existingProduct.name === props.name,
    );
    if (existing != null) {
      throw new Error(`Product with name ${props.name} already exists`);
    }
    const product = new FoodProduct();
    product.name = props.name;
    product.ingredients = [];
    for (const ingredient of props.ingredients) {
      const quantity = new FoodProductIngredientQuantity();
      quantity.product = product;
      quantity.ingredient = new FoodIngredient();
      quantity.ingredient.name = ingredient.name;
      quantity.ingredient.unit = ingredient.unit;
      quantity.quantity = ingredient.quantity;
      product.ingredients.push(quantity);
    }
    this.products.push(product);
    return product;
  }
}
