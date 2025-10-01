import type { IEventBus } from "../interfaces/IEventBus";

type EventHandler = (data?: unknown) => void;

export class MockEventBus implements IEventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();
  private events: Array<{ event: string; data?: unknown; timestamp: Date }> =
    [];

  emit(event: string, data?: unknown): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          // Justification: Mock EventBus is infrastructure - must use console for error handling
          // eslint-disable-next-line no-console
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }

    // Store event for testing
    this.events.push({
      event,
      data,
      timestamp: new Date(),
    });
  }

  on<T = unknown>(event: string, handler: (data?: T) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.add(handler as EventHandler);
    }
  }

  off<T = unknown>(event: string, handler: (data?: T) => void): void {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.delete(handler as EventHandler);
      if (handlers.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  once<T = unknown>(event: string, handler: (data?: T) => void): void {
    const onceHandler = (data?: unknown) => {
      handler(data as T);
      this.off(event, onceHandler);
    };
    this.on(event, onceHandler);
  }

  emitTyped<T>(event: string, data: T): void {
    this.emit(event, data);
  }

  onTyped<T>(event: string, handler: (data: T) => void): void {
    this.on(event, handler as EventHandler);
  }

  onceTyped<T>(event: string, handler: (data: T) => void): void {
    this.once(event, handler as EventHandler);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  // Mock-specific methods for testing
  getEvents(): Array<{ event: string; data?: unknown; timestamp: Date }> {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }

  getEventCount(): number {
    return this.events.length;
  }

  getListeners(event: string): Set<EventHandler> {
    return this.listeners.get(event) || new Set();
  }

  hasListeners(event: string): boolean {
    const handlers = this.listeners.get(event);
    return this.listeners.has(event) && handlers ? handlers.size > 0 : false;
  }
}
