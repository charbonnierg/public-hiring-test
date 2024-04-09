import { Inject, Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { FootprintScoreService } from "./footprintScore.service";
import { IFootprintScoreService } from "./interface/fooprintScore.service";

@Injectable()
export class FootprintScoreTimer {
  private readonly logger = new Logger(FootprintScoreTimer.name);

  constructor(
    @Inject(FootprintScoreService)
    private footprintScoreService: IFootprintScoreService,
  ) {}

  @Cron(CronExpression.EVERY_5_SECONDS)
  async handleCron() {
    this.logger.debug(
      "polling database for pending footprint scores to compute",
    );
    const result = await this.footprintScoreService.processPending();
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
