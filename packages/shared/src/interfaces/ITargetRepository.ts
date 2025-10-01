// Domain types
export interface Target {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  speedTestResults: SpeedTestResult[];
  alertRules: AlertRule[];
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

export interface SpeedTestResult {
  id: string;  // Changed to string for crypto.randomUUID()
  targetId: string;
  ping: number | null;
  download: number | null;
  upload: number | null;
  status: "SUCCESS" | "FAILURE";
  error?: string;  // Made optional
  timestamp: string;  // ISO string timestamp
  createdAt: string;  // ISO string timestamp
}

export interface AlertRule {
  id: number;
  name: string;
  metric: "ping" | "download";
  condition: "GREATER_THAN" | "LESS_THAN";
  threshold: number;
  enabled: boolean;
  targetId: string;
}

export interface ITargetRepository {
  findById(id: string): Promise<Target | null>;
  findByUserId(userId: string): Promise<Target[]>;
  create(data: CreateTargetData): Promise<Target>;
  update(id: string, data: UpdateTargetData): Promise<Target>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  getAll(limit?: number, offset?: number): Promise<Target[]>;
}
