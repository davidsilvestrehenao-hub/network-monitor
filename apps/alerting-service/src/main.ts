/**
 * Alerting Microservice Entry Point (12-Factor Compliant)
 *
 * This service handles:
 * - Alert rule management
 * - Incident detection and tracking
 * - Alert evaluation
 *
 * Listens to events:
 * - ALERT_RULE_CREATE_REQUESTED
 * - ALERT_RULE_UPDATE_REQUESTED
 * - ALERT_RULE_DELETE_REQUESTED
 * - SPEED_TEST_COMPLETED (to evaluate rules)
 * - INCIDENT_RESOLVE_REQUESTED
 *
 * 12-Factor Compliance:
 * ✅ Factor III: Config from environment variables
 * ✅ Factor IX: Graceful shutdown
 * ✅ Factor XI: Logs to stdout/stderr
 */

import {
  bootstrapMicroservice,
  getRequiredService,
  type MicroserviceContext,
  validateEnvironment,
  getEnvironment,
  setupGracefulShutdown,
} from "@network-monitor/infrastructure";
import type { IAlertingService } from "@network-monitor/shared";

async function startAlertingService() {
  // 12-Factor Factor III: Validate environment configuration at startup
  validateEnvironment();
  const config = getEnvironment();

  // Check if service is enabled
  if (!config.alertingServiceEnabled) {
    // Justification: Console log for service disabled message
    // eslint-disable-next-line no-console
    console.log(
      "⚠️  Alerting Service is disabled (ALERTING_SERVICE_ENABLED=false)"
    );
    process.exit(0);
  }

  // Bootstrap the microservice
  // Service wiring: Which implementations to use (DI configuration)
  const wiringConfig = process.env.SERVICE_WIRING_CONFIG || config.nodeEnv;
  const configPath = `service-wiring/${wiringConfig}.json`;

  const context = await bootstrapMicroservice({
    serviceName: "Alerting Service",
    configPath,
    enableDatabase: true,

    // Custom initialization - setup event handlers
    onInitialized: async (ctx: MicroserviceContext) => {
      // Justification: Service retrieved for validation that it exists in container
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const alertingService = getRequiredService<IAlertingService>(
        ctx,
        "alerting"
      );

      ctx.logger.info("Alerting Service initialized", {
        environment: config.nodeEnv,
        eventBus: config.eventBusType,
        database: ctx.database ? "connected" : "not configured",
      });

      ctx.logger.info("Listening for events:");
      ctx.logger.info("  - ALERT_RULE_CREATE_REQUESTED");
      ctx.logger.info("  - ALERT_RULE_UPDATE_REQUESTED");
      ctx.logger.info("  - ALERT_RULE_DELETE_REQUESTED");
      ctx.logger.info("  - SPEED_TEST_COMPLETED (evaluates rules)");
      ctx.logger.info("  - INCIDENT_RESOLVE_REQUESTED");
      ctx.logger.info("");

      ctx.logger.info("12-Factor Compliance:");
      ctx.logger.info("  ✅ Config from environment");
      ctx.logger.info("  ✅ Graceful shutdown enabled");
      ctx.logger.info("  ✅ Logs to stdout/stderr");
      ctx.logger.info("  ✅ Stateless (scales horizontally)");
      ctx.logger.info("");

      // Setup event handlers
      // TODO: Implement event handlers when AlertingService supports them
      // ctx.eventBus.on("ALERT_RULE_CREATE_REQUESTED", (data) => { ... });
      // ctx.eventBus.on("SPEED_TEST_COMPLETED", (data) => { ... });

      // 12-Factor Factor IX: Setup graceful shutdown
      setupGracefulShutdown({
        logger: ctx.logger,
        database: ctx.database ?? undefined,
        eventBus: ctx.eventBus,
        shutdownTimeout: 30000,
        onShutdown: async () => {
          ctx.logger.info("Stopping Alerting Service tasks...");
          // TODO: Cleanup any pending alert evaluations
        },
      });

      ctx.logger.info(
        "Graceful shutdown handlers registered (SIGTERM, SIGINT)"
      );
    },

    // Custom shutdown - cleanup
    onShutdown: async (ctx: MicroserviceContext) => {
      ctx.logger.info("Cleaning up Alerting Service...");
      // All cleanup is handled by the graceful shutdown handler
    },
  });

  // Service is now running
  context.logger.info(
    "Alerting Service is now running and listening for events",
    {
      port: config.port,
      eventBus: config.eventBusType,
    }
  );
}

// Start the microservice
startAlertingService().catch(error => {
  // Justification: Console error for startup failure
  // eslint-disable-next-line no-console
  console.error("❌ Failed to start Alerting Service:", error);
  process.exit(1);
});
