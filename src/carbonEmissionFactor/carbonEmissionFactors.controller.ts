import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Param,
  ParseArrayPipe,
  Post,
  ValidationPipe,
} from "@nestjs/common";
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import { CarbonEmissionFactorsService } from "./carbonEmissionFactors.service";
import { CreateCarbonEmissionFactorDto } from "./dto/create-carbonEmissionFactor.dto";
import { ReadCarbonEmissionFactorDto } from "./dto/read-carbonEmissionFactor.dto";

/**
 * HTTP Controller for managing carbon emission factors.
 *
 * This controller provides endpoints for reading, creating, and deleting
 * carbon emission factors.
 *
 * It also provide endpoints for bulk inserting and bulk reading carbon emission factors.
 *
 * @note: This controller may benefit from a logger middleware instead of calling the logger in each method.
 * @note: Authentication should be added to the controller methods.
 */
@ApiTags("carbon-emission-factor")
@Controller("carbon-emission-factors")
export class CarbonEmissionFactorsController {
  private readonly logger = new Logger(CarbonEmissionFactorsController.name);

  constructor(
    private readonly carbonEmissionFactorService: CarbonEmissionFactorsService,
  ) {}

  @Get()
  @ApiOkResponse({
    description: "All carbon factors have successfully been read.",
    type: [ReadCarbonEmissionFactorDto],
  })
  async getCarbonEmissionFactors(): Promise<ReadCarbonEmissionFactorDto[]> {
    this.logger.log(`[GET /] reading all factors`);
    const factors = await this.carbonEmissionFactorService.findAll();
    return factors.map((factor) =>
      ReadCarbonEmissionFactorDto.fromEntity(factor),
    );
  }

  @Get(":name")
  @HttpCode(200)
  @ApiOkResponse({
    description: "The carbon factor have successfully been read.",
    type: ReadCarbonEmissionFactorDto,
  })
  @ApiNotFoundResponse({
    description: "The carbon factor was not found.",
  })
  async getCarbonEmissionFactor(
    @Param("name") name: string,
  ): Promise<ReadCarbonEmissionFactorDto> {
    this.logger.log(`[GET /${name}] reading factor ${name}`);
    const factor = await this.carbonEmissionFactorService.findByName({ name });
    if (!factor) {
      this.logger.warn(`[GET /${name}] factor ${name} not found`);
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: "Not Found",
          message: ["carbon emission factor not found"],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return ReadCarbonEmissionFactorDto.fromEntity(factor);
  }

  @Delete(":name")
  @HttpCode(204)
  @ApiNoContentResponse({
    description: "The carbon factor have successfully deleted.",
  })
  @ApiNotFoundResponse({
    description: "The carbon factor was not found.",
  })
  async deleteCarbonEmissionFactor(@Param("name") name: string): Promise<void> {
    this.logger.log(`[DELETE /${name}] deleting factor ${name}`);
    const didDelete = await this.carbonEmissionFactorService.deleteByName({
      name,
    });
    if (!didDelete) {
      this.logger.warn(`[DELETE /${name}] factor ${name} not found`);
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: "Not Found",
          message: ["carbon emission factor not found"],
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  @ApiCreatedResponse({
    description: "The carbon factor have successfully created.",
    type: ReadCarbonEmissionFactorDto,
  })
  async createCarbonEmissionFactors(
    @Body(new ValidationPipe({ transform: true }))
    carbonEmissionFactor: CreateCarbonEmissionFactorDto,
  ): Promise<ReadCarbonEmissionFactorDto> {
    this.logger.log(`[POST /] creating factor ${carbonEmissionFactor.name}`);
    const factor = carbonEmissionFactor.toEntity();
    const resource = await this.carbonEmissionFactorService.save(factor);
    return ReadCarbonEmissionFactorDto.fromEntity(resource);
  }

  @Post("/bulk")
  @ApiCreatedResponse({
    description: "The carbon factors have successfully created.",
    type: [ReadCarbonEmissionFactorDto],
  })
  async createCarbonEmissionFactorsBulk(
    @Body(new ParseArrayPipe({ items: CreateCarbonEmissionFactorDto }))
    carbonEmissionFactors: CreateCarbonEmissionFactorDto[],
  ): Promise<ReadCarbonEmissionFactorDto[]> {
    this.logger.log(
      `[POST /bulk] bulk creating ${this.createCarbonEmissionFactors.length} factors`,
    );
    const factors = carbonEmissionFactors.map((factor) => factor.toEntity());
    const resources = await this.carbonEmissionFactorService.saveBulk(factors);
    return resources.map((factor) =>
      ReadCarbonEmissionFactorDto.fromEntity(factor),
    );
  }
}
