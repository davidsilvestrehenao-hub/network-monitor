import type {
  IMonitoringTargetRepository,
  CreateMonitoringTargetData,
  UpdateMonitoringTargetData,
} from "@network-monitor/shared";
import { EntityStatus } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

// Import standardized domain types
import type { MonitoringTarget } from "@network-monitor/shared";

export class MockMonitoringTargetRepository
  implements IMonitoringTargetRepository
{
  private targets: MonitoringTarget[] = [];
  private logger?: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger;
    this.seedTargets();
  }

  private seedTargets(): void {
    const now = new Date();
    this.targets = [
      {
        id: "target-1",
        name: "Google DNS",
        address: "https://8.8.8.8",
        ownerId: "anonymous",
        status: EntityStatus.ACTIVE,
        monitoringEnabled: true,
        monitoringInterval: 30,
        createdAt: now,
        updatedAt: now,
        version: 1,
        deletedAt: null,
        isActive: true,
        tags: [],
        speedTestResults: [],
        incidentEvents: [],
        alertRules: [],
      },
      {
        id: "target-2",
        name: "Cloudflare DNS",
        address: "https://1.1.1.1",
        ownerId: "anonymous",
        status: EntityStatus.ACTIVE,
        monitoringEnabled: true,
        monitoringInterval: 30,
        createdAt: now,
        updatedAt: now,
        version: 1,
        deletedAt: null,
        isActive: true,
        tags: [],
        speedTestResults: [],
        incidentEvents: [],
        alertRules: [],
      },
      {
        id: "target-3",
        name: "GitHub",
        address: "https://github.com",
        ownerId: "user-1",
        status: EntityStatus.ACTIVE,
        monitoringEnabled: true,
        monitoringInterval: 30,
        createdAt: now,
        updatedAt: now,
        version: 1,
        deletedAt: null,
        isActive: true,
        tags: [],
        speedTestResults: [],
        incidentEvents: [],
        alertRules: [],
      },
    ];
  }

  async findById(id: string | number): Promise<MonitoringTarget | null> {
    this.logger?.debug("MockMonitoringTargetRepository: Finding target by ID", {
      id,
    });
    return this.targets.find(target => target.id === id) || null;
  }

  async findByUserId(userId: string): Promise<MonitoringTarget[]> {
    this.logger?.debug(
      "MockMonitoringTargetRepository: Finding targets by user ID",
      { userId }
    );
    return this.targets.filter(target => target.ownerId === userId);
  }

  async findByOwnerId(ownerId: string): Promise<MonitoringTarget[]> {
    this.logger?.debug(
      "MockMonitoringTargetRepository: Finding targets by owner ID",
      { ownerId }
    );
    return this.targets.filter(target => target.ownerId === ownerId);
  }

  async findByUserIdWithPagination(
    userId: string,
    limit = 100,
    offset = 0
  ): Promise<MonitoringTarget[]> {
    this.logger?.debug(
      "MockMonitoringTargetRepository: Finding targets by user ID with pagination",
      { userId, limit, offset }
    );
    const userTargets = this.targets.filter(
      target => target.ownerId === userId
    );
    return userTargets.slice(offset, offset + limit);
  }

  async countByUserId(userId: string): Promise<number> {
    this.logger?.debug(
      "MockMonitoringTargetRepository: Counting targets by user ID",
      { userId }
    );
    return this.targets.filter(target => target.ownerId === userId).length;
  }

  async getAll(limit = 100, offset = 0): Promise<MonitoringTarget[]> {
    this.logger?.debug("MockMonitoringTargetRepository: Getting all targets", {
      limit,
      offset,
    });
    return this.targets.slice(offset, offset + limit);
  }

  async count(): Promise<number> {
    this.logger?.debug("MockMonitoringTargetRepository: Counting targets");
    return this.targets.length;
  }

  async create(data: CreateMonitoringTargetData): Promise<MonitoringTarget> {
    this.logger?.debug("MockMonitoringTargetRepository: Creating target", {
      data,
    });

    const now = new Date();
    const target: MonitoringTarget = {
      id: `target-${Date.now()}`,
      name: data.name,
      address: data.address,
      ownerId: data.ownerId,
      status: EntityStatus.ACTIVE,
      monitoringEnabled: true,
      monitoringInterval: 30,
      createdAt: now,
      updatedAt: now,
      version: 1,
      deletedAt: null,
      isActive: true,
      tags: [],
      speedTestResults: [],
      incidentEvents: [],
      alertRules: [],
    };

    this.targets.push(target);
    return target;
  }

  async update(
    id: string | number,
    data: UpdateMonitoringTargetData
  ): Promise<MonitoringTarget> {
    this.logger?.debug("MockMonitoringTargetRepository: Updating target", {
      id,
      data,
    });

    const targetIndex = this.targets.findIndex(
      target => target.id === String(id)
    );
    if (targetIndex === -1) {
      throw new Error(`Target with ID ${id} not found`);
    }

    const target = this.targets[targetIndex];
    this.targets[targetIndex] = {
      ...target,
      ...data,
    };

    return this.targets[targetIndex];
  }

  async delete(id: string | number): Promise<void> {
    this.logger?.debug("MockMonitoringTargetRepository: Deleting target", {
      id,
    });

    const targetIndex = this.targets.findIndex(
      target => target.id === String(id)
    );
    if (targetIndex === -1) {
      throw new Error(`Target with ID ${id} not found`);
    }

    this.targets.splice(targetIndex, 1);
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.logger?.debug(
      "MockMonitoringTargetRepository: Deleting targets by user ID",
      {
        userId,
      }
    );
    this.targets = this.targets.filter(target => target.ownerId !== userId);
  }

  // Helper method for testing
  setSeedData(targets: MonitoringTarget[]): void {
    this.targets = targets;
  }

  // Helper method to get all targets for testing
  getAllTargets(): MonitoringTarget[] {
    return [...this.targets];
  }
}
