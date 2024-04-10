import { Inject, Injectable } from "@nestjs/common";
import { UnitT } from "../measurementSystem/unit";
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
    return this.foodProductRepo.save(props);
  }

  find(query: { name: string }): Promise<FoodProduct | null> {
    return this.foodProductRepo.findOne(query.name);
  }

  findAll(): Promise<FoodProduct[]> {
    return this.foodProductRepo.findAll();
  }

  findAllByIngredient(query: { name: string }): Promise<FoodProduct[]> {
    return this.foodProductRepo.findAllByIngredient(query.name);
  }

  async delete(query: { name: string }): Promise<boolean> {
    return this.foodProductRepo.delete(query.name);
  }
}
