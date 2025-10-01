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

import { EventBus } from "@network-monitor/infrastructure";
import { LoggerService, LogLevel } from "@network-monitor/infrastructure";
import { MonitorService } from "@network-monitor/monitor";

async function startMonitorService() {
  console.log("🚀 Starting Monitor Microservice...");
  console.log("📦 Independent service");
  console.log("🔌 Event Bus: RabbitMQ (distributed)");
  console.log("");

  const logger = new LoggerService(LogLevel.INFO);

  // In production, use RabbitMQ for distributed event bus
  // const eventBus = new RabbitMQEventBus(process.env.RABBITMQ_URL!);
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
  console.error("Failed to start Monitor Service:", error);
  process.exit(1);
});
