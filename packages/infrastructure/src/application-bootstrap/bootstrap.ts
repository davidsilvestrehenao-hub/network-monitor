/**
 * Application Bootstrap Utility
 *
 * Provides a generic, reusable way to bootstrap applications (workers, APIs, web apps) with JSON-configurable DI containers.
 * This keeps application initialization DRY and consistent across all apps.
 */

import { getContainer } from "../container/flexible-container.js";
import { JsonConfigLoader } from "../container/json-config-loader.js";
import {
  TYPES,
  type ServiceConfig,
  type AppContext,
} from "../container/types.js";
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
  ISpeedTestUrlRepository,
  IMonitorService,
  IAlertingService,
  INotificationService,
  IAuthService,
  IUserSpeedTestPreferenceRepository,
} from "@network-monitor/shared";

/**
 * Configuration options for application bootstrap
 */
export interface ApplicationBootstrapOptions {
  /**
   * Name of the application (e.g., "Monitor Worker", "API Server", "Web App")
   */
  applicationName: string;

  /**
   * Path to the JSON configuration file (defaults to service-wiring/development.json)
   */
  configPath?: string;

  /**
   * Enable database connection (default: true)
   */
  enableDatabase?: boolean;

  /**
   * Custom initialization callback after container is initialized
   */
  onInitialized?: (context: ApplicationContext) => Promise<void> | void;

  /**
   * Custom shutdown callback for cleanup
   */
  onShutdown?: (context: ApplicationContext) => Promise<void> | void;

  /**
   * Port number for health checks (optional)
   */
  port?: number;

  /**
   * Enable console banner (default: true)
   */
  showBanner?: boolean;
}

/**
 * Context provided to application initialization
 */
export interface ApplicationContext {
  logger: ILogger;
  eventBus: IEventBus;
  database: IDatabaseService | null;
  services: Record<string, unknown>;
  repositories: Record<string, unknown>;
}

let containerInitialized = false;

/**
 * Initialize container with JSON configuration
 */
async function initializeJsonContainer(configPath?: string): Promise<void> {
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
async function getJsonAppContext(): Promise<AppContext> {
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
      speedTestConfigService: container.has(TYPES.ISpeedTestUrlRepository)
        ? container.get<ISpeedTestUrlRepository>(TYPES.ISpeedTestUrlRepository)
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
 * Bootstrap an application (worker, API, web app) with JSON-configurable DI container
 *
 * @example
 * ```typescript
 * import { bootstrapApplication } from "@network-monitor/infrastructure";
 *
 * await bootstrapApplication({
 *   applicationName: "Monitor Worker",
 *   configPath: "service-wiring/development.json",
 *   onInitialized: async (ctx) => {
 *     // Setup event handlers
 *     ctx.eventBus.on("TARGET_CREATE_REQUESTED", handleTargetCreate);
 *   },
 * });
 * ```
 */
export async function bootstrapApplication(
  options: ApplicationBootstrapOptions
): Promise<ApplicationContext> {
  const {
    applicationName,
    configPath,
    enableDatabase = true,
    onInitialized,
    onShutdown,
    showBanner = true,
  } = options;

  try {
    // Show startup banner
    if (showBanner) {
      printBanner(applicationName);
    }

    // Initialize DI container with JSON configuration
    await initializeJsonContainer(configPath);

    // Get application context
    const appContext = await getJsonAppContext();
    const container = getContainer();

    // Get core services
    const logger = container.get<ILogger>(TYPES.ILogger);
    const eventBus = container.get<IEventBus>(TYPES.IEventBus);
    const database = enableDatabase
      ? (appContext.services.database ?? null)
      : null;

    // Create application context
    const context: ApplicationContext = {
      logger,
      eventBus,
      database,
      services: appContext.services,
      repositories: appContext.repositories,
    };

    // Log startup info
    logger.info(`${applicationName}: Initializing...`, {
      configPath: configPath || "service-wiring/development.json",
      database: enableDatabase ? "enabled" : "disabled",
    });

    // Call custom initialization callback
    if (onInitialized) {
      await onInitialized(context);
    }

    // Setup graceful shutdown
    setupGracefulShutdown(applicationName, context, onShutdown);

    // Log successful startup
    logger.info(`✅ ${applicationName}: Ready!`);
    logger.info("");

    return context;
  } catch (error) {
    // Justification: Console error for critical startup failure
    // eslint-disable-next-line no-console
    console.error(`❌ Failed to start ${applicationName}:`, error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(
  applicationName: string,
  context: ApplicationContext,
  onShutdown?: (context: ApplicationContext) => Promise<void> | void
): void {
  const shutdown = async (signal: string) => {
    context.logger.info(
      `${applicationName}: Received ${signal}, shutting down gracefully...`
    );

    try {
      // Call custom shutdown callback
      if (onShutdown) {
        await onShutdown(context);
      }

      // Disconnect database if enabled
      if (context.database) {
        await context.database.disconnect();
      }

      context.logger.info(`${applicationName}: Shutdown complete`);
      process.exit(0);
    } catch (error) {
      context.logger.error(`${applicationName}: Error during shutdown`, {
        error,
      });
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Handle uncaught errors
  process.on("uncaughtException", (error: Error) => {
    context.logger.error(`${applicationName}: Uncaught exception`, { error });
    shutdown("uncaughtException");
  });

  // Justification: Process error handlers must accept unknown error types from any source
  process.on("unhandledRejection", (reason: unknown) => {
    context.logger.error(`${applicationName}: Unhandled rejection`, { reason });
    shutdown("unhandledRejection");
  });
}

/**
 * Print startup banner
 */
function printBanner(applicationName: string): void {
  // Justification: Console statements for application startup banner
  // eslint-disable-next-line no-console
  console.log("🚀 Starting", applicationName, "...");
  // eslint-disable-next-line no-console
  console.log("📦 Independent application");
  // eslint-disable-next-line no-console
  console.log("🔌 Event Bus: Distributed (JSON configured)");
  // eslint-disable-next-line no-console
  console.log("");
}

/**
 * Create a simple health check endpoint
 *
 * @example
 * ```typescript
 * import { createHealthCheckEndpoint } from "@network-monitor/infrastructure";
 *
 * createHealthCheckEndpoint(context, 3001);
 * ```
 */
export function createHealthCheckEndpoint(
  context: ApplicationContext,
  port: number
): void {
  // Note: This requires adding http server capability
  // For now, we'll just log the health status
  context.logger.info(`Health check: Application is healthy on port ${port}`);

  // TODO: Add HTTP server for health checks
  // This would require adding express or a similar library
  // For now, the application being alive is the health check
}

/**
 * Helper to get a required service from context
 *
 * @throws Error if service is not available
 */
export function getRequiredService<T>(
  context: ApplicationContext,
  serviceName: string
): T {
  const service = context.services[serviceName] as T | undefined;
  if (!service) {
    throw new Error(
      `Required service '${serviceName}' is not available. Check your service configuration.`
    );
  }
  return service;
}

/**
 * Helper to get a required repository from context
 *
 * @throws Error if repository is not available
 */
export function getRequiredRepository<T>(
  context: ApplicationContext,
  repositoryName: string
): T {
  const repository = context.repositories[repositoryName] as T | undefined;
  if (!repository) {
    throw new Error(
      `Required repository '${repositoryName}' is not available. Check your service configuration.`
    );
  }
  return repository;
}
