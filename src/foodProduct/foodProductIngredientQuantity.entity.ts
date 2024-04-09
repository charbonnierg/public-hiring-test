import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { FoodIngredient } from "./foodIngredient.entity";
import { FoodProduct } from "./foodProduct.entity";

/**
 * An ingredient proportion has a name and a quantity.
 *
 * For example: {name: "cheese", quantity: 0.5}
 */
@Entity("food_product_ingredient_quantity")
export class FoodProductIngredientQuantity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  product_id: number;

  @Column({ nullable: false })
  ingredient_id: number;

  @Column({ type: "float", nullable: false })
  quantity: number;

  @ManyToOne(() => FoodIngredient, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "ingredient_id", referencedColumnName: "id" })
  ingredient: FoodIngredient;

  @ManyToOne(() => FoodProduct, (product) => product.ingredients, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "product_id", referencedColumnName: "id" })
  product: FoodProduct;
}
