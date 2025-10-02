import type { IWorker, WorkerConfig } from "../infrastructure/IWorker";

/**
 * Alerting Worker Interface
 *
 * Handles alert rule evaluation and incident management in the background.
 * Listens to speed test results and evaluates alert conditions.
 */
export interface IAlertingWorker extends IWorker {
  // Alert rule management
  addAlertRule(config: AlertRuleConfig): Promise<void>;
  removeAlertRule(ruleId: string): Promise<void>;
  updateAlertRule(
    ruleId: string,
    config: Partial<AlertRuleConfig>
  ): Promise<void>;
  enableAlertRule(ruleId: string): Promise<void>;
  disableAlertRule(ruleId: string): Promise<void>;

  // Incident management
  resolveIncident(incidentId: string): Promise<void>;
  getActiveIncidents(): Promise<ActiveIncident[]>;

  // Statistics
  getAlertingStats(): AlertingStats;

  // Manual evaluation
  evaluateRulesForTarget(targetId: string): Promise<void>;
}

export interface AlertRuleConfig {
  ruleId: string;
  targetId: string;
  name: string;
  metric: "ping" | "download" | "upload";
  condition: "GREATER_THAN" | "LESS_THAN";
  threshold: number;
  enabled: boolean;
  cooldownMs?: number;
}

export interface ActiveIncident {
  incidentId: string;
  targetId: string;
  ruleId: string;
  type: "OUTAGE" | "ALERT";
  description: string;
  timestamp: Date;
  resolved: boolean;
}

export interface AlertingStats {
  totalRules: number;
  activeRules: number;
  disabledRules: number;
  totalIncidents: number;
  activeIncidents: number;
  resolvedIncidents: number;
  alertsTriggeredToday: number;
}

export interface AlertingWorkerConfig extends WorkerConfig {
  evaluationInterval: number;
  maxIncidentHistory: number;
  defaultCooldown: number;
}
