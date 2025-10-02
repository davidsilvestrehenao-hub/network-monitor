/**
 * REST API Routes (Hono)
 *
 * Clean, Express-like routing with Hono framework.
 * All business logic is in services - these routes just handle HTTP concerns.
 *
 * Architecture:
 * REST Route → Service (from DI) → Repository → Database
 */

import type { MicroserviceContext } from "@network-monitor/infrastructure";
import { registerHealthRoutes } from "./health-routes";
import { registerTargetRoutes } from "./target-routes";
import { registerAlertRuleRoutes } from "./alert-rule-routes";
import { registerIncidentRoutes } from "./incident-routes";
import { registerNotificationRoutes } from "./notification-routes";

/**
 * Register all REST routes with the Hono app
 */
export function registerRESTRoutes(
  // Justification: Using any for Hono app type to avoid complex generic type constraints
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any,
  context: MicroserviceContext
): void {
  // Register domain-specific routes
  registerHealthRoutes(app, context);
  registerTargetRoutes(app, context);
  registerAlertRuleRoutes(app, context);
  registerIncidentRoutes(app, context);
  registerNotificationRoutes(app, context);
}
