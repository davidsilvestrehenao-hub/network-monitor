// Domain types for IncidentEvent entity
export interface IncidentEvent {
  id: number;
  timestamp: Date;
  type: "OUTAGE" | "ALERT";
  description: string;
  resolved: boolean;
  targetId: string;
  ruleId?: number;
  triggeredByRule: AlertRule | null;
}

export interface CreateIncidentEventData {
  type: "OUTAGE" | "ALERT";
  description: string;
  targetId: string;
  ruleId?: number;
}

export interface UpdateIncidentEventData {
  description?: string;
  resolved?: boolean;
}

export interface IncidentEventQuery {
  targetId?: string;
  type?: "OUTAGE" | "ALERT";
  resolved?: boolean;
  ruleId?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// Repository interface
export interface IIncidentEventRepository
  extends IRepository<
    IncidentEvent,
    CreateIncidentEventData,
    UpdateIncidentEventData
  > {
  // Domain-specific query methods
  findByTargetId(targetId: string, limit?: number): Promise<IncidentEvent[]>;
  findByQuery(query: IncidentEventQuery): Promise<IncidentEvent[]>;
  getUnresolvedByTargetId(targetId: string): Promise<IncidentEvent[]>;
  findUnresolved(): Promise<IncidentEvent[]>;

  // Domain-specific command methods
  deleteByTargetId(targetId: string): Promise<void>;
  resolve(id: number): Promise<IncidentEvent>;
  resolveByTargetId(targetId: string): Promise<number>;
}

// Import AlertRule from canonical source to avoid duplication
import type { AlertRule } from "./IAlertRuleRepository";
import type { IRepository } from "./base/IRepository";
