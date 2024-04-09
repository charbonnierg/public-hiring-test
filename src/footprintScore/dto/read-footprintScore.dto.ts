import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import { FootprintScoreContribution } from "../footprintScore.entity";

@Exclude()
export class ContributionDto {
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
export class ReadFootprintScoreDto {
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
    type: [ContributionDto],
  })
  contributions: ContributionDto[];

  static fromEntity(
    product: string,
    entity: FootprintScoreContribution[],
  ): ReadFootprintScoreDto {
    const dto = new ReadFootprintScoreDto();
    dto.product = product;
    dto.score = entity.reduce((acc, curr) => acc + curr.score, 0);
    dto.contributions = entity.map((c) => {
      const contribution = new ContributionDto();
      contribution.ingredient = c.quantity.ingredient.name;
      contribution.score = c.score;
      contribution.percentage = (c.score / dto.score) * 100;
      return contribution;
    });
    return dto;
  }
}
