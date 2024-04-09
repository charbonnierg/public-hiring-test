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
import { CreateFoodProductDto } from "./dto/create-foodProduct.dto";
import { ReadFoodProductDto } from "./dto/read-foodProduct.dto";
import { FoodProductsService } from "./foodProducts.service";

@ApiTags("food-products")
@Controller("food-products")
export class FoodProductsController {
  private readonly logger = new Logger(FoodProductsController.name);

  constructor(private readonly foodProductsService: FoodProductsService) {}

  @Get()
  @ApiOkResponse({
    description: "All food products have successfully been read.",
    type: [ReadFoodProductDto],
  })
  async getFoodProducts(): Promise<ReadFoodProductDto[]> {
    this.logger.log(`[GET /] reading all products`);
    const results = await this.foodProductsService.findAll();
    return results.map((result) => ReadFoodProductDto.fromEntity(result));
  }

  @Get(":name")
  @HttpCode(200)
  @ApiOkResponse({
    description: "The product have successfully been read.",
    type: ReadFoodProductDto,
  })
  @ApiNotFoundResponse({
    description: "The product was not found.",
  })
  async getFoodProductByName(
    @Param("name") name: string,
  ): Promise<ReadFoodProductDto> {
    this.logger.log(`[GET /${name}] reading product ${name}`);
    const result = await this.foodProductsService.find({ name });
    if (!result) {
      this.logger.warn(`[GET /${name}] product ${name} not found`);
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: "Not Found",
          message: ["product not found"],
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return ReadFoodProductDto.fromEntity(result);
  }

  @Delete(":name")
  @HttpCode(204)
  @ApiNoContentResponse({
    description: "The product have successfully deleted.",
  })
  @ApiNotFoundResponse({
    description: "The product was not found.",
  })
  async deleteFoodProductByName(@Param("name") name: string): Promise<void> {
    this.logger.log(`[DELETE /${name}] deleting product ${name}`);
    const didDelete = this.foodProductsService.delete({ name });
    if (!didDelete) {
      this.logger.warn(`[DELETE /${name}] product ${name} not found`);
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          error: "Not Found",
          message: ["product factor not found"],
        },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Post()
  @ApiCreatedResponse({
    description: "The product have successfully created.",
    type: ReadFoodProductDto,
  })
  async createFoodProduct(
    @Body(new ValidationPipe({ transform: true }))
    createFoodProductDto: CreateFoodProductDto,
  ): Promise<ReadFoodProductDto> {
    this.logger.log(`[POST /] creating product ${createFoodProductDto.name}`);
    const result = await this.foodProductsService.save({
      name: createFoodProductDto.name,
      ingredients: createFoodProductDto.ingredients,
    });
    return ReadFoodProductDto.fromEntity(result);
  }
}
