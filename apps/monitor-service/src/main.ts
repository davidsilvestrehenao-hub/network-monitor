/**
 * Monitor Microservice Entry Point
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
 */

// Justification: Service entry point - console statements are for startup information
// eslint-disable-next-line no-console
import { EventBus } from "@network-monitor/infrastructure";
import { LoggerService, LogLevel } from "@network-monitor/infrastructure";
// Justification: MonitorService will be used when implementing event handlers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { MonitorService } from "@network-monitor/monitor";

async function startMonitorService() {
  // Justification: Console statements for microservice startup info
  // eslint-disable-next-line no-console
  console.log("🚀 Starting Monitor Microservice...");
  // eslint-disable-next-line no-console
  console.log("📦 Independent service");
  // eslint-disable-next-line no-console
  console.log("🔌 Event Bus: RabbitMQ (distributed)");
  // eslint-disable-next-line no-console
  console.log("");

  const logger = new LoggerService(LogLevel.INFO);

  // In production, use RabbitMQ for distributed event bus
  // const eventBus = new RabbitMQEventBus(process.env.RABBITMQ_URL!);
  // Justification: eventBus will be used when implementing event handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const eventBus = new EventBus(); // For now, in-memory

  logger.info("Monitor Service: Initializing...");

  // Services get dependencies from DI container in production
  // This is simplified for demonstration

  logger.info("✅ Monitor Service Ready!");
  logger.info("");
  logger.info("Listening for events:");
  logger.info("  - TARGET_CREATE_REQUESTED");
  logger.info("  - TARGET_UPDATE_REQUESTED");
  logger.info("  - TARGET_DELETE_REQUESTED");
  logger.info("  - SPEED_TEST_REQUESTED");
  logger.info("  - MONITORING_START_REQUESTED");
  logger.info("  - MONITORING_STOP_REQUESTED");
  logger.info("");
  logger.info("This service can:");
  logger.info("  - Scale independently (e.g., 5 replicas)");
  logger.info("  - Be deployed separately");
  logger.info("  - Use different resources");
  logger.info("  - Be written in different language (Go, Rust, etc.)");
  logger.info("");

  process.on("SIGINT", () => {
    logger.info("Shutting down Monitor Service...");
    process.exit(0);
  });
}

startMonitorService().catch(error => {
  // Justification: Console error for critical startup failure
  // eslint-disable-next-line no-console
  console.error("Failed to start Monitor Service:", error);
  process.exit(1);
});
