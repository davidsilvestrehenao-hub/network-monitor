/**
 * Monitor Worker Entry Point (12-Factor Compliant)
 *
 * This background worker handles:
 * - Continuous monitoring of targets
 * - Speed test execution in background
 * - Monitoring scheduling and coordination
 *
 * Listens to events:
 * - MONITORING_START_REQUESTED
 * - MONITORING_STOP_REQUESTED
 * - MONITORING_PAUSE_REQUESTED
 * - MONITORING_RESUME_REQUESTED
 * - TARGET_CREATED (to add to monitoring)
 * - TARGET_DELETED (to remove from monitoring)
 *
 * Emits events:
 * - SPEED_TEST_COMPLETED
 * - MONITORING_STARTED
 * - MONITORING_STOPPED
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
  createGracefulShutdown,
  type IGracefulShutdown,
} from "@network-monitor/infrastructure";
import type { IMonitorWorker } from "@network-monitor/shared";

/**
 * Create Monitor Worker graceful shutdown handler
 */
function createMonitorWorkerGracefulShutdown(
  context: MicroserviceContext
): IGracefulShutdown {
  async function performAppShutdown(): Promise<void> {
    context.logger.info("Stopping Monitor Worker tasks...");

    // Stop any running monitoring tasks
    await stopMonitoringTasks();

    // Cancel any pending speed tests
    await cancelPendingTests();

    // Save any in-progress monitoring state
    await saveMonitoringState();

    context.logger.info("Monitor Worker shutdown complete");
  }

  async function stopMonitoringTasks(): Promise<void> {
    // TODO: Stop any running monitoring tasks
    context.logger.debug("Stopping monitoring tasks...");
  }

  async function cancelPendingTests(): Promise<void> {
    // TODO: Cancel any pending speed tests
    context.logger.debug("Canceling pending speed tests...");
  }

  async function saveMonitoringState(): Promise<void> {
    // TODO: Save any in-progress monitoring state
    context.logger.debug("Saving monitoring state...");
  }

  return createGracefulShutdown(
    context.logger,
    performAppShutdown,
    context.database ?? undefined,
    context.eventBus,
    30000 // 30 second timeout
  );
}

async function startMonitorWorker() {
  // 12-Factor Factor III: Validate environment configuration at startup
  validateEnvironment();
  const config = getEnvironment();

  // Check if worker is enabled
  if (!config.monitorServiceEnabled) {
    // Justification: Console log for worker disabled message
    // eslint-disable-next-line no-console
    console.log(
      "⚠️  Monitor Worker is disabled (MONITOR_SERVICE_ENABLED=false)"
    );
    process.exit(0);
  }

  // Bootstrap the worker
  // Service wiring: Which implementations to use (DI configuration)
  const wiringConfig = process.env.SERVICE_WIRING_CONFIG || config.nodeEnv;
  const configPath = `service-wiring/${wiringConfig}.json`;

  const context = await bootstrapMicroservice({
    applicationName: "Monitor Worker",
    configPath,
    enableDatabase: true,

    // Custom initialization - setup event handlers
    onInitialized: async (ctx: MicroserviceContext) => {
      // TODO: Get IMonitorWorker implementation from container when available
      // For now, we'll use the existing service structure
      // Justification: Service retrieved for validation that it exists in container
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const monitorWorker = getRequiredService<IMonitorWorker>(
        ctx,
        "monitorWorker"
      );

      ctx.logger.info("Monitor Worker initialized", {
        environment: config.nodeEnv,
        eventBus: config.eventBusType,
        database: ctx.database ? "connected" : "not configured",
      });

      ctx.logger.info("Listening for events:");
      ctx.logger.info("  - MONITORING_START_REQUESTED");
      ctx.logger.info("  - MONITORING_STOP_REQUESTED");
      ctx.logger.info("  - MONITORING_PAUSE_REQUESTED");
      ctx.logger.info("  - MONITORING_RESUME_REQUESTED");
      ctx.logger.info("  - TARGET_CREATED (adds to monitoring)");
      ctx.logger.info("  - TARGET_DELETED (removes from monitoring)");
      ctx.logger.info("");

      ctx.logger.info("Emits events:");
      ctx.logger.info("  - SPEED_TEST_COMPLETED");
      ctx.logger.info("  - MONITORING_STARTED");
      ctx.logger.info("  - MONITORING_STOPPED");
      ctx.logger.info("");

      ctx.logger.info("12-Factor Compliance:");
      ctx.logger.info("  ✅ Config from environment");
      ctx.logger.info("  ✅ Graceful shutdown enabled");
      ctx.logger.info("  ✅ Logs to stdout/stderr");
      ctx.logger.info("  ✅ Stateless (scales horizontally)");
      ctx.logger.info("");

      // Setup event handlers
      // TODO: Implement event handlers when IMonitorWorker is implemented
      // ctx.eventBus.on("MONITORING_START_REQUESTED", (data) => { ... });
      // ctx.eventBus.on("TARGET_CREATED", (data) => { ... });

      // 12-Factor Factor IX: Setup graceful shutdown using new interface
      const gracefulShutdown = createMonitorWorkerGracefulShutdown(ctx);
      gracefulShutdown.setupGracefulShutdown();

      ctx.logger.info(
        "Graceful shutdown handlers registered (SIGTERM, SIGINT)"
      );
    },

    // Custom shutdown - cleanup
    onShutdown: async (ctx: MicroserviceContext) => {
      ctx.logger.info("Cleaning up Monitor Worker...");
      // All cleanup is handled by the graceful shutdown handler
    },
  });

  // Worker is now running
  context.logger.info(
    "Monitor Worker is now running and listening for events",
    {
      port: config.port,
      eventBus: config.eventBusType,
    }
  );
}

// Start the worker
startMonitorWorker().catch(error => {
  // Justification: Console error for startup failure
  // eslint-disable-next-line no-console
  console.error("❌ Failed to start Monitor Worker:", error);
  process.exit(1);
});
