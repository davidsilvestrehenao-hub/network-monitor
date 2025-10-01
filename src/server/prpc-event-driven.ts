import { getOptionalAuthContext } from "./auth-context";
import type { AuthContext } from "./auth-context";
import type { ILogger } from "@network-monitor/shared";
import type { IEventBus } from "@network-monitor/shared";
import { EventRPC } from "~/lib/container/flexible-container"; // Will be updated to use package

// Validated context with EventBus (no direct service dependencies!)
type ValidatedContext = AuthContext & {
  services: {
    logger: ILogger;
    eventBus: IEventBus;
  };
};

// Helper function to get authenticated context
async function getContext(): Promise<ValidatedContext> {
  const ctx = await getOptionalAuthContext();

  if (!ctx.services.logger || !ctx.services.eventBus) {
    throw new Error("Required services not available in context");
  }

  return ctx as ValidatedContext;
}

// Helper to create EventRPC instance
async function createEventRPC(): Promise<EventRPC> {
  const ctx = await getContext();
  return new EventRPC(ctx.services.eventBus, ctx.services.logger);
}

// ============================================================================
// TARGET MANAGEMENT - Event-Driven
// ============================================================================

export const createTarget = async (data: { name: string; address: string }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Creating target via events", data);

  const target = await eventRPC.request(
    "TARGET_CREATE_REQUESTED",
    "TARGET_CREATED",
    "TARGET_CREATE_FAILED",
    {
      name: data.name,
      address: data.address,
      ownerId: ctx.userId,
    }
  );

  return target;
};

export const getTarget = async (data: { id: string }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.debug("pRPC: Getting target via events", { id: data.id });

  const target = await eventRPC.request(
    "TARGET_GET_REQUESTED",
    "TARGET_RETRIEVED",
    "TARGET_GET_FAILED",
    { id: data.id }
  );

  if (!target) {
    throw new Error("Target not found");
  }

  return target;
};

export const getTargets = async (
  _data: { limit?: number; offset?: number } = {}
) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.debug("pRPC: Getting targets via events");

  const targets = await eventRPC.request(
    "TARGETS_GET_REQUESTED",
    "TARGETS_RETRIEVED",
    "TARGETS_GET_FAILED",
    { userId: ctx.userId }
  );

  return targets;
};

export const updateTarget = async (data: {
  id: string;
  name?: string;
  address?: string;
}) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Updating target via events", data);

  const target = await eventRPC.request(
    "TARGET_UPDATE_REQUESTED",
    "TARGET_UPDATED",
    "TARGET_UPDATE_FAILED",
    data
  );

  return target;
};

export const deleteTarget = async (data: { id: string }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Deleting target via events", { id: data.id });

  await eventRPC.request(
    "TARGET_DELETE_REQUESTED",
    "TARGET_DELETED",
    "TARGET_DELETE_FAILED",
    { id: data.id }
  );

  return { success: true };
};

// ============================================================================
// MONITORING - Event-Driven
// ============================================================================

export const startMonitoring = async (data: {
  targetId: string;
  intervalMs: number;
}) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Starting monitoring via events", data);

  await eventRPC.request(
    "MONITORING_START_REQUESTED",
    "MONITORING_STARTED",
    "MONITORING_START_FAILED",
    data
  );

  return { success: true };
};

export const stopMonitoring = async (data: { targetId: string }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Stopping monitoring via events", data);

  await eventRPC.request(
    "MONITORING_STOP_REQUESTED",
    "MONITORING_STOPPED",
    "MONITORING_STOP_FAILED",
    data
  );

  return { success: true };
};

export const getActiveTargets = async () => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.debug("pRPC: Getting active targets via events");

  const activeTargets = await eventRPC.request(
    "ACTIVE_TARGETS_GET_REQUESTED",
    "ACTIVE_TARGETS_RETRIEVED",
    "ACTIVE_TARGETS_GET_FAILED",
    {}
  );

  return activeTargets;
};

export const runSpeedTest = async (data: {
  targetId: string;
  target: string;
}) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Running speed test via events", data);

  const result = await eventRPC.request(
    "SPEED_TEST_REQUESTED",
    "SPEED_TEST_COMPLETED",
    "SPEED_TEST_FAILED",
    data
  );

  return result;
};

export const getTargetResults = async (data: {
  targetId: string;
  limit?: number;
}) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.debug("pRPC: Getting target results via events", data);

  const results = await eventRPC.request(
    "TARGET_RESULTS_GET_REQUESTED",
    "TARGET_RESULTS_RETRIEVED",
    "TARGET_RESULTS_GET_FAILED",
    data
  );

  return results;
};

// ============================================================================
// ALERT RULES - Event-Driven
// ============================================================================

export const createAlertRule = async (data: {
  targetId: string;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  enabled?: boolean;
}) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Creating alert rule via events", data);

  const alertRule = await eventRPC.request(
    "ALERT_RULE_CREATE_REQUESTED",
    "ALERT_RULE_CREATED",
    "ALERT_RULE_CREATE_FAILED",
    data
  );

  return alertRule;
};

export const updateAlertRule = async (data: {
  id: number;
  name?: string;
  metric?: string;
  condition?: string;
  threshold?: number;
  enabled?: boolean;
}) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Updating alert rule via events", data);

  const alertRule = await eventRPC.request(
    "ALERT_RULE_UPDATE_REQUESTED",
    "ALERT_RULE_UPDATED",
    "ALERT_RULE_UPDATE_FAILED",
    data
  );

  return alertRule;
};

export const deleteAlertRule = async (data: { id: number }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Deleting alert rule via events", data);

  await eventRPC.request(
    "ALERT_RULE_DELETE_REQUESTED",
    "ALERT_RULE_DELETED",
    "ALERT_RULE_DELETE_FAILED",
    data
  );

  return { success: true };
};

export const getAlertRules = async (data: { targetId: string }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.debug("pRPC: Getting alert rules via events", data);

  const alertRules = await eventRPC.request(
    "ALERT_RULES_GET_REQUESTED",
    "ALERT_RULES_RETRIEVED",
    "ALERT_RULES_GET_FAILED",
    data
  );

  return alertRules;
};

// ============================================================================
// INCIDENTS - Event-Driven
// ============================================================================

export const getIncidents = async (data: { targetId: string }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.debug("pRPC: Getting incidents via events", data);

  const incidents = await eventRPC.request(
    "INCIDENTS_GET_REQUESTED",
    "INCIDENTS_RETRIEVED",
    "INCIDENTS_GET_FAILED",
    data
  );

  return incidents;
};

export const getAllIncidents = async (
  _data: { limit?: number; offset?: number } = {}
) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.debug("pRPC: Getting all incidents via events");

  const incidents = await eventRPC.request(
    "ALL_INCIDENTS_GET_REQUESTED",
    "ALL_INCIDENTS_RETRIEVED",
    "ALL_INCIDENTS_GET_FAILED",
    { userId: ctx.userId }
  );

  return incidents;
};

export const resolveIncident = async (data: { id: number }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Resolving incident via events", data);

  await eventRPC.request(
    "INCIDENT_RESOLVE_REQUESTED",
    "INCIDENT_RESOLVED",
    "INCIDENT_RESOLVE_FAILED",
    data
  );

  return { success: true };
};

// ============================================================================
// NOTIFICATIONS - Event-Driven
// ============================================================================

export const createPushSubscription = async (data: {
  endpoint: string;
  p256dh: string;
  auth: string;
}) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Creating push subscription via events", data);

  const subscription = await eventRPC.request(
    "PUSH_SUBSCRIPTION_CREATE_REQUESTED",
    "PUSH_SUBSCRIPTION_CREATED",
    "PUSH_SUBSCRIPTION_CREATE_FAILED",
    {
      ...data,
      userId: ctx.userId,
    }
  );

  return subscription;
};

export const deletePushSubscription = async (data: { id: string }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Deleting push subscription via events", data);

  await eventRPC.request(
    "PUSH_SUBSCRIPTION_DELETE_REQUESTED",
    "PUSH_SUBSCRIPTION_DELETED",
    "PUSH_SUBSCRIPTION_DELETE_FAILED",
    data
  );

  return { success: true };
};

export const getPushSubscriptions = async () => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.debug("pRPC: Getting push subscriptions via events");

  const subscriptions = await eventRPC.request(
    "PUSH_SUBSCRIPTIONS_GET_REQUESTED",
    "PUSH_SUBSCRIPTIONS_RETRIEVED",
    "PUSH_SUBSCRIPTIONS_GET_FAILED",
    { userId: ctx.userId }
  );

  return subscriptions;
};

export const sendTestNotification = async (data: { message: string }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Sending test notification via events", data);

  await eventRPC.request(
    "TEST_NOTIFICATION_SEND_REQUESTED",
    "TEST_NOTIFICATION_SENT",
    "TEST_NOTIFICATION_SEND_FAILED",
    {
      ...data,
      userId: ctx.userId,
    }
  );

  return { success: true };
};

export const getNotifications = async (
  _data: { limit?: number; offset?: number } = {}
) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.debug("pRPC: Getting notifications via events");

  const notifications = await eventRPC.request(
    "NOTIFICATIONS_GET_REQUESTED",
    "NOTIFICATIONS_RETRIEVED",
    "NOTIFICATIONS_GET_FAILED",
    { userId: ctx.userId }
  );

  return notifications;
};

export const markNotificationRead = async (data: { id: number }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.debug("pRPC: Marking notification read via events", data);

  await eventRPC.request(
    "NOTIFICATION_MARK_READ_REQUESTED",
    "NOTIFICATION_MARKED_READ",
    "NOTIFICATION_MARK_READ_FAILED",
    data
  );

  return { success: true };
};

export const markAllNotificationsRead = async () => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Marking all notifications read via events");

  await eventRPC.request(
    "ALL_NOTIFICATIONS_MARK_READ_REQUESTED",
    "ALL_NOTIFICATIONS_MARKED_READ",
    "ALL_NOTIFICATIONS_MARK_READ_FAILED",
    { userId: ctx.userId }
  );

  return { success: true };
};

// ============================================================================
// AUTHENTICATION - Event-Driven
// ============================================================================

export const signIn = async (data: { email: string; password: string }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Sign in via events", { email: data.email });

  const result = await eventRPC.request(
    "SIGN_IN_REQUESTED",
    "SIGNED_IN",
    "SIGN_IN_FAILED",
    data
  );

  return result;
};

export const signOut = async () => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.info("pRPC: Sign out via events");

  await eventRPC.request(
    "SIGN_OUT_REQUESTED",
    "SIGNED_OUT",
    "SIGN_OUT_FAILED",
    {}
  );

  return { success: true };
};

export const getSession = async () => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  ctx.services.logger.debug("pRPC: Getting session via events");

  const session = await eventRPC.request(
    "SESSION_GET_REQUESTED",
    "SESSION_RETRIEVED",
    "SESSION_GET_FAILED",
    {}
  );

  return session;
};
