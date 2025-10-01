// Import from canonical sources to avoid duplication
import type { AlertRule, CreateAlertRuleData, UpdateAlertRuleData } from "./IAlertRuleRepository";
import type { IncidentEvent } from "./IIncidentEventRepository";

// Re-export for convenience
export type { AlertRule, CreateAlertRuleData, UpdateAlertRuleData, IncidentEvent };

export interface CreateIncidentData {
  type: "OUTAGE" | "ALERT";
  description: string;
  targetId: string;
  ruleId?: number;
}

export interface IAlertRepository {
  // Alert Rules
  createRule(data: CreateAlertRuleData): Promise<AlertRule>;
  findRuleById(id: number): Promise<AlertRule | null>;
  findRulesByTargetId(targetId: string): Promise<AlertRule[]>;
  updateRule(id: number, data: UpdateAlertRuleData): Promise<AlertRule>;
  deleteRule(id: number): Promise<void>;
  findEnabledRules(): Promise<AlertRule[]>;

  // Incidents
  createIncident(data: CreateIncidentData): Promise<IncidentEvent>;
  findIncidentById(id: number): Promise<IncidentEvent | null>;
  findIncidentsByTargetId(targetId: string): Promise<IncidentEvent[]>;
  findUnresolvedIncidents(): Promise<IncidentEvent[]>;
  resolveIncident(id: number): Promise<void>;
  deleteIncident(id: number): Promise<void>;
}
