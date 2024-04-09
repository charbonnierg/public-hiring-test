import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
} from "@nestjs/common/decorators";
import { HttpStatus } from "@nestjs/common/enums";
import { HttpException } from "@nestjs/common/exceptions";
import { Logger } from "@nestjs/common/services";
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ReadFootprintScoreDto } from "./dto/read-footprintScore.dto";
import { FootprintScoreService } from "./footprintScore.service";

@ApiTags("footprint-scores")
@Controller("footprint-scores")
export class FootprintScoresController {
  private readonly logger = new Logger(FootprintScoresController.name);

  constructor(private readonly foodProductsService: FootprintScoreService) {}

  @Get(":product")
  @ApiOkResponse({
    description: "The footprint score has successfully been read.",
    type: ReadFootprintScoreDto,
  })
  @ApiNotFoundResponse({
    description: "The footprint score for the product was not found.",
  })
  async getFootprintScore(
    @Param("product") product: string,
  ): Promise<ReadFootprintScoreDto> {
    this.logger.log(`[GET /${product}] reading footprint score for ${product}`);
    const contributions = await this.foodProductsService.get(product);
    if (!contributions) {
      this.logger.warn(
        `[GET /${product}] footprint score for ${product} not found`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: "Not Found",
          message: ["footprint score not found"],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return ReadFootprintScoreDto.fromEntity(product, contributions);
  }

  @Post(":product")
  @HttpCode(201)
  @ApiCreatedResponse({
    description: "The footprint score has successfully been updated.",
    type: ReadFootprintScoreDto,
  })
  @ApiNotFoundResponse({
    description:
      "Either the product is not found, or the footprint score is not available for the product.",
  })
  async updateFootprintScore(
    @Param("product") product: string,
  ): Promise<ReadFootprintScoreDto> {
    this.logger.log(
      `[POST /${product}] updating footprint score for ${product}`,
    );
    const contributions = await this.foodProductsService.save(product);
    if (!contributions) {
      this.logger.warn(
        `[POST /${product}] footprint score for ${product} not found`,
      );
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: "Not Found",
          message: ["footprint score not available for this product"],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return ReadFootprintScoreDto.fromEntity(product, contributions);
  }
}
