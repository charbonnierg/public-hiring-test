import { FoodProduct } from "../foodProduct.entity";

export interface IFoodProductsService {
  /**
   * Create or update a food product.
   */
  save(props: {
    name: string;
    composition: {
      name: string;
      unit: string;
      quantity: number;
    }[];
  }): Promise<FoodProduct>;

  /**
   * Get a food product by its name.
   *
   * @param query An object with a property `name` to search for
   */
  find(query: { name: string }): Promise<FoodProduct | null>;

  /**
   * Get all food products.
   */
  findAll(): Promise<FoodProduct[]>;

  /**
   * Get all food products that contain a given factor.
   */
  findAllByIngredient(query: { name: string }): Promise<FoodProduct[]>;

  /**
   * Delete a food product by its name.
   *
   * @param query An object with a property `name` to search for
   */
  delete(query: { name: string }): Promise<boolean>;
}
