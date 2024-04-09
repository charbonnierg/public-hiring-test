import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FoodProductIngredientQuantity } from "./foodProductIngredientQuantity.entity";

/**
 * A food product has a name and a ingredients.
 *
 * For example: {name: "pizza", ingredients: [{name: "cheese", quantity: 0.5}, {name: "tomato", quantity: 0.3}]}
 */
@Entity("food_product")
@Index(["name"], { unique: true })
export class FoodProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @OneToMany(
    () => FoodProductIngredientQuantity,
    (ingredientQuantity) => ingredientQuantity.product,
  )
  ingredients: FoodProductIngredientQuantity[];
}
