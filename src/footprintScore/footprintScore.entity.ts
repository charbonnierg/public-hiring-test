import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CarbonEmissionFactor } from "../carbonEmissionFactor/carbonEmissionFactor.entity";
import {
  FoodProduct,
  IngredientQuantity,
} from "../foodProduct/foodProduct.entity";

/**
 * A footprint score contribution has a score, a carbon emission factor, and an ingredient quantity.
 *
 */
@Entity("footprint_score_contribution")
@Index(["factor_id", "quantity_id"], { unique: true })
export class FootprintScoreContribution extends BaseEntity {
  @PrimaryColumn({ nullable: false })
  factor_id: number;

  @PrimaryColumn({ nullable: false })
  quantity_id: number;

  @Column({ type: "float", nullable: false })
  score: number;

  @ManyToOne(() => CarbonEmissionFactor, { onDelete: "CASCADE" })
  @JoinColumn({ name: "factor_id", referencedColumnName: "id" })
  factor: CarbonEmissionFactor;

  @ManyToOne(() => IngredientQuantity, { onDelete: "CASCADE" })
  @JoinColumn({ name: "quantity_id", referencedColumnName: "id" })
  quantity: IngredientQuantity;
}

@Entity("pending_footprint_score")
@Index(["status"])
export class PendingFootprintScore extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  product_id: number | null;

  @Column({ nullable: true })
  factor_id: number | null;

  @Column({ nullable: false })
  status: string;

  @Column({ type: "timestamp", nullable: false })
  created_at: Date;

  @Column({ type: "timestamp", nullable: false })
  last_update: Date;

  @ManyToOne(() => FoodProduct, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id", referencedColumnName: "id" })
  product: FoodProduct;

  @ManyToOne(() => CarbonEmissionFactor, { onDelete: "CASCADE" })
  @JoinColumn({ name: "factor_id", referencedColumnName: "id" })
  factor: CarbonEmissionFactor;
}
