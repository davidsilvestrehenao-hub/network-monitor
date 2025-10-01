import type {
  IMonitoringTargetRepository,
  MonitoringTarget,
  CreateMonitoringTargetData,
  UpdateMonitoringTargetData,
} from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class MockMonitoringTargetRepository
  implements IMonitoringTargetRepository
{
  private targets: MonitoringTarget[] = [];

  constructor(private logger?: ILogger) {
    this.seedTargets();
  }

  private seedTargets(): void {
    this.targets = [
      {
        id: "target-1",
        name: "Google DNS",
        address: "https://8.8.8.8",
        ownerId: "anonymous",
        speedTestResults: [],
        incidentEvents: [],
        alertRules: [],
      },
      {
        id: "target-2",
        name: "Cloudflare DNS",
        address: "https://1.1.1.1",
        ownerId: "anonymous",
        speedTestResults: [],
        incidentEvents: [],
        alertRules: [],
      },
      {
        id: "target-3",
        name: "GitHub",
        address: "https://github.com",
        ownerId: "user-1",
        speedTestResults: [],
        incidentEvents: [],
        alertRules: [],
      },
    ];
  }

  async findById(id: string): Promise<MonitoringTarget | null> {
    this.logger?.debug("MockMonitoringTargetRepository: Finding target by ID", {
      id,
    });
    return this.targets.find(target => target.id === id) || null;
  }

  async findByOwnerId(ownerId: string): Promise<MonitoringTarget[]> {
    this.logger?.debug(
      "MockMonitoringTargetRepository: Finding targets by owner ID",
      { ownerId }
    );
    return this.targets.filter(target => target.ownerId === ownerId);
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

    const target: MonitoringTarget = {
      id: `target-${Date.now()}`,
      name: data.name,
      address: data.address,
      ownerId: data.ownerId,
      speedTestResults: [],
      incidentEvents: [],
      alertRules: [],
    };

    this.targets.push(target);
    return target;
  }

  async update(
    id: string,
    data: UpdateMonitoringTargetData
  ): Promise<MonitoringTarget> {
    this.logger?.debug("MockMonitoringTargetRepository: Updating target", {
      id,
      data,
    });

    const targetIndex = this.targets.findIndex(target => target.id === id);
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

  async delete(id: string): Promise<void> {
    this.logger?.debug("MockMonitoringTargetRepository: Deleting target", {
      id,
    });

    const targetIndex = this.targets.findIndex(target => target.id === id);
    if (targetIndex === -1) {
      throw new Error(`Target with ID ${id} not found`);
    }

    this.targets.splice(targetIndex, 1);
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
