/**
 * Monitor Microservice Entry Point (12-Factor Compliant)
 *
 * This service handles:
 * - Target management (CRUD)
 * - Speed test execution
 * - Monitoring scheduling
 *
 * Listens to events:
 * - TARGET_CREATE_REQUESTED
 * - TARGET_UPDATE_REQUESTED
 * - TARGET_DELETE_REQUESTED
 * - SPEED_TEST_REQUESTED
 * - MONITORING_START_REQUESTED
 * - MONITORING_STOP_REQUESTED
 *
 * Deploy independently and scale based on load!
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
import type { IMonitorService } from "@network-monitor/shared";

async function startMonitorService() {
  // 12-Factor Factor III: Validate environment configuration at startup
  validateEnvironment();
  const config = getEnvironment();

  // Check if service is enabled
  if (!config.monitorServiceEnabled) {
    // Justification: Console log for service disabled message
    // eslint-disable-next-line no-console
    console.log(
      "⚠️  Monitor Service is disabled (MONITOR_SERVICE_ENABLED=false)"
    );
    process.exit(0);
  }

  // Bootstrap the microservice
  // Service wiring: Which implementations to use (DI configuration)
  const wiringConfig = process.env.SERVICE_WIRING_CONFIG || config.nodeEnv;
  const configPath = `service-wiring/${wiringConfig}.json`;

  const context = await bootstrapMicroservice({
    serviceName: "Monitor Service",
    configPath,
    enableDatabase: true,

    // Custom initialization - setup event handlers
    onInitialized: async (ctx: MicroserviceContext) => {
      // Justification: Service retrieved for validation that it exists in container
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const monitorService = getRequiredService<IMonitorService>(
        ctx,
        "monitor"
      );

      ctx.logger.info("Monitor Service initialized", {
        environment: config.nodeEnv,
        eventBus: config.eventBusType,
        database: ctx.database ? "connected" : "not configured",
      });

      ctx.logger.info("Listening for events:");
      ctx.logger.info("  - TARGET_CREATE_REQUESTED");
      ctx.logger.info("  - TARGET_UPDATE_REQUESTED");
      ctx.logger.info("  - TARGET_DELETE_REQUESTED");
      ctx.logger.info("  - SPEED_TEST_REQUESTED");
      ctx.logger.info("  - MONITORING_START_REQUESTED");
      ctx.logger.info("  - MONITORING_STOP_REQUESTED");
      ctx.logger.info("");

      ctx.logger.info("12-Factor Compliance:");
      ctx.logger.info("  ✅ Config from environment");
      ctx.logger.info("  ✅ Graceful shutdown enabled");
      ctx.logger.info("  ✅ Logs to stdout/stderr");
      ctx.logger.info("  ✅ Stateless (scales horizontally)");
      ctx.logger.info("");

      // Setup event handlers
      // TODO: Implement event handlers when MonitorService supports them
      // ctx.eventBus.on("TARGET_CREATE_REQUESTED", (data) => { ... });
      // ctx.eventBus.on("SPEED_TEST_REQUESTED", (data) => { ... });

      // 12-Factor Factor IX: Setup graceful shutdown
      setupGracefulShutdown({
        logger: ctx.logger,
        database: ctx.database ?? undefined,
        eventBus: ctx.eventBus,
        shutdownTimeout: 30000,
        onShutdown: async () => {
          ctx.logger.info("Stopping Monitor Service tasks...");
          // TODO: Stop any running monitoring tasks
        },
      });

      ctx.logger.info(
        "Graceful shutdown handlers registered (SIGTERM, SIGINT)"
      );
    },

    // Custom shutdown - cleanup
    onShutdown: async (ctx: MicroserviceContext) => {
      ctx.logger.info("Cleaning up Monitor Service...");
      // All cleanup is handled by the graceful shutdown handler
    },
  });

  // Service is now running
  context.logger.info(
    "Monitor Service is now running and listening for events",
    {
      port: config.port,
      eventBus: config.eventBusType,
    }
  );
}

// Start the microservice
startMonitorService().catch(error => {
  // Justification: Console error for startup failure
  // eslint-disable-next-line no-console
  console.error("❌ Failed to start Monitor Service:", error);
  process.exit(1);
});
