import type {
  IMonitorService,
  SpeedTestConfig,
} from "../interfaces/IMonitorService";
import type {
  ITargetRepository,
  SpeedTestResult,
  Target,
} from "../interfaces/ITargetRepository";
import type { ISpeedTestRepository } from "../interfaces/ISpeedTestRepository";
import type { IMonitoringTargetRepository } from "../interfaces/IMonitoringTargetRepository";
import type { ISpeedTestResultRepository } from "../interfaces/ISpeedTestResultRepository";
import type { IEventBus } from "../interfaces/IEventBus";
import type { ILogger } from "../interfaces/ILogger";

export class MonitorService implements IMonitorService {
  private activeTargets: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private targetRepository: ITargetRepository,
    private speedTestRepository: ISpeedTestRepository,
    private monitoringTargetRepository: IMonitoringTargetRepository,
    private speedTestResultRepository: ISpeedTestResultRepository,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.on(
      "TARGET_CREATE_REQUESTED",
      this.handleTargetCreateRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "TARGET_UPDATE_REQUESTED",
      this.handleTargetUpdateRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "TARGET_DELETE_REQUESTED",
      this.handleTargetDeleteRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "MONITORING_START_REQUESTED",
      this.handleMonitoringStartRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "MONITORING_STOP_REQUESTED",
      this.handleMonitoringStopRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "SPEED_TEST_REQUESTED",
      this.handleSpeedTestRequested.bind(this) as (data?: unknown) => void
    );
  }

  async createTarget(data: {
    name: string;
    address: string;
    ownerId: string;
  }): Promise<Target> {
    this.logger.debug("MonitorService: Creating target", data);

    try {
      const target = await this.targetRepository.create(data);
      this.eventBus.emitTyped("TARGET_CREATED", target);
      return target;
    } catch (error) {
      this.logger.error("MonitorService: Target creation failed", {
        error,
        data,
      });
      this.eventBus.emitTyped("TARGET_CREATE_FAILED", {
        error:
          error instanceof Error
            ? error instanceof Error
              ? error.message
              : "An error occurred"
            : "An error occurred",
      });
      throw error;
    }
  }

  async getTarget(id: string): Promise<Target | null> {
    return await this.targetRepository.findById(id);
  }

  async getTargets(userId: string): Promise<Target[]> {
    return await this.targetRepository.findByUserId(userId);
  }

  async updateTarget(
    id: string,
    data: { name?: string; address?: string }
  ): Promise<Target> {
    this.logger.debug("MonitorService: Updating target", { id, data });

    try {
      const target = await this.targetRepository.update(id, data);
      this.eventBus.emitTyped("TARGET_UPDATED", target);
      return target;
    } catch (error) {
      this.logger.error("MonitorService: Target update failed", {
        error,
        id,
        data,
      });
      this.eventBus.emitTyped("TARGET_UPDATE_FAILED", {
        id,
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
    }
  }

  async deleteTarget(id: string): Promise<void> {
    this.logger.debug("MonitorService: Deleting target", { id });

    try {
      // Stop monitoring if active
      this.stopMonitoring(id);

      await this.targetRepository.delete(id);
      this.eventBus.emitTyped("TARGET_DELETED", { id });
    } catch (error) {
      this.logger.error("MonitorService: Target deletion failed", {
        error,
        id,
      });
      this.eventBus.emitTyped("TARGET_DELETE_FAILED", {
        id,
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
    }
  }

  async runSpeedTest(config: SpeedTestConfig): Promise<SpeedTestResult> {
    this.logger.debug("MonitorService: Running speed test", { config });

    try {
      // Get target information
      const target = await this.targetRepository.findById(config.targetId);
      if (!target) {
        throw new Error(`Target with ID ${config.targetId} not found`);
      }

      // Simulate speed test (in real implementation, this would make actual network requests)
      const result = await this.simulateSpeedTest(
        target.address,
        config.timeout || 10000
      );

      // Save result
      const savedResult = await this.speedTestRepository.create({
        targetId: config.targetId,
        ping: result.ping ?? undefined,
        download: result.download ?? undefined,
        status: result.status,
        error: result.error ?? undefined,
      });

      this.eventBus.emitTyped("SPEED_TEST_COMPLETED", {
        targetId: config.targetId,
        result: savedResult,
      });
      return savedResult;
    } catch (error) {
      this.logger.error("MonitorService: Speed test failed", { error, config });
      this.eventBus.emitTyped("SPEED_TEST_FAILED", {
        targetId: config.targetId,
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
    }
  }

  startMonitoring(targetId: string, intervalMs: number): void {
    this.logger.debug("MonitorService: Starting monitoring", {
      targetId,
      intervalMs,
    });

    // Stop existing monitoring if any
    this.stopMonitoring(targetId);

    const interval = setInterval(async () => {
      try {
        await this.runSpeedTest({ targetId });
      } catch (error) {
        this.logger.error("MonitorService: Monitoring error", {
          error,
          targetId,
        });
      }
    }, intervalMs);

    this.activeTargets.set(targetId, interval);
    this.eventBus.emitTyped("MONITORING_STARTED", { targetId });
  }

  stopMonitoring(targetId: string): void {
    this.logger.debug("MonitorService: Stopping monitoring", { targetId });

    const interval = this.activeTargets.get(targetId);
    if (interval) {
      clearInterval(interval);
      this.activeTargets.delete(targetId);
      this.eventBus.emitTyped("MONITORING_STOPPED", { targetId });
    }
  }

  getActiveTargets(): string[] {
    return Array.from(this.activeTargets.keys());
  }

  async getTargetResults(
    targetId: string,
    limit = 100
  ): Promise<SpeedTestResult[]> {
    return await this.speedTestRepository.findByTargetId(targetId, limit);
  }

  private async simulateSpeedTest(
    _address: string,
    _timeout: number
  ): Promise<{
    ping: number | null;
    download: number | null;
    status: "SUCCESS" | "FAILURE";
    error: string | null;
  }> {
    // Simulate network latency
    const delay = Math.random() * 1000;
    await new Promise(resolve => setTimeout(resolve, delay));

    // Simulate occasional failures
    if (Math.random() < 0.1) {
      return {
        ping: null,
        download: null,
        status: "FAILURE",
        error: "Connection timeout",
      };
    }

    // Simulate realistic ping and download speeds
    const ping = Math.random() * 100 + 10; // 10-110ms
    const download = Math.random() * 50 + 10; // 10-60 Mbps

    return {
      ping: Math.round(ping * 100) / 100,
      download: Math.round(download * 100) / 100,
      status: "SUCCESS",
      error: null,
    };
  }

  // Event handlers
  private async handleTargetCreateRequested(data: {
    name: string;
    address: string;
    ownerId: string;
  }): Promise<void> {
    await this.createTarget(data);
  }

  private async handleTargetUpdateRequested(data: {
    id: string;
    name?: string;
    address?: string;
  }): Promise<void> {
    const { id, ...updateData } = data;
    await this.updateTarget(id, updateData);
  }

  private async handleTargetDeleteRequested(data: {
    id: string;
  }): Promise<void> {
    await this.deleteTarget(data.id);
  }

  private handleMonitoringStartRequested(data: {
    targetId: string;
    intervalMs: number;
  }): void {
    this.startMonitoring(data.targetId, data.intervalMs);
  }

  private handleMonitoringStopRequested(data: { targetId: string }): void {
    this.stopMonitoring(data.targetId);
  }

  private async handleSpeedTestRequested(data: {
    targetId: string;
  }): Promise<void> {
    await this.runSpeedTest({ targetId: data.targetId });
  }
}
