// Import from canonical sources to avoid duplication
import type {
  AlertRule,
  CreateAlertRuleData,
  UpdateAlertRuleData,
} from "./IAlertRuleRepository";
import type { IncidentEvent } from "./IIncidentEventRepository";

// Note: Types are imported but not re-exported to avoid conflicts

export interface CreateIncidentData {
  type: "OUTAGE" | "ALERT";
  description: string;
  targetId: string;
  ruleId?: number;
}

// Import base repository interface
import type { ISimpleRepository } from "../base/ISimpleRepository";

export interface IAlertRepository
  extends ISimpleRepository<
    AlertRule,
    CreateAlertRuleData,
    UpdateAlertRuleData
  > {
  // Alert Rules
  createRule(data: CreateAlertRuleData): Promise<AlertRule>;
  findRuleById(id: string): Promise<AlertRule | null>;
  findRulesByTargetId(targetId: string): Promise<AlertRule[]>;
  updateRule(id: string, data: UpdateAlertRuleData): Promise<AlertRule>;
  deleteRule(id: string): Promise<void>;
  findEnabledRules(): Promise<AlertRule[]>;

  // Incidents
  createIncident(data: CreateIncidentData): Promise<IncidentEvent>;
  findIncidentById(id: string): Promise<IncidentEvent | null>;
  findIncidentsByTargetId(targetId: string): Promise<IncidentEvent[]>;
  findUnresolvedIncidents(): Promise<IncidentEvent[]>;
  resolveIncident(id: string): Promise<void>;
  deleteIncident(id: string): Promise<void>;
}

// Re-export DTO types for external use (domain types are exported from standardized-domain-types.ts)
export type { CreateAlertRuleData, UpdateAlertRuleData, IncidentEvent };
