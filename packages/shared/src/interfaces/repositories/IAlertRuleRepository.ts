// Import domain types
import type { AlertRule } from "../../types/standardized-domain-types";
import type { ISimpleRepository } from "../base/ISimpleRepository";

export interface CreateAlertRuleData {
  name: string;
  metric: "ping" | "download" | "upload" | "status";
  condition: "GREATER_THAN" | "LESS_THAN" | "EQUALS" | "NOT_EQUALS";
  threshold: number;
  enabled?: boolean;
  targetId: string;
}

export interface UpdateAlertRuleData {
  name?: string;
  metric?: "ping" | "download" | "upload" | "status";
  condition?: "GREATER_THAN" | "LESS_THAN" | "EQUALS" | "NOT_EQUALS";
  threshold?: number;
  enabled?: boolean;
}

export interface AlertRuleQuery {
  targetId?: string;
  enabled?: boolean;
  metric?: "ping" | "download" | "upload" | "status";
  limit?: number;
  offset?: number;
}

// Repository interface
export interface IAlertRuleRepository
  extends ISimpleRepository<
    AlertRule,
    CreateAlertRuleData,
    UpdateAlertRuleData
  > {
  // Domain-specific query methods
  findByTargetId(targetId: string): Promise<AlertRule[]>;
  findByQuery(query: AlertRuleQuery): Promise<AlertRule[]>;

  // Domain-specific command methods
  deleteByTargetId(targetId: string): Promise<void>;
  toggleEnabled(id: string, enabled: boolean): Promise<AlertRule>;
}

// Re-export types for external use
export type { AlertRule };
