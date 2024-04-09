import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

export const Units = ["kg", "oz"] as const;

export type UnitT = (typeof Units)[number];

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
