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
export interface IIncidentEventRepository {
  // Query methods
  findById(id: number): Promise<IncidentEvent | null>;
  findByTargetId(targetId: string, limit?: number): Promise<IncidentEvent[]>;
  findByQuery(query: IncidentEventQuery): Promise<IncidentEvent[]>;
  getUnresolvedByTargetId(targetId: string): Promise<IncidentEvent[]>;
  findUnresolved(): Promise<IncidentEvent[]>;
  getAll(limit?: number, offset?: number): Promise<IncidentEvent[]>;
  count(): Promise<number>;

  // Command methods
  create(data: CreateIncidentEventData): Promise<IncidentEvent>;
  update(id: number, data: UpdateIncidentEventData): Promise<IncidentEvent>;
  delete(id: number): Promise<void>;
  deleteByTargetId(targetId: string): Promise<void>;
  resolve(id: number): Promise<IncidentEvent>;
  resolveByTargetId(targetId: string): Promise<number>;
}

// Forward declaration to avoid circular imports
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
