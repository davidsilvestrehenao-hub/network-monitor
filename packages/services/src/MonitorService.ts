import type { IMonitorService, SpeedTestConfig } from "@network-monitor/shared";
import { EventKeys, SpeedTestStatus } from "@network-monitor/shared";
import type {
  ITargetRepository,
  SpeedTestResult,
  Target,
  CreateTargetData,
  UpdateTargetData,
} from "@network-monitor/shared";
import type { ISpeedTestRepository } from "@network-monitor/shared";
import type { IMonitoringTargetRepository } from "@network-monitor/shared";
import type { ISpeedTestResultRepository } from "@network-monitor/shared";
import type { IEventBus, ILogger } from "@network-monitor/shared";
import type {
  IUserSpeedTestPreferenceRepository,
  ISpeedTestConfigService,
} from "@network-monitor/shared";
import type {
  TargetCreateRequestData,
  TargetUpdateRequestData,
  TargetDeleteRequestData,
  MonitoringStartRequestData,
  MonitoringStopRequestData,
} from "@network-monitor/shared";

export class MonitorService implements IMonitorService {
  private activeTargets: Map<string, ReturnType<typeof setInterval>> =
    new Map();
  private targetRepository: ITargetRepository;
  private speedTestRepository: ISpeedTestRepository;
  private monitoringTargetRepository: IMonitoringTargetRepository;
  private speedTestResultRepository: ISpeedTestResultRepository;
  private eventBus: IEventBus;
  private logger: ILogger;
  private userSpeedTestPreferenceRepository?: IUserSpeedTestPreferenceRepository;
  private speedTestConfigService?: ISpeedTestConfigService;

  constructor(
    targetRepository: ITargetRepository,
    speedTestRepository: ISpeedTestRepository,
    monitoringTargetRepository: IMonitoringTargetRepository,
    speedTestResultRepository: ISpeedTestResultRepository,
    eventBus: IEventBus,
    logger: ILogger,
    userSpeedTestPreferenceRepository?: IUserSpeedTestPreferenceRepository,
    speedTestConfigService?: ISpeedTestConfigService
  ) {
    this.targetRepository = targetRepository;
    this.speedTestRepository = speedTestRepository;
    this.monitoringTargetRepository = monitoringTargetRepository;
    this.speedTestResultRepository = speedTestResultRepository;
    this.eventBus = eventBus;
    this.logger = logger;
    this.userSpeedTestPreferenceRepository = userSpeedTestPreferenceRepository;
    this.speedTestConfigService = speedTestConfigService;
    this.setupEventHandlers();
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
    this.eventBus.onDynamic(event, handler);
  }

  off<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.offDynamic(event, handler);
  }

  emit<T = unknown>(event: string, data?: T): void {
    this.eventBus.emitDynamic(event, data);
  }

  // Background service methods
  async start(): Promise<void> {
    this.logger.info("MonitorService: Starting background monitoring");
  }

  async stop(): Promise<void> {
    this.logger.info("MonitorService: Stopping background monitoring");
    this.activeTargets.forEach((interval, targetId) => {
      clearInterval(interval);
      this.activeTargets.delete(targetId);
    });
  }

  private setupEventHandlers(): void {
    this.eventBus.onDynamic(
      "TARGET_CREATE_REQUESTED",
      this.handleTargetCreateRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.onDynamic(
      "TARGET_UPDATE_REQUESTED",
      this.handleTargetUpdateRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.onDynamic(
      "TARGET_DELETE_REQUESTED",
      this.handleTargetDeleteRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.onDynamic(
      "MONITORING_START_REQUESTED",
      this.handleMonitoringStartRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.onDynamic(
      "MONITORING_STOP_REQUESTED",
      this.handleMonitoringStopRequested.bind(this) as (data?: unknown) => void
    );
    this.eventBus.onDynamic(
      "SPEED_TEST_REQUESTED",
      this.handleSpeedTestRequested.bind(this) as (data?: unknown) => void
    );
  }

  // Event handlers
  private async handleTargetCreateRequested(
    data?: TargetCreateRequestData
  ): Promise<void> {
    if (!data) return;

    try {
      const target = await this.createTarget({
        name: data.name,
        address: data.address,
        ownerId: data.ownerId,
      });

      // Emit success with requestId for EventRPC
      if (data.requestId) {
        this.eventBus.emitDynamic(`TARGET_CREATED_${data.requestId}`, target);
      }

      // Emit general event for subscribers
      this.eventBus.emitDynamic(EventKeys.TARGET_CREATED, {
        id: target.id,
        name: target.name,
        address: target.address,
        ownerId: target.ownerId,
      });
    } catch (error) {
      this.logger.error("MonitorService: Failed to create target", {
        error,
        data,
      });

      if (data.requestId) {
        this.eventBus.emitDynamic(`TARGET_CREATE_FAILED_${data.requestId}`, {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  private async handleTargetUpdateRequested(
    data?: TargetUpdateRequestData
  ): Promise<void> {
    if (!data) return;

    try {
      const { id, requestId, ...updateData } = data;
      const target = await this.updateTarget(id, updateData);

      if (requestId) {
        this.eventBus.emitDynamic(`TARGET_UPDATED_${requestId}`, target);
      }

      this.eventBus.emitDynamic(EventKeys.TARGET_UPDATED, {
        id: target.id,
        name: target.name,
        address: target.address,
        ownerId: target.ownerId,
        previousData: {
          name: target.name, // We don't have previous data, so use current
          address: target.address,
        },
      });
    } catch (error) {
      this.logger.error("MonitorService: Failed to update target", {
        error,
        data,
      });

      if (data.requestId) {
        this.eventBus.emitDynamic(`TARGET_UPDATE_FAILED_${data.requestId}`, {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  private async handleTargetDeleteRequested(
    data?: TargetDeleteRequestData
  ): Promise<void> {
    if (!data) return;

    try {
      // Get target data before deletion for event emission
      const target = await this.getTarget(data.id);
      await this.deleteTarget(data.id);

      if (data.requestId) {
        this.eventBus.emitDynamic(`TARGET_DELETED_${data.requestId}`, {
          success: true,
        });
      }

      this.eventBus.emitDynamic(EventKeys.TARGET_DELETED, {
        id: data.id,
        name: target?.name || "Unknown",
        address: target?.address || "Unknown",
      });
    } catch (error) {
      this.logger.error("MonitorService: Failed to delete target", {
        error,
        data,
      });

      if (data.requestId) {
        this.eventBus.emitDynamic(`TARGET_DELETE_FAILED_${data.requestId}`, {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  private async handleMonitoringStartRequested(
    data?: MonitoringStartRequestData
  ): Promise<void> {
    if (!data) return;

    try {
      const intervalMs = data.intervalMs || 30000; // Default to 30 seconds
      this.startMonitoring(data.targetId, intervalMs);

      if (data.requestId) {
        this.eventBus.emitDynamic(`MONITORING_STARTED_${data.requestId}`, {
          success: true,
        });
      }

      this.eventBus.emitDynamic(EventKeys.MONITORING_STARTED, {
        targetId: data.targetId,
        intervalMs,
        startedAt: new Date(),
      });
    } catch (error) {
      this.logger.error("MonitorService: Failed to start monitoring", {
        error,
        data,
      });

      if (data.requestId) {
        this.eventBus.emitDynamic(`MONITORING_START_FAILED_${data.requestId}`, {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  private async handleMonitoringStopRequested(
    data?: MonitoringStopRequestData
  ): Promise<void> {
    if (!data) return;

    try {
      this.stopMonitoring(data.targetId);

      if (data.requestId) {
        this.eventBus.emitDynamic(`MONITORING_STOPPED_${data.requestId}`, {
          success: true,
        });
      }

      this.eventBus.emitDynamic(EventKeys.MONITORING_STOPPED, {
        targetId: data.targetId,
        stoppedAt: new Date(),
        duration: 60000, // Mock duration
      });
    } catch (error) {
      this.logger.error("MonitorService: Failed to stop monitoring", {
        error,
        data,
      });

      if (data.requestId) {
        this.eventBus.emitDynamic(`MONITORING_STOP_FAILED_${data.requestId}`, {
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  private async handleSpeedTestRequested(data?: unknown): Promise<void> {
    // Type guard for speed test request data
    if (
      !data ||
      typeof data !== "object" ||
      !("targetId" in data) ||
      typeof (data as { targetId: unknown }).targetId !== "string"
    ) {
      return;
    }

    const requestData = data as {
      targetId: string;
      config?: { timeout?: number; downloadUrl?: string };
      requestId?: string;
    };

    try {
      // Convert to SpeedTestConfig format
      const speedTestConfig: SpeedTestConfig = {
        targetId: requestData.targetId,
        target: requestData.targetId, // Use targetId as target for compatibility
      };

      const result = await this.runSpeedTest(speedTestConfig);

      if (requestData.requestId) {
        this.eventBus.emitDynamic(
          `SPEED_TEST_COMPLETED_${requestData.requestId}`,
          result
        );
      }

      this.eventBus.emitDynamic(EventKeys.SPEED_TEST_COMPLETED, {
        targetId: result.targetId,
        result,
        duration: 1000, // Mock duration
      });
    } catch (error) {
      this.logger.error("MonitorService: Speed test failed", { error, data });

      if (requestData.requestId) {
        this.eventBus.emitDynamic(
          `SPEED_TEST_FAILED_${requestData.requestId}`,
          {
            error: error instanceof Error ? error.message : "Unknown error",
          }
        );
      }
    }
  }

  // Business logic methods
  async createTarget(data: {
    name: string;
    address: string;
    ownerId: string;
  }): Promise<Target> {
    this.logger.info("MonitorService: Creating target", data);
    const target: Target = await this.monitoringTargetRepository.create(data);
    this.logger.info("MonitorService: Target created", { id: target.id });

    // Emit event for subscribers
    this.eventBus.emitDynamic(EventKeys.TARGET_CREATED, {
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
    });

    return target;
  }

  async getTarget(id: string): Promise<Target | null> {
    this.logger.debug("MonitorService: Getting target", { id });
    const target = await this.targetRepository.findByIdWithRelations(id);
    return target as Target | null;
  }

  async getTargets(userId: string): Promise<Target[]> {
    this.logger.debug("MonitorService: Getting targets for user", { userId });
    const targets = await this.targetRepository.findByUserIdWithRelations(userId);
    return targets as Target[];
  }

  async getAllTargets(): Promise<Target[]> {
    this.logger.debug("MonitorService: Getting all targets");
    const targets = await this.targetRepository.getAllWithRelations();
    return targets as Target[];
  }

  async updateTarget(id: string, data: UpdateTargetData): Promise<Target> {
    this.logger.info("MonitorService: Updating target", { id, data });
    const target: Target = await this.monitoringTargetRepository.update(
      id,
      data
    );
    this.logger.info("MonitorService: Target updated", { id });
    return target;
  }

  async deleteTarget(id: string): Promise<void> {
    this.logger.info("MonitorService: Deleting target", { id });
    this.stopMonitoring(id);
    await this.targetRepository.delete(id);
    this.logger.info("MonitorService: Target deleted", { id });
  }

  async runSpeedTest(config: SpeedTestConfig): Promise<SpeedTestResult> {
    this.logger.info("MonitorService: Running speed test", {
      targetId: config.targetId,
      target: config.target,
    });

    const startTime = Date.now();

    try {
      const pingResult = await this.measurePing(config.target);
      const downloadUrlUsed = await this.resolveDownloadTestUrl(
        config.targetId
      );
      const downloadResult = await this.measureDownloadSpeed(downloadUrlUsed);

      const result: SpeedTestResult = {
        id: crypto.randomUUID(),
        targetId: config.targetId,
        ping: pingResult,
        download: downloadResult,
        upload: 0,
        status: SpeedTestStatus.SUCCESS,
        createdAt: new Date(),
        timestamp: new Date(),
      };

      await this.speedTestResultRepository.create({
        targetId: config.targetId,
        ping: pingResult,
        download: downloadResult,
        upload: 0,
        status: SpeedTestStatus.SUCCESS,
      });

      this.logger.info("MonitorService: Speed test completed", {
        duration: Date.now() - startTime,
        result,
      });

      // Emit event for subscribers
      this.eventBus.emitDynamic(EventKeys.SPEED_TEST_COMPLETED, {
        targetId: result.targetId,
        result,
        duration: 1000, // Mock duration
      });

      return result;
    } catch (error) {
      this.logger.error("MonitorService: Speed test failed", {
        error,
        config,
        duration: Date.now() - startTime,
      });

      const failedResult: SpeedTestResult = {
        id: crypto.randomUUID(),
        targetId: config.targetId,
        ping: undefined,
        download: undefined,
        upload: undefined,
        status: SpeedTestStatus.FAILURE,
        error: error instanceof Error ? error.message : "Unknown error",
        createdAt: new Date(),
        timestamp: new Date(),
      };

      await this.speedTestResultRepository.create({
        targetId: config.targetId,
        ping: null,
        download: null,
        upload: null,
        status: SpeedTestStatus.FAILURE,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Emit event for subscribers (even for failed tests)
      this.eventBus.emitDynamic(EventKeys.SPEED_TEST_COMPLETED, {
        targetId: failedResult.targetId,
        result: failedResult,
        duration: 1000, // Mock duration
      });

      return failedResult;
    }
  }

  startMonitoring(targetId: string, intervalMs: number): void {
    if (this.activeTargets.has(targetId)) {
      this.logger.warn("MonitorService: Target already being monitored", {
        targetId,
      });
      return;
    }

    this.logger.info("MonitorService: Starting monitoring", {
      targetId,
      intervalMs,
    });

    const interval = setInterval(async () => {
      try {
        const target = await this.targetRepository.findById(targetId);
        if (!target) {
          this.logger.error("MonitorService: Target not found", { targetId });
          this.stopMonitoring(targetId);
          return;
        }

        await this.runSpeedTest({
          targetId,
          target: target.address,
        });
      } catch (error) {
        this.logger.error("MonitorService: Monitoring iteration failed", {
          error,
          targetId,
        });
      }
    }, intervalMs);

    this.activeTargets.set(targetId, interval);
  }

  stopMonitoring(targetId: string): void {
    const interval = this.activeTargets.get(targetId);
    if (!interval) {
      this.logger.warn("MonitorService: Target not being monitored", {
        targetId,
      });
      return;
    }

    this.logger.info("MonitorService: Stopping monitoring", { targetId });
    clearInterval(interval);
    this.activeTargets.delete(targetId);
  }

  getActiveTargets(): string[] {
    return Array.from(this.activeTargets.keys());
  }

  async getTargetResults(
    targetId: string,
    limit?: number
  ): Promise<SpeedTestResult[]> {
    this.logger.debug("MonitorService: Getting target results", {
      targetId,
      limit,
    });
    return await this.speedTestResultRepository.findByTargetId(targetId, limit);
  }

  private async measurePing(target: string): Promise<number> {
    const start = Date.now();

    try {
      const response = await fetch(target, { method: "HEAD" });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return Date.now() - start;
    } catch (error) {
      this.logger.error("MonitorService: Ping failed", { error, target });
      throw error;
    }
  }

  private async measureDownloadSpeed(testUrl: string): Promise<number> {
    const start = Date.now();

    try {
      const response = await fetch(testUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body?.getReader();
      let sizeInBytes = 0;
      if (reader) {
        // Stream and count bytes to avoid holding large buffers in memory

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          sizeInBytes += value?.byteLength || 0;
        }
      } else {
        const buffer = await response.arrayBuffer();
        sizeInBytes = buffer.byteLength;
      }
      const durationInSeconds = (Date.now() - start) / 1000;

      const speedMbps = (sizeInBytes * 8) / durationInSeconds / 1_000_000;

      this.logger.debug("MonitorService: Download speed measured", {
        sizeInBytes,
        durationInSeconds,
        speedMbps,
      });

      return speedMbps;
    } catch (error) {
      this.logger.error("MonitorService: Download speed test failed", {
        error,
        testUrl,
      });
      throw error;
    }
  }

  private async resolveDownloadTestUrl(targetId: string): Promise<string> {
    // 1) explicit env override
    if (process.env.SPEED_TEST_URL && process.env.SPEED_TEST_URL.length > 0) {
      return process.env.SPEED_TEST_URL;
    }

    // 2) user preference (if available via DI repository)
    try {
      // We infer owner by reading the target
      const target = await this.targetRepository.findById(targetId);
      const ownerId = target?.ownerId;

      if (
        ownerId &&
        this.userSpeedTestPreferenceRepository &&
        this.speedTestConfigService
      ) {
        const pref =
          await this.userSpeedTestPreferenceRepository.getByUserId(ownerId);
        if (pref) {
          const urls = this.speedTestConfigService.getAllUrls?.() || [];
          const match = urls.find(
            (u: { id: string }) => u.id === pref.speedTestUrlId
          );
          if (match?.url) {
            return match.url;
          }
        }
      }
    } catch {
      // fall through to defaults
    }

    // 3) defaults by environment
    const isProd = process.env.NODE_ENV === "production";
    return isProd
      ? "https://speed.hetzner.de/100MB.bin"
      : "https://speed.hetzner.de/10MB.bin";
  }
}
