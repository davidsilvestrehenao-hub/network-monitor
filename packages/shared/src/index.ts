// Shared package - interfaces, types, and utilities
export * from "./interfaces/index";

// Export domain types that are used throughout the codebase
export * from "./types/domain-types";

// Export specific config schema types that are needed by infrastructure package
export type {
  ConfigSchema,
  TypedConfigManager,
  ConfigValidationResult,
  ConfigValidationError,
  ConfigValidationWarning,
  ConfigDocumentation,
  ConfigLoader,
  ConfigLoadResult,
  ConfigSource,
  ConfigSourceInfo,
  TypedConfig,
} from "./types/config-schema-types";

// Event handler types are now exported from interfaces/index.ts
export * from "./constants/event-keys";
export * from "./constants/domain-constants";
export * from "./utils/uuid";
// Export UUID schemas with specific names to avoid conflicts
export {
  UUIDSchema,
  OptionalUUIDSchema,
  NullableUUIDSchema,
  UUIDArraySchema,
  QueryUUIDSchema,
  FormUUIDSchema,
  IDParamSchema,
  UUIDType,
  UUIDArrayType,
  IDParamType,
} from "./validation/uuid-schemas";
// Export specific utility functions that are needed by applications
export { getBunGlobal, isBunRuntime } from "./types/bun-global-types";

// Export domain types that are commonly used
// Note: Legacy aliases are now provided by standardized-domain-types to avoid conflicts

// Export standardized domain types (preferred)
export type {
  StandardizedUser,
  StandardizedMonitoringTarget,
  StandardizedSpeedTestResult,
  StandardizedAlertRule,
  StandardizedIncidentEvent,
  StandardizedPushSubscription,
  StandardizedNotification,
  StandardizedSpeedTestUrl,
  StandardizedUserSpeedTestPreference,
  // Legacy aliases for backward compatibility
  User,
  MonitoringTarget,
  Target,
  SpeedTestResult,
  SpeedTest,
  AlertRule,
  IncidentEvent,
  PushSubscription,
  Notification,
  SpeedTestUrl,
  UserSpeedTestPreference,
} from "./types/standardized-domain-types";

// Export DTO types
export type {
  CreateMonitoringTargetDTO,
  UpdateMonitoringTargetDTO,
  MonitoringTargetQueryDTO,
  CreateSpeedTestResultDTO,
  UpdateSpeedTestResultDTO,
  SpeedTestResultQueryDTO,
  CreateAlertRuleDTO,
  UpdateAlertRuleDTO,
  AlertRuleQueryDTO,
  CreateIncidentEventDTO,
  UpdateIncidentEventDTO,
  IncidentEventQueryDTO,
  CreatePushSubscriptionDTO,
  UpdatePushSubscriptionDTO,
  PushSubscriptionQueryDTO,
  CreateNotificationDTO,
  UpdateNotificationDTO,
  NotificationQueryDTO,
  CreateSpeedTestUrlDTO,
  UpdateSpeedTestUrlDTO,
  SpeedTestUrlQueryDTO,
  CreateUserSpeedTestPreferenceDTO,
  UpdateUserSpeedTestPreferenceDTO,
  UserSpeedTestPreferenceQueryDTO,
  // Legacy aliases
  CreateTargetData,
  UpdateTargetData,
  CreateAlertRuleData,
  UpdateAlertRuleData,
  CreateIncidentEventData,
  UpdateIncidentEventData,
  CreatePushSubscriptionData,
  UpdatePushSubscriptionData,
  CreateNotificationData,
  UpdateNotificationData,
  CreateSpeedTestUrlData,
  UpdateSpeedTestUrlData,
} from "./types/standardized-dto-types";

// Export event handler types
export type {
  LoginCredentials,
  RegisterData,
  TargetCreateRequestData,
  TargetUpdateRequestData,
  TargetDeleteRequestData,
  MonitoringStartRequestData,
  MonitoringStopRequestData,
  SpeedTestRequestData,
  SpeedTestConfigRequestData,
  SpeedTestCompletedEventData,
  AlertTriggeredData,
  AlertRuleCreateRequestData,
  AlertRuleUpdateRequestData,
  AlertRuleDeleteRequestData,
  IncidentCreatedData,
  NotificationSendRequestData,
  PushSubscriptionCreateRequestData,
  UserLoginRequestData,
  UserRegisterRequestData,
  UserLogoutRequestData,
  ErrorEventData,
  IdEventData,
  TargetIdEventData,
  TargetIdData, // Alias for TargetIdEventData
} from "./types/event-handler-types";

// Export EntityStatus enum
export { EntityStatus } from "./interfaces/base/IBaseEntity";

// Export config types
export type {
  PingTestConfig,
  DownloadUrlConfig,
  SpeedTestTimeout,
  ValidationResult,
  SizeRange,
  MonitoringConfig,
  AlertThresholdConfig,
} from "./types/config-types";

// Note: test-utils are exported separately to avoid circular dependencies during build
// export * from "./test-utils/setup-simple";
