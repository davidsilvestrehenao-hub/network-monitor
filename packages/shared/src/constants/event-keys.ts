/**
 * Strongly typed event keys for the event bus system.
 * This eliminates magic strings and provides compile-time validation.
 */

/**
 * Notification-related event keys
 */
export const NotificationEvents = {
  // Core notification events
  NOTIFICATION_CREATED: "NOTIFICATION_CREATED",
  NOTIFICATION_SENT: "NOTIFICATION_SENT",
  NOTIFICATION_READ: "NOTIFICATION_READ",
  NOTIFICATION_UPDATED: "NOTIFICATION_UPDATED",
  NOTIFICATION_DELETED: "NOTIFICATION_DELETED",
  ALL_NOTIFICATIONS_READ: "ALL_NOTIFICATIONS_READ",

  // Push notification events
  PUSH_SUBSCRIPTION_CREATED: "PUSH_SUBSCRIPTION_CREATED",
  PUSH_SUBSCRIPTION_DELETED: "PUSH_SUBSCRIPTION_DELETED",
  PUSH_SUBSCRIPTION_DELETED_BY_ENDPOINT:
    "PUSH_SUBSCRIPTION_DELETED_BY_ENDPOINT",
  PUSH_NOTIFICATION_SENT: "PUSH_NOTIFICATION_SENT",

  // Request events
  NOTIFICATION_SEND_REQUESTED: "NOTIFICATION_SEND_REQUESTED",
  PUSH_SUBSCRIPTION_CREATE_REQUESTED: "PUSH_SUBSCRIPTION_CREATE_REQUESTED",
} as const;

/**
 * Alerting-related event keys
 */
export const AlertingEvents = {
  // Alert rule events
  ALERT_RULE_CREATED: "ALERT_RULE_CREATED",
  ALERT_RULE_UPDATED: "ALERT_RULE_UPDATED",
  ALERT_RULE_DELETED: "ALERT_RULE_DELETED",

  // Alert trigger events
  ALERT_TRIGGERED: "ALERT_TRIGGERED",

  // Incident events
  INCIDENT_CREATED: "INCIDENT_CREATED",
  INCIDENT_RESOLVED: "INCIDENT_RESOLVED",

  // Request events
  ALERT_RULE_CREATE_REQUESTED: "ALERT_RULE_CREATE_REQUESTED",
  ALERT_RULE_UPDATE_REQUESTED: "ALERT_RULE_UPDATE_REQUESTED",
  ALERT_RULE_DELETE_REQUESTED: "ALERT_RULE_DELETE_REQUESTED",
} as const;

/**
 * Monitoring-related event keys
 */
export const MonitoringEvents = {
  // Target events
  TARGET_CREATED: "TARGET_CREATED",
  TARGET_UPDATED: "TARGET_UPDATED",
  TARGET_DELETED: "TARGET_DELETED",

  // Speed test events
  SPEED_TEST_COMPLETED: "SPEED_TEST_COMPLETED",

  // Monitoring lifecycle events
  MONITORING_STARTED: "MONITORING_STARTED",
  MONITORING_STOPPED: "MONITORING_STOPPED",
  MONITORING_TEST_FAILURE: "MONITORING_TEST_FAILURE",
} as const;

/**
 * All event keys combined for easy access
 */
export const EventKeys = {
  ...NotificationEvents,
  ...AlertingEvents,
  ...MonitoringEvents,
} as const;

/**
 * Type-safe event key type
 */
export type EventKey = keyof typeof EventKeys;

/**
 * Notification event key type
 */
export type NotificationEventKey = keyof typeof NotificationEvents;

/**
 * Alerting event key type
 */
export type AlertingEventKey = keyof typeof AlertingEvents;

/**
 * Monitoring event key type
 */
export type MonitoringEventKey = keyof typeof MonitoringEvents;

/**
 * Helper function to get event key value with type safety
 */
export function getEventKey<T extends EventKey>(key: T): (typeof EventKeys)[T] {
  return EventKeys[key];
}

/**
 * Helper function to validate event key at runtime
 */
export function isValidEventKey(key: string): key is EventKey {
  return (Object.values(EventKeys) as string[]).includes(key);
}
