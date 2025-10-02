/**
 * Target Routes
 *
 * REST endpoints for monitoring target management.
 * Handles CRUD operations and monitoring control for targets.
 */

import type { Context } from "hono";
import type { MicroserviceContext } from "@network-monitor/infrastructure";
import type { IMonitorService } from "@network-monitor/shared";

/**
 * Register target management routes
 */
export function registerTargetRoutes(
  // Justification: Using any for Hono app type to avoid complex generic type constraints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any,
  context: MicroserviceContext
): void {
  const monitorService = context.services.monitor as IMonitorService | null;

  // Helper to get user ID (will be replaced with real auth)
  const getUserId = (authHeader: string | null | undefined): string => {
    // TODO: Extract from JWT or session
    return authHeader?.replace("Bearer ", "") || "mock-user-id";
  };

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
      });

      return c.json({ success: true, message: "Speed test initiated" }, 202);
    } catch (err) {
      const id = c.req.param("id");
      context.logger.error("REST: Run speed test failed", { error: err, id });
      return c.json({ error: "Failed to run speed test" }, 500);
    }
  });
}
