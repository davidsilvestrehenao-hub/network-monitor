import type { SpeedTestResult } from "./ITargetRepository";

export interface CreateSpeedTestData {
  targetId: string;
  ping?: number;
  download?: number;
  status: "SUCCESS" | "FAILURE";
  error?: string;
  downloadUrl?: string;
}

export interface SpeedTestQuery {
  targetId?: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ISpeedTestRepository {
  create(data: CreateSpeedTestData): Promise<SpeedTestResult>;
  findByTargetId(targetId: string, limit?: number): Promise<SpeedTestResult[]>;
  findLatestByTargetId(targetId: string): Promise<SpeedTestResult | null>;
  findByQuery(query: SpeedTestQuery): Promise<SpeedTestResult[]>;
  deleteByTargetId(targetId: string): Promise<void>;
  deleteOldResults(olderThan: Date): Promise<number>;
  count(): Promise<number>;
}
