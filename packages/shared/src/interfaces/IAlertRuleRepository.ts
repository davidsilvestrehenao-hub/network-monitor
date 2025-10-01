// Domain types for AlertRule entity
export interface AlertRule {
  id: number;
  name: string;
  metric: "ping" | "download";
  condition: "GREATER_THAN" | "LESS_THAN";
  threshold: number;
  enabled: boolean;
  targetId: string;
  triggeredEvents: IncidentEvent[];
}

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

export interface AlertRuleQuery {
  targetId?: string;
  enabled?: boolean;
  metric?: "ping" | "download";
  limit?: number;
  offset?: number;
}

// Repository interface
export interface IAlertRuleRepository
  extends IRepository<AlertRule, CreateAlertRuleData, UpdateAlertRuleData> {
  // Domain-specific query methods
  findByTargetId(targetId: string): Promise<AlertRule[]>;
  findByQuery(query: AlertRuleQuery): Promise<AlertRule[]>;

  // Domain-specific command methods
  deleteByTargetId(targetId: string): Promise<void>;
  toggleEnabled(id: number, enabled: boolean): Promise<AlertRule>;
}

// Import IncidentEvent from canonical source to avoid duplication
import type { IncidentEvent } from "./IIncidentEventRepository";
import type { IRepository } from "./base/IRepository";
