import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { BaseEntity } from "typeorm/repository/BaseEntity";

/**
 * An ingredient has a name and a unit.
 *
 * For example: {name: "cheese", unit: "kg"}
 */
@Entity("food_product_ingredient")
@Index(["name"], { unique: true })
export class Ingredient extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  unit: string;
}

/**
 * A food product has a name and a composition.
 *
 * For example: {name: "pizza", composition: [{name: "cheese", quantity: 0.5}, {name: "tomato", quantity: 0.3}]}
 */
@Entity("food_product")
@Index(["name"], { unique: true })
export class FoodProduct extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @OneToMany(
    () => IngredientQuantity,
    (ingredientQuantity) => ingredientQuantity.product,
  )
  composition: IngredientQuantity[];
}

/**
 * An ingredient proportion has a name and a quantity.
 *
 * For example: {name: "cheese", quantity: 0.5}
 */
@Entity("food_product_ingredient_quantity")
export class IngredientQuantity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  product_id: number;

  @Column({ nullable: false })
  ingredient_id: number;

  @Column({ type: "float", nullable: false })
  quantity: number;

  @ManyToOne(() => Ingredient, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "ingredient_id", referencedColumnName: "id" })
  ingredient: Ingredient;

  @ManyToOne(() => FoodProduct, (product) => product.composition, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "product_id", referencedColumnName: "id" })
  product: FoodProduct;
}
