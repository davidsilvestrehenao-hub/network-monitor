import type { IMonitorService } from "@network-monitor/shared";
import type {
  Target,
  TargetData,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
  SpeedTestConfig,
} from "@network-monitor/shared";

export class SimpleMockMonitor implements IMonitorService {
  private targets: Map<string, Target> = new Map();
  private idCounter = 0;

  constructor() {
    // No dependencies needed - simple mock implementation
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
  on<T = unknown>(_event: string, _handler: (data?: T) => void): void {
    // Simple mock - no event bus
  }

  off<T = unknown>(_event: string, _handler: (data?: T) => void): void {
    // Simple mock - no event bus
  }

  emit<T = unknown>(_event: string, _data?: T): void {
    // Simple mock - no event bus
  }

  // Background service methods
  async start(): Promise<void> {
    // Simple mock - no background processing
  }

  async stop(): Promise<void> {
    // Simple mock - no background processing
  }

  // Helper method to convert Target to TargetData
  private toTargetData(target: Target): TargetData {
    return {
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
    };
  }

  async createTarget(data: CreateTargetData): Promise<Target> {
    const now = new Date().toISOString();
    const target: Target = {
      id: `target-${Date.now()}-${++this.idCounter}`,
      name: data.name,
      address: data.address,
      ownerId: data.ownerId,
      createdAt: now,
      updatedAt: now,
      speedTestResults: [],
      alertRules: [],
    };
    this.targets.set(target.id, target);
    return target;
  }

  async getTarget(id: string): Promise<Target | null> {
    return this.targets.get(id) || null;
  }

  async getTargets(userId: string): Promise<Target[]> {
    return Array.from(this.targets.values()).filter(
      target => target.ownerId === userId
    );
  }

  async getAllTargets(): Promise<Target[]> {
    return Array.from(this.targets.values());
  }

  async updateTarget(id: string, data: UpdateTargetData): Promise<Target> {
    const target = this.targets.get(id);
    if (!target) {
      throw new Error(`Target with id ${id} not found`);
    }

    const updatedTarget = {
      ...target,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.targets.set(id, updatedTarget);
    return updatedTarget;
  }

  async deleteTarget(id: string): Promise<void> {
    this.targets.delete(id);
  }

  async runSpeedTest(config: SpeedTestConfig): Promise<SpeedTestResult> {
    // Simple mock speed test
    const now = new Date().toISOString();
    return {
      id: `result-${Date.now()}`,
      targetId: config.targetId,
      ping: Math.random() * 100,
      download: Math.random() * 1000,
      upload: Math.random() * 500,
      status: "SUCCESS",
      timestamp: now,
      createdAt: now,
    };
  }

  startMonitoring(targetId: string, intervalMs: number): void {
    // Simple mock - just log that monitoring started
    // Justification: Console usage in mock service for development debugging
    // eslint-disable-next-line no-console
    console.log(
      `Mock monitoring started for target ${targetId} with interval ${intervalMs}ms`
    );
  }

  stopMonitoring(targetId: string): void {
    // Simple mock - just log that monitoring stopped
    // Justification: Console usage in mock service for development debugging
    // eslint-disable-next-line no-console
    console.log(`Mock monitoring stopped for target ${targetId}`);
  }

  async getTargetResults(
    _targetId: string,
    _limit?: number
  ): Promise<SpeedTestResult[]> {
    // Return empty array for mock
    return [];
  }

  isMonitoring(_targetId: string): boolean {
    // Simple mock - always return false
    return false;
  }

  getActiveTargets(): string[] {
    return Array.from(this.targets.keys());
  }
}
