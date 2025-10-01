import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
} from "./ITargetRepository";

export interface SpeedTestConfig {
  targetId: string;
  target: string; // URL or address to test
  timeout?: number;
  downloadUrl?: string;
}

export interface IMonitorService {
  // Target management
  createTarget(data: CreateTargetData): Promise<Target>;
  getTarget(id: string): Promise<Target | null>;
  getTargets(userId: string): Promise<Target[]>;
  getAllTargets(): Promise<Target[]>;
  updateTarget(id: string, data: UpdateTargetData): Promise<Target>;
  deleteTarget(id: string): Promise<void>;

  // Monitoring operations
  runSpeedTest(config: SpeedTestConfig): Promise<SpeedTestResult>;
  startMonitoring(targetId: string, intervalMs: number): void;
  stopMonitoring(targetId: string): void;
  getActiveTargets(): string[];
  getTargetResults(
    targetId: string,
    limit?: number
  ): Promise<SpeedTestResult[]>;
}
