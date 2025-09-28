import { getContainer } from "./flexible-container";
import { JsonConfigLoader } from "./json-config-loader";
import { TYPES, ServiceConfig } from "./types";
import { IDatabaseService } from "../services/interfaces/IDatabaseService";
import { ILogger } from "../services/interfaces/ILogger";
import { IEventBus } from "../services/interfaces/IEventBus";
import { IUserRepository } from "../services/interfaces/IUserRepository";
import { IMonitoringTargetRepository } from "../services/interfaces/IMonitoringTargetRepository";
import { ISpeedTestResultRepository } from "../services/interfaces/ISpeedTestResultRepository";
import { IAlertRuleRepository } from "../services/interfaces/IAlertRuleRepository";
import { IIncidentEventRepository } from "../services/interfaces/IIncidentEventRepository";
import { IPushSubscriptionRepository } from "../services/interfaces/IPushSubscriptionRepository";
import { INotificationRepository } from "../services/interfaces/INotificationRepository";
import { ITargetRepository } from "../services/interfaces/ITargetRepository";
import { ISpeedTestRepository } from "../services/interfaces/ISpeedTestRepository";
import { IMonitorService } from "../services/interfaces/IMonitorService";
import { IAlertingService } from "../services/interfaces/IAlertingService";
import { INotificationService } from "../services/interfaces/INotificationService";
import { IAuthService } from "../services/interfaces/IAuthService";

let containerInitialized = false;

/**
 * Initialize container with JSON configuration
 */
export async function initializeJsonContainer(
  configPath?: string
): Promise<void> {
  if (containerInitialized) {
    return;
  }

  try {
    const container = getContainer();
    const configLoader = new JsonConfigLoader(configPath);

    // Load JSON configuration
    const jsonConfig = configLoader.loadConfiguration();
    console.log(
      `📋 Loading configuration: ${jsonConfig.name} (${jsonConfig.environment})`
    );

    // Convert to service configuration
    const serviceConfig = await configLoader.convertToServiceConfig(jsonConfig);

    // Register all services
    for (const serviceType of Object.getOwnPropertySymbols(serviceConfig)) {
      const config = serviceConfig[serviceType] as ServiceConfig;
      container.register(serviceType, config);
    }

    // Initialize container
    await container.initialize();

    // Initialize database connection if available
    if (container.has(TYPES.IDatabaseService)) {
      const databaseService = container.get<IDatabaseService>(
        TYPES.IDatabaseService
      );
      await databaseService.connect();
    }

    containerInitialized = true;
    console.log("✅ Container initialized with JSON configuration");
  } catch (error) {
    console.error(
      "❌ Failed to initialize container with JSON configuration:",
      error
    );
    throw error instanceof Error ? error : new Error(String(error));
  }
}

/**
 * Get application context with JSON-configured services
 */
export async function getJsonAppContext() {
  // Ensure container is initialized
  await initializeJsonContainer();

  const container = getContainer();

  return {
    services: {
      logger: container.has(TYPES.ILogger)
        ? container.get<ILogger>(TYPES.ILogger)
        : null,
      eventBus: container.has(TYPES.IEventBus)
        ? container.get<IEventBus>(TYPES.IEventBus)
        : null,
      database: container.has(TYPES.IDatabaseService)
        ? container.get<IDatabaseService>(TYPES.IDatabaseService)
        : null,
      monitor: container.has(TYPES.IMonitorService)
        ? container.get<IMonitorService>(TYPES.IMonitorService)
        : null,
      alerting: container.has(TYPES.IAlertingService)
        ? container.get<IAlertingService>(TYPES.IAlertingService)
        : null,
      notification: container.has(TYPES.INotificationService)
        ? container.get<INotificationService>(TYPES.INotificationService)
        : null,
      auth: container.has(TYPES.IAuthService)
        ? container.get<IAuthService>(TYPES.IAuthService)
        : null,
    },
    repositories: {
      user: container.has(TYPES.IUserRepository)
        ? container.get<IUserRepository>(TYPES.IUserRepository)
        : null,
      monitoringTarget: container.has(TYPES.IMonitoringTargetRepository)
        ? container.get<IMonitoringTargetRepository>(
            TYPES.IMonitoringTargetRepository
          )
        : null,
      speedTestResult: container.has(TYPES.ISpeedTestResultRepository)
        ? container.get<ISpeedTestResultRepository>(
            TYPES.ISpeedTestResultRepository
          )
        : null,
      alertRule: container.has(TYPES.IAlertRuleRepository)
        ? container.get<IAlertRuleRepository>(TYPES.IAlertRuleRepository)
        : null,
      incidentEvent: container.has(TYPES.IIncidentEventRepository)
        ? container.get<IIncidentEventRepository>(
            TYPES.IIncidentEventRepository
          )
        : null,
      pushSubscription: container.has(TYPES.IPushSubscriptionRepository)
        ? container.get<IPushSubscriptionRepository>(
            TYPES.IPushSubscriptionRepository
          )
        : null,
      notification: container.has(TYPES.INotificationRepository)
        ? container.get<INotificationRepository>(TYPES.INotificationRepository)
        : null,
      // Legacy repositories
      target: container.has(TYPES.ITargetRepository)
        ? container.get<ITargetRepository>(TYPES.ITargetRepository)
        : null,
      speedTest: container.has(TYPES.ISpeedTestRepository)
        ? container.get<ISpeedTestRepository>(TYPES.ISpeedTestRepository)
        : null,
    },
  };
}

/**
 * Reset container initialization (for testing)
 */
export function resetContainerInitialization(): void {
  containerInitialized = false;
}

/**
 * Check if container is initialized
 */
export function isContainerInitialized(): boolean {
  return containerInitialized;
}

/**
 * Get current configuration info
 */
export async function getCurrentConfigurationInfo() {
  try {
    const configLoader = new JsonConfigLoader();
    const config = configLoader.loadConfiguration();

    return {
      name: config.name,
      description: config.description,
      environment: config.environment,
      services: Object.keys(config.services),
      initialized: containerInitialized,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      initialized: containerInitialized,
    };
  }
}
