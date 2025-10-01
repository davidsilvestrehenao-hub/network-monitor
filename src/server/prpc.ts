import { getOptionalAuthContext } from "./auth-context";
import type { UpdateTargetData } from "@network-monitor/shared";
import type { UpdateAlertRuleData } from "@network-monitor/shared";

import type { AuthContext } from "./auth-context";
import type { ILogger } from "@network-monitor/shared";
import type { IMonitorService } from "@network-monitor/shared";
import type { IAlertingService } from "@network-monitor/shared";
import type { INotificationService } from "@network-monitor/shared";
import type { IAuthService } from "@network-monitor/shared";

// Validated context with non-null services
type ValidatedContext = AuthContext & {
  services: {
    logger: ILogger;
    monitor: IMonitorService;
    alerting: IAlertingService;
    notification: INotificationService;
    auth: IAuthService;
  };
};

// Helper function to get authenticated context (server-only)
async function getContext(): Promise<ValidatedContext> {
  // Use optional auth context during transition period
  // Replace with getAuthContext() once real auth is implemented
  const ctx = await getOptionalAuthContext();

  if (
    !ctx.services.logger ||
    !ctx.services.monitor ||
    !ctx.services.alerting ||
    !ctx.services.notification ||
    !ctx.services.auth
  ) {
    throw new Error("Required services not available in context");
  }

  // Cast to validated context after runtime check
  return ctx as ValidatedContext;
}

// Target Management
export const createTarget = async (data: { name: string; address: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Creating target", data);

    const target = await ctx.services.monitor.createTarget({
      name: data.name,
      address: data.address,
      ownerId: ctx.userId,
    });

    return target;
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Target creation failed", { error, data });
    throw new Error(
      `Failed to create target: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getTarget = async (data: { id: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.debug("pRPC: Getting target", { id: data.id });

    const target = await ctx.services.monitor.getTarget(data.id);
    if (!target) {
      throw new Error("Target not found");
    }

    return target;
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Get target failed", {
      error,
      id: data.id,
    });
    throw new Error(
      `Failed to get target: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getTargets = async (
  _data: { limit?: number; offset?: number } = {}
) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.debug("pRPC: Getting targets");

    const targets = await ctx.services.monitor.getTargets(ctx.userId);
    return targets;
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Get targets failed", { error });
    throw new Error(
      `Failed to get targets: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const updateTarget = async (data: {
  id: string;
  name?: string;
  address?: string;
}) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Updating target", data);

    const updateData: UpdateTargetData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;

    const target = await ctx.services.monitor.updateTarget(data.id, updateData);
    return target;
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Target update failed", { error, data });
    throw new Error(
      `Failed to update target: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const deleteTarget = async (data: { id: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Deleting target", { id: data.id });

    await ctx.services.monitor.deleteTarget(data.id);
    return { success: true };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Target deletion failed", {
      error,
      id: data.id,
    });
    throw new Error(
      `Failed to delete target: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// Speed Testing
export const runSpeedTest = async (data: { targetId: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Running speed test", {
      targetId: data.targetId,
    });

    const result = await ctx.services.monitor.runSpeedTest({
      targetId: data.targetId,
      target: `target-${data.targetId}`, // Add required target property
      timeout: 30000, // 30 second timeout
    });

    return result;
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Speed test failed", {
      error,
      targetId: data.targetId,
    });
    throw new Error(
      `Failed to run speed test: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const startMonitoring = async (data: {
  targetId: string;
  intervalMs: number;
}) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Starting monitoring", data);

    ctx.services.monitor.startMonitoring(data.targetId, data.intervalMs);
    return { success: true };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Start monitoring failed", { error, data });
    throw new Error(
      `Failed to start monitoring: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const stopMonitoring = async (data: { targetId: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Stopping monitoring", {
      targetId: data.targetId,
    });

    ctx.services.monitor.stopMonitoring(data.targetId);
    return { success: true };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Stop monitoring failed", {
      error,
      targetId: data.targetId,
    });
    throw new Error(
      `Failed to stop monitoring: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getTargetResults = async (data: {
  targetId: string;
  limit?: number;
}) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.debug("pRPC: Getting target results", data);

    const results = await ctx.services.monitor.getTargetResults(
      data.targetId,
      data.limit
    );
    return results;
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Get target results failed", {
      error,
      data,
    });
    throw new Error(
      `Failed to get target results: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getActiveTargets = async () => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.debug("pRPC: Getting active targets");

    const activeTargets = ctx.services.monitor.getActiveTargets();
    return activeTargets;
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Get active targets failed", { error });
    throw new Error(
      `Failed to get active targets: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// Alert Management
export const createAlertRule = async (data: {
  name: string;
  metric: "ping" | "download";
  condition: "GREATER_THAN" | "LESS_THAN";
  threshold: number;
  targetId: string;
}) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Creating alert rule", data);

    const alertRule = await ctx.services.alerting.createAlertRule({
      name: data.name,
      metric: data.metric,
      condition: data.condition,
      threshold: data.threshold,
      targetId: data.targetId,
    });

    return { data: alertRule };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Alert rule creation failed", {
      error,
      data,
    });
    throw new Error(
      `Failed to create alert rule: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getAlertRules = async (data: { targetId: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.debug("pRPC: Getting alert rules", {
      targetId: data.targetId,
    });

    const alertRules = await ctx.services.alerting.getAlertRulesByTargetId(
      data.targetId
    );
    return { data: alertRules };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Get alert rules failed", {
      error,
      targetId: data.targetId,
    });
    throw new Error(
      `Failed to get alert rules: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const updateAlertRule = async (data: {
  id: number;
  name?: string;
  metric?: "ping" | "download";
  condition?: "GREATER_THAN" | "LESS_THAN";
  threshold?: number;
  enabled?: boolean;
}) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Updating alert rule", data);

    const updateData: UpdateAlertRuleData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.metric !== undefined) updateData.metric = data.metric;
    if (data.condition !== undefined) updateData.condition = data.condition;
    if (data.threshold !== undefined) updateData.threshold = data.threshold;
    if (data.enabled !== undefined) updateData.enabled = data.enabled;

    const alertRule = await ctx.services.alerting.updateAlertRule(
      data.id,
      updateData
    );
    return { data: alertRule };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Alert rule update failed", {
      error,
      data,
    });
    throw new Error(
      `Failed to update alert rule: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const deleteAlertRule = async (data: { id: number }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Deleting alert rule", { id: data.id });

    await ctx.services.alerting.deleteAlertRule(data.id);
    return { data: { success: true } };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Alert rule deletion failed", {
      error,
      id: data.id,
    });
    throw new Error(
      `Failed to delete alert rule: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getIncidents = async (data: { targetId: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.debug("pRPC: Getting incidents", {
      targetId: data.targetId,
    });

    const incidents = await ctx.services.alerting.getIncidentsByTargetId(
      data.targetId
    );
    return { data: incidents };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Get incidents failed", {
      error,
      targetId: data.targetId,
    });
    throw new Error(
      `Failed to get incidents: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const resolveIncident = async (data: { id: number }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Resolving incident", { id: data.id });

    await ctx.services.alerting.resolveIncident(data.id);
    return { data: { success: true } };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Resolve incident failed", {
      error,
      id: data.id,
    });
    throw new Error(
      `Failed to resolve incident: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
// Notification Management
export const getNotifications = async (data: { userId: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.debug("pRPC: Getting notifications", {
      userId: data.userId,
    });

    const notifications = await ctx.services.notification.getNotifications(
      data.userId
    );
    return { data: notifications };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Get notifications failed", {
      error,
      userId: data.userId,
    });
    throw new Error(
      `Failed to get notifications: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const markNotificationAsRead = async (data: { id: number }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Marking notification as read", {
      id: data.id,
    });

    await ctx.services.notification.markNotificationAsRead(data.id);
    return { data: { success: true } };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Mark notification as read failed", {
      error,
      id: data.id,
    });
    throw new Error(
      `Failed to mark notification as read: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const markAllNotificationsAsRead = async (data: { userId: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Marking all notifications as read", {
      userId: data.userId,
    });

    await ctx.services.notification.markAllNotificationsAsRead(data.userId);
    return { data: { success: true } };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Mark all notifications as read failed", {
      error,
      userId: data.userId,
    });
    throw new Error(
      `Failed to mark all notifications as read: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const createPushSubscription = async (data: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: string;
}) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Creating push subscription", {
      userId: data.userId,
    });

    const subscription = await ctx.services.notification.createPushSubscription(
      {
        endpoint: data.endpoint,
        p256dh: data.p256dh,
        auth: data.auth,
        userId: data.userId,
      }
    );

    return { data: subscription };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Create push subscription failed", {
      error,
      data,
    });
    throw new Error(
      `Failed to create push subscription: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getPushSubscriptions = async (data: { userId: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.debug("pRPC: Getting push subscriptions", {
      userId: data.userId,
    });

    const subscriptions = await ctx.services.notification.getPushSubscriptions(
      data.userId
    );
    return { data: subscriptions };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Get push subscriptions failed", {
      error,
      userId: data.userId,
    });
    throw new Error(
      `Failed to get push subscriptions: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const deletePushSubscription = async (data: { id: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Deleting push subscription", {
      id: data.id,
    });

    await ctx.services.notification.deletePushSubscription(data.id);
    return { data: { success: true } };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Delete push subscription failed", {
      error,
      id: data.id,
    });
    throw new Error(
      `Failed to delete push subscription: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const sendPushNotification = async (data: {
  userId: string;
  message: string;
}) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: Sending push notification", {
      userId: data.userId,
    });

    await ctx.services.notification.sendPushNotification(
      data.userId,
      data.message
    );
    return { data: { success: true } };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Send push notification failed", {
      error,
      data,
    });
    throw new Error(
      `Failed to send push notification: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
// Authentication Management
export const signIn = async (data: { email: string; password: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: User sign in", { email: data.email });

    const session = await ctx.services.auth.signIn(data.email, data.password);
    if (!session) {
      throw new Error("Invalid credentials");
    }

    return {
      data: {
        user: session.user,
        session: {
          id: "mock-session-id", // TODO: Implement proper session ID
          userId: session.user.id,
          expiresAt: session.expires.toISOString(),
        },
      },
    };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Sign in failed", {
      error,
      email: data.email,
    });
    throw new Error(
      `Failed to sign in: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const signUp = async (data: {
  name: string;
  email: string;
  password: string;
}) => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: User sign up", { email: data.email });

    const session = await ctx.services.auth.signUp(
      data.email,
      data.password,
      data.name
    );
    if (!session) {
      throw new Error("Failed to create user");
    }

    return {
      data: {
        user: session.user,
        session: {
          id: "mock-session-id", // TODO: Implement proper session ID
          userId: session.user.id,
          expiresAt: session.expires.toISOString(),
        },
      },
    };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Sign up failed", {
      error,
      email: data.email,
    });
    throw new Error(
      `Failed to sign up: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const signOut = async () => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.info("pRPC: User sign out");

    await ctx.services.auth.signOut();
    return { data: { success: true } };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Sign out failed", { error });
    throw new Error(
      `Failed to sign out: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getCurrentUser = async () => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.debug("pRPC: Getting current user");

    const user = await ctx.services.auth.getCurrentUser();
    return { data: user };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Get current user failed", { error });
    throw new Error(
      `Failed to get current user: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const getSession = async () => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.debug("pRPC: Getting session");

    const session = await ctx.services.auth.getSession();
    if (!session) {
      return { data: null };
    }

    return {
      data: {
        id: "mock-session-id", // TODO: Implement proper session ID
        userId: session.user.id,
        expiresAt: session.expires.toISOString(),
      },
    };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Get session failed", { error });
    throw new Error(
      `Failed to get session: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

export const isAuthenticated = async () => {
  "use server";
  try {
    const ctx = await getContext();
    ctx.services.logger.debug("pRPC: Checking authentication status");

    const authenticated = await ctx.services.auth.isAuthenticated();
    return { data: { authenticated } };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Check authentication failed", { error });
    throw new Error(
      `Failed to check authentication: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
