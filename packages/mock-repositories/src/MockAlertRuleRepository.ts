import type {
  IAlertRuleRepository,
  CreateAlertRuleData,
  UpdateAlertRuleData,
  AlertRuleQuery,
} from "@network-monitor/shared";
import { generateUUID } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

// Import standardized domain types
import type { AlertRule } from "@network-monitor/shared";
import { EntityStatus } from "@network-monitor/shared";

export class MockAlertRuleRepository implements IAlertRuleRepository {
  private rules: AlertRule[] = [];
  private logger?: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger;
    this.seedRules();
  }

  private seedRules(): void {
    const now = new Date();
    this.rules = [
      {
        id: generateUUID(),
        name: "High Ping Alert",
        metric: "ping",
        condition: "GREATER_THAN",
        threshold: 100,
        enabled: true,
        targetId: "target-1",
        status: EntityStatus.ACTIVE,
        severity: "HIGH",
        cooldownPeriod: 300,
        maxAlerts: 10,
        createdAt: now,
        updatedAt: now,
        version: 1,
        deletedAt: null,
        isActive: true,
      },
      {
        id: generateUUID(),
        name: "Low Download Speed Alert",
        metric: "download",
        condition: "LESS_THAN",
        threshold: 50,
        enabled: true,
        targetId: "target-1",
        status: EntityStatus.ACTIVE,
        severity: "MEDIUM",
        cooldownPeriod: 600,
        maxAlerts: 5,
        createdAt: now,
        updatedAt: now,
        version: 1,
        deletedAt: null,
        isActive: true,
      },
      {
        id: generateUUID(),
        name: "Critical Ping Alert",
        metric: "ping",
        condition: "GREATER_THAN",
        threshold: 200,
        enabled: true,
        targetId: "target-2",
        status: EntityStatus.ACTIVE,
        severity: "CRITICAL",
        cooldownPeriod: 180,
        maxAlerts: 20,
        createdAt: now,
        updatedAt: now,
        version: 1,
        deletedAt: null,
        isActive: true,
      },
      {
        id: generateUUID(),
        name: "Disabled Rule",
        metric: "download",
        condition: "LESS_THAN",
        threshold: 10,
        enabled: false,
        targetId: "target-2",
        status: EntityStatus.INACTIVE,
        severity: "LOW",
        cooldownPeriod: 900,
        maxAlerts: 3,
        createdAt: now,
        updatedAt: now,
        version: 1,
        deletedAt: null,
        isActive: true,
      },
    ];
  }

  async findById(id: string): Promise<AlertRule | null> {
    this.logger?.debug("MockAlertRuleRepository: Finding rule by ID", { id });
    return this.rules.find(rule => rule.id === id) || null;
  }

  async findByTargetId(targetId: string): Promise<AlertRule[]> {
    this.logger?.debug("MockAlertRuleRepository: Finding rules by target ID", {
      targetId,
    });
    return this.rules.filter(rule => rule.targetId === targetId);
  }

  async findByQuery(query: AlertRuleQuery): Promise<AlertRule[]> {
    this.logger?.debug("MockAlertRuleRepository: Finding rules by query", {
      query,
    });

    let filteredRules = [...this.rules];

    if (query.targetId) {
      filteredRules = filteredRules.filter(
        rule => rule.targetId === query.targetId
      );
    }

    if (query.enabled !== undefined) {
      filteredRules = filteredRules.filter(
        rule => rule.enabled === query.enabled
      );
    }

    if (query.metric) {
      filteredRules = filteredRules.filter(
        rule => rule.metric === query.metric
      );
    }

    return filteredRules
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));
  }

  async getAll(limit = 100, offset = 0): Promise<AlertRule[]> {
    this.logger?.debug("MockAlertRuleRepository: Getting all rules", {
      limit,
      offset,
    });
    return this.rules
      .sort((a, b) => b.id.localeCompare(a.id))
      .slice(offset, offset + limit);
  }

  async count(): Promise<number> {
    this.logger?.debug("MockAlertRuleRepository: Counting rules");
    return this.rules.length;
  }

  async create(data: CreateAlertRuleData): Promise<AlertRule> {
    this.logger?.debug("MockAlertRuleRepository: Creating rule", { data });

    const now = new Date();
    const rule: AlertRule = {
      id: generateUUID(),
      name: data.name,
      metric: data.metric,
      condition: data.condition,
      threshold: data.threshold,
      enabled: data.enabled ?? true,
      targetId: data.targetId,
      status: EntityStatus.ACTIVE,
      severity: "MEDIUM",
      cooldownPeriod: 300,
      maxAlerts: 10,
      createdAt: now,
      updatedAt: now,
      version: 1,
      deletedAt: null,
      isActive: true,
    };

    this.rules.push(rule);
    return rule;
  }

  async update(id: string, data: UpdateAlertRuleData): Promise<AlertRule> {
    this.logger?.debug("MockAlertRuleRepository: Updating rule", { id, data });

    const ruleIndex = this.rules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) {
      throw new Error(`Alert rule with ID ${id} not found`);
    }

    const rule = this.rules[ruleIndex];
    this.rules[ruleIndex] = {
      ...rule,
      ...data,
    };

    return this.rules[ruleIndex];
  }

  async delete(id: string): Promise<void> {
    this.logger?.debug("MockAlertRuleRepository: Deleting rule", { id });

    const ruleIndex = this.rules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) {
      throw new Error(`Alert rule with ID ${id} not found`);
    }

    this.rules.splice(ruleIndex, 1);
  }

  async deleteByTargetId(targetId: string): Promise<void> {
    this.logger?.debug("MockAlertRuleRepository: Deleting rules by target ID", {
      targetId,
    });
    this.rules = this.rules.filter(rule => rule.targetId !== targetId);
  }

  async toggleEnabled(id: string, enabled: boolean): Promise<AlertRule> {
    this.logger?.debug(
      "MockAlertRuleRepository: Toggling rule enabled status",
      { id, enabled }
    );

    const ruleIndex = this.rules.findIndex(rule => rule.id === id);
    if (ruleIndex === -1) {
      throw new Error(`Alert rule with ID ${id} not found`);
    }

    this.rules[ruleIndex].enabled = enabled;
    return this.rules[ruleIndex];
  }

  // Helper method for testing
  setSeedData(rules: AlertRule[]): void {
    this.rules = rules;
  }

  // Helper method to get all rules for testing
  getAllRules(): AlertRule[] {
    return [...this.rules];
  }
}
