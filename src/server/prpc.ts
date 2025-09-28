import { createCaller, error$ } from "@solid-mediakit/prpc";
import { getAppContext, initializeContainer } from "~/lib/container/container";
import { z } from "zod";

// Target management callers following PRPC documentation
export const createTarget = createCaller(
  z.object({
    name: z.string().min(1, "Target name is required"),
    address: z.string().min(1, "Target address is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    try {
      await initializeContainer();
      const ctx = await getAppContext();
      if (!ctx.services.monitor) throw new Error("Monitor service not available");
      const { name, address } = input$;

      const target = await ctx.services.monitor.createTarget({
        name,
        address,
        ownerId: "anonymous",
      });

      return target;
    } catch (error) {
      console.error("Error in createTarget:", error);
      throw error;
    }
  },
  {
    method: "POST",
    type: "action",
  }
);

export const getTargets = createCaller(
  z.object({}),
  async ({ input$: _input$, event$: _event$ }) => {
    try {
      await initializeContainer();
      const ctx = await getAppContext();
      if (!ctx.services.monitor) throw new Error("Monitor service not available");
      const targets = await ctx.services.monitor.getTargets("anonymous");
      return targets;
    } catch (error) {
      console.error("Error in getTargets:", error);
      throw error;
    }
  },
  {
    method: "GET",
    type: "query",
  }
);

export const getTarget = createCaller(
  z.object({
    id: z.string().min(1, "Target ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.monitor) throw new Error("Monitor service not available");
    const { id } = input$;

    const target = await ctx.services.monitor.getTarget(id);
    if (!target || target.ownerId !== "anonymous") {
      throw new Error("Target not found or unauthorized access");
    }

    return target;
  }
);

export const updateTarget = createCaller(
  z.object({
    id: z.string().min(1, "Target ID is required"),
    name: z.string().min(1, "Target name is required").optional(),
    address: z.string().min(1, "Target address is required").optional(),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.monitor) throw new Error("Monitor service not available");
    const { id, ...data } = input$;

    const existingTarget = await ctx.services.monitor.getTarget(id);
    if (!existingTarget || existingTarget.ownerId !== "anonymous") {
      throw new Error("Target not found or unauthorized access");
    }

    const target = await ctx.services.monitor.updateTarget(id, data);
    return target;
  }
);

export const deleteTarget = createCaller(
  z.object({
    id: z.string().min(1, "Target ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.monitor) throw new Error("Monitor service not available");
    const { id } = input$;

    const existingTarget = await ctx.services.monitor.getTarget(id);
    if (!existingTarget || existingTarget.ownerId !== "anonymous") {
      throw new Error("Target not found or unauthorized access");
    }

    await ctx.services.monitor.deleteTarget(id);
    return { success: true };
  }
);

export const runSpeedTest = createCaller(
  z.object({
    targetId: z.string().min(1, "Target ID is required"),
    timeout: z.number().positive().optional(),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.monitor) throw new Error("Monitor service not available");
    const { targetId, timeout } = input$;

    const target = await ctx.services.monitor.getTarget(targetId);
    if (!target || target.ownerId !== "anonymous") {
      throw new Error("Target not found or unauthorized access");
    }

    const result = await ctx.services.monitor.runSpeedTest({
      targetId,
      timeout,
    });
    return result;
  }
);

export const getTargetResults = createCaller(
  z.object({
    targetId: z.string().min(1, "Target ID is required"),
    limit: z.number().positive().optional(),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.monitor) throw new Error("Monitor service not available");
    const { targetId, limit } = input$;

    const target = await ctx.services.monitor.getTarget(targetId);
    if (!target || target.ownerId !== "anonymous") {
      throw new Error("Target not found or unauthorized access");
    }

    const results = await ctx.services.monitor.getTargetResults(
      targetId,
      limit
    );
    return results;
  }
);

export const startMonitoring = createCaller(
  z.object({
    targetId: z.string().min(1, "Target ID is required"),
    intervalMs: z.number().positive("Interval must be positive"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.monitor) throw new Error("Monitor service not available");
    const { targetId, intervalMs } = input$;

    const target = await ctx.services.monitor.getTarget(targetId);
    if (!target || target.ownerId !== "anonymous") {
      throw new Error("Target not found or unauthorized access");
    }

    ctx.services.monitor.startMonitoring(targetId, intervalMs);
    return { success: true };
  }
);

export const stopMonitoring = createCaller(
  z.object({
    targetId: z.string().min(1, "Target ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.monitor) throw new Error("Monitor service not available");
    const { targetId } = input$;

    const target = await ctx.services.monitor.getTarget(targetId);
    if (!target || target.ownerId !== "anonymous") {
      throw new Error("Target not found or unauthorized access");
    }

    ctx.services.monitor.stopMonitoring(targetId);
    return { success: true };
  }
);

export const getActiveTargets = createCaller(
  z.object({}),
  async ({ input$: _input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.monitor) throw new Error("Monitor service not available");
    const activeTargets = ctx.services.monitor.getActiveTargets();
    return activeTargets;
  }
);

// Alerting endpoints
export const createAlertRule = createCaller(
  z.object({
    targetId: z.string().min(1, "Target ID is required"),
    name: z.string().min(1, "Rule name is required"),
    metric: z.enum(["ping", "download"]),
    condition: z.enum(["GREATER_THAN", "LESS_THAN"]),
    threshold: z.number().positive("Threshold must be positive"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.alerting)
      throw new Error("Alerting service not available");
    const rule = await ctx.services.alerting.createAlertRule(input$);
    return rule;
  }
);

export const getAlertRules = createCaller(
  z.object({
    targetId: z.string().min(1, "Target ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.alerting)
      throw new Error("Alerting service not available");
    const rules = await ctx.services.alerting.getAlertRulesByTargetId(
      input$.targetId
    );
    return rules;
  }
);

export const updateAlertRule = createCaller(
  z.object({
    id: z.number().positive("Rule ID is required"),
    name: z.string().min(1, "Rule name is required").optional(),
    metric: z.enum(["ping", "download"]).optional(),
    condition: z.enum(["GREATER_THAN", "LESS_THAN"]).optional(),
    threshold: z.number().positive("Threshold must be positive").optional(),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.alerting)
      throw new Error("Alerting service not available");
    const { id, ...data } = input$;
    const rule = await ctx.services.alerting.updateAlertRule(id, data);
    return rule;
  }
);

export const deleteAlertRule = createCaller(
  z.object({
    id: z.number().positive("Rule ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.alerting)
      throw new Error("Alerting service not available");
    await ctx.services.alerting.deleteAlertRule(input$.id);
    return { success: true };
  }
);

export const getIncidents = createCaller(
  z.object({
    targetId: z.string().min(1, "Target ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.alerting)
      throw new Error("Alerting service not available");
    const incidents = await ctx.services.alerting.getIncidentsByTargetId(
      input$.targetId
    );
    return incidents;
  }
);

export const resolveIncident = createCaller(
  z.object({
    id: z.number().positive("Incident ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.alerting)
      throw new Error("Alerting service not available");
    await ctx.services.alerting.resolveIncident(input$.id);
    return { success: true };
  }
);

// Notification endpoints
export const getNotifications = createCaller(
  z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.notification)
      throw new Error("Notification service not available");
    const notifications = await ctx.services.notification.getNotifications(
      input$.userId
    );
    return notifications;
  }
);

export const markNotificationAsRead = createCaller(
  z.object({
    id: z.number().positive("Notification ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.notification)
      throw new Error("Notification service not available");
    await ctx.services.notification.markNotificationAsRead(input$.id);
    return { success: true };
  }
);

export const markAllNotificationsAsRead = createCaller(
  z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.notification)
      throw new Error("Notification service not available");
    await ctx.services.notification.markAllNotificationsAsRead(input$.userId);
    return { success: true };
  }
);

export const createPushSubscription = createCaller(
  z.object({
    userId: z.string().min(1, "User ID is required"),
    endpoint: z.string().min(1, "Endpoint is required"),
    p256dh: z.string().min(1, "p256dh key is required"),
    auth: z.string().min(1, "Auth key is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.notification)
      throw new Error("Notification service not available");
    const subscription =
      await ctx.services.notification.createPushSubscription(input$);
    return subscription;
  }
);

export const getPushSubscriptions = createCaller(
  z.object({
    userId: z.string().min(1, "User ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.notification)
      throw new Error("Notification service not available");
    const subscriptions = await ctx.services.notification.getPushSubscriptions(
      input$.userId
    );
    return subscriptions;
  }
);

export const deletePushSubscription = createCaller(
  z.object({
    id: z.string().min(1, "Subscription ID is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.notification)
      throw new Error("Notification service not available");
    await ctx.services.notification.deletePushSubscription(input$.id);
    return { success: true };
  }
);

export const sendPushNotification = createCaller(
  z.object({
    userId: z.string().min(1, "User ID is required"),
    message: z.string().min(1, "Message is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.notification)
      throw new Error("Notification service not available");
    await ctx.services.notification.sendPushNotification(
      input$.userId,
      input$.message
    );
    return { success: true };
  }
);

// Authentication endpoints
export const signIn = createCaller(
  z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(1, "Password is required"),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.auth) throw new Error("Auth service not available");
    const result = await ctx.services.auth.signIn(
      input$.email,
      input$.password
    );
    return result;
  }
);

export const signUp = createCaller(
  z.object({
    email: z.string().email("Valid email is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    name: z.string().optional(),
  }),
  async ({ input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.auth) throw new Error("Auth service not available");
    const result = await ctx.services.auth.signUp(
      input$.email,
      input$.password,
      input$.name
    );
    return result;
  }
);

export const signOut = createCaller(
  z.object({}),
  async ({ input$: _input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.auth) throw new Error("Auth service not available");
    await ctx.services.auth.signOut();
    return { success: true };
  }
);

export const getCurrentUser = createCaller(
  z.object({}),
  async ({ input$: _input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.auth) throw new Error("Auth service not available");
    const user = await ctx.services.auth.getCurrentUser();
    return user;
  }
);

export const getSession = createCaller(
  z.object({}),
  async ({ input$: _input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.auth) throw new Error("Auth service not available");
    const session = await ctx.services.auth.getSession();
    return session;
  }
);

export const isAuthenticated = createCaller(
  z.object({}),
  async ({ input$: _input$, event$: _event$ }) => {
    const ctx = await getAppContext();
    if (!ctx.services.auth) throw new Error("Auth service not available");
    const authenticated = await ctx.services.auth.isAuthenticated();
    return { authenticated };
  }
);
