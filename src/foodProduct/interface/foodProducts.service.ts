import { FoodProduct } from "../foodProduct.entity";

export interface IFoodProductsService {
  /**
   * Create or update a food product.
   *
   * @param props An object with the properties `name` and `ingredients`
   *
   * @returns The created or updated food product
   * @throws If the food product could not be created or updated
   */
  save(props: {
    name: string;
    ingredients: {
      name: string;
      unit: string;
      quantity: number;
    }[];
  }): Promise<FoodProduct>;

  /**
   * Get a food product by its name.
   *
   * @param query An object with a property `name` to search for
   * @returns The food product or `null` if it does not exist
   */
  find(query: { name: string }): Promise<FoodProduct | null>;

  /**
   * Get all food products.
   *
   * @returns All food products
   */
  findAll(): Promise<FoodProduct[]>;

  /**
   * Get all food products that contain a given factor.
   *
   * @param query An object with a property `name` to search for
   * @returns All food products that contain the given factor
   */
  findAllByIngredient(query: { name: string }): Promise<FoodProduct[]>;

  /**
   * Delete a food product by its name.
   *
   * @param query An object with a property `name` to search for
   * @returns `true` if the food product was deleted, `false` otherwise
   */
  delete(query: { name: string }): Promise<boolean>;
}
