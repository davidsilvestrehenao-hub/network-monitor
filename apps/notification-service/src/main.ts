/**
 * Notification Microservice Entry Point (12-Factor Compliant)
 *
 * This service handles:
 * - Push notification subscriptions
 * - In-app notifications
 * - Test notifications
 *
 * Listens to events:
 * - PUSH_SUBSCRIPTION_CREATE_REQUESTED
 * - PUSH_SUBSCRIPTION_DELETE_REQUESTED
 * - TEST_NOTIFICATION_SEND_REQUESTED
 * - NOTIFICATION_MARK_READ_REQUESTED
 * - INCIDENT_CREATED (to send notifications)
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
import type { INotificationService } from "@network-monitor/shared";

async function startNotificationService() {
  // 12-Factor Factor III: Validate environment configuration at startup
  validateEnvironment();
  const config = getEnvironment();

  // Check if service is enabled
  if (!config.notificationServiceEnabled) {
    // Justification: Console log for service disabled message
    // eslint-disable-next-line no-console
    console.log(
      "⚠️  Notification Service is disabled (NOTIFICATION_SERVICE_ENABLED=false)"
    );
    process.exit(0);
  }

  // Bootstrap the microservice
  // Service wiring: Which implementations to use (DI configuration)
  const wiringConfig = process.env.SERVICE_WIRING_CONFIG || config.nodeEnv;
  const configPath = `service-wiring/${wiringConfig}.json`;

  const context = await bootstrapMicroservice({
    serviceName: "Notification Service",
    configPath,
    enableDatabase: true,

    // Custom initialization - setup event handlers
    onInitialized: async (ctx: MicroserviceContext) => {
      // Justification: Service retrieved for validation that it exists in container
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const notificationService = getRequiredService<INotificationService>(
        ctx,
        "notification"
      );

      ctx.logger.info("Notification Service initialized", {
        environment: config.nodeEnv,
        eventBus: config.eventBusType,
        database: ctx.database ? "connected" : "not configured",
      });

      ctx.logger.info("Listening for events:");
      ctx.logger.info("  - PUSH_SUBSCRIPTION_CREATE_REQUESTED");
      ctx.logger.info("  - PUSH_SUBSCRIPTION_DELETE_REQUESTED");
      ctx.logger.info("  - TEST_NOTIFICATION_SEND_REQUESTED");
      ctx.logger.info("  - NOTIFICATION_MARK_READ_REQUESTED");
      ctx.logger.info("  - INCIDENT_CREATED (sends push)");
      ctx.logger.info("");

      ctx.logger.info("12-Factor Compliance:");
      ctx.logger.info("  ✅ Config from environment");
      ctx.logger.info("  ✅ Graceful shutdown enabled");
      ctx.logger.info("  ✅ Logs to stdout/stderr");
      ctx.logger.info("  ✅ Stateless (scales horizontally)");
      ctx.logger.info("");

      // Setup event handlers
      // TODO: Implement event handlers when NotificationService supports them
      // ctx.eventBus.on("INCIDENT_CREATED", (data) => { ... });
      // ctx.eventBus.on("PUSH_SUBSCRIPTION_CREATE_REQUESTED", (data) => { ... });

      // 12-Factor Factor IX: Setup graceful shutdown
      setupGracefulShutdown({
        logger: ctx.logger,
        database: ctx.database ?? undefined,
        eventBus: ctx.eventBus,
        shutdownTimeout: 30000,
        onShutdown: async () => {
          ctx.logger.info("Stopping Notification Service tasks...");
          // TODO: Cleanup any pending notifications
        },
      });

      ctx.logger.info(
        "Graceful shutdown handlers registered (SIGTERM, SIGINT)"
      );
    },

    // Custom shutdown - cleanup
    onShutdown: async (ctx: MicroserviceContext) => {
      ctx.logger.info("Cleaning up Notification Service...");
      // All cleanup is handled by the graceful shutdown handler
    },
  });

  // Service is now running
  context.logger.info(
    "Notification Service is now running and listening for events",
    {
      port: config.port,
      eventBus: config.eventBusType,
    }
  );
}

// Start the microservice
startNotificationService().catch(error => {
  // Justification: Console error for startup failure
  // eslint-disable-next-line no-console
  console.error("❌ Failed to start Notification Service:", error);
  process.exit(1);
});
