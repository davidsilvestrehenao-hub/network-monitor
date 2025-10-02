import type { IUserOwnedService, IObservableService } from "../base/IService";
import type {
  Target,
  SpeedTestResult,
} from "../../types/standardized-domain-types";
import type {
  CreateTargetData,
  UpdateTargetData,
} from "../repositories/ITargetRepository";

/**
 * Traditional service interface for monitoring operations.
 * Follows Router → Service → Repository pattern.
 * Used by tRPC procedures and frontend components.
 */
export interface IMonitoringService
  extends IUserOwnedService<Target, CreateTargetData, UpdateTargetData>,
    IObservableService {
  // Speed test operations
  runSpeedTest(targetId: string): Promise<SpeedTestResult>;
  getSpeedTestResults(
    targetId: string,
    limit?: number
  ): Promise<SpeedTestResult[]>;
  getLatestSpeedTestResult(targetId: string): Promise<SpeedTestResult | null>;

  // Target status operations
  getTargetStatus(targetId: string): Promise<TargetStatus>;
  getAllTargetStatuses(userId: string): Promise<TargetStatus[]>;

  // Monitoring control (emits events to microservices)
  startMonitoring(targetId: string, intervalMs?: number): Promise<void>;
  stopMonitoring(targetId: string): Promise<void>;
  pauseMonitoring(targetId: string): Promise<void>;
  resumeMonitoring(targetId: string): Promise<void>;

  // Bulk operations
  startAllMonitoring(userId: string): Promise<void>;
  stopAllMonitoring(userId: string): Promise<void>;
}

export interface TargetStatus {
  targetId: string;
  isMonitoring: boolean;
  isPaused: boolean;
  lastTestAt?: Date;
  nextTestAt?: Date;
  consecutiveFailures: number;
  status: "healthy" | "warning" | "critical" | "unknown";
}
