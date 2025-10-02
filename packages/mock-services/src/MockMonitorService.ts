import type { IMonitorService, IEventBus } from "@network-monitor/shared";
import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
  SpeedTestConfig,
} from "@network-monitor/shared";
import { SpeedTestStatus } from "@network-monitor/shared";

export class MockMonitorService implements IMonitorService {
  private targets: Target[] = [];
  private speedTestResults: SpeedTestResult[] = [];
  private activeTargets: Set<string> = new Set();
  private nextId = 1;
  private eventBus: IEventBus;

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus;
    this.seedData();
  }

  private seedData(): void {
    // Hardcoded test targets
    const now = new Date().toISOString();
    this.targets = [
      {
        id: "target-1",
        name: "Google DNS",
        address: "https://8.8.8.8",
        ownerId: "user-1",
        createdAt: now,
        updatedAt: now,
        speedTestResults: [],
        alertRules: [],
      },
      {
        id: "target-2",
        name: "Cloudflare DNS",
        address: "https://1.1.1.1",
        ownerId: "user-1",
        createdAt: now,
        updatedAt: now,
        speedTestResults: [],
        alertRules: [],
      },
      {
        id: "target-3",
        name: "GitHub",
        address: "https://github.com",
        ownerId: "user-2",
        createdAt: now,
        updatedAt: now,
        speedTestResults: [],
        alertRules: [],
      },
    ];

    // Hardcoded speed test results
    this.speedTestResults = [
      {
        id: "result-1",
        targetId: "target-1",
        ping: 15,
        download: 100.5,
        upload: 50.2,
        status: SpeedTestStatus.SUCCESS,
        timestamp: new Date(Date.now() - 60000).toISOString(),
        createdAt: new Date(Date.now() - 60000).toISOString(),
      },
      {
        id: "result-2",
        targetId: "target-1",
        ping: 18,
        download: 95.3,
        upload: 48.1,
        status: SpeedTestStatus.SUCCESS,
        timestamp: new Date(Date.now() - 30000).toISOString(),
        createdAt: new Date(Date.now() - 30000).toISOString(),
      },
      {
        id: "result-3",
        targetId: "target-2",
        ping: 12,
        download: 120.8,
        upload: 55.7,
        status: SpeedTestStatus.SUCCESS,
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];
  }

  // Base IService interface methods
  async getById(id: string | number): Promise<Target | null> {
    const targetId = typeof id === "string" ? id : id.toString();
    return this.targets.find(t => t.id === targetId) || null;
  }

  async getAll(limit?: number, offset?: number): Promise<Target[]> {
    let result = [...this.targets];
    if (offset) result = result.slice(offset);
    if (limit) result = result.slice(0, limit);
    return result;
  }

  async create(data: CreateTargetData): Promise<Target> {
    const now = new Date().toISOString();
    const target: Target = {
      id: `target-${this.nextId++}`,
      name: data.name,
      address: data.address,
      ownerId: data.ownerId,
      createdAt: now,
      updatedAt: now,
      speedTestResults: [],
      alertRules: [],
    };

    this.targets.push(target);
    return target;
  }

  async update(id: string | number, data: UpdateTargetData): Promise<Target> {
    const targetId = typeof id === "string" ? id : id.toString();
    const targetIndex = this.targets.findIndex(t => t.id === targetId);

    if (targetIndex === -1) {
      throw new Error(`Target with id ${targetId} not found`);
    }

    this.targets[targetIndex] = {
      ...this.targets[targetIndex],
      ...data,
    };

    return this.targets[targetIndex];
  }

  async delete(id: string | number): Promise<void> {
    const targetId = typeof id === "string" ? id : id.toString();
    const targetIndex = this.targets.findIndex(t => t.id === targetId);

    if (targetIndex !== -1) {
      this.targets.splice(targetIndex, 1);
      this.activeTargets.delete(targetId);
    }
  }

  // IUserOwnedService methods
  async getByUserId(userId: string): Promise<Target[]> {
    return this.targets.filter(t => t.ownerId === userId);
  }

  // IObservableService methods - delegate to event bus
  on<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.onDynamic(event, handler);
  }

  off<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.offDynamic(event, handler);
  }

  emit<T = unknown>(event: string, data?: T): void {
    this.eventBus.emitDynamic(event, data);
  }

  // IBackgroundService methods
  async start(): Promise<void> {
    // Mock implementation - do nothing
  }

  async stop(): Promise<void> {
    // Mock implementation - do nothing
    this.activeTargets.clear();
  }

  // Domain-specific methods
  async createTarget(data: CreateTargetData): Promise<Target> {
    return this.create(data);
  }

  async getTarget(id: string): Promise<Target | null> {
    return this.getById(id);
  }

  async getTargets(userId: string): Promise<Target[]> {
    return this.getByUserId(userId);
  }

  async getAllTargets(): Promise<Target[]> {
    return this.getAll();
  }

  async updateTarget(id: string, data: UpdateTargetData): Promise<Target> {
    return this.update(id, data);
  }

  async deleteTarget(id: string): Promise<void> {
    return this.delete(id);
  }

  startMonitoring(targetId: string, _intervalMs: number): void {
    this.activeTargets.add(targetId);
  }

  stopMonitoring(targetId: string): void {
    this.activeTargets.delete(targetId);
  }

  getActiveTargets(): string[] {
    return Array.from(this.activeTargets);
  }

  async runSpeedTest(config: SpeedTestConfig): Promise<SpeedTestResult> {
    // Return mock speed test result
    const result: SpeedTestResult = {
      id: `result-${Date.now()}`,
      targetId: config.targetId,
      ping: Math.random() * 50 + 10, // 10-60ms
      download: Math.random() * 50 + 50, // 50-100 Mbps
      upload: Math.random() * 30 + 20, // 20-50 Mbps
      status: SpeedTestStatus.SUCCESS,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    this.speedTestResults.push(result);
    return result;
  }

  async getTargetResults(
    targetId: string,
    limit?: number
  ): Promise<SpeedTestResult[]> {
    let results = this.speedTestResults.filter(r => r.targetId === targetId);
    if (limit) results = results.slice(-limit); // Get most recent
    return results;
  }
}
