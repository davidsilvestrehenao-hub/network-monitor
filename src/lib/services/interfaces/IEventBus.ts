export interface IEventBus {
  emit(event: string, data?: unknown): void;
  emitTyped<T>(event: string, data: T): void;

  // Generic overloads for type-safe event handlers
  on<T = unknown>(event: string, handler: (data?: T) => void): void;
  onTyped<T>(event: string, handler: (data: T) => void): void;

  off<T = unknown>(event: string, handler: (data?: T) => void): void;

  once<T = unknown>(event: string, handler: (data?: T) => void): void;
  onceTyped<T>(event: string, handler: (data: T) => void): void;

  removeAllListeners(event?: string): void;
}

// Event type definitions for type safety
export interface BackendEvents {
  // Target events
  TARGET_CREATE_REQUESTED: { name: string; address: string; ownerId: string };
  TARGET_CREATED: {
    id: string;
    name: string;
    address: string;
    ownerId: string;
  };
  TARGET_CREATE_FAILED: { error: string };
  TARGET_UPDATE_REQUESTED: { id: string; name?: string; address?: string };
  TARGET_UPDATED: { id: string; name: string; address: string };
  TARGET_UPDATE_FAILED: { id: string; error: string };
  TARGET_DELETE_REQUESTED: { id: string };
  TARGET_DELETED: { id: string };
  TARGET_DELETE_FAILED: { id: string; error: string };

  // Monitoring events
  MONITORING_START_REQUESTED: { targetId: string; intervalMs: number };
  MONITORING_STARTED: { targetId: string };
  MONITORING_STOP_REQUESTED: { targetId: string };
  MONITORING_STOPPED: { targetId: string };
  SPEED_TEST_REQUESTED: { targetId: string };
  SPEED_TEST_COMPLETED: { targetId: string; result: unknown };
  SPEED_TEST_FAILED: { targetId: string; error: string };

  // Alert events
  ALERT_RULE_CREATE_REQUESTED: { targetId: string; rule: unknown };
  ALERT_RULE_CREATED: { id: number; targetId: string; rule: unknown };
  ALERT_RULE_UPDATE_REQUESTED: { id: number; rule: unknown };
  ALERT_RULE_UPDATED: { id: number; rule: unknown };
  ALERT_RULE_DELETE_REQUESTED: { id: number };
  ALERT_RULE_DELETED: { id: number };
  ALERT_TRIGGERED: {
    targetId: string;
    ruleId: number;
    value: number;
    threshold: number;
  };

  // Notification events
  NOTIFICATION_SEND_REQUESTED: { userId: string; message: string };
  NOTIFICATION_SENT: { id: number; userId: string; message: string };
  NOTIFICATION_CREATED: { id: number; userId: string; message: string };
  NOTIFICATION_READ: { id: number };
  ALL_NOTIFICATIONS_READ: { userId: string; count: number };
  NOTIFICATION_DELETED: { id: number };
  PUSH_SUBSCRIPTION_CREATE_REQUESTED: { userId: string; subscription: unknown };
  PUSH_SUBSCRIPTION_CREATED: { id: string; userId: string };
  PUSH_SUBSCRIPTION_DELETED: { id: string };

  // Auth events
  USER_LOGIN_REQUESTED: { credentials: unknown };
  USER_REGISTER_REQUESTED: { data: unknown };
  USER_LOGOUT_REQUESTED: { sessionToken: string };

  // Incident events
  INCIDENT_CREATED: {
    id: number;
    targetId: string;
    type: string;
    description: string;
  };
  INCIDENT_RESOLVED: { id: number };
}

export interface FrontendEvents {
  // Data events
  TARGETS_LOADED: { targets: unknown[] };
  TARGETS_LOAD_FAILED: { error: string };
  SPEED_TEST_RESULTS_LOADED: { targetId: string; results: unknown[] };
  SPEED_TEST_RESULTS_LOAD_FAILED: { targetId: string; error: string };

  // Alert events
  ALERT_RULES_LOADED: { targetId: string; rules: unknown[] };
  ALERT_RULE_DELETED: { id: number };
  INCIDENTS_LOADED: { targetId: string; incidents: unknown[] };
  INCIDENT_RESOLVED: { id: number };

  // Notification events
  NOTIFICATIONS_LOADED: { notifications: unknown[] };
  NOTIFICATION_READ: { id: number };
  ALL_NOTIFICATIONS_READ: { userId: string };
  PUSH_SUBSCRIPTIONS_LOADED: { subscriptions: unknown[] };
  PUSH_SUBSCRIPTION_CREATED: { subscription: unknown };
  PUSH_SUBSCRIPTION_DELETED: { id: string };
  PUSH_NOTIFICATION_SENT: { data: unknown };

  // Auth events
  USER_SIGNED_IN: { user: unknown };
  USER_SIGNED_UP: { user: unknown };
  USER_SIGNED_OUT: Record<string, never>;

  // UI events
  SHOW_NOTIFICATION: {
    message: string;
    type: "success" | "error" | "info" | "warning";
  };
  HIDE_NOTIFICATION: { id: string };
  MODAL_OPEN: { modal: string; data?: unknown };
  MODAL_CLOSE: { modal: string };

  // Performance events
  PERFORMANCE_METRIC: { metric: string; value: number; timestamp: number };
  CACHE_HIT: { key: string };
  CACHE_MISS: { key: string };
}
