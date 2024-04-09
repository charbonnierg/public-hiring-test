import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

export const Units = ["kg", "oz"] as const;

export type UnitT = (typeof Units)[number];

/**
 * Entity for carbon emission factors.
 *
 * A carbon emission factor for a food product is
 * the amount of carbon dioxide equivalent (CO2e) emissions
 * produced per unit of the food product.
 *
 * The value may come from a source indicated in the `source` field.
 * The food product unit is indicated in the `unit` field.
 */
@Entity("carbon_emission_factors")
@Index(["name"], { unique: true })
export class CarbonEmissionFactor extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: "varchar",
    nullable: false,
  })
  name: string;

  @Column({
    type: "varchar",
    nullable: false,
  })
  unit: UnitT;

  @Column({
    type: "float",
    nullable: false,
  })
  emissionCO2eInKgPerUnit: number;

  @Column({
    type: "varchar",
    nullable: false,
  })
  source: string;
}
