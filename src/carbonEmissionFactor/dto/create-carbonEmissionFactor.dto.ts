import { ApiProperty } from "@nestjs/swagger";
import { plainToClass } from "class-transformer";
import {
  IsIn,
  IsNumber,
  IsPositive,
  IsString,
  MinLength,
  validateOrReject,
} from "class-validator";
import { UnitT, Units } from "../../measurementSystem/unit";
import { CarbonEmissionFactor } from "../carbonEmissionFactor.entity";

/**
 * Data transfer object for creating a carbon emission factor.
 */
export class CreateCarbonEmissionFactorDto {
  @IsString()
  @MinLength(2)
  @ApiProperty()
  name: string;

  @IsIn(Units)
  @ApiProperty()
  unit: UnitT;

  @IsNumber()
  @IsPositive()
  @ApiProperty()
  emissionCO2eInKgPerUnit: number;

  @IsString()
  @MinLength(2)
  @ApiProperty()
  source: string;

  toEntity(): CarbonEmissionFactor {
    return plainToClass(CarbonEmissionFactor, this);
  }

  static async fromObject(obj: any): Promise<CreateCarbonEmissionFactorDto> {
    const dto = plainToClass(CreateCarbonEmissionFactorDto, obj);
    await validateOrReject(dto);
    return dto;
  }
}
