import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { CarbonEmissionFactor } from "../carbonEmissionFactor/carbonEmissionFactor.entity";
import { FoodProductIngredientQuantity } from "../foodProduct/foodProductIngredientQuantity.entity";

/**
 * A footprint score contribution has a score, a carbon emission factor, and an ingredient quantity.
 *
 */
@Entity("carbon_footprint_contribution")
@Index(["factor_id", "quantity_id"], { unique: true })
export class CarbonFootprintContribution extends BaseEntity {
  @PrimaryColumn({ nullable: false })
  factor_id: number;

  @PrimaryColumn({ nullable: false })
  quantity_id: number;

  @Column({ type: "float", nullable: false })
  score: number;

  @ManyToOne(() => CarbonEmissionFactor, { onDelete: "CASCADE" })
  @JoinColumn({ name: "factor_id", referencedColumnName: "id" })
  factor: CarbonEmissionFactor;

  @ManyToOne(() => FoodProductIngredientQuantity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "quantity_id", referencedColumnName: "id" })
  quantity: FoodProductIngredientQuantity;
}
