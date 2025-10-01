import type { IAlertingService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";
import type { IEventBus } from "@network-monitor/shared";
import type {
  MockAlertRule,
  MockTriggeredAlert,
  SpeedTestCompletedEventData,
} from "@network-monitor/shared";
import type {
  CreateAlertRuleData,
  UpdateAlertRuleData,
  IncidentEvent,
} from "@network-monitor/shared";
import type {
  AlertRule,
  SpeedTestResult,
  MockSpeedTestResult,
} from "@network-monitor/shared";

export class MockAlerting implements IAlertingService {
  private alertRules: Map<string, MockAlertRule[]> = new Map();
  private triggeredAlerts: MockTriggeredAlert[] = [];

  private eventBus: IEventBus;
  private logger?: ILogger;

  constructor(eventBus: IEventBus, logger?: ILogger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.logger?.debug("MockAlerting: Initialized");
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.on("SPEED_TEST_COMPLETED", (data: unknown) => {
      this.handleSpeedTestCompleted(data as SpeedTestCompletedEventData);
    });
  }

  private async handleSpeedTestCompleted(
    data: SpeedTestCompletedEventData
  ): Promise<void> {
    this.logger?.debug("MockAlerting: Handling speed test completed", { data });

    // Mock alert checking logic
    const targetId = data.targetId;
    const rules = this.alertRules.get(targetId) || [];

    for (const rule of rules) {
      if (this.shouldTriggerAlert(rule, data)) {
        await this.triggerAlert(rule, targetId, data);
      }
    }
  }

  private shouldTriggerAlert(
    rule: MockAlertRule,
    data: SpeedTestCompletedEventData
  ): boolean {
    // Mock alert logic - check if rule conditions are met
    const result = data.result;

    if (
      rule.metric === "ping" &&
      result.ping !== null &&
      result.ping !== undefined
    ) {
      if (rule.condition === "GREATER_THAN") {
        return result.ping > rule.threshold;
      } else {
        return result.ping < rule.threshold;
      }
    }

    if (
      rule.metric === "download" &&
      result.download !== null &&
      result.download !== undefined
    ) {
      if (rule.condition === "GREATER_THAN") {
        return result.download > rule.threshold;
      } else {
        return result.download < rule.threshold;
      }
    }

    return false;
  }

  private async triggerAlert(
    rule: MockAlertRule,
    targetId: string,
    data: SpeedTestCompletedEventData
  ): Promise<void> {
    this.logger?.debug("MockAlerting: Triggering alert", {
      rule,
      targetId,
      data,
    });

    const alert: MockTriggeredAlert = {
      ruleId: rule.id,
      targetId,
      timestamp: new Date(),
      data: {
        metric: rule.metric,
        value:
          rule.metric === "ping"
            ? data.result.ping || 0
            : data.result.download || 0,
        threshold: rule.threshold,
        ruleName: rule.name,
      },
    };

    this.triggeredAlerts.push(alert);
    this.eventBus.emit("ALERT_TRIGGERED", {
      ruleId: rule.id,
      targetId,
      metric: rule.metric,
      value:
        rule.metric === "ping"
          ? data.result.ping || 0
          : data.result.download || 0,
      threshold: rule.threshold,
      message: `Alert triggered: ${rule.name}`,
    });
  }

  async createAlertRule(data: CreateAlertRuleData): Promise<AlertRule> {
    this.logger?.debug("MockAlerting: Creating alert rule", { data });

    const rule: MockAlertRule = {
      id: `rule-${Date.now()}`,
      name: data.name,
      metric: data.metric,
      condition: data.condition,
      threshold: data.threshold,
      enabled: data.enabled !== false,
      targetId: data.targetId,
    };

    const targetId = data.targetId;
    if (!this.alertRules.has(targetId)) {
      this.alertRules.set(targetId, []);
    }
    const rules = this.alertRules.get(targetId);
    if (rules) {
      rules.push(rule);
    }

    this.eventBus.emit("ALERT_RULE_CREATED", rule);
    return {
      id: parseInt(rule.id.replace("rule-", "")),
      name: rule.name,
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold,
      enabled: rule.enabled,
      targetId: rule.targetId,
      triggeredEvents: [], // Add missing property
    };
  }

  async updateAlertRule(
    id: number,
    data: UpdateAlertRuleData
  ): Promise<AlertRule> {
    this.logger?.debug("MockAlerting: Updating alert rule", { id, data });

    const ruleId = `rule-${id}`;

    // Find and update rule
    for (const [, rules] of this.alertRules) {
      const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
      if (ruleIndex !== -1) {
        rules[ruleIndex] = { ...rules[ruleIndex], ...data };
        this.eventBus.emit("ALERT_RULE_UPDATED", rules[ruleIndex]);
        return {
          id,
          name: rules[ruleIndex].name,
          metric: rules[ruleIndex].metric,
          condition: rules[ruleIndex].condition,
          threshold: rules[ruleIndex].threshold,
          enabled: rules[ruleIndex].enabled,
          targetId: rules[ruleIndex].targetId,
          triggeredEvents: [],
        };
      }
    }

    throw new Error(`Alert rule ${id} not found`);
  }

  async deleteAlertRule(id: number): Promise<void> {
    this.logger?.debug("MockAlerting: Deleting alert rule", { id });

    const ruleId = `rule-${id}`;

    for (const [, rules] of this.alertRules) {
      const ruleIndex = rules.findIndex(rule => rule.id === ruleId);
      if (ruleIndex !== -1) {
        rules.splice(ruleIndex, 1);
        this.eventBus.emit("ALERT_RULE_DELETED", { id });
        return;
      }
    }

    throw new Error(`Alert rule ${id} not found`);
  }

  async getAlertRule(id: number): Promise<AlertRule | null> {
    this.logger?.debug("MockAlerting: Getting alert rule", { id });

    const ruleId = `rule-${id}`;

    for (const rules of this.alertRules.values()) {
      const rule = rules.find(rule => rule.id === ruleId);
      if (rule) {
        return {
          id,
          name: rule.name,
          metric: rule.metric,
          condition: rule.condition,
          threshold: rule.threshold,
          enabled: rule.enabled,
          targetId: rule.targetId,
          triggeredEvents: [],
        };
      }
    }

    return null;
  }

  async getAlertRulesByTargetId(targetId: string): Promise<AlertRule[]> {
    this.logger?.debug("MockAlerting: Getting alert rules by target ID", {
      targetId,
    });

    const rules = this.alertRules.get(targetId) || [];
    return rules.map(rule => ({
      id: parseInt(rule.id.replace("rule-", "")),
      name: rule.name,
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold,
      enabled: rule.enabled,
      targetId: rule.targetId,
      triggeredEvents: [],
    }));
  }

  async processSpeedTestResult(result: SpeedTestResult): Promise<void> {
    this.logger?.debug("MockAlerting: Processing speed test result", {
      result,
    });

    await this.checkAlertRules(result.targetId, result);
  }

  async checkAlertRules(
    targetId: string,
    result: SpeedTestResult
  ): Promise<void> {
    this.logger?.debug("MockAlerting: Checking alert rules", {
      targetId,
      result,
    });

    const rules = this.alertRules.get(targetId) || [];

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const shouldTrigger = this.shouldTriggerAlertForResult(rule, result);
      if (shouldTrigger) {
        await this.triggerAlert(rule, targetId, {
          targetId,
          result: result as unknown as MockSpeedTestResult,
          success: true,
        });
      }
    }
  }

  private shouldTriggerAlertForResult(
    rule: MockAlertRule,
    result: SpeedTestResult
  ): boolean {
    if (
      rule.metric === "ping" &&
      result.ping !== null &&
      result.ping !== undefined
    ) {
      if (rule.condition === "GREATER_THAN") {
        return result.ping > rule.threshold;
      } else {
        return result.ping < rule.threshold;
      }
    }

    if (
      rule.metric === "download" &&
      result.download !== null &&
      result.download !== undefined
    ) {
      if (rule.condition === "GREATER_THAN") {
        return result.download > rule.threshold;
      } else {
        return result.download < rule.threshold;
      }
    }

    return false;
  }

  async getIncidentsByTargetId(targetId: string): Promise<IncidentEvent[]> {
    this.logger?.debug("MockAlerting: Getting incidents by target ID", {
      targetId,
    });

    // Mock implementation - return empty array for now
    return [];
  }

  async getUnresolvedIncidents(): Promise<IncidentEvent[]> {
    this.logger?.debug("MockAlerting: Getting unresolved incidents");

    // Mock implementation - return empty array for now
    return [];
  }

  async resolveIncident(id: number): Promise<void> {
    this.logger?.debug("MockAlerting: Resolving incident", { id });

    // Mock implementation - no-op for now
  }

  async createIncident(data: {
    type: "OUTAGE" | "ALERT";
    description: string;
    targetId: string;
    ruleId?: number;
  }): Promise<IncidentEvent> {
    this.logger?.debug("MockAlerting: Creating incident", data);

    // Mock implementation - return a mock incident
    return {
      id: Date.now(),
      timestamp: new Date(),
      type: data.type,
      description: data.description,
      resolved: false,
      targetId: data.targetId,
      ruleId: data.ruleId,
      triggeredByRule: null, // Add missing property
    };
  }

  // Base IService interface methods
  async getById(id: string | number): Promise<AlertRule | null> {
    return this.getAlertRule(typeof id === "string" ? parseInt(id) : id);
  }

  async getAll(limit?: number, offset?: number): Promise<AlertRule[]> {
    this.logger?.debug("MockAlerting: Getting all alert rules", {
      limit,
      offset,
    });

    const allRules: AlertRule[] = [];
    for (const rules of this.alertRules.values()) {
      allRules.push(
        ...rules.map(rule => ({
          id: parseInt(rule.id.replace("rule-", "")),
          name: rule.name,
          metric: rule.metric,
          condition: rule.condition,
          threshold: rule.threshold,
          enabled: rule.enabled,
          targetId: rule.targetId,
          triggeredEvents: [],
        }))
      );
    }

    const start = offset || 0;
    const end = limit ? start + limit : allRules.length;
    return allRules.slice(start, end);
  }

  async create(data: CreateAlertRuleData): Promise<AlertRule> {
    return this.createAlertRule(data);
  }

  async update(
    id: string | number,
    data: UpdateAlertRuleData
  ): Promise<AlertRule> {
    return this.updateAlertRule(
      typeof id === "string" ? parseInt(id) : id,
      data
    );
  }

  async delete(id: string | number): Promise<void> {
    return this.deleteAlertRule(typeof id === "string" ? parseInt(id) : id);
  }

  // IObservableService interface methods
  on<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.on(event, handler);
  }

  off<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.off(event, handler);
  }

  emit<T = unknown>(event: string, data?: T): void {
    this.eventBus.emit(event, data);
  }

  // Mock-specific methods for testing
  getTriggeredAlerts(): MockTriggeredAlert[] {
    return [...this.triggeredAlerts];
  }

  clearTriggeredAlerts(): void {
    this.triggeredAlerts = [];
  }

  getAlertRuleCount(): number {
    let count = 0;
    for (const rules of this.alertRules.values()) {
      count += rules.length;
    }
    return count;
  }

  clearAlertRules(): void {
    this.alertRules.clear();
  }
}
