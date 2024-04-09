import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { CarbonFootprintContribution } from "../carbonFootprintContribution.entity";

@Exclude()
export class ReadCarbonFootprintContributionDto {
  @Expose()
  @IsString()
  @ApiProperty()
  ingredient: string;

  @Expose()
  @IsNumber()
  @ApiProperty()
  score: number;

  @Expose()
  @IsNumber()
  @ApiProperty()
  percentage: number;
}

@Exclude()
export class ReadCarbonFootprintDto {
  @Expose()
  @IsString()
  @ApiProperty()
  product: string;

  @Expose()
  @IsNumber()
  @ApiProperty()
  score: number;

  @Expose()
  @ApiProperty({
    type: [ReadCarbonFootprintContributionDto],
  })
  contributions: ReadCarbonFootprintContributionDto[];

  static fromEntity(
    product: string,
    entity: CarbonFootprintContribution[],
  ): ReadCarbonFootprintDto {
    const dto = new ReadCarbonFootprintDto();
    dto.product = product;
    dto.score = entity.reduce((acc, curr) => acc + curr.score, 0);
    dto.contributions = entity.map((c) => {
      const contribution = new ReadCarbonFootprintContributionDto();
      contribution.ingredient = c.quantity.ingredient.name;
      contribution.score = c.score;
      contribution.percentage = (c.score / dto.score) * 100;
      return contribution;
    });
    return dto;
  }
}
