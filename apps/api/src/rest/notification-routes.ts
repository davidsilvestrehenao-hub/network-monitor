/**
 * Notification Routes
 *
 * REST endpoints for notification management.
 * Handles notifications, push subscriptions, and user communication.
 */

import type { Context } from "hono";
import type { MicroserviceContext } from "@network-monitor/infrastructure";
import type { INotificationService } from "@network-monitor/shared";

/**
 * Register notification management routes
 */
export function registerNotificationRoutes(
  // Justification: Using any for Hono app type to avoid complex generic type constraints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any,
  context: MicroserviceContext
): void {
  const notificationService = context.services
    .notification as INotificationService | null;

  // Helper to get user ID (will be replaced with real auth)
  const getUserId = (authHeader: string | null | undefined): string => {
    // TODO: Extract from JWT or session
    return authHeader?.replace("Bearer ", "") || "mock-user-id";
  };

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
      await notificationService.markNotificationAsRead(id.toString());
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
        userId: userId,
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
