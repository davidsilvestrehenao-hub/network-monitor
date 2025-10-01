import { getContainer } from "./flexible-container.js";
import { JsonConfigLoader } from "./json-config-loader.js";
import type { ServiceConfig } from "./types.js";
import { TYPES } from "./types.js";
import type {
  IDatabaseService,
  ILogger,
  IEventBus,
  IUserRepository,
  IMonitoringTargetRepository,
  ISpeedTestResultRepository,
  IAlertRuleRepository,
  IIncidentEventRepository,
  IPushSubscriptionRepository,
  INotificationRepository,
  ITargetRepository,
  ISpeedTestRepository,
  IMonitorService,
  IAlertingService,
  INotificationService,
  IAuthService,
  IUserSpeedTestPreferenceRepository,
  ISpeedTestConfigService,
} from "@network-monitor/shared";

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
    const jsonConfig = await configLoader.loadConfiguration();
    // Justification: Console usage for debugging configuration loading during container initialization
    // eslint-disable-next-line no-console
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

    // Use logger service now that container is initialized
    if (container.has(TYPES.ILogger)) {
      const logger = container.get<ILogger>(TYPES.ILogger);
      logger.info("Container initialized with JSON configuration");
    } else {
      // Fallback to console if logger not available
      // Justification: Console usage for success logging during container initialization when logger unavailable
      // eslint-disable-next-line no-console
      console.log("✅ Container initialized with JSON configuration");
    }
  } catch (error) {
    // Try to use logger if container was partially initialized, otherwise fallback to console
    try {
      const container = getContainer();
      if (container.has(TYPES.ILogger)) {
        const logger = container.get<ILogger>(TYPES.ILogger);
        logger.error("Failed to initialize container with JSON configuration", {
          error,
        });
      } else {
        throw new Error("Logger not available");
      }
    } catch {
      // Fallback to console if logger not available or container failed to initialize
      // Justification: Console usage for critical error logging during container initialization failure
      // eslint-disable-next-line no-console
      console.error(
        "❌ Failed to initialize container with JSON configuration:",
        error
      );
    }
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
    userId: null,
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
      speedTestConfigService: container.has(TYPES.ISpeedTestConfigService)
        ? (container.get(
            TYPES.ISpeedTestConfigService
          ) as ISpeedTestConfigService)
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
      userSpeedTestPreference: container.has(
        TYPES.IUserSpeedTestPreferenceRepository
      )
        ? (container.get(
            TYPES.IUserSpeedTestPreferenceRepository
          ) as IUserSpeedTestPreferenceRepository)
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
    const config = await configLoader.loadConfiguration();

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
