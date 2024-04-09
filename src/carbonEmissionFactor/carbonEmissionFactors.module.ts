/***
 * The carbon emission factors module provides functionality
 * for managing carbon emission factors.
 *
 * This module provides a service for managing carbon emission factors
 * which can be used by other modules.
 *
 * It also provides a controller for managing carbon emission factors
 * through HTTP endpoints.
 */
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarbonEmissionFactor } from "./carbonEmissionFactor.entity";
import { CarbonEmissionFactorsController } from "./carbonEmissionFactors.controller";
import { CarbonEmissionFactorsService } from "./carbonEmissionFactors.service";

@Module({
  imports: [TypeOrmModule.forFeature([CarbonEmissionFactor])],
  providers: [CarbonEmissionFactorsService],
  controllers: [CarbonEmissionFactorsController],
  exports: [CarbonEmissionFactorsService],
})
export class CarbonEmissionFactorsModule {}
