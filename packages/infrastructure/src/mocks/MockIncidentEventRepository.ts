import type {
  IIncidentEventRepository,
  IncidentEvent,
  CreateIncidentEventData,
  UpdateIncidentEventData,
  IncidentEventQuery,
} from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class MockIncidentEventRepository implements IIncidentEventRepository {
  private events: IncidentEvent[] = [];
  private nextId = 1;

  constructor(private logger?: ILogger) {
    this.seedEvents();
  }

  private seedEvents(): void {
    const now = new Date();

    this.events = [
      {
        id: this.nextId++,
        timestamp: new Date(now.getTime() - 3600000), // 1 hour ago
        type: "ALERT",
        description: "High ping detected: 150ms",
        resolved: false,
        targetId: "target-1",
        ruleId: 1,
        triggeredByRule: null,
      },
      {
        id: this.nextId++,
        timestamp: new Date(now.getTime() - 7200000), // 2 hours ago
        type: "OUTAGE",
        description: "Connection timeout",
        resolved: true,
        targetId: "target-1",
        ruleId: undefined,
        triggeredByRule: null,
      },
      {
        id: this.nextId++,
        timestamp: new Date(now.getTime() - 1800000), // 30 minutes ago
        type: "ALERT",
        description: "Low download speed: 25Mbps",
        resolved: false,
        targetId: "target-2",
        ruleId: 2,
        triggeredByRule: null,
      },
    ];
  }

  async findById(id: number): Promise<IncidentEvent | null> {
    this.logger?.debug("MockIncidentEventRepository: Finding event by ID", {
      id,
    });
    return this.events.find(event => event.id === id) || null;
  }

  async findByTargetId(
    targetId: string,
    limit = 100
  ): Promise<IncidentEvent[]> {
    this.logger?.debug(
      "MockIncidentEventRepository: Finding events by target ID",
      { targetId, limit }
    );
    return this.events
      .filter(event => event.targetId === targetId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async findByQuery(query: IncidentEventQuery): Promise<IncidentEvent[]> {
    this.logger?.debug("MockIncidentEventRepository: Finding events by query", {
      query,
    });

    let filteredEvents = [...this.events];

    if (query.targetId) {
      filteredEvents = filteredEvents.filter(
        event => event.targetId === query.targetId
      );
    }

    if (query.type) {
      filteredEvents = filteredEvents.filter(
        event => event.type === query.type
      );
    }

    if (query.resolved !== undefined) {
      filteredEvents = filteredEvents.filter(
        event => event.resolved === query.resolved
      );
    }

    if (query.ruleId) {
      filteredEvents = filteredEvents.filter(
        event => event.ruleId === query.ruleId
      );
    }

    if (query.startDate) {
      filteredEvents = filteredEvents.filter(
        event => event.timestamp >= (query.startDate as Date)
      );
    }

    if (query.endDate) {
      filteredEvents = filteredEvents.filter(
        event => event.timestamp <= (query.endDate as Date)
      );
    }

    return filteredEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));
  }

  async getUnresolvedByTargetId(targetId: string): Promise<IncidentEvent[]> {
    this.logger?.debug(
      "MockIncidentEventRepository: Getting unresolved events by target ID",
      { targetId }
    );
    return this.events
      .filter(event => event.targetId === targetId && !event.resolved)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getAll(limit = 100, offset = 0): Promise<IncidentEvent[]> {
    this.logger?.debug("MockIncidentEventRepository: Getting all events", {
      limit,
      offset,
    });
    return this.events
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
  }

  async count(): Promise<number> {
    this.logger?.debug("MockIncidentEventRepository: Counting events");
    return this.events.length;
  }

  async create(data: CreateIncidentEventData): Promise<IncidentEvent> {
    this.logger?.debug("MockIncidentEventRepository: Creating event", { data });

    const event: IncidentEvent = {
      id: this.nextId++,
      timestamp: new Date(),
      type: data.type,
      description: data.description,
      resolved: false,
      targetId: data.targetId,
      ruleId: data.ruleId || undefined,
      triggeredByRule: null,
    };

    this.events.push(event);
    return event;
  }

  async update(
    id: number,
    data: UpdateIncidentEventData
  ): Promise<IncidentEvent> {
    this.logger?.debug("MockIncidentEventRepository: Updating event", {
      id,
      data,
    });

    const eventIndex = this.events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error(`Incident event with ID ${id} not found`);
    }

    const event = this.events[eventIndex];
    this.events[eventIndex] = {
      ...event,
      ...data,
    };

    return this.events[eventIndex];
  }

  async delete(id: number): Promise<void> {
    this.logger?.debug("MockIncidentEventRepository: Deleting event", { id });

    const eventIndex = this.events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error(`Incident event with ID ${id} not found`);
    }

    this.events.splice(eventIndex, 1);
  }

  async deleteByTargetId(targetId: string): Promise<void> {
    this.logger?.debug(
      "MockIncidentEventRepository: Deleting events by target ID",
      { targetId }
    );
    this.events = this.events.filter(event => event.targetId !== targetId);
  }

  async resolve(id: number): Promise<IncidentEvent> {
    this.logger?.debug("MockIncidentEventRepository: Resolving event", { id });

    const eventIndex = this.events.findIndex(event => event.id === id);
    if (eventIndex === -1) {
      throw new Error(`Incident event with ID ${id} not found`);
    }

    this.events[eventIndex].resolved = true;
    return this.events[eventIndex];
  }

  async resolveByTargetId(targetId: string): Promise<number> {
    this.logger?.debug(
      "MockIncidentEventRepository: Resolving events by target ID",
      { targetId }
    );

    let resolvedCount = 0;
    this.events.forEach(event => {
      if (event.targetId === targetId && !event.resolved) {
        event.resolved = true;
        resolvedCount++;
      }
    });

    return resolvedCount;
  }

  async findUnresolved(): Promise<IncidentEvent[]> {
    this.logger?.debug(
      "MockIncidentEventRepository: Finding unresolved events",
      { query: {} }
    );
    return this.events.filter(event => !event.resolved);
  }

  // Helper method for testing
  setSeedData(events: IncidentEvent[]): void {
    this.events = events;
    this.nextId = Math.max(...events.map(e => e.id), 0) + 1;
  }

  // Helper method to get all events for testing
  getAllEvents(): IncidentEvent[] {
    return [...this.events];
  }
}
