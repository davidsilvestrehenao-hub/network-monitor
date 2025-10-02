import type {
  IUserSpeedTestPreferenceRepository,
  UserSpeedTestPreference,
  ILogger,
} from "@network-monitor/shared";
import type { IDatabaseService } from "@network-monitor/shared";
import { EntityStatus } from "@network-monitor/shared";

export class MockUserSpeedTestPreferenceRepository
  implements IUserSpeedTestPreferenceRepository
{
  private databaseService: IDatabaseService;
  private logger: ILogger;
  private preferences: Map<string, UserSpeedTestPreference> = new Map();

  constructor(databaseService: IDatabaseService, logger: ILogger) {
    this.databaseService = databaseService;
    this.logger = logger;
    this.seedPreferences();
  }

  private seedPreferences(): void {
    // Seed with some default preferences
    this.preferences.set("user-1", {
      id: "pref-1",
      ownerId: "user-1",
      speedTestUrlId: "mock-10mb",
      autoSelect: true,
      preferredRegion: null,
      maxTestDuration: null,
      status: EntityStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      deletedAt: null,
      isActive: true,
    });

    this.preferences.set("user-2", {
      id: "pref-2",
      ownerId: "user-2",
      speedTestUrlId: "mock-10mb",
      autoSelect: true,
      preferredRegion: null,
      maxTestDuration: null,
      status: EntityStatus.ACTIVE,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      deletedAt: null,
      isActive: true,
    });
  }

  async getByUserId(userId: string): Promise<UserSpeedTestPreference | null> {
    this.logger.debug(
      "MockUserSpeedTestPreferenceRepository: Finding preference by user ID",
      { userId }
    );
    return this.preferences.get(userId) || null;
  }

  async upsert(
    userId: string,
    speedTestUrlId: string
  ): Promise<UserSpeedTestPreference> {
    this.logger.debug(
      "MockUserSpeedTestPreferenceRepository: Upserting preference",
      { userId, speedTestUrlId }
    );
    const now = new Date();
    const newPreference: UserSpeedTestPreference = {
      id: `pref-${Date.now()}`,
      ownerId: userId,
      speedTestUrlId,
      autoSelect: true,
      preferredRegion: null,
      maxTestDuration: null,
      status: EntityStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
      version: 1,
      deletedAt: null,
      isActive: true,
    };
    this.preferences.set(userId, newPreference);
    return newPreference;
  }

  // Helper method for testing
  setSeedData(preferences: Map<string, UserSpeedTestPreference>): void {
    this.preferences = preferences;
  }

  // Helper method to get all preferences for testing
  getAllPreferences(): Map<string, UserSpeedTestPreference> {
    return new Map(this.preferences);
  }

  // Helper method to clear all preferences for testing
  clearPreferences(): void {
    this.preferences.clear();
  }
}
