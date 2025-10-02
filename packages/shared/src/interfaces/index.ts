// Export base interfaces first (for consistency and polymorphism)
export * from "./base/index";

// Export specific types that are commonly used
export type { EventHandler } from "./base/IEventBus";
export type {
  TargetData,
  CreateTargetData,
  UpdateTargetData,
} from "./ITargetRepository";

// Export domain-specific event and logger interfaces (with explicit naming to avoid conflicts)
export {
  IEventBus as IDomainEventBus,
  BackendEvents,
  FrontendEvents,
} from "./IEventBus";
export {
  ILogger as IDomainLogger,
  LogLevel as DomainLogLevel,
  LogContext as DomainLogContext,
} from "./ILogger";

// Export all service interfaces (excluding duplicates from base)
export * from "./IAlertingService";
export * from "./IAlertRepository";
export * from "./IAlertRuleRepository";
export * from "./IAuthService";
export * from "./IDatabaseService";
export * from "./IIncidentEventRepository";
export * from "./IMonitoringScheduler";
export * from "./IMonitoringTargetRepository";
export * from "./IMonitorService";
export * from "./INotificationRepository";
export * from "./INotificationService";
export * from "./IPushSubscriptionRepository";
export * from "./ISpeedTestConfig";
export * from "./ISpeedTestRepository";
export * from "./ISpeedTestResultRepository";
export * from "./ISpeedTestService";
export * from "./ITargetRepository";
export * from "./IUserRepository";
