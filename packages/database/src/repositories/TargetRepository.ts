// PrismaClient is used indirectly through databaseService
import type {
  ITargetRepository,
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
  AlertRule,
} from "@network-monitor/shared";
import type { IDatabaseService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class TargetRepository implements ITargetRepository {
  constructor(
    private databaseService: IDatabaseService,
    private logger: ILogger
  ) {}

  async findById(id: string): Promise<Target | null> {
    this.logger.debug("TargetRepository: Finding target by ID", { id });

    const target = await this.databaseService
      .getClient()
      .monitoringTarget.findUnique({
        where: { id },
        include: {
          speedTestResults: {
            orderBy: { createdAt: "desc" },
            take: 100,
          },
          alertRules: true,
        },
      });

    return target ? this.mapToTarget(target) : null;
  }

  async findByUserId(userId: string): Promise<Target[]> {
    this.logger.debug("TargetRepository: Finding targets by user ID", {
      userId,
    });

    const targets = await this.databaseService
      .getClient()
      .monitoringTarget.findMany({
        where: { ownerId: userId },
        include: {
          speedTestResults: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          alertRules: true,
        },
        orderBy: { name: "asc" },
      });

    return targets.map(target => this.mapToTarget(target));
  }

  async create(data: CreateTargetData): Promise<Target> {
    this.logger.debug("TargetRepository: Creating target", { data });

    const target = await this.databaseService
      .getClient()
      .monitoringTarget.create({
        data,
        include: { speedTestResults: true, alertRules: true },
      });

    return this.mapToTarget(target);
  }

  async update(id: string, data: UpdateTargetData): Promise<Target> {
    this.logger.debug("TargetRepository: Updating target", { id, data });

    const target = await this.databaseService
      .getClient()
      .monitoringTarget.update({
        where: { id },
        data,
        include: { speedTestResults: true, alertRules: true },
      });

    return this.mapToTarget(target);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug("TargetRepository: Deleting target", { id });

    await this.databaseService.getClient().monitoringTarget.delete({
      where: { id },
    });
  }

  async count(): Promise<number> {
    return await this.databaseService.getClient().monitoringTarget.count();
  }

  async getAll(limit = 50, offset = 0): Promise<Target[]> {
    this.logger.debug("TargetRepository: Getting all targets", {
      limit,
      offset,
    });

    const targets = await this.databaseService
      .getClient()
      .monitoringTarget.findMany({
        include: {
          speedTestResults: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
          alertRules: true,
        },
        orderBy: { name: "asc" },
        take: limit,
        skip: offset,
      });

    return targets.map(target => this.mapToTarget(target));
  }

  private mapToTarget = (prismaTarget: unknown): Target => {
    const target = prismaTarget as {
      id: string;
      name: string;
      address: string;
      ownerId: string;
      speedTestResults?: unknown[];
      alertRules?: unknown[];
    };

    return {
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
      speedTestResults:
        target.speedTestResults?.map(this.mapToSpeedTestResult) || [],
      alertRules: target.alertRules?.map(this.mapToAlertRule) || [],
    };
  };

  private mapToSpeedTestResult = (prismaResult: unknown): SpeedTestResult => {
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
      id: result.id.toString(),
      ping: result.ping,
      download: result.download,
      upload: null, // Prisma schema doesn't have upload yet
      status: result.status as "SUCCESS" | "FAILURE",
      error: result.error ?? undefined,
      createdAt: result.createdAt.toISOString(),
      timestamp: result.createdAt.toISOString(),
      targetId: result.targetId,
    };
  };

  private mapToAlertRule = (prismaRule: unknown): AlertRule => {
    const rule = prismaRule as {
      id: number;
      name: string;
      metric: string;
      condition: string;
      threshold: number;
      enabled: boolean;
      targetId: string;
    };

    return {
      id: rule.id,
      name: rule.name,
      metric: rule.metric as "ping" | "download",
      condition: rule.condition as "GREATER_THAN" | "LESS_THAN",
      threshold: rule.threshold,
      enabled: rule.enabled,
      targetId: rule.targetId,
      triggeredEvents: [],
    };
  };
}
