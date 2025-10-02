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
import type { StandardizedIncidentEvent } from "@network-monitor/shared";
import type { StandardizedSpeedTestResult } from "@network-monitor/shared";
import type {
  AlertRuleCreateRequestData,
  AlertRuleUpdateRequestData,
  AlertRuleDeleteRequestData,
  SpeedTestCompletedEventData,
} from "@network-monitor/shared";
import {
  EventKeys,
  AlertConditions,
  MonitoringMetrics,
  IncidentTypes,
  EntityStatus,
} from "@network-monitor/shared";

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
    this.eventBus.onDynamic(
      EventKeys.ALERT_RULE_CREATE_REQUESTED,
      this.handleAlertRuleCreateRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.onDynamic(
      EventKeys.ALERT_RULE_UPDATE_REQUESTED,
      this.handleAlertRuleUpdateRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.onDynamic(
      EventKeys.ALERT_RULE_DELETE_REQUESTED,
      this.handleAlertRuleDeleteRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.onDynamic(
      EventKeys.SPEED_TEST_COMPLETED,
      this.handleSpeedTestCompleted.bind(this) as (data?: unknown) => void
    );
  }

  async getAlertRulesByTargetId(targetId: string): Promise<AlertRule[]> {
    this.logger.debug("AlertingService: Getting alert rules by target ID", {
      targetId,
    });
    return await this.alertRuleRepository.findByTargetId(targetId);
  }

  async toggleAlertRule(id: string, enabled: boolean): Promise<AlertRule> {
    this.logger.debug("AlertingService: Toggling alert rule", { id, enabled });

    try {
      const rule = await this.alertRuleRepository.toggleEnabled(id, enabled);
      this.eventBus.emitDynamic(EventKeys.ALERT_RULE_UPDATED, {
        id: rule.id,
        rule: rule,
        previousData: { enabled: !enabled },
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

  async getIncidentsByTargetId(
    targetId: string
  ): Promise<StandardizedIncidentEvent[]> {
    this.logger.debug("AlertingService: Getting incidents by target ID", {
      targetId,
    });
    const incidents =
      await this.incidentEventRepository.findByTargetId(targetId);
    return incidents.map(this.mapToStandardizedIncident);
  }

  async resolveIncident(id: string): Promise<void> {
    this.logger.debug("AlertingService: Resolving incident", { id });

    try {
      const incident = await this.incidentEventRepository.findById(id);
      await this.incidentEventRepository.resolve(id);
      const resolvedAt = new Date();
      const createdAt = incident?.timestamp
        ? new Date(incident.timestamp)
        : new Date();
      const duration = resolvedAt.getTime() - createdAt.getTime();

      this.eventBus.emitDynamic(EventKeys.INCIDENT_RESOLVED, {
        id,
        targetId: incident?.targetId || "unknown",
        resolvedAt,
        duration,
      });
    } catch (error) {
      this.logger.error("AlertingService: Incident resolution failed", {
        error,
        id,
      });
      throw error;
    }
  }

  async getUnresolvedIncidents(): Promise<StandardizedIncidentEvent[]> {
    this.logger.debug("AlertingService: Getting unresolved incidents");
    const incidents = await this.incidentEventRepository.findUnresolved();
    return incidents.map(this.mapToStandardizedIncident);
  }

  async processSpeedTestResult(
    result: StandardizedSpeedTestResult
  ): Promise<void> {
    this.logger.debug("AlertingService: Processing speed test result", {
      targetId: result.targetId,
      status: result.status,
    });
    await this.evaluateSpeedTestResult(result);
  }

  async checkAlertRules(
    targetId: string,
    result: StandardizedSpeedTestResult
  ): Promise<void> {
    this.logger.debug("AlertingService: Checking alert rules", { targetId });
    await this.evaluateSpeedTestResult(result);
  }

  async createIncident(data: {
    type: typeof IncidentTypes.OUTAGE | typeof IncidentTypes.ALERT;
    description: string;
    targetId: string;
    ruleId?: string;
  }): Promise<StandardizedIncidentEvent> {
    this.logger.debug("AlertingService: Creating incident", data);

    try {
      const incident = await this.incidentEventRepository.create(data);
      this.eventBus.emitDynamic(EventKeys.INCIDENT_CREATED, {
        id: incident.id,
        targetId: incident.targetId,
        type: incident.type,
        description: incident.description,
        ruleId: incident.ruleId,
        createdAt: new Date(),
      });
      return this.mapToStandardizedIncident(incident);
    } catch (error) {
      this.logger.error("AlertingService: Incident creation failed", {
        error,
        data,
      });
      throw error;
    }
  }

  async evaluateSpeedTestResult(
    result: StandardizedSpeedTestResult
  ): Promise<void> {
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
    result: StandardizedSpeedTestResult
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
      if (rule.metric === MonitoringMetrics.PING) {
        value = result.ping ?? null;
      } else if (rule.metric === MonitoringMetrics.DOWNLOAD) {
        value = result.download ?? null;
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
      if (rule.condition === AlertConditions.GREATER_THAN) {
        conditionMet = value > rule.threshold;
      } else if (rule.condition === AlertConditions.LESS_THAN) {
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
    result: StandardizedSpeedTestResult,
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
        type: IncidentTypes.ALERT,
        description: `Alert triggered: ${rule.metric} ${rule.condition} ${rule.threshold} (actual: ${value})`,
        ruleId: rule.id,
      });

      this.eventBus.emitDynamic(EventKeys.ALERT_TRIGGERED, {
        targetId: result.targetId,
        ruleId: rule.id,
        ruleName: rule.name,
        metric: rule.metric,
        value,
        threshold: rule.threshold,
        condition: rule.condition,
        triggeredAt: new Date(),
      });

      this.eventBus.emitDynamic(EventKeys.INCIDENT_CREATED, {
        id: incident.id,
        targetId: incident.targetId,
        type: incident.type,
        description: incident.description,
        ruleId: incident.ruleId,
        createdAt: new Date(),
      });
    } catch (error) {
      this.logger.error("AlertingService: Incident creation failed", {
        error,
        ruleId: rule.id,
        targetId: result.targetId,
      });
    }
  }

  private async handleAlertRuleCreateRequested(
    data: AlertRuleCreateRequestData
  ): Promise<void> {
    await this.createAlertRule(data.rule);
  }

  private async handleAlertRuleUpdateRequested(
    data: AlertRuleUpdateRequestData
  ): Promise<void> {
    await this.updateAlertRule(data.id.toString(), data.rule);
  }

  private async handleAlertRuleDeleteRequested(
    data: AlertRuleDeleteRequestData
  ): Promise<void> {
    await this.deleteAlertRule(data.id.toString());
  }

  private async handleSpeedTestCompleted(
    data: SpeedTestCompletedEventData
  ): Promise<void> {
    await this.evaluateSpeedTestResult(data.result);
  }

  // Domain-specific alert rule methods
  async createAlertRule(data: CreateAlertRuleData): Promise<AlertRule> {
    this.logger.debug("AlertingService: Creating alert rule", { data });

    try {
      const rule = await this.alertRuleRepository.create(data);
      this.eventBus.emitDynamic(EventKeys.ALERT_RULE_CREATED, {
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

  async getAlertRule(id: string): Promise<AlertRule | null> {
    this.logger.debug("AlertingService: Getting alert rule", { id });
    return await this.alertRuleRepository.findById(id);
  }

  async updateAlertRule(
    id: string,
    data: UpdateAlertRuleData
  ): Promise<AlertRule> {
    this.logger.debug("AlertingService: Updating alert rule", { id, data });

    try {
      const rule = await this.alertRuleRepository.update(id, data);
      this.eventBus.emitDynamic(EventKeys.ALERT_RULE_UPDATED, {
        id: rule.id,
        rule: rule,
        previousData: data,
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

  async deleteAlertRule(id: string): Promise<void> {
    this.logger.debug("AlertingService: Deleting alert rule", { id });

    try {
      const rule = await this.alertRuleRepository.findById(id);
      await this.alertRuleRepository.delete(id);
      this.eventBus.emitDynamic(EventKeys.ALERT_RULE_DELETED, {
        id,
        targetId: rule?.targetId || "unknown",
      });
    } catch (error) {
      this.logger.error("AlertingService: Alert rule deletion failed", {
        error,
        id,
      });
      throw error;
    }
  }

  // Base IService interface methods
  async getById(id: string | number): Promise<AlertRule | null> {
    this.logger.debug("AlertingService: Getting alert rule by ID", { id });
    return this.alertRuleRepository.findById(
      typeof id === "string" ? parseInt(id) : id
    );
  }

  async getAll(limit?: number, offset?: number): Promise<AlertRule[]> {
    this.logger.debug("AlertingService: Getting all alert rules", {
      limit,
      offset,
    });
    return this.alertRuleRepository.getAll(limit, offset);
  }

  async create(data: CreateAlertRuleData): Promise<AlertRule> {
    this.logger.debug("AlertingService: Creating alert rule", { data });
    return this.alertRuleRepository.create(data);
  }

  async update(
    id: string | number,
    data: UpdateAlertRuleData
  ): Promise<AlertRule> {
    this.logger.debug("AlertingService: Updating alert rule", { id, data });
    return this.alertRuleRepository.update(
      typeof id === "string" ? parseInt(id) : id,
      data
    );
  }

  async delete(id: string | number): Promise<void> {
    this.logger.debug("AlertingService: Deleting alert rule", { id });
    return this.alertRuleRepository.delete(
      typeof id === "string" ? parseInt(id) : id
    );
  }

  // IObservableService interface methods
  on<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.onDynamic(event, handler);
  }

  off<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.offDynamic(event, handler);
  }

  emit<T = unknown>(event: string, data?: T): void {
    this.eventBus.emitDynamic(event, data);
  }

  private mapToStandardizedIncident(incident: any): StandardizedIncidentEvent {
    return {
      id: incident.id,
      targetId: incident.targetId,
      ruleId: incident.ruleId,
      type: incident.type,
      severity: "MEDIUM", // Default severity
      description: incident.description,
      resolved: incident.resolved || false,
      resolvedAt: incident.resolvedAt || null,
      resolvedBy: incident.resolvedBy || null,
      duration: incident.duration || null,
      affectedUsers: incident.affectedUsers || null,
      rootCause: incident.rootCause || null,
      resolution: incident.resolution || null,
      status: EntityStatus.ACTIVE, // Default status
      createdAt: incident.createdAt || new Date().toISOString(),
      updatedAt: incident.updatedAt || new Date().toISOString(),
      deletedAt: incident.deletedAt || null,
      isActive: incident.isActive !== false,
      version: incident.version || 1,
    };
  }
}
