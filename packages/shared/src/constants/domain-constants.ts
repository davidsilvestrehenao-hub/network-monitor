/**
 * Strongly typed domain constants for the network monitoring application.
 * This eliminates magic strings and provides compile-time validation.
 */

/**
 * Alert rule conditions
 */
export const AlertConditions = {
  GREATER_THAN: "GREATER_THAN",
  LESS_THAN: "LESS_THAN",
} as const;

export type AlertCondition = keyof typeof AlertConditions;

/**
 * Monitoring metrics
 */
export const MonitoringMetrics = {
  PING: "ping",
  DOWNLOAD: "download",
  UPLOAD: "upload",
} as const;

export type MonitoringMetric = keyof typeof MonitoringMetrics;

/**
 * Speed test result status
 */
export const SpeedTestStatus = {
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
} as const;

export type SpeedTestStatusType = keyof typeof SpeedTestStatus;

/**
 * Incident event types
 */
export const IncidentTypes = {
  OUTAGE: "OUTAGE",
  ALERT: "ALERT",
} as const;

export type IncidentType = keyof typeof IncidentTypes;

/**
 * Notification types
 */
export const NotificationTypes = {
  PUSH: "push",
  IN_APP: "in_app",
  EMAIL: "email",
} as const;

export type NotificationType = keyof typeof NotificationTypes;

/**
 * Helper functions for type-safe access to constant values
 */
export const DomainConstants = {
  AlertConditions,
  MonitoringMetrics,
  SpeedTestStatus,
  IncidentTypes,
  NotificationTypes,
} as const;

/**
 * Helper function to get alert condition value with type safety
 */
export function getAlertCondition<T extends AlertCondition>(
  condition: T
): (typeof AlertConditions)[T] {
  return AlertConditions[condition];
}

/**
 * Helper function to get monitoring metric value with type safety
 */
export function getMonitoringMetric<T extends MonitoringMetric>(
  metric: T
): (typeof MonitoringMetrics)[T] {
  return MonitoringMetrics[metric];
}

/**
 * Helper function to get speed test status value with type safety
 */
export function getSpeedTestStatus<T extends SpeedTestStatusType>(
  status: T
): (typeof SpeedTestStatus)[T] {
  return SpeedTestStatus[status];
}

/**
 * Helper function to get incident type value with type safety
 */
export function getIncidentType<T extends IncidentType>(
  type: T
): (typeof IncidentTypes)[T] {
  return IncidentTypes[type];
}

/**
 * Helper function to get notification type value with type safety
 */
export function getNotificationType<T extends NotificationType>(
  type: T
): (typeof NotificationTypes)[T] {
  return NotificationTypes[type];
}

/**
 * Runtime validation helpers
 */
export function isValidAlertCondition(
  condition: string
): condition is AlertCondition {
  return (Object.values(AlertConditions) as string[]).includes(condition);
}

export function isValidMonitoringMetric(
  metric: string
): metric is MonitoringMetric {
  return (Object.values(MonitoringMetrics) as string[]).includes(metric);
}

export function isValidSpeedTestStatus(
  status: string
): status is SpeedTestStatusType {
  return (Object.values(SpeedTestStatus) as string[]).includes(status);
}

export function isValidIncidentType(type: string): type is IncidentType {
  return (Object.values(IncidentTypes) as string[]).includes(type);
}

export function isValidNotificationType(
  type: string
): type is NotificationType {
  return (Object.values(NotificationTypes) as string[]).includes(type);
}
