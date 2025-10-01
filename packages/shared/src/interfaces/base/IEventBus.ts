// Base event bus interface that all event buses should extend
// This ensures consistency and polymorphism across all event-driven communication

export interface IEventBus {
  // Event subscription
  on<T = unknown>(event: string, handler: EventHandler<T>): void;
  once<T = unknown>(event: string, handler: EventHandler<T>): void;
  off<T = unknown>(event: string, handler: EventHandler<T>): void;

  // Event emission
  emit<T = unknown>(event: string, data: T): void | Promise<void>;
  emitAsync<T = unknown>(event: string, data: T): Promise<void>;

  // Event management
  removeAllListeners(event?: string): void;
  listenerCount(event: string): number;
  eventNames(): string[];

  // Lifecycle
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// Event handler type
export type EventHandler<T = unknown> = (data?: T) => void | Promise<void>;

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
