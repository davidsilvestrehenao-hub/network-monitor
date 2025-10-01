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
export interface IAlertRuleRepository {
  // Query methods
  findById(id: number): Promise<AlertRule | null>;
  findByTargetId(targetId: string): Promise<AlertRule[]>;
  findByQuery(query: AlertRuleQuery): Promise<AlertRule[]>;
  getAll(limit?: number, offset?: number): Promise<AlertRule[]>;
  count(): Promise<number>;

  // Command methods
  create(data: CreateAlertRuleData): Promise<AlertRule>;
  update(id: number, data: UpdateAlertRuleData): Promise<AlertRule>;
  delete(id: number): Promise<void>;
  deleteByTargetId(targetId: string): Promise<void>;
  toggleEnabled(id: number, enabled: boolean): Promise<AlertRule>;
}

// Import IncidentEvent from canonical source to avoid duplication
import type { IncidentEvent } from "./IIncidentEventRepository";
