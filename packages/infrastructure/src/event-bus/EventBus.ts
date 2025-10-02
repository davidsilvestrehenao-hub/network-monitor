import type { IEventBus, EventHandler } from "@network-monitor/shared";
import type { EventName, EventData, TypedEvent } from "@network-monitor/shared";

export class EventBus implements IEventBus {
  private listeners: Map<
    string,
    Set<(...args: unknown[]) => void | Promise<void>>
  > = new Map();
  private connected: boolean = false;

  // Strongly-typed event methods (preferred)
  emit<T extends EventName>(event: T, data: EventData<T>): void {
    this.emitInternal(event as string, data);
  }

  async emitAsync<T extends EventName>(
    event: T,
    data: EventData<T>
  ): Promise<void> {
    await this.emitAsyncInternal(event as string, data);
  }

  on<T extends EventName>(
    event: T,
    handler: (data: EventData<T>) => void
  ): void {
    // Justification: Type casting needed for generic event handler compatibility with internal storage
    this.onInternal(event as string, handler as (...args: unknown[]) => void);
  }

  once<T extends EventName>(
    event: T,
    handler: (data: EventData<T>) => void
  ): void {
    // Justification: Type casting needed for generic event handler compatibility with internal storage
    this.onceInternal(event as string, handler as (...args: unknown[]) => void);
  }

  off<T extends EventName>(
    event: T,
    handler: (data: EventData<T>) => void
  ): void {
    // Justification: Type casting needed for generic event handler compatibility with internal storage
    this.offInternal(event as string, handler as (...args: unknown[]) => void);
  }

  // Dynamic event methods (for events not in EventMap)
  emitDynamic<T = unknown>(event: string, data: T): void {
    this.emitInternal(event, data);
  }

  async emitAsyncDynamic<T = unknown>(event: string, data: T): Promise<void> {
    await this.emitAsyncInternal(event, data);
  }

  onDynamic<T = unknown>(event: string, handler: EventHandler<T>): void {
    // Justification: Type casting needed for generic event handler compatibility with internal storage
    this.onInternal(event, handler as (...args: unknown[]) => void);
  }

  onceDynamic<T = unknown>(event: string, handler: EventHandler<T>): void {
    // Justification: Type casting needed for generic event handler compatibility with internal storage
    this.onceInternal(event, handler as (...args: unknown[]) => void);
  }

  offDynamic<T = unknown>(event: string, handler: EventHandler<T>): void {
    // Justification: Type casting needed for generic event handler compatibility with internal storage
    this.offInternal(event, handler as (...args: unknown[]) => void);
  }

  // Typed event object methods
  publishEvent<T extends EventName>(event: TypedEvent<T>): void {
    this.emitInternal(event.type as string, event);
  }

  subscribeToEvent<T extends EventName>(
    eventType: T,
    handler: (event: TypedEvent<T>) => void
  ): void {
    // Justification: Type casting needed for generic event handler compatibility with internal storage
    this.onInternal(
      eventType as string,
      handler as (...args: unknown[]) => void
    );
  }

  // Event validation
  isValidEventType(eventType: string): eventType is EventName {
    // For now, accept any string as a valid event type
    // This can be enhanced later with proper validation
    return typeof eventType === "string" && eventType.length > 0;
  }

  validateEventData<T extends EventName>(
    eventType: T,
    data: unknown
  ): data is EventData<T> {
    // Basic validation - in a real implementation, you might use a schema validator
    return data !== null && data !== undefined;
  }

  getTypedEventNames(): EventName[] {
    return Array.from(this.listeners.keys()).filter(this.isValidEventType);
  }

  // Internal implementation methods
  private emitInternal(event: string, data: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          // Justification: EventBus is infrastructure - must use console for error handling
          // eslint-disable-next-line no-console
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  private async emitAsyncInternal(event: string, data: unknown): Promise<void> {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const promises = Array.from(handlers).map(async handler => {
        try {
          const result = handler(data);
          if (result instanceof Promise) {
            await result;
          }
        } catch (error) {
          // Justification: EventBus is infrastructure - must use console for error handling
          // eslint-disable-next-line no-console
          console.error(`Error in async event handler for ${event}:`, error);
        }
      });
      await Promise.all(promises);
    }
  }

  private onInternal(
    event: string,
    handler: (...args: unknown[]) => void | Promise<void>
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.add(handler);
    }
  }

  private onceInternal(
    event: string,
    handler: (...args: unknown[]) => void | Promise<void>
  ): void {
    const onceHandler = (data: unknown) => {
      handler(data);
      this.offInternal(event, onceHandler);
    };
    this.onInternal(event, onceHandler);
  }

  private offInternal(
    event: string,
    handler: (...args: unknown[]) => void | Promise<void>
  ): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  // Event management
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  // Lifecycle
  async connect(): Promise<void> {
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.connected = false;
    this.listeners.clear();
  }

  isConnected(): boolean {
    return this.connected;
  }
}
