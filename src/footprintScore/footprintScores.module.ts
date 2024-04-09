import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CarbonEmissionFactorsModule } from "../carbonEmissionFactor/carbonEmissionFactors.module";
import { FoodProductsModule } from "../foodProduct/foodProducts.module";
import {
  FootprintScoreContribution,
  PendingFootprintScore,
} from "./footprintScore.entity";
import { FootprintScoreService } from "./footprintScore.service";
import { FootprintScoreTimer } from "./footprintScore.timer";
import { FootprintScoresController } from "./footprintScores.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      FootprintScoreContribution,
      PendingFootprintScore,
    ]),
    FoodProductsModule,
    CarbonEmissionFactorsModule,
  ],
  providers: [FootprintScoreService, FootprintScoreTimer],
  controllers: [FootprintScoresController],
})
export class FootprintScoresModule {}
