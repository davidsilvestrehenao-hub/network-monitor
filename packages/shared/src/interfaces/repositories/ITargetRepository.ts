// Import from canonical sources to avoid duplication
import type {
  MonitoringTarget,
  SpeedTestResult,
  AlertRule,
  Target,
} from "../../types/domain-types";
import type { IUserOwnedSimpleRepository } from "../base/ISimpleRepository";

// Re-export for convenience - these are now exported by their individual repository files
// export type { SpeedTestResult, AlertRule };
// Note: Target is exported from standardized-domain-types.ts as an alias for MonitoringTarget

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
  extends IUserOwnedSimpleRepository<
    TargetData,
    CreateTargetData,
    UpdateTargetData
  > {
  // Aggregate methods (with relations) - specific to targets
  findByIdWithRelations(id: string): Promise<Target | null>;
  findByUserIdWithRelations(userId: string): Promise<Target[]>;
  getAllWithRelations(limit?: number, offset?: number): Promise<Target[]>;
}
