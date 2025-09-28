export interface MonitoringTargetConfig {
  targetId: string;
  intervalMs: number;
  enabled: boolean;
  lastRun?: Date;
  nextRun?: Date;
  failureCount?: number;
  maxFailures?: number;
}

export interface SchedulerStats {
  totalTargets: number;
  activeTargets: number;
  pausedTargets: number;
  failedTargets: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageRunTime: number;
  uptime: number;
}

export interface IMonitoringScheduler {
  // Target management
  addTarget(config: MonitoringTargetConfig): void;
  removeTarget(targetId: string): void;
  updateTargetConfig(
    targetId: string,
    config: Partial<MonitoringTargetConfig>
  ): void;
  getTargetConfig(targetId: string): MonitoringTargetConfig | null;
  getAllTargetConfigs(): MonitoringTargetConfig[];

  // Scheduler control
  start(): Promise<void>;
  stop(): Promise<void>;
  pause(): void;
  resume(): void;
  isRunning(): boolean;
  isPaused(): boolean;

  // Target control
  enableTarget(targetId: string): void;
  disableTarget(targetId: string): void;
  pauseTarget(targetId: string): void;
  resumeTarget(targetId: string): void;

  // Statistics and monitoring
  getStats(): SchedulerStats;
  getActiveTargets(): string[];
  getFailedTargets(): string[];

  // Configuration
  setDefaultInterval(intervalMs: number): void;
  setMaxConcurrentTests(maxConcurrent: number): void;
  setFailureThreshold(maxFailures: number): void;

  // Health checks
  isHealthy(): boolean;
  getHealthStatus(): {
    status: "healthy" | "degraded" | "unhealthy";
    issues: string[];
    lastCheck: Date;
  };
}
