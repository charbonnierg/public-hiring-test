import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { CarbonEmissionFactor } from "../carbonEmissionFactor/carbonEmissionFactor.entity";
import { FoodProduct } from "../foodProduct/foodProduct.entity";

@Entity("pending_carbon_footprint")
@Index(["status"])
export class PendingCarbonFootprint extends BaseEntity {
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
