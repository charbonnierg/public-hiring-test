import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarbonEmissionFactorsModule } from "../carbonEmissionFactor/carbonEmissionFactors.module";
import { FoodProductsModule } from "../foodProduct/foodProducts.module";
import { CarbonFootprintContribution } from "./carbonFootprintContribution.entity";
import { CarbonFootprintController } from "./carbonFootprints.controller";
import { CarbonFootprintRepository } from "./carbonFootprints.repository";
import { CarbonFootprintService } from "./carbonFootprints.service";
import { PendingCarbonFootprint } from "./pendingCarbonFootprint.entity";
import { PendingCarbonFootprintRepository } from "./pendingCarbonFootprints.repository";
import { PendingCarbonFootprintService } from "./pendingCarbonFootprints.service";
import { PendingCarbonFootprintTimer } from "./pendingCarbonFootprints.timer";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CarbonFootprintContribution,
      PendingCarbonFootprint,
    ]),
    FoodProductsModule,
    CarbonEmissionFactorsModule,
  ],
  providers: [
    CarbonFootprintRepository,
    CarbonFootprintService,
    PendingCarbonFootprintRepository,
    PendingCarbonFootprintService,
    PendingCarbonFootprintTimer,
  ],
  controllers: [CarbonFootprintController],
})
export class CarbonFootprintsModule {}
