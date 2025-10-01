import type { IMonitorService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";
import type { IEventBus } from "@network-monitor/shared";
import type { ITargetRepository } from "@network-monitor/shared";
import type { ISpeedTestRepository } from "@network-monitor/shared";
import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
} from "@network-monitor/shared";
import type { SpeedTestConfig } from "@network-monitor/shared";

export class MockMonitor implements IMonitorService {
  private activeTargets: Set<string> = new Set();
  private monitoringIntervals: Map<string, NodeJS.Timeout> = new Map();

  private targetRepository: ITargetRepository;
  private speedTestRepository: ISpeedTestRepository;
  private eventBus: IEventBus;
  private logger?: ILogger;

  constructor(
    targetRepository: ITargetRepository,
    speedTestRepository: ISpeedTestRepository,
    eventBus: IEventBus,
    logger?: ILogger
  ) {
    this.targetRepository = targetRepository;
    this.speedTestRepository = speedTestRepository;
    this.eventBus = eventBus;
    this.logger = logger;
    this.logger?.debug("MockMonitor: Initialized");
  }

  // Base interface methods
  async getById(id: string): Promise<Target | null> {
    return this.getTarget(id);
  }

  async getAll(): Promise<Target[]> {
    return this.getAllTargets();
  }

  async create(data: CreateTargetData): Promise<Target> {
    return this.createTarget(data);
  }

  async update(id: string, data: UpdateTargetData): Promise<Target> {
    return this.updateTarget(id, data);
  }

  async delete(id: string): Promise<void> {
    return this.deleteTarget(id);
  }

  async getByUserId(userId: string): Promise<Target[]> {
    return this.getTargets(userId);
  }

  // Observable service methods
  on<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.on(event, handler);
  }

  off<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.off(event, handler);
  }

  emit<T = unknown>(event: string, data?: T): void {
    this.eventBus.emit(event, data);
  }

  // Background service methods
  async start(): Promise<void> {
    this.logger?.info("MockMonitor: Starting background monitoring");
  }

  async stop(): Promise<void> {
    this.logger?.info("MockMonitor: Stopping background monitoring");
    this.activeTargets.forEach(targetId => {
      this.stopMonitoring(targetId);
    });
  }

  async createTarget(data: CreateTargetData): Promise<Target> {
    this.logger?.debug("MockMonitor: Creating target", { data });
    const targetData = await this.targetRepository.create(data);
    // Convert TargetData to Target for service layer
    const target: Target = {
      ...targetData,
      speedTestResults: [],
      alertRules: [],
    };
    this.eventBus.emit("TARGET_CREATED", target);
    return target;
  }

  async getTarget(id: string): Promise<Target | null> {
    this.logger?.debug("MockMonitor: Getting target", { id });
    return await this.targetRepository.findByIdWithRelations(id);
  }

  async getTargets(userId: string): Promise<Target[]> {
    this.logger?.debug("MockMonitor: Getting targets for user", { userId });
    return await this.targetRepository.findByUserIdWithRelations(userId);
  }

  async getAllTargets(): Promise<Target[]> {
    this.logger?.debug("MockMonitor: Getting all targets");
    return await this.targetRepository.getAllWithRelations();
  }

  async updateTarget(id: string, data: UpdateTargetData): Promise<Target> {
    this.logger?.debug("MockMonitor: Updating target", { id, data });
    const targetData = await this.targetRepository.update(id, data);
    // Convert TargetData to Target for service layer
    const target: Target = {
      ...targetData,
      speedTestResults: [],
      alertRules: [],
    };
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
    const now = new Date();
    const result: SpeedTestResult = {
      id: crypto.randomUUID(),
      targetId: config.targetId,
      ping: Math.random() * 100,
      download: Math.random() * 1000,
      upload: Math.random() * 500,
      status: "SUCCESS",
      error: undefined,
      createdAt: now.toISOString(),
      timestamp: now.toISOString(),
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
        await this.runSpeedTest({ targetId, target: `target-${targetId}` });
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
