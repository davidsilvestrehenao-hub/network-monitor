/**
 * Monolith Entry Point (12-Factor Compliant)
 *
 * This file initializes ALL services in a single Bun process.
 * Perfect for:
 * - Development
 * - Small deployments (1-10k users)
 * - Cheap hosting ($20/month single container)
 *
 * When ready to scale, just deploy services separately using
 * the microservice entry points (apps/*-service/)
 *
 * 12-Factor Compliance:
 * ✅ Factor III: Config from environment variables
 * ✅ Factor IX: Graceful shutdown
 * ✅ Factor XI: Logs to stdout/stderr
 */

import {
  bootstrapMicroservice,
  type MicroserviceContext,
  validateEnvironment,
  getEnvironment,
  setupGracefulShutdown,
} from "@network-monitor/infrastructure";
import type {
  IMonitorService,
  IAlertingService,
  INotificationService,
} from "@network-monitor/shared";

async function startMonolith() {
  // 12-Factor Factor III: Validate environment configuration at startup
  validateEnvironment();
  const config = getEnvironment();

  // Justification: Console statements for 12-factor compliance banner
  // eslint-disable-next-line no-console
  console.log("🚀 Starting Network Monitor Monolith (12-Factor)...");
  // eslint-disable-next-line no-console
  console.log("📦 All services in one process");
  // eslint-disable-next-line no-console
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  // eslint-disable-next-line no-console
  console.log(`⚙️  Event Bus: ${config.eventBusType}`);
  // eslint-disable-next-line no-console
  console.log(`📊 Log Level: ${config.logLevel}`);
  // eslint-disable-next-line no-console
  console.log("");

  // Bootstrap with environment configuration
  // Service wiring: Which implementations to use (DI configuration)
  // Runtime config: All values come from environment variables
  const wiringConfig = process.env.SERVICE_WIRING_CONFIG || config.nodeEnv;
  const configPath = `service-wiring/${wiringConfig}.json`;

  // Justification: Console statements for service wiring info
  // eslint-disable-next-line no-console
  console.log(`📦 Service wiring: ${wiringConfig}.json`);
  // eslint-disable-next-line no-console
  console.log(`⚙️  Runtime config: from environment variables`);

  const context = await bootstrapMicroservice({
    serviceName: "Network Monitor Monolith",
    configPath,
    enableDatabase: true,
    showBanner: false, // Custom banner above

    // Custom initialization - setup all services
    onInitialized: async (ctx: MicroserviceContext) => {
      // Get all services
      const monitorService = ctx.services.monitor as IMonitorService | null;
      const alertingService = ctx.services.alerting as IAlertingService | null;
      const notificationService = ctx.services
        .notification as INotificationService | null;

      ctx.logger.info("Infrastructure initialized", {
        eventBus: config.eventBusType,
        database: ctx.database ? "connected" : "not configured",
        services: {
          monitor: config.monitorServiceEnabled,
          alerting: config.alertingServiceEnabled,
          notification: config.notificationServiceEnabled,
        },
      });

      ctx.logger.info("Services running:");
      if (monitorService) {
        ctx.logger.info("  ✅ Monitor Service (targets, speed tests)");
      }
      if (alertingService) {
        ctx.logger.info("  ✅ Alerting Service (alert rules, incidents)");
      }
      if (notificationService) {
        ctx.logger.info("  ✅ Notification Service (push, in-app)");
      }
      ctx.logger.info("");

      ctx.logger.info("12-Factor Compliance:");
      ctx.logger.info("  ✅ Factor III: Config from environment");
      ctx.logger.info("  ✅ Factor IX: Graceful shutdown enabled");
      ctx.logger.info("  ✅ Factor XI: Logs to stdout/stderr");
      ctx.logger.info("  ✅ Factor X: PostgreSQL supported");
      ctx.logger.info("");

      ctx.logger.info("To scale to microservices:");
      ctx.logger.info("  1. Set EVENT_BUS_TYPE=rabbitmq");
      ctx.logger.info("  2. Deploy services separately (apps/*-service/)");
      ctx.logger.info("  3. Zero code changes needed!");
      ctx.logger.info("");

      // 12-Factor Factor IX: Setup graceful shutdown
      setupGracefulShutdown({
        logger: ctx.logger,
        database: ctx.database ?? undefined,
        eventBus: ctx.eventBus,
        shutdownTimeout: 30000,
        onShutdown: async () => {
          ctx.logger.info("Running custom monolith cleanup...");
          // Custom cleanup if needed
        },
      });

      ctx.logger.info(
        "Graceful shutdown handlers registered (SIGTERM, SIGINT)"
      );
    },

    // Custom shutdown - cleanup all services
    onShutdown: async (ctx: MicroserviceContext) => {
      ctx.logger.info("Shutting down all services...");
      // All cleanup is handled by the graceful shutdown handler
    },
  });

  // Monolith is now running
  context.logger.info("Monolith is now running and serving all services", {
    port: config.port,
    host: config.host,
    environment: config.nodeEnv,
  });
}

// Start the monolith
startMonolith().catch(error => {
  // Justification: Console error for startup failure
  // eslint-disable-next-line no-console
  console.error("❌ Failed to start monolith:", error);
  process.exit(1);
});
