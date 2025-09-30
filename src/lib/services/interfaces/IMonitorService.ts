import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
} from "./ITargetRepository";

export interface SpeedTestConfig {
  targetId: string;
  timeout?: number;
}

export interface IMonitorService {
  // Target management
  createTarget(data: CreateTargetData): Promise<Target>;
  getTarget(id: string): Promise<Target | null>;
  getTargets(userId: string): Promise<Target[]>;
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
