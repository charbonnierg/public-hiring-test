import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose, plainToInstance } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { CarbonEmissionFactor } from "../carbonEmissionFactor.entity";

@Exclude()
export class ReadCarbonEmissionFactorDto {
  @Expose()
  @IsString()
  @ApiProperty()
  name: string;

  @Expose()
  @IsString()
  @ApiProperty()
  unit: string;

  @Expose()
  @IsNumber()
  @ApiProperty()
  emissionCO2eInKgPerUnit: number;

  @Expose()
  @IsString()
  @ApiProperty()
  source: string;

  static fromEntity(factor: CarbonEmissionFactor) {
    return plainToInstance(ReadCarbonEmissionFactorDto, factor);
  }
}
