import type {
  IUserSpeedTestPreferenceRepository,
  UserSpeedTestPreference,
} from "@network-monitor/shared";
import type { IDatabaseService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class UserSpeedTestPreferenceRepository
  implements IUserSpeedTestPreferenceRepository
{
  private databaseService: IDatabaseService;
  private logger: ILogger;

  constructor(databaseService: IDatabaseService, logger: ILogger) {
    this.databaseService = databaseService;
    this.logger = logger;
  }

  async getByUserId(userId: string): Promise<UserSpeedTestPreference | null> {
    this.logger.debug(
      "UserSpeedTestPreferenceRepository: Finding preference by user ID",
      { userId }
    );

    const pref = await this.databaseService
      .getClient()
      .userSpeedTestPreference.findUnique({ where: { userId } });

    return pref
      ? {
          userId: pref.userId,
          speedTestUrlId: pref.speedTestUrlId,
          updatedAt: pref.updatedAt,
        }
      : null;
  }

  async upsert(
    userId: string,
    speedTestUrlId: string
  ): Promise<UserSpeedTestPreference> {
    this.logger.debug(
      "UserSpeedTestPreferenceRepository: Upserting preference",
      { userId, speedTestUrlId }
    );

    const pref = await this.databaseService
      .getClient()
      .userSpeedTestPreference.upsert({
        where: { userId },
        update: { speedTestUrlId },
        create: { userId, speedTestUrlId },
      });

    return {
      userId: pref.userId,
      speedTestUrlId: pref.speedTestUrlId,
      updatedAt: pref.updatedAt,
    };
  }
}
