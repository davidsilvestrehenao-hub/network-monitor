import type { IIncidentEventRepository } from "@network-monitor/shared";
import { generateUUID, EntityStatus } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

// Import legacy domain types to match interface expectations
interface IncidentEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  resolved: boolean;
  targetId: string;
  ruleId?: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateIncidentEventData {
  type: "OUTAGE" | "ALERT";
  description: string;
  targetId: string;
  ruleId?: string;
}

interface UpdateIncidentEventData {
  description?: string;
  resolved?: boolean;
}

interface IncidentEventQuery {
  targetId?: string;
  type?: "OUTAGE" | "ALERT";
  resolved?: boolean;
  ruleId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class MockIncidentEventRepository implements IIncidentEventRepository {
  private events: IncidentEvent[] = [];
  private logger?: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger;
    this.seedEvents();
  }

  private seedEvents(): void {
    const now = new Date();
    const nowString = now.toISOString();

    this.events = [
      {
        id: generateUUID(),
        timestamp: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
        type: "ALERT",
        description: "High ping detected: 150ms",
        resolved: false,
        targetId: "target-1",
        ruleId: "rule-1",
        createdAt: nowString,
        updatedAt: nowString,
      },
      {
        id: generateUUID(),
        timestamp: new Date(now.getTime() - 7200000).toISOString(), // 2 hours ago
        type: "OUTAGE",
        description: "Connection timeout",
        resolved: true,
        targetId: "target-1",
        ruleId: undefined,
        createdAt: nowString,
        updatedAt: nowString,
      },
      {
        id: generateUUID(),
        timestamp: new Date(now.getTime() - 1800000).toISOString(), // 30 minutes ago
        type: "ALERT",
        description: "Low download speed: 25Mbps",
        resolved: false,
        targetId: "target-2",
        ruleId: "rule-2",
        createdAt: nowString,
        updatedAt: nowString,
      },
    ];
  }

  async findById(id: string): Promise<IncidentEvent | null> {
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
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
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
        event => new Date(event.timestamp) >= (query.startDate as Date)
      );
    }

    if (query.endDate) {
      filteredEvents = filteredEvents.filter(
        event => new Date(event.timestamp) <= (query.endDate as Date)
      );
    }

    return filteredEvents
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));
  }

  async getUnresolvedByTargetId(targetId: string): Promise<IncidentEvent[]> {
    this.logger?.debug(
      "MockIncidentEventRepository: Getting unresolved events by target ID",
      { targetId }
    );
    return this.events
      .filter(event => event.targetId === targetId && !event.resolved)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  async getAll(limit = 100, offset = 0): Promise<IncidentEvent[]> {
    this.logger?.debug("MockIncidentEventRepository: Getting all events", {
      limit,
      offset,
    });
    return this.events
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(offset, offset + limit);
  }

  async count(): Promise<number> {
    this.logger?.debug("MockIncidentEventRepository: Counting events");
    return this.events.length;
  }

  async create(data: CreateIncidentEventData): Promise<IncidentEvent> {
    this.logger?.debug("MockIncidentEventRepository: Creating event", { data });

    const now = new Date().toISOString();
    const event: IncidentEvent = {
      id: generateUUID(),
      timestamp: now,
      type: data.type,
      description: data.description,
      resolved: false,
      targetId: data.targetId,
      ruleId: data.ruleId || undefined,
      createdAt: now,
      updatedAt: now,
    };

    this.events.push(event);
    return event;
  }

  async update(
    id: string,
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

  async delete(id: string): Promise<void> {
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

  async resolve(id: string): Promise<IncidentEvent> {
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
  }

  // Helper method to get all events for testing
  getAllEvents(): IncidentEvent[] {
    return [...this.events];
  }
}
