// Import domain types
import type { IncidentEvent } from "../../types/domain-types";

// Re-export for backward compatibility
export type { IncidentEvent };

export interface CreateIncidentEventData {
  type: "OUTAGE" | "ALERT";
  description: string;
  targetId: string;
  ruleId?: string; // Updated to match AlertRule.id (string)
}

export interface UpdateIncidentEventData {
  description?: string;
  resolved?: boolean;
}

export interface IncidentEventQuery {
  targetId?: string;
  type?: "OUTAGE" | "ALERT";
  resolved?: boolean;
  ruleId?: string; // Updated to match AlertRule.id (string)
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// Repository interface
export interface IIncidentEventRepository
  extends ISimpleRepository<
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
  resolve(id: string): Promise<IncidentEvent>;
  resolveByTargetId(targetId: string): Promise<number>;
}

import type { ISimpleRepository } from "../base/ISimpleRepository";
