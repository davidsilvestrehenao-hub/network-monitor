/**
 * Health Check Routes
 *
 * System health and status endpoints for monitoring and diagnostics.
 */

import type { Context } from "hono";
import type { MicroserviceContext } from "@network-monitor/infrastructure";
import type {
  IMonitorService,
  IAlertingService,
  INotificationService,
} from "@network-monitor/shared";

/**
 * Register health check routes
 */
export function registerHealthRoutes(
  // Justification: Using any for Hono app type to avoid complex generic type constraints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any,
  context: MicroserviceContext
): void {
  const monitorService = context.services.monitor as IMonitorService | null;
  const alertingService = context.services.alerting as IAlertingService | null;
  const notificationService = context.services
    .notification as INotificationService | null;

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
}
