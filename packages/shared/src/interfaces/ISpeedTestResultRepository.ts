// Domain types for SpeedTestResult entity
export interface SpeedTestResult {
  id: string; // UUID from crypto.randomUUID()
  targetId: string;
  ping: number | null;
  download: number | null;
  upload: number | null;
  status: "SUCCESS" | "FAILURE";
  error?: string; // Optional error message
  timestamp: string; // ISO timestamp of when test was run
  createdAt: string; // ISO timestamp of when record was created
}

export interface CreateSpeedTestResultData {
  targetId: string;
  ping: number | null;
  download: number | null;
  upload: number | null;
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
  findById(id: string): Promise<SpeedTestResult | null>;
  findByTargetId(targetId: string, limit?: number): Promise<SpeedTestResult[]>;
  findLatestByTargetId(targetId: string): Promise<SpeedTestResult | null>;
  findByQuery(query: SpeedTestResultQuery): Promise<SpeedTestResult[]>;
  getAll(limit?: number, offset?: number): Promise<SpeedTestResult[]>;
  count(): Promise<number>;

  // Command methods
  create(data: CreateSpeedTestResultData): Promise<SpeedTestResult>;
  update(
    id: string,
    data: Partial<CreateSpeedTestResultData>
  ): Promise<SpeedTestResult>;
  delete(id: string): Promise<void>;
  deleteByTargetId(targetId: string): Promise<void>;
  deleteOldResults(olderThan: Date): Promise<number>;
}
