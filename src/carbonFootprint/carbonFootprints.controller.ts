import {
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  Post,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CarbonFootprintService } from "./carbonFootprints.service";
import { ReadCarbonFootprintDto } from "./dto/read-carbonFootprint.dto";

@ApiTags("footprint-scores")
@Controller("footprint-scores")
export class CarbonFootprintController {
  private readonly logger = new Logger(CarbonFootprintController.name);

  constructor(
    private readonly carbonFootprintService: CarbonFootprintService,
  ) {}

  @Get(":product")
  @ApiOkResponse({
    description: "The footprint score has successfully been read.",
    type: ReadCarbonFootprintDto,
  })
  @ApiNotFoundResponse({
    description: "The footprint score for the product was not found.",
  })
  async getFootprintScore(
    @Param("product") product: string,
  ): Promise<ReadCarbonFootprintDto> {
    this.logger.log(`[GET /${product}] reading footprint score for ${product}`);
    const contributions = await this.carbonFootprintService.get(product);
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
    return ReadCarbonFootprintDto.fromEntity(product, contributions);
  }

  @Post(":product")
  @HttpCode(201)
  @ApiCreatedResponse({
    description: "The footprint score has successfully been updated.",
    type: ReadCarbonFootprintDto,
  })
  @ApiNotFoundResponse({
    description:
      "Either the product is not found, or the footprint score is not available for the product.",
  })
  async updateFootprintScore(
    @Param("product") product: string,
  ): Promise<ReadCarbonFootprintDto> {
    this.logger.log(
      `[POST /${product}] updating footprint score for ${product}`,
    );
    const contributions = await this.carbonFootprintService.save(product);
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
    return ReadCarbonFootprintDto.fromEntity(product, contributions);
  }
}
