import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { IPendingCarbonFootprintService } from "./interface/pendingCarbonFootprint.service";
import { PendingCarbonFootprintService } from "./pendingCarbonFootprints.service";

@Injectable()
export class PendingCarbonFootprintTimer {
  private readonly logger = new Logger(PendingCarbonFootprintTimer.name);

  constructor(
    @Inject(PendingCarbonFootprintService)
    private pendingFootprintScoreService: IPendingCarbonFootprintService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    this.logger.debug(
      "polling database for pending footprint scores to compute",
    );
    const result = await this.pendingFootprintScoreService.processPending();
    for (const [key, value] of Object.entries(result)) {
      if (!value) {
        this.logger.log(`invalidated footprint score for product ${key}`);
      } else {
        this.logger.log(
          `updated footprint score for product ${key}: ${value.reduce((acc, val) => acc + val.score, 0)}`,
        );
      }
    }
  }
}
