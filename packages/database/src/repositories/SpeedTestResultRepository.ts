import type {
  ISpeedTestResultRepository,
  SpeedTestResult,
  CreateSpeedTestResultData,
  SpeedTestResultQuery,
} from "@network-monitor/shared";
import type { IDatabaseService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class SpeedTestResultRepository implements ISpeedTestResultRepository {
  constructor(
    private databaseService: IDatabaseService,
    private logger: ILogger
  ) {}

  async findById(id: number): Promise<SpeedTestResult | null> {
    this.logger.debug("SpeedTestResultRepository: Finding result by ID", {
      id,
    });

    const prismaResult = await this.databaseService
      .getClient()
      .speedTestResult.findUnique({
        where: { id },
      });

    return prismaResult ? this.mapToSpeedTestResult(prismaResult) : null;
  }

  async findByTargetId(
    targetId: string,
    limit = 100
  ): Promise<SpeedTestResult[]> {
    this.logger.debug(
      "SpeedTestResultRepository: Finding results by target ID",
      { targetId, limit }
    );

    const prismaResults = await this.databaseService
      .getClient()
      .speedTestResult.findMany({
        where: { targetId },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

    return prismaResults.map(result => this.mapToSpeedTestResult(result));
  }

  async findLatestByTargetId(
    targetId: string
  ): Promise<SpeedTestResult | null> {
    this.logger.debug(
      "SpeedTestResultRepository: Finding latest result by target ID",
      { targetId }
    );

    const prismaResult = await this.databaseService
      .getClient()
      .speedTestResult.findFirst({
        where: { targetId },
        orderBy: { createdAt: "desc" },
      });

    return prismaResult ? this.mapToSpeedTestResult(prismaResult) : null;
  }

  async findByQuery(query: SpeedTestResultQuery): Promise<SpeedTestResult[]> {
    this.logger.debug("SpeedTestResultRepository: Finding results by query", {
      query,
    });

    const where: Record<string, unknown> = {};

    if (query.targetId) {
      where.targetId = query.targetId;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {} as Record<string, Date>;
      if (query.startDate) {
        (where.createdAt as Record<string, Date>).gte = query.startDate;
      }
      if (query.endDate) {
        (where.createdAt as Record<string, Date>).lte = query.endDate;
      }
    }

    const prismaResults = await this.databaseService
      .getClient()
      .speedTestResult.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: query.limit || 100,
        skip: query.offset || 0,
      });

    return prismaResults.map(result => this.mapToSpeedTestResult(result));
  }

  async getAll(limit = 100, offset = 0): Promise<SpeedTestResult[]> {
    this.logger.debug("SpeedTestResultRepository: Getting all results", {
      limit,
      offset,
    });

    const prismaResults = await this.databaseService
      .getClient()
      .speedTestResult.findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      });

    return prismaResults.map(result => this.mapToSpeedTestResult(result));
  }

  async count(): Promise<number> {
    this.logger.debug("SpeedTestResultRepository: Counting results");
    return await this.databaseService.getClient().speedTestResult.count();
  }

  async create(data: CreateSpeedTestResultData): Promise<SpeedTestResult> {
    this.logger.debug("SpeedTestResultRepository: Creating result", { data });

    const prismaResult = await this.databaseService
      .getClient()
      .speedTestResult.create({
        data,
      });

    return this.mapToSpeedTestResult(prismaResult);
  }

  async update(
    id: number,
    data: Partial<CreateSpeedTestResultData>
  ): Promise<SpeedTestResult> {
    this.logger.debug("SpeedTestResultRepository: Updating result", {
      id,
      data,
    });

    const prismaResult = await this.databaseService
      .getClient()
      .speedTestResult.update({
        where: { id },
        data,
      });

    return this.mapToSpeedTestResult(prismaResult);
  }

  async delete(id: number): Promise<void> {
    this.logger.debug("SpeedTestResultRepository: Deleting result", { id });
    await this.databaseService.getClient().speedTestResult.delete({
      where: { id },
    });
  }

  async deleteByTargetId(targetId: string): Promise<void> {
    this.logger.debug(
      "SpeedTestResultRepository: Deleting results by target ID",
      { targetId }
    );
    await this.databaseService.getClient().speedTestResult.deleteMany({
      where: { targetId },
    });
  }

  async deleteOldResults(olderThan: Date): Promise<number> {
    this.logger.debug("SpeedTestResultRepository: Deleting old results", {
      olderThan,
    });

    const { count } = await this.databaseService
      .getClient()
      .speedTestResult.deleteMany({
        where: {
          createdAt: {
            lt: olderThan,
          },
        },
      });

    return count;
  }

  private mapToSpeedTestResult(prismaResult: unknown): SpeedTestResult {
    const result = prismaResult as {
      id: number;
      ping: number | null;
      download: number | null;
      status: string;
      error: string | null;
      createdAt: Date;
      targetId: string;
    };

    return {
      id: result.id,
      ping: result.ping,
      download: result.download,
      status: result.status as "SUCCESS" | "FAILURE",
      error: result.error,
      createdAt: result.createdAt,
      targetId: result.targetId,
    };
  }
}
