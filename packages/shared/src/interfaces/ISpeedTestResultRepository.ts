// Domain types for SpeedTestResult entity
export interface SpeedTestResult {
  id: number;
  ping: number | null;
  download: number | null;
  status: "SUCCESS" | "FAILURE";
  error: string | null;
  createdAt: Date;
  targetId: string;
}

export interface CreateSpeedTestResultData {
  targetId: string;
  ping?: number;
  download?: number;
  status: "SUCCESS" | "FAILURE";
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
export interface ISpeedTestResultRepository {
  // Query methods
  findById(id: number): Promise<SpeedTestResult | null>;
  findByTargetId(targetId: string, limit?: number): Promise<SpeedTestResult[]>;
  findLatestByTargetId(targetId: string): Promise<SpeedTestResult | null>;
  findByQuery(query: SpeedTestResultQuery): Promise<SpeedTestResult[]>;
  getAll(limit?: number, offset?: number): Promise<SpeedTestResult[]>;
  count(): Promise<number>;

  // Command methods
  create(data: CreateSpeedTestResultData): Promise<SpeedTestResult>;
  update(
    id: number,
    data: Partial<CreateSpeedTestResultData>
  ): Promise<SpeedTestResult>;
  delete(id: number): Promise<void>;
  deleteByTargetId(targetId: string): Promise<void>;
  deleteOldResults(olderThan: Date): Promise<number>;
}
