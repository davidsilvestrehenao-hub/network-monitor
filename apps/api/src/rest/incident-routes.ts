/**
 * Incident Routes
 *
 * REST endpoints for incident management.
 * Handles incident tracking, resolution, and reporting.
 */

import type { Context } from "hono";
import type { MicroserviceContext } from "@network-monitor/infrastructure";
import type { IAlertingService } from "@network-monitor/shared";

/**
 * Register incident management routes
 */
export function registerIncidentRoutes(
  // Justification: Using any for Hono app type to avoid complex generic type constraints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any,
  context: MicroserviceContext
): void {
  const alertingService = context.services.alerting as IAlertingService | null;

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
      await alertingService.resolveIncident(id.toString());
      return c.json({ success: true, id });
    } catch (err) {
      const id = parseInt(c.req.param("id"), 10);
      context.logger.error("REST: Resolve incident failed", { error: err, id });
      return c.json({ error: "Failed to resolve incident" }, 500);
    }
  });
}
