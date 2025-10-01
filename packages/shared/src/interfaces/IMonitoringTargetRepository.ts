// Domain types for MonitoringTarget entity
export interface MonitoringTarget {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  speedTestResults: SpeedTestResult[];
  incidentEvents: IncidentEvent[];
  alertRules: AlertRule[];
}

export interface CreateMonitoringTargetData {
  name: string;
  address: string;
  ownerId: string;
}

export interface UpdateMonitoringTargetData {
  name?: string;
  address?: string;
}

// Repository interface
export interface IMonitoringTargetRepository {
  // Query methods
  findById(id: string): Promise<MonitoringTarget | null>;
  findByOwnerId(ownerId: string): Promise<MonitoringTarget[]>;
  getAll(limit?: number, offset?: number): Promise<MonitoringTarget[]>;
  count(): Promise<number>;

  // Command methods
  create(data: CreateMonitoringTargetData): Promise<MonitoringTarget>;
  update(
    id: string,
    data: UpdateMonitoringTargetData
  ): Promise<MonitoringTarget>;
  delete(id: string): Promise<void>;
}

// Import related types
import type { SpeedTestResult } from "./ISpeedTestResultRepository";
import type { IncidentEvent } from "./IIncidentEventRepository";
import type { AlertRule } from "./IAlertRuleRepository";
