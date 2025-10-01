import type {
  IIncidentEventRepository,
  IncidentEvent,
  CreateIncidentEventData,
  UpdateIncidentEventData,
  IncidentEventQuery,
} from "@network-monitor/shared";
import type { IDatabaseService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class IncidentEventRepository implements IIncidentEventRepository {
  constructor(
    private databaseService: IDatabaseService,
    private logger: ILogger
  ) {}

  async findById(id: number): Promise<IncidentEvent | null> {
    this.logger.debug("IncidentEventRepository: Finding event by ID", { id });

    const prismaEvent = await this.databaseService
      .getClient()
      .incidentEvent.findUnique({
        where: { id },
        include: {
          triggeredByRule: true,
        },
      });

    return prismaEvent ? this.mapToIncidentEvent(prismaEvent) : null;
  }

  async findByTargetId(
    targetId: string,
    limit = 100
  ): Promise<IncidentEvent[]> {
    this.logger.debug("IncidentEventRepository: Finding events by target ID", {
      targetId,
      limit,
    });

    const prismaEvents = await this.databaseService
      .getClient()
      .incidentEvent.findMany({
        where: { targetId },
        include: {
          triggeredByRule: true,
        },
        orderBy: { timestamp: "desc" },
        take: limit,
      });

    return prismaEvents.map(event => this.mapToIncidentEvent(event));
  }

  async findByQuery(query: IncidentEventQuery): Promise<IncidentEvent[]> {
    this.logger.debug("IncidentEventRepository: Finding events by query", {
      query,
    });

    const where: Record<string, unknown> = {};

    if (query.targetId) {
      where.targetId = query.targetId;
    }

    if (query.type) {
      where.type = query.type;
    }

    if (query.resolved !== undefined) {
      where.resolved = query.resolved;
    }

    if (query.ruleId) {
      where.ruleId = query.ruleId;
    }

    if (query.startDate || query.endDate) {
      where.timestamp = {} as Record<string, Date>;
      if (query.startDate) {
        (where.timestamp as Record<string, Date>).gte = query.startDate;
      }
      if (query.endDate) {
        (where.timestamp as Record<string, Date>).lte = query.endDate;
      }
    }

    const prismaEvents = await this.databaseService
      .getClient()
      .incidentEvent.findMany({
        where,
        include: {
          triggeredByRule: true,
        },
        orderBy: { timestamp: "desc" },
        take: query.limit || 100,
        skip: query.offset || 0,
      });

    return prismaEvents.map(event => this.mapToIncidentEvent(event));
  }

  async getUnresolvedByTargetId(targetId: string): Promise<IncidentEvent[]> {
    this.logger.debug(
      "IncidentEventRepository: Getting unresolved events by target ID",
      { targetId }
    );

    const prismaEvents = await this.databaseService
      .getClient()
      .incidentEvent.findMany({
        where: {
          targetId,
          resolved: false,
        },
        include: {
          triggeredByRule: true,
        },
        orderBy: { timestamp: "desc" },
      });

    return prismaEvents.map(event => this.mapToIncidentEvent(event));
  }

  async findUnresolved(): Promise<IncidentEvent[]> {
    this.logger.debug("IncidentEventRepository: Finding unresolved events");

    const prismaEvents = await this.databaseService
      .getClient()
      .incidentEvent.findMany({
        where: {
          resolved: false,
        },
        include: {
          triggeredByRule: true,
        },
        orderBy: { timestamp: "desc" },
      });

    return prismaEvents.map(event => this.mapToIncidentEvent(event));
  }

  async getAll(limit = 100, offset = 0): Promise<IncidentEvent[]> {
    this.logger.debug("IncidentEventRepository: Getting all events", {
      limit,
      offset,
    });

    const prismaEvents = await this.databaseService
      .getClient()
      .incidentEvent.findMany({
        include: {
          triggeredByRule: true,
        },
        orderBy: { timestamp: "desc" },
        take: limit,
        skip: offset,
      });

    return prismaEvents.map(event => this.mapToIncidentEvent(event));
  }

  async count(): Promise<number> {
    this.logger.debug("IncidentEventRepository: Counting events");
    return await this.databaseService.getClient().incidentEvent.count();
  }

  async create(data: CreateIncidentEventData): Promise<IncidentEvent> {
    this.logger.debug("IncidentEventRepository: Creating event", { data });

    const prismaEvent = await this.databaseService
      .getClient()
      .incidentEvent.create({
        data,
        include: {
          triggeredByRule: true,
        },
      });

    return this.mapToIncidentEvent(prismaEvent);
  }

  async update(
    id: number,
    data: UpdateIncidentEventData
  ): Promise<IncidentEvent> {
    this.logger.debug("IncidentEventRepository: Updating event", { id, data });

    const prismaEvent = await this.databaseService
      .getClient()
      .incidentEvent.update({
        where: { id },
        data,
        include: {
          triggeredByRule: true,
        },
      });

    return this.mapToIncidentEvent(prismaEvent);
  }

  async delete(id: number): Promise<void> {
    this.logger.debug("IncidentEventRepository: Deleting event", { id });
    await this.databaseService.getClient().incidentEvent.delete({
      where: { id },
    });
  }

  async deleteByTargetId(targetId: string): Promise<void> {
    this.logger.debug("IncidentEventRepository: Deleting events by target ID", {
      targetId,
    });
    await this.databaseService.getClient().incidentEvent.deleteMany({
      where: { targetId },
    });
  }

  async resolve(id: number): Promise<IncidentEvent> {
    this.logger.debug("IncidentEventRepository: Resolving event", { id });

    const prismaEvent = await this.databaseService
      .getClient()
      .incidentEvent.update({
        where: { id },
        data: { resolved: true },
        include: {
          triggeredByRule: true,
        },
      });

    return this.mapToIncidentEvent(prismaEvent);
  }

  async resolveByTargetId(targetId: string): Promise<number> {
    this.logger.debug(
      "IncidentEventRepository: Resolving events by target ID",
      { targetId }
    );

    const { count } = await this.databaseService
      .getClient()
      .incidentEvent.updateMany({
        where: {
          targetId,
          resolved: false,
        },
        data: { resolved: true },
      });

    return count;
  }

  private mapToIncidentEvent(prismaEvent: unknown): IncidentEvent {
    const event = prismaEvent as {
      id: number;
      timestamp: Date;
      type: string;
      description: string;
      resolved: boolean;
      targetId: string;
      ruleId: number | null;
      triggeredByRule?: {
        id: number;
        name: string;
        metric: string;
        condition: string;
        threshold: number;
        enabled: boolean;
        targetId: string;
      } | null;
    };

    return {
      id: event.id,
      timestamp: event.timestamp,
      type: event.type as "OUTAGE" | "ALERT",
      description: event.description,
      resolved: event.resolved,
      targetId: event.targetId,
      ruleId: event.ruleId ?? undefined,
      triggeredByRule: event.triggeredByRule
        ? {
            id: event.triggeredByRule.id,
            name: event.triggeredByRule.name,
            metric: event.triggeredByRule.metric as "ping" | "download",
            condition: event.triggeredByRule.condition as
              | "GREATER_THAN"
              | "LESS_THAN",
            threshold: event.triggeredByRule.threshold,
            enabled: event.triggeredByRule.enabled,
            targetId: event.triggeredByRule.targetId,
            triggeredEvents: [],
          }
        : null,
    };
  }
}
