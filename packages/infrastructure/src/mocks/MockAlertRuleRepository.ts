import type {
  IAlertRuleRepository,
  AlertRule,
  CreateAlertRuleData,
  UpdateAlertRuleData,
  AlertRuleQuery,
} from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class MockAlertRuleRepository implements IAlertRuleRepository {
  private rules: AlertRule[] = [];
  private nextId = 1;
  private logger?: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger;
    this.seedRules();
  }

  private seedRules(): void {
    this.rules = [
      {
        id: this.nextId++,
        name: "High Ping Alert",
        metric: "ping",
        condition: "GREATER_THAN",
        threshold: 100,
        enabled: true,
        targetId: "target-1",
        triggeredEvents: [],
      },
      {
        id: this.nextId++,
        name: "Low Download Speed Alert",
        metric: "download",
        condition: "LESS_THAN",
        threshold: 50,
        enabled: true,
        targetId: "target-1",
        triggeredEvents: [],
      },
      {
        id: this.nextId++,
        name: "Critical Ping Alert",
        metric: "ping",
        condition: "GREATER_THAN",
        threshold: 200,
        enabled: true,
        targetId: "target-2",
        triggeredEvents: [],
      },
      {
        id: this.nextId++,
        name: "Disabled Rule",
        metric: "download",
        condition: "LESS_THAN",
        threshold: 10,
        enabled: false,
        targetId: "target-2",
        triggeredEvents: [],
      },
    ];
  }

  async findById(id: number): Promise<AlertRule | null> {
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
      .sort((a, b) => b.id - a.id)
      .slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));
  }

  async getAll(limit = 100, offset = 0): Promise<AlertRule[]> {
    this.logger?.debug("MockAlertRuleRepository: Getting all rules", {
      limit,
      offset,
    });
    return this.rules.sort((a, b) => b.id - a.id).slice(offset, offset + limit);
  }

  async count(): Promise<number> {
    this.logger?.debug("MockAlertRuleRepository: Counting rules");
    return this.rules.length;
  }

  async create(data: CreateAlertRuleData): Promise<AlertRule> {
    this.logger?.debug("MockAlertRuleRepository: Creating rule", { data });

    const rule: AlertRule = {
      id: this.nextId++,
      name: data.name,
      metric: data.metric,
      condition: data.condition,
      threshold: data.threshold,
      enabled: data.enabled ?? true,
      targetId: data.targetId,
      triggeredEvents: [],
    };

    this.rules.push(rule);
    return rule;
  }

  async update(id: number, data: UpdateAlertRuleData): Promise<AlertRule> {
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

  async delete(id: number): Promise<void> {
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

  async toggleEnabled(id: number, enabled: boolean): Promise<AlertRule> {
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
    this.nextId = Math.max(...rules.map(r => r.id), 0) + 1;
  }

  // Helper method to get all rules for testing
  getAllRules(): AlertRule[] {
    return [...this.rules];
  }
}
