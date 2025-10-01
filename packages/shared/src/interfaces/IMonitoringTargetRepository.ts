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
export interface IMonitoringTargetRepository
  extends IRepository<
    MonitoringTarget,
    CreateMonitoringTargetData,
    UpdateMonitoringTargetData
  > {
  // Domain-specific query methods
  findByOwnerId(ownerId: string): Promise<MonitoringTarget[]>;

  // Domain-specific command methods
  update(
    id: string,
    data: UpdateMonitoringTargetData
  ): Promise<MonitoringTarget>;
}

// Import related types
import type { SpeedTestResult } from "./ISpeedTestResultRepository";
import type { IncidentEvent } from "./IIncidentEventRepository";
import type { AlertRule } from "./IAlertRuleRepository";
import type { IRepository } from "./base/IRepository";
