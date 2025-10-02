import type {
  ITargetRepository,
  TargetData,
  CreateTargetData,
  UpdateTargetData,
  ILogger,
} from "@network-monitor/shared";
import { EntityStatus } from "@network-monitor/shared";
import type { IDatabaseService } from "@network-monitor/shared";

// Import the standardized types that the repository interface expects
import type { StandardizedMonitoringTarget } from "@network-monitor/shared";

// Define local interfaces that match the domain types
interface MonitoringTarget {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  speedTestResults?: SpeedTestResult[];
  alertRules?: AlertRule[];
  incidentEvents?: IncidentEvent[];
}

interface SpeedTestResult {
  id: string;
  ping?: number;
  download?: number;
  upload?: number;
  status: string;
  error?: string;
  targetId: string;
  timestamp: Date;
  createdAt: Date;
}

interface AlertRule {
  id: string;
  name: string;
  metric: "ping" | "download" | "upload" | "status";
  condition: "GREATER_THAN" | "LESS_THAN" | "EQUALS" | "NOT_EQUALS";
  threshold: number;
  enabled: boolean;
  targetId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IncidentEvent {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  resolved: boolean;
  targetId: string;
  ruleId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MockTargetRepository implements ITargetRepository {
  private databaseService: IDatabaseService;
  private logger: ILogger;
  private targets: StandardizedMonitoringTarget[] = [];

  constructor(databaseService: IDatabaseService, logger: ILogger) {
    this.databaseService = databaseService;
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
        createdAt: now,
        updatedAt: now,
        speedTestResults: [],
        alertRules: [],
        status: EntityStatus.ACTIVE,
        monitoringEnabled: true,
        monitoringInterval: 30,
        deletedAt: null,
        isActive: true,
        version: 1,
        tags: [],
        lastMonitoredAt: null,
      },
      {
        id: "target-2",
        name: "Cloudflare DNS",
        address: "https://1.1.1.1",
        ownerId: "anonymous",
        createdAt: now,
        updatedAt: now,
        speedTestResults: [],
        alertRules: [],
        status: EntityStatus.ACTIVE,
        monitoringEnabled: true,
        monitoringInterval: 30,
        deletedAt: null,
        isActive: true,
        version: 1,
        tags: [],
        lastMonitoredAt: null,
      },
      {
        id: "target-3",
        name: "GitHub",
        address: "https://github.com",
        ownerId: "user-1",
        createdAt: now,
        updatedAt: now,
        speedTestResults: [],
        alertRules: [],
        status: EntityStatus.ACTIVE,
        monitoringEnabled: true,
        monitoringInterval: 30,
        deletedAt: null,
        isActive: true,
        version: 1,
        tags: [],
        lastMonitoredAt: null,
      },
    ];
  }

  private toTargetData(target: StandardizedMonitoringTarget): TargetData {
    return {
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
    };
  }

  async findById(id: string | number): Promise<TargetData | null> {
    this.logger.debug("MockTargetRepository: Finding target by ID", { id });
    const target = this.targets.find(t => t.id === String(id));
    return target ? this.toTargetData(target) : null;
  }

  async findByIdWithRelations(id: string): Promise<MonitoringTarget | null> {
    this.logger.debug(
      "MockTargetRepository: Finding target by ID with relations",
      { id }
    );
    const target = this.targets.find(t => t.id === id);
    if (!target) return null;

    // Convert to domain type with Date objects
    return {
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
      createdAt: target.createdAt,
      updatedAt: target.updatedAt,
      speedTestResults:
        target.speedTestResults?.map(result => ({
          id: result.id,
          ping: result.ping,
          download: result.download,
          upload: result.upload,
          status: result.status,
          error: result.error,
          targetId: result.targetId,
          timestamp: result.createdAt,
          createdAt: result.createdAt,
        })) || [],
      alertRules:
        target.alertRules?.map(rule => ({
          id: rule.id,
          name: rule.name,
          metric: rule.metric as "ping" | "download" | "upload" | "status",
          condition: rule.condition as
            | "GREATER_THAN"
            | "LESS_THAN"
            | "EQUALS"
            | "NOT_EQUALS",
          threshold: rule.threshold,
          enabled: rule.enabled,
          targetId: rule.targetId,
          createdAt: rule.createdAt,
          updatedAt: rule.updatedAt,
        })) || [],
      incidentEvents:
        target.incidentEvents?.map(event => ({
          id: event.id,
          timestamp: event.timestamp,
          type: event.type,
          description: event.description,
          resolved: event.resolved,
          targetId: event.targetId,
          ruleId: event.ruleId,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        })) || [],
    };
  }

  async findByUserId(userId: string): Promise<TargetData[]> {
    this.logger.debug("MockTargetRepository: Finding targets by user ID", {
      userId,
    });
    return this.targets
      .filter(t => t.ownerId === userId)
      .map(t => this.toTargetData(t));
  }

  async findByUserIdWithPagination(
    userId: string,
    limit = 100,
    offset = 0
  ): Promise<TargetData[]> {
    this.logger.debug(
      "MockTargetRepository: Finding targets by user ID with pagination",
      {
        userId,
        limit,
        offset,
      }
    );
    const userTargets = this.targets
      .filter(t => t.ownerId === userId)
      .map(t => this.toTargetData(t));
    return userTargets.slice(offset, offset + limit);
  }

  async countByUserId(userId: string): Promise<number> {
    this.logger.debug("MockTargetRepository: Counting targets by user ID", {
      userId,
    });
    return this.targets.filter(t => t.ownerId === userId).length;
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.logger.debug("MockTargetRepository: Deleting targets by user ID", {
      userId,
    });
    this.targets = this.targets.filter(t => t.ownerId !== userId);
  }

  async findByAddress(address: string): Promise<TargetData | null> {
    this.logger.debug("MockTargetRepository: Finding target by address", {
      address,
    });
    const target = this.targets.find(t => t.address === address);
    return target ? this.toTargetData(target) : null;
  }

  async findByUserIdWithRelations(userId: string): Promise<MonitoringTarget[]> {
    this.logger.debug(
      "MockTargetRepository: Finding targets by user ID with relations",
      {
        userId,
      }
    );
    const targets = this.targets.filter(t => t.ownerId === userId);
    return targets.map(target => ({
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
      createdAt: target.createdAt,
      updatedAt: target.updatedAt,
      speedTestResults:
        target.speedTestResults?.map(result => ({
          id: result.id,
          ping: result.ping,
          download: result.download,
          upload: result.upload,
          status: result.status,
          error: result.error,
          targetId: result.targetId,
          timestamp: result.createdAt,
          createdAt: result.createdAt,
        })) || [],
      alertRules:
        target.alertRules?.map(rule => ({
          id: rule.id,
          name: rule.name,
          metric: rule.metric as "ping" | "download" | "upload" | "status",
          condition: rule.condition as
            | "GREATER_THAN"
            | "LESS_THAN"
            | "EQUALS"
            | "NOT_EQUALS",
          threshold: rule.threshold,
          enabled: rule.enabled,
          targetId: rule.targetId,
          createdAt: rule.createdAt,
          updatedAt: rule.updatedAt,
        })) || [],
      incidentEvents:
        target.incidentEvents?.map(event => ({
          id: event.id,
          timestamp: event.timestamp,
          type: event.type,
          description: event.description,
          resolved: event.resolved,
          targetId: event.targetId,
          ruleId: event.ruleId,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        })) || [],
    }));
  }

  async getAll(limit?: number, offset?: number): Promise<TargetData[]> {
    this.logger.debug("MockTargetRepository: Getting all targets", {
      limit,
      offset,
    });
    let results = [...this.targets];
    if (offset) {
      results = results.slice(offset);
    }
    if (limit) {
      results = results.slice(0, limit);
    }
    return results.map((target: StandardizedMonitoringTarget) => this.toTargetData(target));
  }

  async getAllWithRelations(
    limit?: number,
    offset?: number
  ): Promise<MonitoringTarget[]> {
    this.logger.debug(
      "MockTargetRepository: Getting all targets with relations",
      {
        limit,
        offset,
      }
    );
    let results = [...this.targets];
    if (offset) {
      results = results.slice(offset);
    }
    if (limit) {
      results = results.slice(0, limit);
    }
    return results.map((target: StandardizedMonitoringTarget): MonitoringTarget => ({
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
      createdAt: target.createdAt,
      updatedAt: target.updatedAt,
      speedTestResults:
        target.speedTestResults?.map(result => ({
          id: result.id,
          ping: result.ping,
          download: result.download,
          upload: result.upload,
          status: result.status,
          error: result.error,
          targetId: result.targetId,
          timestamp: result.createdAt,
          createdAt: result.createdAt,
        })) || [],
      alertRules:
        target.alertRules?.map(rule => ({
          id: rule.id,
          name: rule.name,
          metric: rule.metric as "ping" | "download" | "upload" | "status",
          condition: rule.condition as
            | "GREATER_THAN"
            | "LESS_THAN"
            | "EQUALS"
            | "NOT_EQUALS",
          threshold: rule.threshold,
          enabled: rule.enabled,
          targetId: rule.targetId,
          createdAt: rule.createdAt,
          updatedAt: rule.updatedAt,
        })) || [],
      incidentEvents:
        target.incidentEvents?.map(event => ({
          id: event.id,
          timestamp: event.timestamp,
          type: event.type,
          description: event.description,
          resolved: event.resolved,
          targetId: event.targetId,
          ruleId: event.ruleId,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        })) || [],
    }));
  }

  async count(): Promise<number> {
    this.logger.debug("MockTargetRepository: Counting targets");
    return this.targets.length;
  }

  async create(data: CreateTargetData): Promise<TargetData> {
    this.logger.debug("MockTargetRepository: Creating target", { data });
    const now = new Date();
    const newTarget: StandardizedMonitoringTarget = {
      id: `mock-target-${this.targets.length + 1}`,
      name: data.name,
      address: data.address,
      ownerId: data.ownerId,
      createdAt: now,
      updatedAt: now,
      speedTestResults: [],
      alertRules: [],
      status: EntityStatus.ACTIVE,
      monitoringEnabled: true,
      monitoringInterval: 30,
      deletedAt: null,
      isActive: true,
      version: 1,
      tags: [],
      lastMonitoredAt: null,
    };
    this.targets.push(newTarget);
    return this.toTargetData(newTarget);
  }

  async update(id: string | number, data: UpdateTargetData): Promise<TargetData> {
    this.logger.debug("MockTargetRepository: Updating target", { id, data });
    const index = this.targets.findIndex(t => t.id === String(id));
    if (index === -1) {
      throw new Error(`Target with ID ${id} not found`);
    }
    this.targets[index] = {
      ...this.targets[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.toTargetData(this.targets[index] as StandardizedMonitoringTarget);
  }

  async delete(id: string | number): Promise<void> {
    this.logger.debug("MockTargetRepository: Deleting target", { id });
    this.targets = this.targets.filter(t => t.id !== String(id));
  }

  // Helper method for testing
  setSeedData(targets: StandardizedMonitoringTarget[]): void {
    this.targets = targets;
  }

  // Helper method to get all targets for testing
  getAllTargets(): StandardizedMonitoringTarget[] {
    return [...this.targets];
  }
}
