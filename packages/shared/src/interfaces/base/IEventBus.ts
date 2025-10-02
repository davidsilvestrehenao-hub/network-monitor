// Base event bus interface that all event buses should extend
// This ensures consistency and polymorphism across all event-driven communication

import type {
  EventMap,
  EventName,
  EventData,
  TypedEvent,
} from "../../types/event-map-types";

export interface IEventBus {
  // Strongly-typed event methods (preferred)
  on<T extends EventName>(
    event: T,
    handler: (data: EventData<T>) => void
  ): void;
  once<T extends EventName>(
    event: T,
    handler: (data: EventData<T>) => void
  ): void;
  off<T extends EventName>(
    event: T,
    handler: (data: EventData<T>) => void
  ): void;
  emit<T extends EventName>(event: T, data: EventData<T>): void | Promise<void>;
  emitAsync<T extends EventName>(event: T, data: EventData<T>): Promise<void>;

  // Dynamic event methods (for events not in EventMap)
  onDynamic<T = unknown>(event: string, handler: EventHandler<T>): void;
  onceDynamic<T = unknown>(event: string, handler: EventHandler<T>): void;
  offDynamic<T = unknown>(event: string, handler: EventHandler<T>): void;
  emitDynamic<T = unknown>(event: string, data: T): void | Promise<void>;
  emitAsyncDynamic<T = unknown>(event: string, data: T): Promise<void>;

  // Typed event object methods
  publishEvent<T extends EventName>(event: TypedEvent<T>): void | Promise<void>;
  subscribeToEvent<T extends EventName>(
    eventType: T,
    handler: (event: TypedEvent<T>) => void
  ): void;

  // Event management
  removeAllListeners(event?: string): void;
  listenerCount(event: string): number;
  eventNames(): string[];
  getTypedEventNames(): EventName[];

  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Event validation
  isValidEventType(eventType: string): eventType is EventName;
  validateEventData<T extends EventName>(
    eventType: T,
    data: unknown
  ): data is EventData<T>;
}

// Event handler type for dynamic events
export type EventHandler<T = unknown> = (data?: T) => void | Promise<void>;

// Event types are imported above and used in the interface
// No need to re-export since they're already available through the import

// Event metadata interface
export interface EventMetadata {
  id: string;
  timestamp: Date;
  source: string;
  version: string;
  correlationId?: string;
  causationId?: string;
}

// Event wrapper interface
export interface Event<T = unknown> {
  type: string;
  data: T;
  metadata: EventMetadata;
}

// Base event bus for domain events
export interface IDomainEventBus extends IEventBus {
  // Domain event specific methods
  publish<T = unknown>(event: Event<T>): void | Promise<void>;
  subscribe<T = unknown>(eventType: string, handler: EventHandler<T>): void;
  unsubscribe<T = unknown>(eventType: string, handler: EventHandler<T>): void;

  // Event persistence
  persistEvent<T = unknown>(event: Event<T>): Promise<void>;
  replayEvents(fromTimestamp?: Date, toTimestamp?: Date): Promise<void>;

  // Event sourcing
  getEventStream(aggregateId: string, fromVersion?: number): Promise<Event[]>;
  appendEvents(aggregateId: string, events: Event[]): Promise<void>;
}

// Base event bus for integration events
export interface IIntegrationEventBus extends IEventBus {
  // Integration event specific methods
  publishIntegrationEvent<T = unknown>(event: Event<T>): Promise<void>;
  subscribeToIntegrationEvent<T = unknown>(
    eventType: string,
    handler: EventHandler<T>
  ): void;

  // Dead letter queue
  publishToDeadLetterQueue<T = unknown>(
    event: Event<T>,
    error: Error
  ): Promise<void>;
  processDeadLetterQueue(): Promise<void>;

  // Circuit breaker
  isCircuitOpen(): boolean;
  getCircuitState(): "closed" | "open" | "half-open";
  resetCircuit(): void;
}
