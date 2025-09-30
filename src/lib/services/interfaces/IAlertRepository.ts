import type { AlertRule } from "./ITargetRepository";

export interface CreateAlertRuleData {
  name: string;
  metric: "ping" | "download";
  condition: "GREATER_THAN" | "LESS_THAN";
  threshold: number;
  enabled?: boolean;
  targetId: string;
}

export interface UpdateAlertRuleData {
  name?: string;
  metric?: "ping" | "download";
  condition?: "GREATER_THAN" | "LESS_THAN";
  threshold?: number;
  enabled?: boolean;
}

export interface IncidentEvent {
  id: number;
  timestamp: Date;
  type: "OUTAGE" | "ALERT";
  description: string;
  resolved: boolean;
  targetId: string;
  ruleId?: number;
}

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
