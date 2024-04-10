import { Inject, Injectable } from "@nestjs/common";
import { UnitT, validateUnitOrReject } from "../measurementSystem/unit";
import { FoodProduct } from "./foodProduct.entity";
import { FoodProductRepository } from "./foodProducts.repository";
import { IFoodProductsService } from "./interface/foodProducts.service";

@Injectable()
export class FoodProductsService implements IFoodProductsService {
  constructor(
    @Inject(FoodProductRepository)
    private foodProductRepo: FoodProductRepository,
  ) {}
  async save(props: {
    name: string;
    ingredients: { name: string; unit: UnitT; quantity: number }[];
  }): Promise<FoodProduct> {
    const composition = new Set() as Set<string>;
    props.ingredients.forEach((ingredient) => {
      if (composition.has(ingredient.name)) {
        throw new Error(
          `Ingredient ${ingredient.name} is duplicated in the composition.`,
        );
      }
      validateUnitOrReject(ingredient.unit);
      composition.add(ingredient.name);
    });
    return this.foodProductRepo.saveOne(props);
  }

  find(query: { name: string }): Promise<FoodProduct | null> {
    return this.foodProductRepo.findOne(query.name);
  }

  findAll(): Promise<FoodProduct[]> {
    return this.foodProductRepo.find();
  }

  findAllByIngredient(query: { name: string }): Promise<FoodProduct[]> {
    return this.foodProductRepo.findByIngredient(query.name);
  }

  async delete(query: { name: string }): Promise<boolean> {
    return this.foodProductRepo.deleteOne(query.name);
  }
}
