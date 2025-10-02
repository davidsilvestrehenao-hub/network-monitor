import type {
  ISpeedTestRepository,
  CreateSpeedTestData,
  SpeedTestQuery,
} from "@network-monitor/shared";
import type { SpeedTestResult } from "@network-monitor/shared";
import type { IPrisma } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class SpeedTestRepository implements ISpeedTestRepository {
  private databaseService: IPrisma;
  private logger: ILogger;

  constructor(databaseService: IPrisma, logger: ILogger) {
    this.databaseService = databaseService;
    this.logger = logger;
  }

  async create(data: CreateSpeedTestData): Promise<SpeedTestResult> {
    this.logger.debug("SpeedTestRepository: Creating speed test result", {
      data,
    });

    // Convert status to testStatus for Prisma
    const prismaData = {
      ...data,
      testStatus: data.status,
      // Remove status as it's not part of the Prisma model
      status: undefined,
    };

    const result = await this.databaseService
      .getClient()
      .speedTestResult.create({
        data: prismaData,
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

  async findById(id: string): Promise<SpeedTestResult | null> {
    this.logger.debug("SpeedTestRepository: Finding result by ID", { id });

    const result = await this.databaseService
      .getClient()
      .speedTestResult.findUnique({
        where: { id },
      });

    return result ? this.mapToSpeedTestResult(result) : null;
  }

  async getAll(limit = 100, offset = 0): Promise<SpeedTestResult[]> {
    this.logger.debug("SpeedTestRepository: Getting all results", {
      limit,
      offset,
    });

    const results = await this.databaseService
      .getClient()
      .speedTestResult.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

    return results.map(this.mapToSpeedTestResult);
  }

  async update(
    id: string,
    data: Partial<CreateSpeedTestData>
  ): Promise<SpeedTestResult> {
    this.logger.debug("SpeedTestRepository: Updating result", { id, data });

    // Filter out undefined values and convert to Prisma update input
    const updateData: Record<string, unknown> = {};
    if (data.ping !== undefined) updateData.ping = data.ping;
    if (data.download !== undefined) updateData.download = data.download;
    if (data.upload !== undefined) updateData.upload = data.upload;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.error !== undefined) updateData.error = data.error;

    const result = await this.databaseService
      .getClient()
      .speedTestResult.update({
        where: { id },
        data: updateData,
      });

    return this.mapToSpeedTestResult(result);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug("SpeedTestRepository: Deleting result", { id });

    await this.databaseService.getClient().speedTestResult.delete({
      where: { id },
    });
  }

  private mapToSpeedTestResult(prismaResult: unknown): SpeedTestResult {
    const result = prismaResult as {
      id: string;
      ping: number | null;
      download: number | null;
      upload: number | null;
      testStatus: string; // Prisma field name
      error: string | null;
      createdAt: Date;
      timestamp: Date;
      targetId: string;
    };

    return {
      id: result.id,
      ping: result.ping ?? undefined,
      download: result.download ?? undefined,
      upload: result.upload ?? undefined,
      status: result.testStatus as "SUCCESS" | "FAILURE", // Map testStatus back to status for domain model
      error: result.error ?? undefined,
      createdAt: result.createdAt.toISOString(),
      timestamp: result.timestamp.toISOString(),
      targetId: result.targetId,
    };
  }
}
