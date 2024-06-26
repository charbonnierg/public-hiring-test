import { ApiProperty } from "@nestjs/swagger";
import { Type, plainToClass } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsNumber,
  IsString,
  MinLength,
  ValidateNested,
  validateOrReject,
} from "class-validator";
import { UnitT, Units } from "../../measurementSystem/unit";

/**
 * Data transfer object for an ingredient quantity
 */
export class CreateIngredientQuantityDto {
  @IsString()
  @MinLength(2)
  @ApiProperty()
  name: string;

  @IsString()
  @IsIn(Units)
  @ApiProperty()
  unit: UnitT;

  @ApiProperty()
  @IsNumber()
  quantity: number;
}

/**
 * Data transfer object for creating a food product
 */
export class CreateFoodProductDto {
  @IsString()
  @MinLength(2)
  @ApiProperty()
  name: string;

  @ApiProperty({
    type: [CreateIngredientQuantityDto],
  })
  @ArrayMinSize(1)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIngredientQuantityDto)
  ingredients: CreateIngredientQuantityDto[];

  static async fromObject(obj: any): Promise<CreateFoodProductDto> {
    const dto = plainToClass(CreateFoodProductDto, obj);
    await validateOrReject(dto);
    return dto;
  }
}
