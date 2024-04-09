import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarbonEmissionFactorsModule } from "../carbonEmissionFactor/carbonEmissionFactors.module";
import { FoodProductsModule } from "../foodProduct/foodProducts.module";
import { CarbonFootprintContribution } from "./carbonFootprintContribution.entity";
import { CarbonFootprintController } from "./carbonFootprints.controller";
import { CarbonFootprintService } from "./carbonFootprints.service";
import { PendingCarbonFootprint } from "./pendingCarbonFootprint.entity";
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
    CarbonFootprintService,
    PendingCarbonFootprintService,
    PendingCarbonFootprintTimer,
  ],
  controllers: [CarbonFootprintController],
})
export class CarbonFootprintsModule {}
