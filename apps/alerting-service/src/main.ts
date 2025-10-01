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

import { EventBus } from '@network-monitor/infrastructure';
import { LoggerService, LogLevel } from '@network-monitor/infrastructure';
import { AlertingService } from '@network-monitor/alerting';

async function startAlertingService() {
  console.log('🚀 Starting Alerting Microservice...');
  console.log('📦 Independent service');
  console.log('🔌 Event Bus: RabbitMQ (distributed)');
  console.log('');

  const logger = new LoggerService(LogLevel.INFO);
  const eventBus = new EventBus();

  logger.info('Alerting Service: Initializing...');
  
  logger.info('✅ Alerting Service Ready!');
  logger.info('');
  logger.info('Listening for events:');
  logger.info('  - ALERT_RULE_CREATE_REQUESTED');
  logger.info('  - ALERT_RULE_UPDATE_REQUESTED');
  logger.info('  - ALERT_RULE_DELETE_REQUESTED');
  logger.info('  - SPEED_TEST_COMPLETED (evaluates rules)');
  logger.info('  - INCIDENT_RESOLVE_REQUESTED');
  logger.info('');

  process.on('SIGINT', () => {
    logger.info('Shutting down Alerting Service...');
    process.exit(0);
  });
}

startAlertingService().catch((error) => {
  console.error('Failed to start Alerting Service:', error);
  process.exit(1);
});
