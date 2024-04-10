import { UnitT } from "../../measurementSystem/unit";
import { FoodIngredient } from "../foodIngredient.entity";
import { FoodProduct } from "../foodProduct.entity";

export interface Indice {
  columns: string[];
  unique: boolean;
}

export interface IFoodProduct {
  name: string;
  ingredients: { name: string; unit: UnitT; quantity: number }[];
}

export interface IFoodProductRepository {
  /**
   * Find a food product by name.
   *
   * @note The FoodProduct instance must be returned with its ingredients.
   *
   * @param name The name of the food product to find.
   * @returns The food product if found, null otherwise.
   */
  findOne: (name: string) => Promise<FoodProduct | null>;

  /**
   * Find all food products.
   *
   * @note The FoodProduct instances must be returned with their ingredients.
   *
   * @returns All food products.
   */
  find: () => Promise<FoodProduct[]>;

  /**
   * Find all food products that contain a given ingredient.
   *
   * @note The FoodProduct instances must be returned without their ingredients.
   *
   * @param ingredientName The name of the ingredient to search for.
   * @returns All food products that contain the given ingredient.
   */
  findByIngredient: (ingredientName: string) => Promise<FoodProduct[]>;

  /**
   * Find a record of ingredients by name.
   *
   * @param names A list of ingredient names to search for.
   * @returns A map of ingredient names to their corresponding FoodIngredient instances.
   *        If an ingredient is not found, it is not included in the map.
   */
  findIngredients: (names: string[]) => Promise<Record<string, FoodIngredient>>;

  /**
   * Delete a food product by name.
   *
   * @param name The name of the food product to delete.
   * @returns `true` if the food product was deleted, `false` otherwise.
   */
  deleteOne: (name: string) => Promise<boolean>;

  /**
   * Save a food product.
   *
   * @param props The properties of the food product to save.
   * @returns The saved food product.
   */
  saveOne: (props: IFoodProduct) => Promise<FoodProduct>;

  /**
   * Get all indices on the underlying table.
   * Mainly used for testing.
   */
  indices: () => Promise<Record<string, Indice[]>>;
}
