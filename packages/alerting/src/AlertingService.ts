import type { IAlertingService } from "@network-monitor/shared";
import type { IAlertRuleRepository } from "@network-monitor/shared";
import type { IIncidentEventRepository } from "@network-monitor/shared";
import type { IEventBus } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";
import type {
  AlertRule,
  CreateAlertRuleData,
  UpdateAlertRuleData,
} from "@network-monitor/shared";
import type { IncidentEvent } from "@network-monitor/shared";
import type { SpeedTestResult } from "@network-monitor/shared";

export class AlertingService implements IAlertingService {
  private alertRuleRepository: IAlertRuleRepository;
  private incidentEventRepository: IIncidentEventRepository;
  private eventBus: IEventBus;
  private logger: ILogger;

  constructor(
    alertRuleRepository: IAlertRuleRepository,
    incidentEventRepository: IIncidentEventRepository,
    eventBus: IEventBus,
    logger: ILogger
  ) {
    this.alertRuleRepository = alertRuleRepository;
    this.incidentEventRepository = incidentEventRepository;
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.on(
      "ALERT_RULE_CREATE_REQUESTED",
      this.handleAlertRuleCreateRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "ALERT_RULE_UPDATE_REQUESTED",
      this.handleAlertRuleUpdateRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "ALERT_RULE_DELETE_REQUESTED",
      this.handleAlertRuleDeleteRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "SPEED_TEST_COMPLETED",
      this.handleSpeedTestCompleted.bind(this) as (data?: unknown) => void
    );
  }

  async createAlertRule(data: CreateAlertRuleData): Promise<AlertRule> {
    this.logger.debug("AlertingService: Creating alert rule", { data });

    try {
      const rule = await this.alertRuleRepository.create(data);
      this.eventBus.emit("ALERT_RULE_CREATED", {
        id: rule.id,
        targetId: rule.targetId,
        rule: rule,
      });
      return rule;
    } catch (error) {
      this.logger.error("AlertingService: Alert rule creation failed", {
        error,
        data,
      });
      throw error;
    }
  }

  async getAlertRule(id: number): Promise<AlertRule | null> {
    this.logger.debug("AlertingService: Getting alert rule", { id });
    return await this.alertRuleRepository.findById(id);
  }

  async getAlertRulesByTargetId(targetId: string): Promise<AlertRule[]> {
    this.logger.debug("AlertingService: Getting alert rules by target ID", {
      targetId,
    });
    return await this.alertRuleRepository.findByTargetId(targetId);
  }

  async updateAlertRule(
    id: number,
    data: UpdateAlertRuleData
  ): Promise<AlertRule> {
    this.logger.debug("AlertingService: Updating alert rule", { id, data });

    try {
      const rule = await this.alertRuleRepository.update(id, data);
      this.eventBus.emit("ALERT_RULE_UPDATED", {
        id: rule.id,
        rule: rule,
      });
      return rule;
    } catch (error) {
      this.logger.error("AlertingService: Alert rule update failed", {
        error,
        id,
        data,
      });
      throw error;
    }
  }

  async deleteAlertRule(id: number): Promise<void> {
    this.logger.debug("AlertingService: Deleting alert rule", { id });

    try {
      await this.alertRuleRepository.delete(id);
      this.eventBus.emit("ALERT_RULE_DELETED", { id });
    } catch (error) {
      this.logger.error("AlertingService: Alert rule deletion failed", {
        error,
        id,
      });
      throw error;
    }
  }

  async toggleAlertRule(id: number, enabled: boolean): Promise<AlertRule> {
    this.logger.debug("AlertingService: Toggling alert rule", { id, enabled });

    try {
      const rule = await this.alertRuleRepository.toggleEnabled(id, enabled);
      this.eventBus.emit("ALERT_RULE_UPDATED", {
        id: rule.id,
        rule: rule,
      });
      return rule;
    } catch (error) {
      this.logger.error("AlertingService: Alert rule toggle failed", {
        error,
        id,
        enabled,
      });
      throw error;
    }
  }

  async getIncidentsByTargetId(targetId: string): Promise<IncidentEvent[]> {
    this.logger.debug("AlertingService: Getting incidents by target ID", {
      targetId,
    });
    return await this.incidentEventRepository.findByTargetId(targetId);
  }

  async resolveIncident(id: number): Promise<void> {
    this.logger.debug("AlertingService: Resolving incident", { id });

    try {
      await this.incidentEventRepository.resolve(id);
      this.eventBus.emit("INCIDENT_RESOLVED", {
        id,
      });
    } catch (error) {
      this.logger.error("AlertingService: Incident resolution failed", {
        error,
        id,
      });
      throw error;
    }
  }

  async getUnresolvedIncidents(): Promise<IncidentEvent[]> {
    this.logger.debug("AlertingService: Getting unresolved incidents");
    return await this.incidentEventRepository.findUnresolved();
  }

  async processSpeedTestResult(result: SpeedTestResult): Promise<void> {
    this.logger.debug("AlertingService: Processing speed test result", {
      targetId: result.targetId,
      status: result.status,
    });
    await this.evaluateSpeedTestResult(result);
  }

  async checkAlertRules(
    targetId: string,
    result: SpeedTestResult
  ): Promise<void> {
    this.logger.debug("AlertingService: Checking alert rules", { targetId });
    await this.evaluateSpeedTestResult(result);
  }

  async createIncident(data: {
    type: "OUTAGE" | "ALERT";
    description: string;
    targetId: string;
    ruleId?: number;
  }): Promise<IncidentEvent> {
    this.logger.debug("AlertingService: Creating incident", data);

    try {
      const incident = await this.incidentEventRepository.create(data);
      this.eventBus.emit("INCIDENT_CREATED", {
        id: incident.id,
        targetId: incident.targetId,
        type: incident.type,
        description: incident.description,
      });
      return incident;
    } catch (error) {
      this.logger.error("AlertingService: Incident creation failed", {
        error,
        data,
      });
      throw error;
    }
  }

  async evaluateSpeedTestResult(result: SpeedTestResult): Promise<void> {
    this.logger.debug("AlertingService: Evaluating speed test result", {
      targetId: result.targetId,
      status: result.status,
    });

    try {
      // Get all alert rules for this target
      const rules = await this.alertRuleRepository.findByTargetId(
        result.targetId
      );

      // Only evaluate enabled rules
      const enabledRules = rules.filter(rule => rule.enabled);

      for (const rule of enabledRules) {
        await this.evaluateRule(rule, result);
      }
    } catch (error) {
      this.logger.error("AlertingService: Speed test evaluation failed", {
        error,
        targetId: result.targetId,
      });
    }
  }

  private async evaluateRule(
    rule: AlertRule,
    result: SpeedTestResult
  ): Promise<void> {
    this.logger.debug("AlertingService: Evaluating rule", {
      ruleId: rule.id,
      metric: rule.metric,
      condition: rule.condition,
      threshold: rule.threshold,
    });

    try {
      let value: number | null = null;

      // Get the metric value based on the rule
      if (rule.metric === "ping") {
        value = result.ping;
      } else if (rule.metric === "download") {
        value = result.download;
      }

      // Skip if we don't have the required metric value
      if (value === null) {
        this.logger.debug("AlertingService: No value for metric", {
          ruleId: rule.id,
          metric: rule.metric,
        });
        return;
      }

      // Check if the rule condition is met
      let conditionMet = false;
      if (rule.condition === "GREATER_THAN") {
        conditionMet = value > rule.threshold;
      } else if (rule.condition === "LESS_THAN") {
        conditionMet = value < rule.threshold;
      }

      if (conditionMet) {
        await this.createAlertIncident(rule, result, value);
      }
    } catch (error) {
      this.logger.error("AlertingService: Rule evaluation failed", {
        error,
        ruleId: rule.id,
      });
    }
  }

  private async createAlertIncident(
    rule: AlertRule,
    result: SpeedTestResult,
    value: number
  ): Promise<void> {
    this.logger.info("AlertingService: Creating incident", {
      ruleId: rule.id,
      targetId: result.targetId,
      value,
      threshold: rule.threshold,
    });

    try {
      const incident = await this.incidentEventRepository.create({
        targetId: result.targetId,
        type: "ALERT",
        description: `Alert triggered: ${rule.metric} ${rule.condition} ${rule.threshold} (actual: ${value})`,
        ruleId: rule.id,
      });

      this.eventBus.emit("ALERT_TRIGGERED", {
        targetId: result.targetId,
        ruleId: rule.id,
        value,
        threshold: rule.threshold,
      });

      this.eventBus.emit("INCIDENT_CREATED", {
        id: incident.id,
        targetId: incident.targetId,
        type: incident.type,
        description: incident.description,
      });
    } catch (error) {
      this.logger.error("AlertingService: Incident creation failed", {
        error,
        ruleId: rule.id,
        targetId: result.targetId,
      });
    }
  }

  private async handleAlertRuleCreateRequested(data: {
    targetId: string;
    rule: unknown;
  }): Promise<void> {
    await this.createAlertRule(data.rule as CreateAlertRuleData);
  }

  private async handleAlertRuleUpdateRequested(data: {
    id: number;
    rule: unknown;
  }): Promise<void> {
    await this.updateAlertRule(data.id, data.rule as UpdateAlertRuleData);
  }

  private async handleAlertRuleDeleteRequested(data: {
    id: number;
  }): Promise<void> {
    await this.deleteAlertRule(data.id);
  }

  private async handleSpeedTestCompleted(data: {
    targetId: string;
    result: unknown;
  }): Promise<void> {
    await this.evaluateSpeedTestResult(data.result as SpeedTestResult);
  }
}
