import type {
  ISpeedTestRepository,
  CreateSpeedTestData,
  SpeedTestQuery,
} from "@network-monitor/shared";
import type { SpeedTestResult } from "@network-monitor/shared";
import type { IDatabaseService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class SpeedTestRepository implements ISpeedTestRepository {
  constructor(
    private databaseService: IDatabaseService,
    private logger: ILogger
  ) {}

  async create(data: CreateSpeedTestData): Promise<SpeedTestResult> {
    this.logger.debug("SpeedTestRepository: Creating speed test result", {
      data,
    });

    const result = await this.databaseService
      .getClient()
      .speedTestResult.create({
        data,
      });

    return this.mapToSpeedTestResult(result);
  }

  async findByTargetId(
    targetId: string,
    limit = 100
  ): Promise<SpeedTestResult[]> {
    this.logger.debug("SpeedTestRepository: Finding results by target ID", {
      targetId,
      limit,
    });

    const results = await this.databaseService
      .getClient()
      .speedTestResult.findMany({
        where: { targetId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

    return results.map(this.mapToSpeedTestResult);
  }

  async findLatestByTargetId(
    targetId: string
  ): Promise<SpeedTestResult | null> {
    this.logger.debug(
      "SpeedTestRepository: Finding latest result by target ID",
      { targetId }
    );

    const result = await this.databaseService
      .getClient()
      .speedTestResult.findFirst({
        where: { targetId },
        orderBy: { createdAt: "desc" },
      });

    return result ? this.mapToSpeedTestResult(result) : null;
  }

  async findByQuery(query: SpeedTestQuery): Promise<SpeedTestResult[]> {
    this.logger.debug("SpeedTestRepository: Finding results by query", {
      query,
    });

    const where: Record<string, unknown> = {};

    if (query.targetId) {
      where.targetId = query.targetId;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        (where.createdAt as Record<string, unknown>).gte = query.startDate;
      }
      if (query.endDate) {
        (where.createdAt as Record<string, unknown>).lte = query.endDate;
      }
    }

    const results = await this.databaseService
      .getClient()
      .speedTestResult.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit || 100,
        skip: query.offset || 0,
      });

    return results.map(this.mapToSpeedTestResult);
  }

  async deleteByTargetId(targetId: string): Promise<void> {
    this.logger.debug("SpeedTestRepository: Deleting results by target ID", {
      targetId,
    });

    await this.databaseService.getClient().speedTestResult.deleteMany({
      where: { targetId },
    });
  }

  async deleteOldResults(olderThan: Date): Promise<number> {
    this.logger.debug("SpeedTestRepository: Deleting old results", {
      olderThan,
    });

    const result = await this.databaseService
      .getClient()
      .speedTestResult.deleteMany({
        where: {
          createdAt: {
            lt: olderThan,
          },
        },
      });

    return result.count;
  }

  async count(): Promise<number> {
    return await this.databaseService.getClient().speedTestResult.count();
  }

  private mapToSpeedTestResult(prismaResult: unknown): SpeedTestResult {
    const result = prismaResult as {
      id: string;
      ping: number | null;
      download: number | null;
      upload: number | null;
      status: string;
      error: string | null;
      createdAt: Date;
      timestamp: Date;
      targetId: string;
    };

    return {
      id: result.id,
      ping: result.ping,
      download: result.download,
      upload: result.upload,
      status: result.status as "SUCCESS" | "FAILURE",
      error: result.error ?? undefined,
      createdAt: result.createdAt.toISOString(),
      timestamp: result.timestamp.toISOString(),
      targetId: result.targetId,
    };
  }
}
