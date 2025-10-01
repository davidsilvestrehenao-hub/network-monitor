/**
 * REST API Routes (Hono)
 *
 * Clean, Express-like routing with Hono framework.
 * All business logic is in services - these routes just handle HTTP concerns.
 *
 * Architecture:
 * REST Route → Service (from DI) → Repository → Database
 */

import type { Context } from "hono";
import type { MicroserviceContext } from "@network-monitor/infrastructure";
import type {
  IMonitorService,
  IAlertingService,
  INotificationService,
} from "@network-monitor/shared";

/**
 * Register REST routes with the Hono app
 */
export function registerRESTRoutes(
  // Justification: Using any for Hono app type to avoid complex generic type constraints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any,
  context: MicroserviceContext
): void {
  const monitorService = context.services.monitor as IMonitorService | null;
  const alertingService = context.services.alerting as IAlertingService | null;
  const notificationService = context.services
    .notification as INotificationService | null;

  // Helper to get user ID (will be replaced with real auth)
  const getUserId = (authHeader: string | null | undefined): string => {
    // TODO: Extract from JWT or session
    return authHeader?.replace("Bearer ", "") || "mock-user-id";
  };

  // ==========================================================================
  // HEALTH CHECK
  // ==========================================================================

  /**
   * GET /health
   * Health check endpoint
   */
  app.get("/health", (c: Context) => {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      services: {
        monitor: !!monitorService,
        alerting: !!alertingService,
        notification: !!notificationService,
      },
      database: !!context.database,
    };

    return c.json(health);
  });

  // ==========================================================================
  // TARGET ROUTES
  // ==========================================================================

  /**
   * GET /api/targets
   * Get all targets (no user filtering)
   */
  app.get("/api/targets", async (c: Context) => {
    if (!monitorService) {
      return c.json({ error: "Monitor service not available" }, 503);
    }

    try {
      // Get all targets without user filtering
      const targets = await monitorService.getAllTargets();
      return c.json(targets);
    } catch (err) {
      context.logger.error("REST: Get targets failed", { error: err });
      return c.json({ error: "Failed to get targets" }, 500);
    }
  });

  /**
   * GET /api/targets/active
   * Get list of actively monitored targets
   */
  app.get("/api/targets/active", async (c: Context) => {
    if (!monitorService) {
      return c.json({ error: "Monitor service not available" }, 503);
    }

    try {
      const activeTargets = monitorService.getActiveTargets();
      return c.json({ targetIds: activeTargets });
    } catch (err) {
      context.logger.error("REST: Get active targets failed", { error: err });
      return c.json({ error: "Failed to get active targets" }, 500);
    }
  });

  /**
   * GET /api/targets/:id
   * Get a specific target by ID
   */
  app.get("/api/targets/:id", async (c: Context) => {
    if (!monitorService) {
      return c.json({ error: "Monitor service not available" }, 503);
    }

    try {
      const id = c.req.param("id");
      const target = await monitorService.getTarget(id);
      if (!target) {
        return c.json({ error: "Target not found" }, 404);
      }
      return c.json(target);
    } catch (err) {
      const id = c.req.param("id");
      context.logger.error("REST: Get target failed", { error: err, id });
      return c.json({ error: "Failed to get target" }, 500);
    }
  });

  /**
   * POST /api/targets
   * Create a new monitoring target
   */
  app.post("/api/targets", async (c: Context) => {
    if (!monitorService) {
      return c.json({ error: "Monitor service not available" }, 503);
    }

    try {
      const userId = getUserId(c.req.header("Authorization"));
      const body = await c.req.json();

      // Validate input
      if (!body.name || !body.address) {
        return c.json({ error: "Missing required fields: name, address" }, 400);
      }

      const target = await monitorService.createTarget({
        name: body.name,
        address: body.address,
        ownerId: userId,
      });

      return c.json(target, 201);
    } catch (err) {
      context.logger.error("REST: Create target failed", { error: err });
      return c.json({ error: "Failed to create target" }, 500);
    }
  });

  /**
   * PUT /api/targets/:id
   * Update an existing target
   */
  app.put("/api/targets/:id", async (c: Context) => {
    if (!monitorService) {
      return c.json({ error: "Monitor service not available" }, 503);
    }

    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const target = await monitorService.updateTarget(id, body);
      return c.json(target);
    } catch (err) {
      const id = c.req.param("id");
      context.logger.error("REST: Update target failed", { error: err, id });
      return c.json({ error: "Failed to update target" }, 500);
    }
  });

  /**
   * DELETE /api/targets/:id
   * Delete a target
   */
  app.delete("/api/targets/:id", async (c: Context) => {
    if (!monitorService) {
      return c.json({ error: "Monitor service not available" }, 503);
    }

    try {
      const id = c.req.param("id");
      await monitorService.deleteTarget(id);
      return c.body(null, 204);
    } catch (err) {
      const id = c.req.param("id");
      context.logger.error("REST: Delete target failed", { error: err, id });
      return c.json({ error: "Failed to delete target" }, 500);
    }
  });

  /**
   * POST /api/targets/:id/start
   * Start monitoring a target
   */
  app.post("/api/targets/:id/start", async (c: Context) => {
    if (!monitorService) {
      return c.json({ error: "Monitor service not available" }, 503);
    }

    try {
      const id = c.req.param("id");
      const body = await c.req.json();
      const intervalMs = body.intervalMs || 30000;

      monitorService.startMonitoring(id, intervalMs);
      return c.json({ success: true, targetId: id, intervalMs });
    } catch (err) {
      const id = c.req.param("id");
      context.logger.error("REST: Start monitoring failed", { error: err, id });
      return c.json({ error: "Failed to start monitoring" }, 500);
    }
  });

  /**
   * POST /api/targets/:id/stop
   * Stop monitoring a target
   */
  app.post("/api/targets/:id/stop", async (c: Context) => {
    if (!monitorService) {
      return c.json({ error: "Monitor service not available" }, 503);
    }

    try {
      const id = c.req.param("id");
      monitorService.stopMonitoring(id);
      return c.json({ success: true, targetId: id });
    } catch (err) {
      const id = c.req.param("id");
      context.logger.error("REST: Stop monitoring failed", { error: err, id });
      return c.json({ error: "Failed to stop monitoring" }, 500);
    }
  });

  /**
   * POST /api/targets/:id/test
   * Run a speed test immediately
   */
  app.post("/api/targets/:id/test", async (c: Context) => {
    if (!monitorService) {
      return c.json({ error: "Monitor service not available" }, 503);
    }

    try {
      const id = c.req.param("id");
      const target = await monitorService.getTarget(id);
      if (!target) {
        return c.json({ error: "Target not found" }, 404);
      }

      // Emit event to request speed test
      context.eventBus.emit("SPEED_TEST_REQUESTED", {
        targetId: id,
        target: target.address,
      });

      return c.json({ success: true, message: "Speed test initiated" }, 202);
    } catch (err) {
      const id = c.req.param("id");
      context.logger.error("REST: Run speed test failed", { error: err, id });
      return c.json({ error: "Failed to run speed test" }, 500);
    }
  });

  // ==========================================================================
  // ALERT RULE ROUTES
  // ==========================================================================

  /**
   * GET /api/alert-rules/target/:targetId
   * Get alert rules for a target
   */
  app.get("/api/alert-rules/target/:targetId", async (c: Context) => {
    if (!alertingService) {
      return c.json({ error: "Alerting service not available" }, 503);
    }

    try {
      const targetId = c.req.param("targetId");
      const rules = await alertingService.getAlertRulesByTargetId(targetId);
      return c.json(rules);
    } catch (err) {
      const targetId = c.req.param("targetId");
      context.logger.error("REST: Get alert rules failed", {
        error: err,
        targetId,
      });
      return c.json({ error: "Failed to get alert rules" }, 500);
    }
  });

  /**
   * POST /api/alert-rules
   * Create a new alert rule
   */
  app.post("/api/alert-rules", async (c: Context) => {
    if (!alertingService) {
      return c.json({ error: "Alerting service not available" }, 503);
    }

    try {
      const body = await c.req.json();

      // Validate input
      if (
        !body.name ||
        !body.targetId ||
        !body.metric ||
        !body.condition ||
        body.threshold === undefined
      ) {
        return c.json(
          {
            error:
              "Missing required fields: name, targetId, metric, condition, threshold",
          },
          400
        );
      }

      const rule = await alertingService.createAlertRule({
        name: body.name,
        targetId: body.targetId,
        metric: body.metric,
        condition: body.condition,
        threshold: body.threshold,
        enabled: body.enabled ?? true,
      });

      return c.json(rule, 201);
    } catch (err) {
      context.logger.error("REST: Create alert rule failed", { error: err });
      return c.json({ error: "Failed to create alert rule" }, 500);
    }
  });

  /**
   * PUT /api/alert-rules/:id
   * Update an alert rule
   */
  app.put("/api/alert-rules/:id", async (c: Context) => {
    if (!alertingService) {
      return c.json({ error: "Alerting service not available" }, 503);
    }

    try {
      const id = parseInt(c.req.param("id"), 10);
      const body = await c.req.json();
      const rule = await alertingService.updateAlertRule(id, body);
      return c.json(rule);
    } catch (err) {
      const id = parseInt(c.req.param("id"), 10);
      context.logger.error("REST: Update alert rule failed", {
        error: err,
        id,
      });
      return c.json({ error: "Failed to update alert rule" }, 500);
    }
  });

  /**
   * DELETE /api/alert-rules/:id
   * Delete an alert rule
   */
  app.delete("/api/alert-rules/:id", async (c: Context) => {
    if (!alertingService) {
      return c.json({ error: "Alerting service not available" }, 503);
    }

    try {
      const id = parseInt(c.req.param("id"), 10);
      await alertingService.deleteAlertRule(id);
      return c.body(null, 204);
    } catch (err) {
      const id = parseInt(c.req.param("id"), 10);
      context.logger.error("REST: Delete alert rule failed", {
        error: err,
        id,
      });
      return c.json({ error: "Failed to delete alert rule" }, 500);
    }
  });

  // ==========================================================================
  // INCIDENT ROUTES
  // ==========================================================================

  /**
   * GET /api/incidents/target/:targetId
   * Get incidents for a target
   */
  app.get("/api/incidents/target/:targetId", async (c: Context) => {
    if (!alertingService) {
      return c.json({ error: "Alerting service not available" }, 503);
    }

    try {
      const targetId = c.req.param("targetId");
      const incidents = await alertingService.getIncidentsByTargetId(targetId);
      return c.json(incidents);
    } catch (err) {
      const targetId = c.req.param("targetId");
      context.logger.error("REST: Get incidents failed", {
        error: err,
        targetId,
      });
      return c.json({ error: "Failed to get incidents" }, 500);
    }
  });

  /**
   * POST /api/incidents/:id/resolve
   * Mark an incident as resolved
   */
  app.post("/api/incidents/:id/resolve", async (c: Context) => {
    if (!alertingService) {
      return c.json({ error: "Alerting service not available" }, 503);
    }

    try {
      const id = parseInt(c.req.param("id"), 10);
      await alertingService.resolveIncident(id);
      return c.json({ success: true, id });
    } catch (err) {
      const id = parseInt(c.req.param("id"), 10);
      context.logger.error("REST: Resolve incident failed", { error: err, id });
      return c.json({ error: "Failed to resolve incident" }, 500);
    }
  });

  // ==========================================================================
  // NOTIFICATION ROUTES
  // ==========================================================================

  /**
   * GET /api/notifications/user/:userId
   * Get notifications for a user
   */
  app.get("/api/notifications/user/:userId", async (c: Context) => {
    if (!notificationService) {
      return c.json({ error: "Notification service not available" }, 503);
    }

    try {
      const userId = c.req.param("userId");
      const notifications = await notificationService.getNotifications(userId);
      return c.json(notifications);
    } catch (err) {
      const userId = c.req.param("userId");
      context.logger.error("REST: Get notifications failed", {
        error: err,
        userId,
      });
      return c.json({ error: "Failed to get notifications" }, 500);
    }
  });

  /**
   * POST /api/notifications/:id/read
   * Mark a notification as read
   */
  app.post("/api/notifications/:id/read", async (c: Context) => {
    if (!notificationService) {
      return c.json({ error: "Notification service not available" }, 503);
    }

    try {
      const id = parseInt(c.req.param("id"), 10);
      await notificationService.markNotificationAsRead(id);
      return c.json({ success: true, id });
    } catch (err) {
      const id = parseInt(c.req.param("id"), 10);
      context.logger.error("REST: Mark notification as read failed", {
        error: err,
        id,
      });
      return c.json({ error: "Failed to mark notification as read" }, 500);
    }
  });

  // ==========================================================================
  // PUSH SUBSCRIPTION ROUTES
  // ==========================================================================

  /**
   * POST /api/push-subscriptions
   * Create a push subscription
   */
  app.post("/api/push-subscriptions", async (c: Context) => {
    if (!notificationService) {
      return c.json({ error: "Notification service not available" }, 503);
    }

    try {
      const userId = getUserId(c.req.header("Authorization"));
      const body = await c.req.json();

      if (!body.endpoint || !body.p256dh || !body.auth) {
        return c.json(
          { error: "Missing required fields: endpoint, p256dh, auth" },
          400
        );
      }

      const subscription = await notificationService.createPushSubscription({
        userId,
        endpoint: body.endpoint,
        p256dh: body.p256dh,
        auth: body.auth,
      });

      return c.json(subscription, 201);
    } catch (err) {
      context.logger.error("REST: Create push subscription failed", {
        error: err,
      });
      return c.json({ error: "Failed to create push subscription" }, 500);
    }
  });
}
