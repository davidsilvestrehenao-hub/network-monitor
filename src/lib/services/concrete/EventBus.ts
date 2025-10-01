import type { IEventBus } from "../interfaces/IEventBus";

type EventHandler = (data?: unknown) => void;

export class EventBus implements IEventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  emit(event: string, data?: unknown): void {
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

  emitTyped<T>(event: string, data: T): void {
    this.emit(event, data);
  }

  on<T = unknown>(event: string, handler: (data?: T) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.add(handler as EventHandler);
    }
  }

  onTyped<T>(event: string, handler: (data: T) => void): void {
    this.on(event, handler as (data?: unknown) => void);
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

  onceTyped<T>(event: string, handler: (data: T) => void): void {
    this.once(event, handler as (data?: unknown) => void);
  }

  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  // Utility methods for debugging
  getListenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }

  getEvents(): string[] {
    return Array.from(this.listeners.keys());
  }
}
