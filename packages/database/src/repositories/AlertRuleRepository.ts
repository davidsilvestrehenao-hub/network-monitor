import type {
  IAlertRuleRepository,
  AlertRule,
  CreateAlertRuleData,
  UpdateAlertRuleData,
  AlertRuleQuery,
} from "@network-monitor/shared";
import type { IDatabaseService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class AlertRuleRepository implements IAlertRuleRepository {
  constructor(
    private databaseService: IDatabaseService,
    private logger: ILogger
  ) {}

  async findById(id: number): Promise<AlertRule | null> {
    this.logger.debug("AlertRuleRepository: Finding rule by ID", { id });

    const prismaRule = await this.databaseService
      .getClient()
      .alertRule.findUnique({
        where: { id },
        include: {
          triggeredEvents: true,
        },
      });

    return prismaRule ? this.mapToAlertRule(prismaRule) : null;
  }

  async findByTargetId(targetId: string): Promise<AlertRule[]> {
    this.logger.debug("AlertRuleRepository: Finding rules by target ID", {
      targetId,
    });

    const prismaRules = await this.databaseService
      .getClient()
      .alertRule.findMany({
        where: { targetId },
        include: {
          triggeredEvents: true,
        },
        orderBy: { id: "desc" },
      });

    return prismaRules.map((rule: unknown) => this.mapToAlertRule(rule));
  }

  async findByQuery(query: AlertRuleQuery): Promise<AlertRule[]> {
    this.logger.debug("AlertRuleRepository: Finding rules by query", { query });

    const where: Record<string, unknown> = {};

    if (query.targetId) {
      where.targetId = query.targetId;
    }

    if (query.enabled !== undefined) {
      where.enabled = query.enabled;
    }

    if (query.metric) {
      where.metric = query.metric;
    }

    const prismaRules = await this.databaseService
      .getClient()
      .alertRule.findMany({
        where,
        include: {
          triggeredEvents: true,
        },
        orderBy: { id: "desc" },
        take: query.limit || 100,
        skip: query.offset || 0,
      });

    return prismaRules.map((rule: unknown) => this.mapToAlertRule(rule));
  }

  async getAll(limit = 100, offset = 0): Promise<AlertRule[]> {
    this.logger.debug("AlertRuleRepository: Getting all rules", {
      limit,
      offset,
    });

    const prismaRules = await this.databaseService
      .getClient()
      .alertRule.findMany({
        include: {
          triggeredEvents: true,
        },
        orderBy: { id: "desc" },
        take: limit,
        skip: offset,
      });

    return prismaRules.map((rule: unknown) => this.mapToAlertRule(rule));
  }

  async count(): Promise<number> {
    this.logger.debug("AlertRuleRepository: Counting rules");
    return await this.databaseService.getClient().alertRule.count();
  }

  async create(data: CreateAlertRuleData): Promise<AlertRule> {
    this.logger.debug("AlertRuleRepository: Creating rule", { data });

    const prismaRule = await this.databaseService.getClient().alertRule.create({
      data: {
        ...data,
        enabled: data.enabled ?? true,
      },
      include: {
        triggeredEvents: true,
      },
    });

    return this.mapToAlertRule(prismaRule);
  }

  async update(id: number, data: UpdateAlertRuleData): Promise<AlertRule> {
    this.logger.debug("AlertRuleRepository: Updating rule", { id, data });

    const prismaRule = await this.databaseService.getClient().alertRule.update({
      where: { id },
      data,
      include: {
        triggeredEvents: true,
      },
    });

    return this.mapToAlertRule(prismaRule);
  }

  async delete(id: number): Promise<void> {
    this.logger.debug("AlertRuleRepository: Deleting rule", { id });
    await this.databaseService.getClient().alertRule.delete({
      where: { id },
    });
  }

  async deleteByTargetId(targetId: string): Promise<void> {
    this.logger.debug("AlertRuleRepository: Deleting rules by target ID", {
      targetId,
    });
    await this.databaseService.getClient().alertRule.deleteMany({
      where: { targetId },
    });
  }

  async toggleEnabled(id: number, enabled: boolean): Promise<AlertRule> {
    this.logger.debug("AlertRuleRepository: Toggling rule enabled status", {
      id,
      enabled,
    });

    const prismaRule = await this.databaseService.getClient().alertRule.update({
      where: { id },
      data: { enabled },
      include: {
        triggeredEvents: true,
      },
    });

    return this.mapToAlertRule(prismaRule);
  }

  private mapToAlertRule(prismaRule: unknown): AlertRule {
    const rule = prismaRule as {
      id: number;
      name: string;
      metric: string;
      condition: string;
      threshold: number;
      enabled: boolean;
      targetId: string;
      triggeredEvents?: Array<{
        id: number;
        timestamp: Date;
        type: string;
        description: string;
        resolved: boolean;
        targetId: string;
        ruleId: number | null;
      }>;
    };

    return {
      id: rule.id,
      name: rule.name,
      metric: rule.metric as "ping" | "download",
      condition: rule.condition as "GREATER_THAN" | "LESS_THAN",
      threshold: rule.threshold,
      enabled: rule.enabled,
      targetId: rule.targetId,
      triggeredEvents:
        rule.triggeredEvents?.map(event => ({
          id: event.id,
          timestamp: event.timestamp,
          type: event.type as "OUTAGE" | "ALERT",
          description: event.description,
          resolved: event.resolved,
          targetId: event.targetId,
          ruleId: event.ruleId ?? undefined,
          triggeredByRule: null, // Avoid circular reference
        })) || [],
    };
  }
}
