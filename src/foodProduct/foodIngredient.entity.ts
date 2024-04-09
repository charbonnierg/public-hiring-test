import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

/**
 * An ingredient has a name and a unit.
 *
 * For example: {name: "cheese", unit: "kg"}
 */
@Entity("food_ingredient")
@Index(["name"], { unique: true })
export class FoodIngredient extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  unit: string;
}
