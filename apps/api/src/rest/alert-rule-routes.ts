/**
 * Alert Rule Routes
 *
 * REST endpoints for alert rule management.
 * Handles CRUD operations for alerting rules and configurations.
 */

import type { Context } from "hono";
import type { MicroserviceContext } from "@network-monitor/infrastructure";
import type { IAlertingService } from "@network-monitor/shared";

/**
 * Register alert rule management routes
 */
export function registerAlertRuleRoutes(
  // Justification: Using any for Hono app type to avoid complex generic type constraints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any,
  context: MicroserviceContext
): void {
  const alertingService = context.services.alerting as IAlertingService | null;

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
      const rule = await alertingService.updateAlertRule(id.toString(), body);
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
      await alertingService.deleteAlertRule(id.toString());
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
}
