// Export base interfaces first (for consistency and polymorphism)
export * from "./base/index";

// Export specific event types that are commonly used
export type { EventHandler } from "./base/IEventBus";

// Export event types from event-map-types
export type {
  EventName,
  EventData,
  TypedEvent,
} from "../types/event-map-types";

// Export organized interface categories
export * from "./services";
export * from "./repositories";
export * from "./workers";

// Export infrastructure interfaces with specific naming to avoid conflicts
export type {
  MonitoringTargetConfig,
  SchedulerStats,
  IMonitoringScheduler,
  NotificationData,
  IPrisma,
  IPrismaService,
  IDatabaseService,
} from "./infrastructure";
export {
  IEventBus as IInfrastructureEventBus,
  BackendEvents,
  FrontendEvents,
} from "./infrastructure/IEventBus";

// Export logger interfaces with specific naming to avoid conflicts
export { ILogger as ILoggerInterface } from "./loggers/ILogger";
export type { LogLevel, LogContext } from "./loggers/ILogger";

// Export specific types that are commonly used
// Note: EventHandler is exported from base/index.ts to avoid conflicts
export type {
  TargetData,
  CreateTargetData,
  UpdateTargetData,
} from "./repositories/ITargetRepository";
