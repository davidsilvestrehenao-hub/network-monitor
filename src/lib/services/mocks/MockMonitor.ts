import { IMonitorService } from "../interfaces/IMonitorService";
import { ILogger } from "../interfaces/ILogger";
import { IEventBus } from "../interfaces/IEventBus";
import { ITargetRepository } from "../interfaces/ITargetRepository";
import { ISpeedTestRepository } from "../interfaces/ISpeedTestRepository";
import {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
} from "../interfaces/ITargetRepository";
import { SpeedTestConfig } from "../interfaces/IMonitorService";

export class MockMonitor implements IMonitorService {
  private activeTargets: Set<string> = new Set();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private targetRepository: ITargetRepository,
    private speedTestRepository: ISpeedTestRepository,
    private eventBus: IEventBus,
    private logger?: ILogger
  ) {
    this.logger?.debug("MockMonitor: Initialized");
  }

  async createTarget(data: CreateTargetData): Promise<Target> {
    this.logger?.debug("MockMonitor: Creating target", { data });
    const target = await this.targetRepository.create(data);
    this.eventBus.emit("TARGET_CREATED", target);
    return target;
  }

  async getTarget(id: string): Promise<Target | null> {
    this.logger?.debug("MockMonitor: Getting target", { id });
    return await this.targetRepository.findById(id);
  }

  async getTargets(userId: string): Promise<Target[]> {
    this.logger?.debug("MockMonitor: Getting targets for user", { userId });
    return await this.targetRepository.findByUserId(userId);
  }

  async updateTarget(id: string, data: UpdateTargetData): Promise<Target> {
    this.logger?.debug("MockMonitor: Updating target", { id, data });
    const target = await this.targetRepository.update(id, data);
    this.eventBus.emit("TARGET_UPDATED", target);
    return target;
  }

  async deleteTarget(id: string): Promise<void> {
    this.logger?.debug("MockMonitor: Deleting target", { id });
    await this.targetRepository.delete(id);
    this.eventBus.emit("TARGET_DELETED", { id });
  }

  async runSpeedTest(config: SpeedTestConfig): Promise<SpeedTestResult> {
    this.logger?.debug("MockMonitor: Running speed test", { config });

    // Mock speed test result
    const result: SpeedTestResult = {
      id: Date.now(),
      targetId: config.targetId,
      ping: Math.random() * 100,
      download: Math.random() * 1000,
      status: "SUCCESS",
      error: null,
      createdAt: new Date(),
    };

    await this.speedTestRepository.create({
      targetId: result.targetId,
      ping: result.ping ?? undefined,
      download: result.download ?? undefined,
      status: result.status,
      error: result.error ?? undefined,
    });
    this.eventBus.emit("SPEED_TEST_COMPLETED", result);

    return result;
  }

  startMonitoring(targetId: string, intervalMs: number): void {
    this.logger?.debug("MockMonitor: Starting monitoring", {
      targetId,
      intervalMs,
    });
    this.activeTargets.add(targetId);

    const interval = setInterval(async () => {
      try {
        await this.runSpeedTest({ targetId });
      } catch (error) {
        this.logger?.error("MockMonitor: Speed test failed", {
          targetId,
          error,
        });
      }
    }, intervalMs);

    this.monitoringIntervals.set(targetId, interval);
    this.eventBus.emit("MONITORING_STARTED", { targetId, intervalMs });
  }

  stopMonitoring(targetId: string): void {
    this.logger?.debug("MockMonitor: Stopping monitoring", { targetId });
    this.activeTargets.delete(targetId);

    const interval = this.monitoringIntervals.get(targetId);
    if (interval) {
      clearInterval(interval);
      this.monitoringIntervals.delete(targetId);
    }

    this.eventBus.emit("MONITORING_STOPPED", { targetId });
  }

  getActiveTargets(): string[] {
    return Array.from(this.activeTargets);
  }

  async getTargetResults(
    targetId: string,
    limit?: number
  ): Promise<SpeedTestResult[]> {
    this.logger?.debug("MockMonitor: Getting target results", {
      targetId,
      limit,
    });
    return await this.speedTestRepository.findByTargetId(targetId, limit);
  }

  // Mock-specific methods for testing
  getMonitoringIntervals(): Map<string, NodeJS.Timeout> {
    return new Map(this.monitoringIntervals);
  }

  clearMonitoring(): void {
    this.monitoringIntervals.forEach(interval => clearInterval(interval));
    this.monitoringIntervals.clear();
    this.activeTargets.clear();
  }
}
