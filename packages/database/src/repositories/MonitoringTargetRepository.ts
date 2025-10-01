import type {
  IMonitoringTargetRepository,
  MonitoringTarget,
  CreateMonitoringTargetData,
  UpdateMonitoringTargetData,
} from "@network-monitor/shared";
import type { IDatabaseService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class MonitoringTargetRepository implements IMonitoringTargetRepository {
  constructor(
    private databaseService: IDatabaseService,
    private logger: ILogger
  ) {}

  async findById(id: string): Promise<MonitoringTarget | null> {
    this.logger.debug("MonitoringTargetRepository: Finding target by ID", {
      id,
    });

    const prismaTarget = await this.databaseService
      .getClient()
      .monitoringTarget.findUnique({
        where: { id },
        include: {
          speedTestResults: {
            orderBy: { createdAt: "desc" },
          },
          incidentEvents: {
            orderBy: { timestamp: "desc" },
          },
          alertRules: true,
        },
      });

    return prismaTarget ? this.mapToMonitoringTarget(prismaTarget) : null;
  }

  async findByOwnerId(ownerId: string): Promise<MonitoringTarget[]> {
    this.logger.debug(
      "MonitoringTargetRepository: Finding targets by owner ID",
      { ownerId }
    );

    const prismaTargets = await this.databaseService
      .getClient()
      .monitoringTarget.findMany({
        where: { ownerId },
        include: {
          speedTestResults: {
            orderBy: { createdAt: "desc" },
          },
          incidentEvents: {
            orderBy: { timestamp: "desc" },
          },
          alertRules: true,
        },
        orderBy: { id: "desc" },
      });

    return prismaTargets.map(target => this.mapToMonitoringTarget(target));
  }

  async getAll(limit = 100, offset = 0): Promise<MonitoringTarget[]> {
    this.logger.debug("MonitoringTargetRepository: Getting all targets", {
      limit,
      offset,
    });

    const prismaTargets = await this.databaseService
      .getClient()
      .monitoringTarget.findMany({
        take: limit,
        skip: offset,
        include: {
          speedTestResults: {
            orderBy: { createdAt: "desc" },
          },
          incidentEvents: {
            orderBy: { timestamp: "desc" },
          },
          alertRules: true,
        },
        orderBy: { id: "desc" },
      });

    return prismaTargets.map(target => this.mapToMonitoringTarget(target));
  }

  async count(): Promise<number> {
    this.logger.debug("MonitoringTargetRepository: Counting targets");
    return await this.databaseService.getClient().monitoringTarget.count();
  }

  async create(data: CreateMonitoringTargetData): Promise<MonitoringTarget> {
    this.logger.debug("MonitoringTargetRepository: Creating target", { data });

    const prismaTarget = await this.databaseService
      .getClient()
      .monitoringTarget.create({
        data,
        include: {
          speedTestResults: true,
          incidentEvents: true,
          alertRules: true,
        },
      });

    return this.mapToMonitoringTarget(prismaTarget);
  }

  async update(
    id: string,
    data: UpdateMonitoringTargetData
  ): Promise<MonitoringTarget> {
    this.logger.debug("MonitoringTargetRepository: Updating target", {
      id,
      data,
    });

    const prismaTarget = await this.databaseService
      .getClient()
      .monitoringTarget.update({
        where: { id },
        data,
        include: {
          speedTestResults: {
            orderBy: { id: "desc" },
          },
          incidentEvents: {
            orderBy: { timestamp: "desc" },
          },
          alertRules: true,
        },
      });

    return this.mapToMonitoringTarget(prismaTarget);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug("MonitoringTargetRepository: Deleting target", { id });
    await this.databaseService.getClient().monitoringTarget.delete({
      where: { id },
    });
  }

  private mapToMonitoringTarget(prismaTarget: unknown): MonitoringTarget {
    const target = prismaTarget as {
      id: string;
      name: string;
      address: string;
      ownerId: string;
      speedTestResults?: Array<{
        id: string;
        ping: number | null;
        download: number | null;
        upload: number | null;
        status: string;
        error: string | null;
        createdAt: Date;
        timestamp: Date;
        targetId: string;
      }>;
      incidentEvents?: Array<{
        id: number;
        timestamp: Date;
        type: string;
        description: string;
        resolved: boolean;
        targetId: string;
        ruleId: number | null;
        triggeredByRule?: {
          id: number;
          name: string;
          metric: string;
          condition: string;
          threshold: number;
          enabled: boolean;
          targetId: string;
        } | null;
      }>;
      alertRules?: Array<{
        id: number;
        name: string;
        metric: string;
        condition: string;
        threshold: number;
        enabled: boolean;
        targetId: string;
      }>;
    };

    return {
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
      speedTestResults:
        target.speedTestResults?.map(result => ({
          id: result.id,
          ping: result.ping,
          download: result.download,
          upload: result.upload,
          status: result.status as "SUCCESS" | "FAILURE",
          error: result.error ?? undefined,
          createdAt: result.createdAt.toISOString(),
          timestamp: result.timestamp.toISOString(),
          targetId: result.targetId,
        })) || [],
      incidentEvents:
        target.incidentEvents?.map(event => ({
          id: event.id,
          timestamp: event.timestamp,
          type: event.type as "OUTAGE" | "ALERT",
          description: event.description,
          resolved: event.resolved,
          targetId: event.targetId,
          ruleId: event.ruleId ?? undefined,
          triggeredByRule: event.triggeredByRule
            ? {
                id: event.triggeredByRule.id,
                name: event.triggeredByRule.name,
                metric: event.triggeredByRule.metric as "ping" | "download",
                condition: event.triggeredByRule.condition as
                  | "GREATER_THAN"
                  | "LESS_THAN",
                threshold: event.triggeredByRule.threshold,
                enabled: event.triggeredByRule.enabled,
                targetId: event.triggeredByRule.targetId,
                triggeredEvents: [],
              }
            : null,
        })) || [],
      alertRules:
        target.alertRules?.map(rule => ({
          id: rule.id,
          name: rule.name,
          metric: rule.metric as "ping" | "download",
          condition: rule.condition as "GREATER_THAN" | "LESS_THAN",
          threshold: rule.threshold,
          enabled: rule.enabled,
          targetId: rule.targetId,
          triggeredEvents: [],
        })) || [],
    };
  }
}
