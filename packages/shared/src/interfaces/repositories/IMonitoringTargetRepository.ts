// Import domain types
import type { MonitoringTarget } from "../../types/standardized-domain-types";

// Re-export for backward compatibility
export type { MonitoringTarget };

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
  extends IUserOwnedSimpleRepository<
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

// Import base repository interface
import type { IUserOwnedSimpleRepository } from "../base/ISimpleRepository";
