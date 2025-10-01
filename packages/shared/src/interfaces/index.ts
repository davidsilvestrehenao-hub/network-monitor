// Export base interfaces first (for consistency and polymorphism)
export * from "./base/index.js";

// Export specific types that are commonly used
export type { EventHandler } from "./base/IEventBus.js";
export type {
  TargetData,
  CreateTargetData,
  UpdateTargetData,
} from "./ITargetRepository.js";

// Export all service interfaces (excluding duplicates from base)
export * from "./IAlertingService.js";
export * from "./IAlertRepository.js";
export * from "./IAlertRuleRepository.js";
export * from "./IAuthService.js";
export * from "./IDatabaseService.js";
export * from "./IIncidentEventRepository.js";
export * from "./IMonitoringScheduler.js";
export * from "./IMonitoringTargetRepository.js";
export * from "./IMonitorService.js";
export * from "./INotificationRepository.js";
export * from "./INotificationService.js";
export * from "./IPushSubscriptionRepository.js";
export * from "./ISpeedTestConfig.js";
export * from "./ISpeedTestRepository.js";
export * from "./ISpeedTestResultRepository.js";
export * from "./ISpeedTestService.js";
export * from "./ITargetRepository.js";
export * from "./IUserRepository.js";
