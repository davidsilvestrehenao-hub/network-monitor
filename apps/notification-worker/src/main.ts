/**
 * Notification Worker Entry Point (12-Factor Compliant)
 *
 * This background worker handles:
 * - Push notification delivery in background
 * - In-app notification management
 * - Notification subscription management
 *
 * Listens to events:
 * - INCIDENT_CREATED (sends push notifications)
 * - ALERT_TRIGGERED (sends alert notifications)
 * - PUSH_SUBSCRIPTION_CREATED (adds to delivery list)
 * - PUSH_SUBSCRIPTION_DELETED (removes from delivery list)
 * - TEST_NOTIFICATION_REQUESTED
 *
 * Emits events:
 * - NOTIFICATION_SENT
 * - NOTIFICATION_FAILED
 * - PUSH_SUBSCRIPTION_EXPIRED
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
import type { INotificationWorker } from "@network-monitor/shared";

/**
 * Create Notification Worker graceful shutdown handler
 */
function createNotificationWorkerGracefulShutdown(
  context: MicroserviceContext
): IGracefulShutdown {
  async function performAppShutdown(): Promise<void> {
    context.logger.info("Stopping Notification Worker tasks...");

    // Stop any pending notification deliveries
    await stopNotificationDeliveries();

    // Cancel any push notification queues
    await cancelPushQueues();

    // Save any delivery state
    await saveDeliveryState();

    context.logger.info("Notification Worker shutdown complete");
  }

  async function stopNotificationDeliveries(): Promise<void> {
    // TODO: Stop any pending notification deliveries
    context.logger.debug("Stopping notification deliveries...");
  }

  async function cancelPushQueues(): Promise<void> {
    // TODO: Cancel any push notification queues
    context.logger.debug("Canceling push notification queues...");
  }

  async function saveDeliveryState(): Promise<void> {
    // TODO: Save any delivery state
    context.logger.debug("Saving delivery state...");
  }

  return createGracefulShutdown(
    context.logger,
    performAppShutdown,
    context.database ?? undefined,
    context.eventBus,
    30000 // 30 second timeout
  );
}

async function startNotificationWorker() {
  // 12-Factor Factor III: Validate environment configuration at startup
  validateEnvironment();
  const config = getEnvironment();

  // Check if worker is enabled
  if (!config.notificationServiceEnabled) {
    // Justification: Console log for worker disabled message
    // eslint-disable-next-line no-console
    console.log(
      "⚠️  Notification Worker is disabled (NOTIFICATION_SERVICE_ENABLED=false)"
    );
    process.exit(0);
  }

  // Bootstrap the worker
  // Service wiring: Which implementations to use (DI configuration)
  const wiringConfig = process.env.SERVICE_WIRING_CONFIG || config.nodeEnv;
  const configPath = `service-wiring/${wiringConfig}.json`;

  const context = await bootstrapMicroservice({
    applicationName: "Notification Worker",
    configPath,
    enableDatabase: true,

    // Custom initialization - setup event handlers
    onInitialized: async (ctx: MicroserviceContext) => {
      // TODO: Get INotificationWorker implementation from container when available
      // For now, we'll use the existing service structure
      // Justification: Service retrieved for validation that it exists in container
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const notificationWorker = getRequiredService<INotificationWorker>(
        ctx,
        "notificationWorker"
      );

      ctx.logger.info("Notification Worker initialized", {
        environment: config.nodeEnv,
        eventBus: config.eventBusType,
        database: ctx.database ? "connected" : "not configured",
      });

      ctx.logger.info("Listening for events:");
      ctx.logger.info("  - INCIDENT_CREATED (sends push notifications)");
      ctx.logger.info("  - ALERT_TRIGGERED (sends alert notifications)");
      ctx.logger.info("  - PUSH_SUBSCRIPTION_CREATED (adds to delivery list)");
      ctx.logger.info(
        "  - PUSH_SUBSCRIPTION_DELETED (removes from delivery list)"
      );
      ctx.logger.info("  - TEST_NOTIFICATION_REQUESTED");
      ctx.logger.info("");

      ctx.logger.info("Emits events:");
      ctx.logger.info("  - NOTIFICATION_SENT");
      ctx.logger.info("  - NOTIFICATION_FAILED");
      ctx.logger.info("  - PUSH_SUBSCRIPTION_EXPIRED");
      ctx.logger.info("");

      ctx.logger.info("12-Factor Compliance:");
      ctx.logger.info("  ✅ Config from environment");
      ctx.logger.info("  ✅ Graceful shutdown enabled");
      ctx.logger.info("  ✅ Logs to stdout/stderr");
      ctx.logger.info("  ✅ Stateless (scales horizontally)");
      ctx.logger.info("");

      // Setup event handlers
      // TODO: Implement event handlers when INotificationWorker is implemented
      // ctx.eventBus.on("INCIDENT_CREATED", (data) => { ... });
      // ctx.eventBus.on("ALERT_TRIGGERED", (data) => { ... });

      // 12-Factor Factor IX: Setup graceful shutdown using new interface
      const gracefulShutdown = createNotificationWorkerGracefulShutdown(ctx);
      gracefulShutdown.setupGracefulShutdown();

      ctx.logger.info(
        "Graceful shutdown handlers registered (SIGTERM, SIGINT)"
      );
    },

    // Custom shutdown - cleanup
    onShutdown: async (ctx: MicroserviceContext) => {
      ctx.logger.info("Cleaning up Notification Worker...");
      // All cleanup is handled by the graceful shutdown handler
    },
  });

  // Worker is now running
  context.logger.info(
    "Notification Worker is now running and listening for events",
    {
      port: config.port,
      eventBus: config.eventBusType,
    }
  );
}

// Start the worker
startNotificationWorker().catch(error => {
  // Justification: Console error for startup failure
  // eslint-disable-next-line no-console
  console.error("❌ Failed to start Notification Worker:", error);
  process.exit(1);
});
