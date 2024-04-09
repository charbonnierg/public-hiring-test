import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeorm } from "../config/dataSource";
import { CarbonEmissionFactorsModule } from "./carbonEmissionFactor/carbonEmissionFactors.module";
import { CarbonFootprintsModule } from "./carbonFootprint/carbonFootprints.module";
import { FoodProductsModule } from "./foodProduct/foodProducts.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeorm],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.getOrThrow("typeorm"),
    }),
    CarbonEmissionFactorsModule,
    FoodProductsModule,
    CarbonFootprintsModule,
  ],
})
export class AppModule {}
