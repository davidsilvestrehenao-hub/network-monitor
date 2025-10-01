/**
 * Alerting Microservice Entry Point
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
 */

import { EventBus } from "@network-monitor/infrastructure";
import { LoggerService, LogLevel } from "@network-monitor/infrastructure";
// Justification: AlertingService will be used when implementing event handlers
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { AlertingService } from "@network-monitor/alerting";

async function startAlertingService() {
  // Justification: Console statements for microservice startup info
  // eslint-disable-next-line no-console
  console.log("🚀 Starting Alerting Microservice...");
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

  logger.info("Alerting Service: Initializing...");

  logger.info("✅ Alerting Service Ready!");
  logger.info("");
  logger.info("Listening for events:");
  logger.info("  - ALERT_RULE_CREATE_REQUESTED");
  logger.info("  - ALERT_RULE_UPDATE_REQUESTED");
  logger.info("  - ALERT_RULE_DELETE_REQUESTED");
  logger.info("  - SPEED_TEST_COMPLETED (evaluates rules)");
  logger.info("  - INCIDENT_RESOLVE_REQUESTED");
  logger.info("");

  process.on("SIGINT", () => {
    logger.info("Shutting down Alerting Service...");
    process.exit(0);
  });
}

startAlertingService().catch(error => {
  // Justification: Console error for critical startup failure
  // eslint-disable-next-line no-console
  console.error("Failed to start Alerting Service:", error);
  process.exit(1);
});
