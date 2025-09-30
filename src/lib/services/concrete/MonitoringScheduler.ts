import type {
  IMonitoringScheduler,
  MonitoringTargetConfig,
  SchedulerStats,
} from "../interfaces/IMonitoringScheduler";
import type { ISpeedTestService } from "../interfaces/ISpeedTestService";
import type { IEventBus } from "../interfaces/IEventBus";
import type { ILogger } from "../interfaces/ILogger";

interface ScheduledTarget {
  config: MonitoringTargetConfig;
  interval?: NodeJS.Timeout;
  isPaused: boolean;
  lastRun?: Date;
  nextRun?: Date;
  failureCount: number;
}

export class MonitoringScheduler implements IMonitoringScheduler {
  private targets: Map<string, ScheduledTarget> = new Map();
  private running = false;
  private paused = false;
  private startTime?: Date;
  private defaultInterval = 30000; // 30 seconds
  private maxConcurrentTests = 5;
  private maxFailures = 3;
  private totalRuns = 0;
  private successfulRuns = 0;
  private failedRuns = 0;
  private totalRunTime = 0;

  constructor(
    private speedTestService: ISpeedTestService,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.on(
      "MONITORING_SCHEDULER_START_REQUESTED",
      this.handleStartRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "MONITORING_SCHEDULER_STOP_REQUESTED",
      this.handleStopRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "MONITORING_TARGET_ADD_REQUESTED",
      this.handleTargetAddRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "MONITORING_TARGET_REMOVE_REQUESTED",
      this.handleTargetRemoveRequested.bind(this) as (data?: unknown) => void
    );
  }

  addTarget(config: MonitoringTargetConfig): void {
    this.logger.debug("MonitoringScheduler: Adding target", { config });

    const scheduledTarget: ScheduledTarget = {
      config,
      isPaused: false,
      failureCount: 0,
    };

    this.targets.set(config.targetId, scheduledTarget);

    // If scheduler is running, start monitoring this target
    if (this.running && !this.paused) {
      this.startTargetMonitoring(config.targetId);
    }

    this.eventBus.emitTyped("MONITORING_TARGET_ADDED", {
      targetId: config.targetId,
      config,
    });
  }

  removeTarget(targetId: string): void {
    this.logger.debug("MonitoringScheduler: Removing target", { targetId });

    const target = this.targets.get(targetId);
    if (target) {
      // Stop the interval if running
      if (target.interval) {
        clearInterval(target.interval);
      }

      this.targets.delete(targetId);

      this.eventBus.emitTyped("MONITORING_TARGET_REMOVED", { targetId });
    }
  }

  updateTargetConfig(
    targetId: string,
    config: Partial<MonitoringTargetConfig>
  ): void {
    this.logger.debug("MonitoringScheduler: Updating target config", {
      targetId,
      config,
    });

    const target = this.targets.get(targetId);
    if (target) {
      // Update the config
      target.config = { ...target.config, ...config };

      // If interval changed, restart the monitoring
      if (config.intervalMs && target.interval) {
        clearInterval(target.interval);
        if (this.running && !this.paused && target.config.enabled) {
          this.startTargetMonitoring(targetId);
        }
      }

      this.eventBus.emitTyped("MONITORING_TARGET_UPDATED", {
        targetId,
        config: target.config,
      });
    }
  }

  getTargetConfig(targetId: string): MonitoringTargetConfig | null {
    const target = this.targets.get(targetId);
    return target ? target.config : null;
  }

  getAllTargetConfigs(): MonitoringTargetConfig[] {
    return Array.from(this.targets.values()).map(target => target.config);
  }

  async start(): Promise<void> {
    this.logger.info("MonitoringScheduler: Starting scheduler");

    if (this.running) {
      this.logger.warn("MonitoringScheduler: Scheduler is already running");
      return;
    }

    this.running = true;
    this.startTime = new Date();

    // Start monitoring for all enabled targets
    for (const [, target] of this.targets) {
      if (target.config.enabled && !target.isPaused) {
        this.startTargetMonitoring(target.config.targetId);
      }
    }

    this.eventBus.emitTyped("MONITORING_SCHEDULER_STARTED", {});
  }

  async stop(): Promise<void> {
    this.logger.info("MonitoringScheduler: Stopping scheduler");

    if (!this.running) {
      this.logger.warn("MonitoringScheduler: Scheduler is not running");
      return;
    }

    // Stop all target monitoring
    for (const [, target] of this.targets) {
      if (target.interval) {
        clearInterval(target.interval);
        target.interval = undefined;
      }
    }

    this.running = false;
    this.paused = false;

    this.eventBus.emitTyped("MONITORING_SCHEDULER_STOPPED", {});
  }

  pause(): void {
    this.logger.info("MonitoringScheduler: Pausing scheduler");

    if (!this.running) {
      this.logger.warn("MonitoringScheduler: Scheduler is not running");
      return;
    }

    this.paused = true;

    // Pause all target monitoring
    for (const [, target] of this.targets) {
      if (target.interval) {
        clearInterval(target.interval);
        target.interval = undefined;
      }
    }

    this.eventBus.emitTyped("MONITORING_SCHEDULER_PAUSED", {});
  }

  resume(): void {
    this.logger.info("MonitoringScheduler: Resuming scheduler");

    if (!this.running) {
      this.logger.warn("MonitoringScheduler: Scheduler is not running");
      return;
    }

    this.paused = false;

    // Resume monitoring for all enabled targets
    for (const [, target] of this.targets) {
      if (target.config.enabled && !target.isPaused) {
        this.startTargetMonitoring(target.config.targetId);
      }
    }

    this.eventBus.emitTyped("MONITORING_SCHEDULER_RESUMED", {});
  }

  isRunning(): boolean {
    return this.running;
  }

  isPaused(): boolean {
    return this.paused;
  }

  enableTarget(targetId: string): void {
    this.logger.debug("MonitoringScheduler: Enabling target", { targetId });

    const target = this.targets.get(targetId);
    if (target) {
      target.config.enabled = true;

      if (this.running && !this.paused && !target.isPaused) {
        this.startTargetMonitoring(targetId);
      }

      this.eventBus.emitTyped("MONITORING_TARGET_ENABLED", { targetId });
    }
  }

  disableTarget(targetId: string): void {
    this.logger.debug("MonitoringScheduler: Disabling target", { targetId });

    const target = this.targets.get(targetId);
    if (target) {
      target.config.enabled = false;

      if (target.interval) {
        clearInterval(target.interval);
        target.interval = undefined;
      }

      this.eventBus.emitTyped("MONITORING_TARGET_DISABLED", { targetId });
    }
  }

  pauseTarget(targetId: string): void {
    this.logger.debug("MonitoringScheduler: Pausing target", { targetId });

    const target = this.targets.get(targetId);
    if (target) {
      target.isPaused = true;

      if (target.interval) {
        clearInterval(target.interval);
        target.interval = undefined;
      }

      this.eventBus.emitTyped("MONITORING_TARGET_PAUSED", { targetId });
    }
  }

  resumeTarget(targetId: string): void {
    this.logger.debug("MonitoringScheduler: Resuming target", { targetId });

    const target = this.targets.get(targetId);
    if (target) {
      target.isPaused = false;

      if (this.running && !this.paused && target.config.enabled) {
        this.startTargetMonitoring(targetId);
      }

      this.eventBus.emitTyped("MONITORING_TARGET_RESUMED", { targetId });
    }
  }

  getStats(): SchedulerStats {
    const activeTargets = Array.from(this.targets.values()).filter(
      target => target.config.enabled && !target.isPaused
    ).length;

    const pausedTargets = Array.from(this.targets.values()).filter(
      target => target.isPaused
    ).length;

    const failedTargets = Array.from(this.targets.values()).filter(
      target => target.failureCount >= this.maxFailures
    ).length;

    const uptime = this.startTime ? Date.now() - this.startTime.getTime() : 0;
    const averageRunTime =
      this.totalRuns > 0 ? this.totalRunTime / this.totalRuns : 0;

    return {
      totalTargets: this.targets.size,
      activeTargets,
      pausedTargets,
      failedTargets,
      totalRuns: this.totalRuns,
      successfulRuns: this.successfulRuns,
      failedRuns: this.failedRuns,
      averageRunTime,
      uptime,
    };
  }

  getActiveTargets(): string[] {
    return Array.from(this.targets.entries())
      .filter(([_, target]) => target.config.enabled && !target.isPaused)
      .map(([targetId]) => targetId);
  }

  getFailedTargets(): string[] {
    return Array.from(this.targets.entries())
      .filter(([_, target]) => target.failureCount >= this.maxFailures)
      .map(([targetId]) => targetId);
  }

  setDefaultInterval(intervalMs: number): void {
    this.defaultInterval = intervalMs;
    this.logger.debug("MonitoringScheduler: Default interval set", {
      intervalMs,
    });
  }

  setMaxConcurrentTests(maxConcurrent: number): void {
    this.maxConcurrentTests = maxConcurrent;
    this.logger.debug("MonitoringScheduler: Max concurrent tests set", {
      maxConcurrent,
    });
  }

  setFailureThreshold(maxFailures: number): void {
    this.maxFailures = maxFailures;
    this.logger.debug("MonitoringScheduler: Failure threshold set", {
      maxFailures,
    });
  }

  isHealthy(): boolean {
    const stats = this.getStats();
    const failureRate =
      stats.totalRuns > 0 ? stats.failedRuns / stats.totalRuns : 0;

    // Consider unhealthy if failure rate is above 50% or too many targets are failing
    return failureRate < 0.5 && stats.failedTargets < stats.totalTargets * 0.3;
  }

  getHealthStatus(): {
    status: "healthy" | "degraded" | "unhealthy";
    issues: string[];
    lastCheck: Date;
  } {
    const stats = this.getStats();
    const failureRate =
      stats.totalRuns > 0 ? stats.failedRuns / stats.totalRuns : 0;
    const issues: string[] = [];

    if (failureRate > 0.5) {
      issues.push(`High failure rate: ${(failureRate * 100).toFixed(1)}%`);
    }

    if (stats.failedTargets > stats.totalTargets * 0.3) {
      issues.push(
        `Many targets failing: ${stats.failedTargets}/${stats.totalTargets}`
      );
    }

    if (!this.running) {
      issues.push("Scheduler is not running");
    }

    if (this.paused) {
      issues.push("Scheduler is paused");
    }

    let status: "healthy" | "degraded" | "unhealthy";
    if (issues.length === 0) {
      status = "healthy";
    } else if (issues.length <= 2) {
      status = "degraded";
    } else {
      status = "unhealthy";
    }

    return {
      status,
      issues,
      lastCheck: new Date(),
    };
  }

  private startTargetMonitoring(targetId: string): void {
    const target = this.targets.get(targetId);
    if (!target || target.interval) {
      return; // Target not found or already monitoring
    }

    this.logger.debug("MonitoringScheduler: Starting target monitoring", {
      targetId,
      intervalMs: target.config.intervalMs || this.defaultInterval,
    });

    const interval = setInterval(async () => {
      await this.runTargetTest(targetId);
    }, target.config.intervalMs || this.defaultInterval);

    target.interval = interval;
    target.nextRun = new Date(
      Date.now() + (target.config.intervalMs || this.defaultInterval)
    );
  }

  private async runTargetTest(targetId: string): Promise<void> {
    const target = this.targets.get(targetId);
    if (!target) {
      return;
    }

    const startTime = Date.now();

    try {
      this.logger.debug("MonitoringScheduler: Running test for target", {
        targetId,
      });

      // Run the comprehensive test
      await this.speedTestService.runComprehensiveTest({
        targetId,
        timeout: target.config.maxFailures || 10000,
      });

      // Update statistics
      target.lastRun = new Date();
      target.failureCount = 0; // Reset failure count on success
      target.nextRun = new Date(
        Date.now() + (target.config.intervalMs || this.defaultInterval)
      );

      this.totalRuns++;
      this.successfulRuns++;
      this.totalRunTime += Date.now() - startTime;

      this.eventBus.emitTyped("MONITORING_TEST_SUCCESS", {
        targetId,
        duration: Date.now() - startTime,
      });
    } catch (error) {
      this.logger.error("MonitoringScheduler: Test failed for target", {
        targetId,
        error,
      });

      // Update failure count
      target.failureCount++;
      target.lastRun = new Date();
      target.nextRun = new Date(
        Date.now() + (target.config.intervalMs || this.defaultInterval)
      );

      this.totalRuns++;
      this.failedRuns++;
      this.totalRunTime += Date.now() - startTime;

      // If too many failures, disable the target
      if (target.failureCount >= this.maxFailures) {
        this.logger.warn(
          "MonitoringScheduler: Target disabled due to failures",
          {
            targetId,
            failureCount: target.failureCount,
          }
        );

        target.config.enabled = false;
        if (target.interval) {
          clearInterval(target.interval);
          target.interval = undefined;
        }
      }

      this.eventBus.emitTyped("MONITORING_TEST_FAILURE", {
        targetId,
        error: error instanceof Error ? error.message : "Unknown error",
        failureCount: target.failureCount,
        duration: Date.now() - startTime,
      });
    }
  }

  // Event handlers
  private async handleStartRequested(): Promise<void> {
    await this.start();
  }

  private async handleStopRequested(): Promise<void> {
    await this.stop();
  }

  private handleTargetAddRequested(data: {
    targetId: string;
    config: MonitoringTargetConfig;
  }): void {
    this.addTarget(data.config);
  }

  private handleTargetRemoveRequested(data: { targetId: string }): void {
    this.removeTarget(data.targetId);
  }
}
