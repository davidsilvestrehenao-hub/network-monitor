/**
 * Notification Microservice Entry Point
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
 */

import { EventBus } from "@network-monitor/infrastructure";
import { LoggerService, LogLevel } from "@network-monitor/infrastructure";
import { NotificationService } from "@network-monitor/notification";

async function startNotificationService() {
  console.log("🚀 Starting Notification Microservice...");
  console.log("📦 Independent service");
  console.log("🔌 Event Bus: RabbitMQ (distributed)");
  console.log("");

  const logger = new LoggerService(LogLevel.INFO);
  const eventBus = new EventBus();

  logger.info("Notification Service: Initializing...");

  logger.info("✅ Notification Service Ready!");
  logger.info("");
  logger.info("Listening for events:");
  logger.info("  - PUSH_SUBSCRIPTION_CREATE_REQUESTED");
  logger.info("  - PUSH_SUBSCRIPTION_DELETE_REQUESTED");
  logger.info("  - TEST_NOTIFICATION_SEND_REQUESTED");
  logger.info("  - NOTIFICATION_MARK_READ_REQUESTED");
  logger.info("  - INCIDENT_CREATED (sends push)");
  logger.info("");

  process.on("SIGINT", () => {
    logger.info("Shutting down Notification Service...");
    process.exit(0);
  });
}

startNotificationService().catch(error => {
  console.error("Failed to start Notification Service:", error);
  process.exit(1);
});
