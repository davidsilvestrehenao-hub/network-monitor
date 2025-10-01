// Next-generation Monitor Service interface that extends base interfaces
// This can be adopted gradually without breaking existing implementations

import type {
  IUserOwnedService,
  IObservableService,
  IBackgroundService,
} from "../base/IService";
import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
} from "../ITargetRepository";

export interface SpeedTestConfig {
  targetId: string;
  target: string; // URL or address to test
  timeout?: number;
  downloadUrl?: string;
}

// Next-generation monitor service interface
export interface IMonitorServiceV2
  extends IUserOwnedService<Target, CreateTargetData, UpdateTargetData>,
    IObservableService,
    IBackgroundService {
  // Override base methods with specific return types
  getById(id: string): Promise<Target | null>;
  getAll(): Promise<Target[]>;
  create(data: CreateTargetData): Promise<Target>;
  update(id: string, data: UpdateTargetData): Promise<Target>;
  getByUserId(userId: string): Promise<Target[]>;

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

  // Additional monitoring-specific methods
  pauseMonitoring(targetId: string): void;
  resumeMonitoring(targetId: string): void;
  getMonitoringStatus(targetId: string): "active" | "paused" | "stopped";
  getMonitoringStats(): Promise<{
    totalTargets: number;
    activeTargets: number;
    pausedTargets: number;
    totalTests: number;
    averageResponseTime: number;
  }>;

  // Bulk operations
  startMonitoringAll(userId: string): Promise<void>;
  stopMonitoringAll(userId: string): Promise<void>;
  pauseMonitoringAll(userId: string): Promise<void>;
  resumeMonitoringAll(userId: string): Promise<void>;
}
