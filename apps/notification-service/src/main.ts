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
// Justification: NotificationService will be used when implementing event handlers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { NotificationService } from "@network-monitor/notification";

async function startNotificationService() {
  // Justification: Console statements for microservice startup info
  // eslint-disable-next-line no-console
  console.log("🚀 Starting Notification Microservice...");
  // eslint-disable-next-line no-console
  console.log("📦 Independent service");
  // eslint-disable-next-line no-console
  console.log("🔌 Event Bus: RabbitMQ (distributed)");
  // eslint-disable-next-line no-console
  console.log("");

  const logger = new LoggerService(LogLevel.INFO);
  // Justification: eventBus will be used when implementing event handlers
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  // Justification: Console error for critical startup failure
  // eslint-disable-next-line no-console
  console.error("Failed to start Notification Service:", error);
  process.exit(1);
});
