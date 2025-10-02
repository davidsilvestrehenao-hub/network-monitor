import type {
  IUserSpeedTestPreferenceRepository,
  UserSpeedTestPreference,
} from "@network-monitor/shared";
import type { IPrisma } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class UserSpeedTestPreferenceRepository
  implements IUserSpeedTestPreferenceRepository
{
  private databaseService: IPrisma;
  private logger: ILogger;

  constructor(databaseService: IPrisma, logger: ILogger) {
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
      .userSpeedTestPreference.findUnique({ where: { ownerId: userId } });

    return pref
      ? {
          userId: pref.ownerId,
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
        where: { ownerId: userId },
        update: { speedTestUrlId },
        create: { ownerId: userId, speedTestUrlId },
      });

    return {
      userId: pref.ownerId,
      speedTestUrlId: pref.speedTestUrlId,
      updatedAt: pref.updatedAt,
    };
  }
}
