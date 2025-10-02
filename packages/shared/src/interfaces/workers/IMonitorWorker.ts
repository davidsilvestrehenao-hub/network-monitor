import type { IWorker, WorkerConfig } from "../infrastructure/IWorker";

/**
 * Monitor Worker Interface
 *
 * Handles continuous monitoring of targets in the background.
 * Listens to monitoring control events and executes speed tests.
 */
export interface IMonitorWorker extends IWorker {
  // Target monitoring control
  addTarget(config: MonitoringTargetConfig): Promise<void>;
  removeTarget(targetId: string): Promise<void>;
  updateTargetConfig(
    targetId: string,
    config: Partial<MonitoringTargetConfig>
  ): Promise<void>;

  // Monitoring operations
  startTargetMonitoring(targetId: string): Promise<void>;
  stopTargetMonitoring(targetId: string): Promise<void>;
  pauseTargetMonitoring(targetId: string): Promise<void>;
  resumeTargetMonitoring(targetId: string): Promise<void>;

  // Status and statistics
  getActiveTargets(): string[];
  getMonitoringStats(): MonitoringStats;

  // Manual operations
  runImmediateTest(targetId: string): Promise<void>;
}

export interface MonitoringTargetConfig {
  targetId: string;
  targetAddress: string;
  intervalMs: number;
  enabled: boolean;
  maxFailures?: number;
  timeout?: number;
}

export interface MonitoringStats {
  totalTargets: number;
  activeTargets: number;
  pausedTargets: number;
  failedTargets: number;
  totalTests: number;
  successfulTests: number;
  failedTests: number;
  averageResponseTime: number;
}

export interface MonitorWorkerConfig extends WorkerConfig {
  defaultInterval: number;
  maxConcurrentTests: number;
  testTimeout: number;
  retryAttempts: number;
}
