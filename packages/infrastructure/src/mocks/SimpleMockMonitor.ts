import type { IMonitorService } from "@network-monitor/shared";
import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
  SpeedTestConfig,
} from "@network-monitor/shared";

export class SimpleMockMonitor implements IMonitorService {
  private targets: Map<string, Target> = new Map();

  constructor() {
    // No dependencies needed - simple mock implementation
  }

  async createTarget(data: CreateTargetData): Promise<Target> {
    const target: Target = {
      id: `target-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: data.name,
      address: data.address,
      ownerId: data.ownerId,
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

    const updatedTarget = { ...target, ...data };
    this.targets.set(id, updatedTarget);
    return updatedTarget;
  }

  async deleteTarget(id: string): Promise<void> {
    this.targets.delete(id);
  }

  async runSpeedTest(config: SpeedTestConfig): Promise<SpeedTestResult> {
    // Simple mock speed test
    return {
      id: `result-${Date.now()}`,
      targetId: config.targetId,
      ping: Math.random() * 100,
      download: Math.random() * 1000,
      upload: Math.random() * 500,
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
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
