// Import from canonical sources to avoid duplication
import type { SpeedTestResult } from "./ISpeedTestResultRepository";
import type { AlertRule } from "./IAlertRuleRepository";
import type { IUserOwnedRepository } from "./base/IRepository";

// Re-export for convenience
export type { SpeedTestResult, AlertRule };

// Domain types
export interface Target {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  speedTestResults: SpeedTestResult[];
  alertRules: AlertRule[];
}

// Basic target data without relations (for repository layer)
export interface TargetData {
  id: string;
  name: string;
  address: string;
  ownerId: string;
}

export interface CreateTargetData {
  name: string;
  address: string;
  ownerId: string;
}

export interface UpdateTargetData {
  name?: string;
  address?: string;
}

export interface ITargetRepository
  extends IUserOwnedRepository<TargetData, CreateTargetData, UpdateTargetData> {
  // Aggregate methods (with relations) - specific to targets
  findByIdWithRelations(id: string): Promise<Target | null>;
  findByUserIdWithRelations(userId: string): Promise<Target[]>;
  getAllWithRelations(limit?: number, offset?: number): Promise<Target[]>;
}
