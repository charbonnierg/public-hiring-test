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
