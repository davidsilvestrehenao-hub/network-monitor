import type { SpeedTestResult } from "./ISpeedTestResultRepository";

export interface CreateSpeedTestData {
  targetId: string;
  ping?: number;
  download?: number;
  upload?: number;
  status: "SUCCESS" | "FAILURE";
  error?: string;
  downloadUrl?: string;
}

export interface SpeedTestQuery {
  targetId?: string;
  status?: "SUCCESS" | "FAILURE";
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

// Import base repository interface
import type { ISimpleRepository } from "../base/ISimpleRepository";

export interface ISpeedTestRepository
  extends ISimpleRepository<SpeedTestResult, CreateSpeedTestData, never> {
  // Domain-specific query methods
  findByTargetId(targetId: string, limit?: number): Promise<SpeedTestResult[]>;
  findLatestByTargetId(targetId: string): Promise<SpeedTestResult | null>;
  findByQuery(query: SpeedTestQuery): Promise<SpeedTestResult[]>;

  // Domain-specific command methods
  deleteByTargetId(targetId: string): Promise<void>;
  deleteOldResults(olderThan: Date): Promise<number>;
}
