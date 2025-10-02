import type { IEventBus as IBaseEventBus } from "../base/IEventBus";
import type {
  SpeedTestResult,
  AlertRule,
  PushSubscription,
  User,
  Target,
  IncidentEvent,
  Notification,
} from "../../types/standardized-domain-types";
import type {
  CreateAlertRuleData,
  UpdateAlertRuleData,
} from "../repositories/IAlertRuleRepository";
import type { CreatePushSubscriptionData } from "../repositories/IPushSubscriptionRepository";
import type {
  LoginCredentials,
  RegisterData,
} from "../../types/event-handler-types";

// Additional event data types
export interface NotificationData {
  message: string;
  type?: "info" | "warning" | "error" | "success";
  userId?: string;
}

export interface IEventBus extends IBaseEventBus {
  // All methods inherited from base interface
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
  SPEED_TEST_COMPLETED: { targetId: string; result: SpeedTestResult };
  SPEED_TEST_FAILED: { targetId: string; error: string };

  // Alert events
  ALERT_RULE_CREATE_REQUESTED: { targetId: string; rule: CreateAlertRuleData };
  ALERT_RULE_CREATED: { id: string; targetId: string; rule: AlertRule };
  ALERT_RULE_UPDATE_REQUESTED: { id: string; rule: UpdateAlertRuleData };
  ALERT_RULE_UPDATED: { id: string; rule: AlertRule };
  ALERT_RULE_DELETE_REQUESTED: { id: string };
  ALERT_RULE_DELETED: { id: string };
  ALERT_TRIGGERED: {
    targetId: string;
    ruleId: string;
    value: number;
    threshold: number;
  };

  // Notification events
  NOTIFICATION_SEND_REQUESTED: { userId: string; message: string };
  NOTIFICATION_SENT: { id: string; userId: string; message: string };
  NOTIFICATION_CREATED: { id: string; userId: string; message: string };
  NOTIFICATION_READ: { id: string };
  ALL_NOTIFICATIONS_READ: { userId: string; count: number };
  NOTIFICATION_DELETED: { id: string };
  PUSH_SUBSCRIPTION_CREATE_REQUESTED: {
    userId: string;
    subscription: CreatePushSubscriptionData;
  };
  PUSH_SUBSCRIPTION_CREATED: { id: string; userId: string };
  PUSH_SUBSCRIPTION_DELETED: { id: string };

  // Auth events
  USER_LOGIN_REQUESTED: { credentials: LoginCredentials };
  USER_REGISTER_REQUESTED: { data: RegisterData };
  USER_LOGOUT_REQUESTED: { sessionToken: string };

  // Incident events
  INCIDENT_CREATED: {
    id: string;
    targetId: string;
    type: string;
    description: string;
  };
  INCIDENT_RESOLVED: { id: string };
}

export interface FrontendEvents {
  // Data events
  TARGETS_LOADED: { targets: Target[] };
  TARGETS_LOAD_FAILED: { error: string };
  SPEED_TEST_RESULTS_LOADED: { targetId: string; results: SpeedTestResult[] };
  SPEED_TEST_RESULTS_LOAD_FAILED: { targetId: string; error: string };

  // Alert events
  ALERT_RULES_LOADED: { targetId: string; rules: AlertRule[] };
  ALERT_RULE_DELETED: { id: string };
  INCIDENTS_LOADED: { targetId: string; incidents: IncidentEvent[] };
  INCIDENT_RESOLVED: { id: string };

  // Notification events
  NOTIFICATIONS_LOADED: { notifications: Notification[] };
  NOTIFICATION_READ: { id: string };
  ALL_NOTIFICATIONS_READ: { userId: string };
  PUSH_SUBSCRIPTIONS_LOADED: { subscriptions: PushSubscription[] };
  PUSH_SUBSCRIPTION_CREATED: { subscription: PushSubscription };
  PUSH_SUBSCRIPTION_DELETED: { id: string };
  PUSH_NOTIFICATION_SENT: { data: NotificationData };

  // Auth events
  USER_SIGNED_IN: { user: User };
  USER_SIGNED_UP: { user: User };
  USER_SIGNED_OUT: Record<string, never>;

  // UI events
  SHOW_NOTIFICATION: {
    message: string;
    type: "success" | "error" | "info" | "warning";
  };
  HIDE_NOTIFICATION: { id: string };
  MODAL_OPEN: { modal: string; data?: Record<string, unknown> };
  MODAL_CLOSE: { modal: string };

  // Performance events
  PERFORMANCE_METRIC: { metric: string; value: number; timestamp: number };
  CACHE_HIT: { key: string };
  CACHE_MISS: { key: string };
}
