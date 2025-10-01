import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
} from "./ITargetRepository";
import type {
  IUserOwnedService,
  IObservableService,
  IBackgroundService,
} from "./base/IService";

export interface SpeedTestConfig {
  targetId: string;
  target: string; // URL or address to test
  timeout?: number;
  downloadUrl?: string;
}

export interface IMonitorService
  extends IUserOwnedService<Target, CreateTargetData, UpdateTargetData>,
    IObservableService,
    IBackgroundService {
  // Target management (legacy methods for backward compatibility)
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
