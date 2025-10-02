// Strongly-typed event map for compile-time type safety
// This ensures all events have proper type definitions and prevents runtime errors

import type {
  SpeedTestResult,
  AlertRule,
  Target,
  User,
  IncidentEvent,
  Notification,
  PushSubscription,
} from "./domain-types";

// Core event map interface for type safety
export interface EventMap {
  // Target management events
  TARGET_CREATE_REQUESTED: {
    name: string;
    address: string;
    ownerId: string;
  };
  TARGET_CREATED: {
    id: string;
    name: string;
    address: string;
    ownerId: string;
  };
  TARGET_CREATE_FAILED: {
    error: string;
    requestData: {
      name: string;
      address: string;
      ownerId: string;
    };
  };
  TARGET_UPDATE_REQUESTED: {
    id: string;
    name?: string;
    address?: string;
  };
  TARGET_UPDATED: {
    id: string;
    name: string;
    address: string;
    previousData: {
      name: string;
      address: string;
    };
  };
  TARGET_UPDATE_FAILED: {
    id: string;
    error: string;
    requestData: {
      name?: string;
      address?: string;
    };
  };
  TARGET_DELETE_REQUESTED: {
    id: string;
  };
  TARGET_DELETED: {
    id: string;
    name: string;
    address: string;
  };
  TARGET_DELETE_FAILED: {
    id: string;
    error: string;
  };

  // Monitoring events
  MONITORING_START_REQUESTED: {
    targetId: string;
    intervalMs: number;
  };
  MONITORING_STARTED: {
    targetId: string;
    intervalMs: number;
    startedAt: Date;
  };
  MONITORING_START_FAILED: {
    targetId: string;
    error: string;
  };
  MONITORING_STOP_REQUESTED: {
    targetId: string;
  };
  MONITORING_STOPPED: {
    targetId: string;
    stoppedAt: Date;
    duration: number;
  };
  MONITORING_STOP_FAILED: {
    targetId: string;
    error: string;
  };

  // Speed test events
  SPEED_TEST_REQUESTED: {
    targetId: string;
    config?: {
      timeout?: number;
      downloadUrl?: string;
    };
  };
  SPEED_TEST_STARTED: {
    targetId: string;
    startedAt: Date;
  };
  SPEED_TEST_COMPLETED: {
    targetId: string;
    result: SpeedTestResult;
    duration: number;
  };
  SPEED_TEST_FAILED: {
    targetId: string;
    error: string;
    duration: number;
  };

  // Alert events
  ALERT_RULE_CREATE_REQUESTED: {
    targetId: string;
    name: string;
    metric: "ping" | "download";
    condition: "GREATER_THAN" | "LESS_THAN";
    threshold: number;
  };
  ALERT_RULE_CREATED: {
    id: number;
    targetId: string;
    rule: AlertRule;
  };
  ALERT_RULE_CREATE_FAILED: {
    targetId: string;
    error: string;
  };
  ALERT_RULE_UPDATE_REQUESTED: {
    id: number;
    name?: string;
    threshold?: number;
    enabled?: boolean;
  };
  ALERT_RULE_UPDATED: {
    id: number;
    rule: AlertRule;
    previousData: Partial<AlertRule>;
  };
  ALERT_RULE_UPDATE_FAILED: {
    id: number;
    error: string;
  };
  ALERT_RULE_DELETE_REQUESTED: {
    id: number;
  };
  ALERT_RULE_DELETED: {
    id: number;
    targetId: string;
    deletedAt: Date;
  };
  ALERT_RULE_DELETE_FAILED: {
    id: number;
    error: string;
  };
  ALERT_TRIGGERED: {
    targetId: string;
    ruleId: number;
    ruleName: string;
    metric: "ping" | "download";
    value: number;
    threshold: number;
    condition: "GREATER_THAN" | "LESS_THAN";
    triggeredAt: Date;
  };

  // Incident events
  INCIDENT_CREATED: {
    id: number;
    targetId: string;
    type: "OUTAGE" | "ALERT";
    description: string;
    ruleId?: number;
    createdAt: Date;
  };
  INCIDENT_RESOLVED: {
    id: number;
    targetId: string;
    resolvedAt: Date;
    duration: number;
  };
  INCIDENT_RESOLVE_FAILED: {
    id: number;
    error: string;
  };

  // Notification events
  NOTIFICATION_SEND_REQUESTED: {
    userId: string;
    message: string;
    type?: "info" | "warning" | "error" | "success";
  };
  NOTIFICATION_SENT: {
    id: number;
    userId: string;
    message: string;
    sentAt: Date;
  };
  NOTIFICATION_UPDATED: {
    id: number;
    userId: string;
    message: string;
    updatedAt: Date;
  };
  NOTIFICATION_SEND_FAILED: {
    userId: string;
    message: string;
    error: string;
  };
  NOTIFICATION_CREATED: {
    id: number;
    userId: string;
    message: string;
    createdAt: Date;
  };
  NOTIFICATION_READ: {
    id: number;
    userId: string;
    readAt: Date;
  };
  NOTIFICATION_READ_FAILED: {
    id: number;
    error: string;
  };
  ALL_NOTIFICATIONS_READ: {
    userId: string;
    count: number;
    readAt: Date;
  };
  NOTIFICATION_DELETED: {
    id: number;
    userId: string;
    deletedAt: Date;
  };

  // Push subscription events
  PUSH_SUBSCRIPTION_CREATE_REQUESTED: {
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
  };
  PUSH_SUBSCRIPTION_CREATED: {
    id: string;
    userId: string;
    endpoint: string;
    createdAt: Date;
  };
  PUSH_SUBSCRIPTION_CREATE_FAILED: {
    userId: string;
    error: string;
  };
  PUSH_SUBSCRIPTION_DELETED: {
    id: string;
    userId: string;
    deletedAt: Date;
  };
  PUSH_NOTIFICATION_SENT: {
    subscriptionId: string;
    userId: string;
    message: string;
    sentAt: Date;
  };
  PUSH_NOTIFICATION_FAILED: {
    subscriptionId: string;
    userId: string;
    error: string;
  };

  // Authentication events
  USER_LOGIN_REQUESTED: {
    email: string;
    provider?: string;
  };
  USER_LOGIN_SUCCESS: {
    user: User;
    sessionToken: string;
    expiresAt: Date;
    loginAt: Date;
  };
  USER_LOGIN_FAILED: {
    email: string;
    error: string;
    attemptedAt: Date;
  };
  USER_REGISTER_REQUESTED: {
    email: string;
    name?: string;
    provider?: string;
  };
  USER_REGISTER_SUCCESS: {
    user: User;
    sessionToken: string;
    expiresAt: Date;
    registeredAt: Date;
  };
  USER_REGISTER_FAILED: {
    email: string;
    error: string;
    attemptedAt: Date;
  };
  USER_LOGOUT_REQUESTED: {
    sessionToken: string;
    userId: string;
  };
  USER_LOGOUT_SUCCESS: {
    userId: string;
    sessionToken: string;
    logoutAt: Date;
  };
  USER_LOGOUT_FAILED: {
    sessionToken: string;
    error: string;
  };
  SESSION_EXPIRED: {
    userId: string;
    sessionToken: string;
    expiredAt: Date;
  };

  // System events
  SERVICE_STARTED: {
    serviceName: string;
    version: string;
    startedAt: Date;
    environment: string;
  };
  SERVICE_STOPPED: {
    serviceName: string;
    stoppedAt: Date;
    uptime: number;
  };
  SERVICE_ERROR: {
    serviceName: string;
    error: string;
    errorAt: Date;
    context?: Record<string, unknown>;
  };
  DATABASE_CONNECTED: {
    connectionString: string;
    connectedAt: Date;
  };
  DATABASE_DISCONNECTED: {
    disconnectedAt: Date;
    reason?: string;
  };
  DATABASE_ERROR: {
    error: string;
    query?: string;
    errorAt: Date;
  };

  // Performance events
  PERFORMANCE_METRIC: {
    metric: string;
    value: number;
    unit: string;
    timestamp: Date;
    context?: Record<string, unknown>;
  };
  CACHE_HIT: {
    key: string;
    hitAt: Date;
  };
  CACHE_MISS: {
    key: string;
    missAt: Date;
  };
  CACHE_SET: {
    key: string;
    ttl?: number;
    setAt: Date;
  };
  CACHE_EXPIRED: {
    key: string;
    expiredAt: Date;
  };

  // UI/Frontend events
  TARGETS_LOADED: {
    targets: Target[];
    loadedAt: Date;
    count: number;
  };
  TARGETS_LOAD_FAILED: {
    error: string;
    attemptedAt: Date;
  };
  SPEED_TEST_RESULTS_LOADED: {
    targetId: string;
    results: SpeedTestResult[];
    loadedAt: Date;
    count: number;
  };
  SPEED_TEST_RESULTS_LOAD_FAILED: {
    targetId: string;
    error: string;
    attemptedAt: Date;
  };
  ALERT_RULES_LOADED: {
    targetId: string;
    rules: AlertRule[];
    loadedAt: Date;
    count: number;
  };
  INCIDENTS_LOADED: {
    targetId: string;
    incidents: IncidentEvent[];
    loadedAt: Date;
    count: number;
  };
  NOTIFICATIONS_LOADED: {
    notifications: Notification[];
    loadedAt: Date;
    count: number;
  };
  PUSH_SUBSCRIPTIONS_LOADED: {
    subscriptions: PushSubscription[];
    loadedAt: Date;
    count: number;
  };

  // User Authentication Events
  USER_SIGNED_IN: {
    user: User;
    signedInAt: Date;
  };
  USER_SIGNED_UP: {
    user: User;
    signedUpAt: Date;
  };
  USER_SIGNED_OUT: {
    userId?: string;
    signedOutAt: Date;
  };

  // Auth Service Events
  USER_LOGGED_IN: {
    email: string;
    provider?: string;
    credentials: Record<string, unknown>;
  };
  USER_REGISTERED: {
    email: string;
    name?: string;
    provider?: string;
    data: Record<string, unknown>;
  };
  USER_LOGGED_OUT: {
    userId: string;
    loggedOutAt: Date;
  };
  SESSION_REFRESHED: {
    userId: string;
    sessionId: string;
    refreshedAt: Date;
  };
  USER_PROFILE_UPDATED: {
    userId: string;
    updatedFields: string[];
    updatedAt: Date;
  };
  USER_ACCOUNT_DELETED: {
    userId: string;
    deletedAt: Date;
    reason?: string;
  };

  SHOW_NOTIFICATION: {
    message: string;
    type: "success" | "error" | "info" | "warning";
    duration?: number;
    shownAt: Date;
  };
  HIDE_NOTIFICATION: {
    id: string;
    hiddenAt: Date;
  };
  MODAL_OPEN: {
    modal: string;
    data?: Record<string, unknown>;
    openedAt: Date;
  };
  MODAL_CLOSE: {
    modal: string;
    closedAt: Date;
  };

  // Monitoring Scheduler Events
  MONITORING_SCHEDULER_START_REQUESTED: {
    targetId: string;
    intervalMs?: number;
  };
  MONITORING_SCHEDULER_STOP_REQUESTED: { targetId: string };
  MONITORING_TARGET_ADD_REQUESTED: { targetId: string; config?: unknown };
  MONITORING_TARGET_REMOVE_REQUESTED: { targetId: string };
  MONITORING_TARGET_ADDED: { targetId: string; config?: unknown };
  MONITORING_TARGET_REMOVED: { targetId: string };
  MONITORING_TARGET_UPDATED: { targetId: string; config?: unknown };
  MONITORING_SCHEDULER_STARTED: Record<string, never>;
  MONITORING_SCHEDULER_STOPPED: Record<string, never>;
  MONITORING_SCHEDULER_PAUSED: Record<string, never>;
  MONITORING_SCHEDULER_RESUMED: Record<string, never>;
  MONITORING_TARGET_ENABLED: { targetId: string };
  MONITORING_TARGET_DISABLED: { targetId: string };
  MONITORING_TARGET_PAUSED: { targetId: string };
  MONITORING_TARGET_RESUMED: { targetId: string };
  MONITORING_TEST_SUCCESS: {
    targetId: string;
    result?: unknown;
    duration?: number;
  };
  MONITORING_TEST_FAILURE: {
    targetId: string;
    error: string;
    failureCount?: number;
    duration?: number;
  };

  // Speed Test Service Events
  SPEED_TEST_SERVICE_START_REQUESTED: { targetId: string };
  SPEED_TEST_SERVICE_STOP_REQUESTED: { targetId: string };
  CONTINUOUS_MONITORING_START_REQUESTED: {
    targetId: string;
    intervalMs?: number;
  };
  CONTINUOUS_MONITORING_STOP_REQUESTED: { targetId: string };
  COMPREHENSIVE_SPEED_TEST_COMPLETED: { targetId: string; result: unknown };
  COMPREHENSIVE_SPEED_TEST_FAILED: { targetId: string; error: string };
  CONTINUOUS_MONITORING_STARTED: { targetId: string; intervalMs?: number };
  CONTINUOUS_MONITORING_STOPPED: { targetId: string };
  CONTINUOUS_MONITORING_PAUSED: { targetId: string };
  CONTINUOUS_MONITORING_RESUMED: { targetId: string };
  BATCH_SPEED_TESTS_COMPLETED: { results: unknown[]; targetIds?: string[] };
  SPEED_TEST_SERVICE_STARTED: Record<string, never>;
  SPEED_TEST_SERVICE_STOPPED: Record<string, never>;
}

// Type helpers for event handling
export type EventName = keyof EventMap;
export type EventData<T extends EventName> = EventMap[T];
export type TypedEventHandler<T extends EventName> = (
  data: EventData<T>
) => void | Promise<void>;

// Generic event interface
export interface TypedEvent<T extends EventName> {
  type: T;
  data: EventData<T>;
  metadata: {
    id: string;
    timestamp: Date;
    source: string;
    version: string;
    correlationId?: string;
    causationId?: string;
  };
}

// Event validation helpers
export function isValidEventType(eventType: string): eventType is EventName {
  const validEventTypes: EventName[] = [
    "TARGET_CREATE_REQUESTED",
    "TARGET_CREATED",
    "TARGET_CREATE_FAILED",
    "TARGET_UPDATE_REQUESTED",
    "TARGET_UPDATED",
    "TARGET_UPDATE_FAILED",
    "TARGET_DELETE_REQUESTED",
    "TARGET_DELETED",
    "TARGET_DELETE_FAILED",
    "MONITORING_START_REQUESTED",
    "MONITORING_STARTED",
    "MONITORING_START_FAILED",
    "MONITORING_STOP_REQUESTED",
    "MONITORING_STOPPED",
    "MONITORING_STOP_FAILED",
    "SPEED_TEST_REQUESTED",
    "SPEED_TEST_STARTED",
    "SPEED_TEST_COMPLETED",
    "SPEED_TEST_FAILED",
    "ALERT_RULE_CREATE_REQUESTED",
    "ALERT_RULE_CREATED",
    "ALERT_RULE_CREATE_FAILED",
    "ALERT_RULE_UPDATE_REQUESTED",
    "ALERT_RULE_UPDATED",
    "ALERT_RULE_UPDATE_FAILED",
    "ALERT_RULE_DELETE_REQUESTED",
    "ALERT_RULE_DELETED",
    "ALERT_RULE_DELETE_FAILED",
    "ALERT_TRIGGERED",
    "INCIDENT_CREATED",
    "INCIDENT_RESOLVED",
    "INCIDENT_RESOLVE_FAILED",
    "NOTIFICATION_SEND_REQUESTED",
    "NOTIFICATION_SENT",
    "NOTIFICATION_UPDATED",
    "NOTIFICATION_SEND_FAILED",
    "NOTIFICATION_CREATED",
    "NOTIFICATION_READ",
    "NOTIFICATION_READ_FAILED",
    "ALL_NOTIFICATIONS_READ",
    "NOTIFICATION_DELETED",
    "PUSH_SUBSCRIPTION_CREATE_REQUESTED",
    "PUSH_SUBSCRIPTION_CREATED",
    "PUSH_SUBSCRIPTION_CREATE_FAILED",
    "PUSH_SUBSCRIPTION_DELETED",
    "PUSH_NOTIFICATION_SENT",
    "PUSH_NOTIFICATION_FAILED",
    "USER_LOGIN_REQUESTED",
    "USER_LOGIN_SUCCESS",
    "USER_LOGIN_FAILED",
    "USER_REGISTER_REQUESTED",
    "USER_REGISTER_SUCCESS",
    "USER_REGISTER_FAILED",
    "USER_LOGOUT_REQUESTED",
    "USER_LOGOUT_SUCCESS",
    "USER_LOGOUT_FAILED",
    "SESSION_EXPIRED",
    "SERVICE_STARTED",
    "SERVICE_STOPPED",
    "SERVICE_ERROR",
    "DATABASE_CONNECTED",
    "DATABASE_DISCONNECTED",
    "DATABASE_ERROR",
    "PERFORMANCE_METRIC",
    "CACHE_HIT",
    "CACHE_MISS",
    "CACHE_SET",
    "CACHE_EXPIRED",
    "TARGETS_LOADED",
    "TARGETS_LOAD_FAILED",
    "SPEED_TEST_RESULTS_LOADED",
    "SPEED_TEST_RESULTS_LOAD_FAILED",
    "ALERT_RULES_LOADED",
    "INCIDENTS_LOADED",
    "NOTIFICATIONS_LOADED",
    "PUSH_SUBSCRIPTIONS_LOADED",
    "USER_SIGNED_IN",
    "USER_SIGNED_UP",
    "USER_SIGNED_OUT",
    "USER_LOGGED_IN",
    "USER_REGISTERED",
    "USER_LOGGED_OUT",
    "SESSION_REFRESHED",
    "USER_PROFILE_UPDATED",
    "USER_ACCOUNT_DELETED",
    "SHOW_NOTIFICATION",
    "HIDE_NOTIFICATION",
    "MODAL_OPEN",
    "MODAL_CLOSE",
    "MONITORING_SCHEDULER_START_REQUESTED",
    "MONITORING_SCHEDULER_STOP_REQUESTED",
    "MONITORING_TARGET_ADD_REQUESTED",
    "MONITORING_TARGET_REMOVE_REQUESTED",
    "MONITORING_TARGET_ADDED",
    "MONITORING_TARGET_REMOVED",
    "MONITORING_TARGET_UPDATED",
    "MONITORING_SCHEDULER_STARTED",
    "MONITORING_SCHEDULER_STOPPED",
    "MONITORING_SCHEDULER_PAUSED",
    "MONITORING_SCHEDULER_RESUMED",
    "MONITORING_TARGET_ENABLED",
    "MONITORING_TARGET_DISABLED",
    "MONITORING_TARGET_PAUSED",
    "MONITORING_TARGET_RESUMED",
    "MONITORING_TEST_SUCCESS",
    "MONITORING_TEST_FAILURE",
    "SPEED_TEST_SERVICE_START_REQUESTED",
    "SPEED_TEST_SERVICE_STOP_REQUESTED",
    "CONTINUOUS_MONITORING_START_REQUESTED",
    "CONTINUOUS_MONITORING_STOP_REQUESTED",
    "COMPREHENSIVE_SPEED_TEST_COMPLETED",
    "COMPREHENSIVE_SPEED_TEST_FAILED",
    "CONTINUOUS_MONITORING_STARTED",
    "CONTINUOUS_MONITORING_STOPPED",
    "CONTINUOUS_MONITORING_PAUSED",
    "CONTINUOUS_MONITORING_RESUMED",
    "BATCH_SPEED_TESTS_COMPLETED",
    "SPEED_TEST_SERVICE_STARTED",
    "SPEED_TEST_SERVICE_STOPPED",
  ];
  return validEventTypes.includes(eventType as EventName);
}

export function createTypedEvent<T extends EventName>(
  type: T,
  data: EventData<T>,
  metadata?: Partial<TypedEvent<T>["metadata"]>
): TypedEvent<T> {
  return {
    type,
    data,
    metadata: {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      source: "network-monitor",
      version: "1.0.0",
      ...metadata,
    },
  };
}
