// Import domain types
import type { SpeedTestResult } from "../../types/standardized-domain-types";

// Re-export for backward compatibility
// SpeedTestResult is now exported from standardized-domain-types.ts

export interface CreateSpeedTestResultData {
  targetId: string;
  ping: number | null;
  download: number | null;
  upload: number | null;
  status: "SUCCESS" | "FAILURE";
  error?: string;
}

export interface UpdateSpeedTestResultData {
  ping?: number | null;
  download?: number | null;
  upload?: number | null;
  status?: "SUCCESS" | "FAILURE";
  error?: string;
}

export interface SpeedTestResultQuery {
  targetId?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  status?: "SUCCESS" | "FAILURE";
}

// Repository interface
export interface ISpeedTestResultRepository
  extends ISimpleRepository<
    SpeedTestResult,
    CreateSpeedTestResultData,
    UpdateSpeedTestResultData
  > {
  // Domain-specific query methods
  findByTargetId(targetId: string, limit?: number): Promise<SpeedTestResult[]>;
  findLatestByTargetId(targetId: string): Promise<SpeedTestResult | null>;
  findByQuery(query: SpeedTestResultQuery): Promise<SpeedTestResult[]>;

  // Domain-specific command methods
  update(
    id: string,
    data: Partial<CreateSpeedTestResultData>
  ): Promise<SpeedTestResult>;
  deleteByTargetId(targetId: string): Promise<void>;
  deleteOldResults(olderThan: Date): Promise<number>;
}

// Import base repository interface
import type { ISimpleRepository } from "../base/ISimpleRepository";

// Re-export domain types for external use
export type { SpeedTestResult };
