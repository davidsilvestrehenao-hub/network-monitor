/**
 * Microservice Bootstrap Utility
 *
 * Provides a generic, reusable way to bootstrap microservices with JSON-configurable DI containers.
 * This keeps microservice initialization DRY and consistent across all services.
 */

import {
  initializeJsonContainer,
  getJsonAppContext,
} from "../container/json-container.js";
import { getContainer } from "../container/flexible-container.js";
import { TYPES } from "../container/types.js";
import type {
  IDatabaseService,
  ILogger,
  IEventBus,
} from "@network-monitor/shared";

/**
 * Configuration options for microservice bootstrap
 */
export interface MicroserviceBootstrapOptions {
  /**
   * Name of the microservice (e.g., "Monitor Service")
   */
  serviceName: string;

  /**
   * Path to the JSON configuration file (defaults to service-config.json)
   */
  configPath?: string;

  /**
   * Enable database connection (default: true)
   */
  enableDatabase?: boolean;

  /**
   * Custom initialization callback after container is initialized
   */
  onInitialized?: (context: MicroserviceContext) => Promise<void> | void;

  /**
   * Custom shutdown callback for cleanup
   */
  onShutdown?: (context: MicroserviceContext) => Promise<void> | void;

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
 * Context provided to microservice initialization
 */
export interface MicroserviceContext {
  logger: ILogger;
  eventBus: IEventBus;
  database: IDatabaseService | null;
  services: Record<string, unknown>;
  repositories: Record<string, unknown>;
}

/**
 * Bootstrap a microservice with JSON-configurable DI container
 *
 * @example
 * ```typescript
 * import { bootstrapMicroservice } from "@network-monitor/infrastructure";
 *
 * await bootstrapMicroservice({
 *   serviceName: "Monitor Service",
 *   configPath: "service-config.json",
 *   onInitialized: async (ctx) => {
 *     // Setup event handlers
 *     ctx.eventBus.on("TARGET_CREATE_REQUESTED", handleTargetCreate);
 *   },
 * });
 * ```
 */
export async function bootstrapMicroservice(
  options: MicroserviceBootstrapOptions
): Promise<MicroserviceContext> {
  const {
    serviceName,
    configPath,
    enableDatabase = true,
    onInitialized,
    onShutdown,
    showBanner = true,
  } = options;

  try {
    // Show startup banner
    if (showBanner) {
      printBanner(serviceName);
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

    // Create microservice context
    const context: MicroserviceContext = {
      logger,
      eventBus,
      database,
      services: appContext.services,
      repositories: appContext.repositories,
    };

    // Log startup info
    logger.info(`${serviceName}: Initializing...`, {
      configPath: configPath || "service-config.json",
      database: enableDatabase ? "enabled" : "disabled",
    });

    // Call custom initialization callback
    if (onInitialized) {
      await onInitialized(context);
    }

    // Setup graceful shutdown
    setupGracefulShutdown(serviceName, context, onShutdown);

    // Log successful startup
    logger.info(`✅ ${serviceName}: Ready!`);
    logger.info("");

    return context;
  } catch (error) {
    // Justification: Console error for critical startup failure
    // eslint-disable-next-line no-console
    console.error(`❌ Failed to start ${serviceName}:`, error);
    process.exit(1);
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupGracefulShutdown(
  serviceName: string,
  context: MicroserviceContext,
  onShutdown?: (context: MicroserviceContext) => Promise<void> | void
): void {
  const shutdown = async (signal: string) => {
    context.logger.info(
      `${serviceName}: Received ${signal}, shutting down gracefully...`
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

      context.logger.info(`${serviceName}: Shutdown complete`);
      process.exit(0);
    } catch (error) {
      context.logger.error(`${serviceName}: Error during shutdown`, { error });
      process.exit(1);
    }
  };

  // Handle shutdown signals
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  // Handle uncaught errors
  process.on("uncaughtException", (error: Error) => {
    context.logger.error(`${serviceName}: Uncaught exception`, { error });
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason: unknown) => {
    context.logger.error(`${serviceName}: Unhandled rejection`, { reason });
    shutdown("unhandledRejection");
  });
}

/**
 * Print startup banner
 */
function printBanner(serviceName: string): void {
  // Justification: Console statements for microservice startup banner
  // eslint-disable-next-line no-console
  console.log("🚀 Starting", serviceName, "...");
  // eslint-disable-next-line no-console
  console.log("📦 Independent service");
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
  context: MicroserviceContext,
  port: number
): void {
  // Note: This requires adding http server capability
  // For now, we'll just log the health status
  context.logger.info(`Health check: Service is healthy on port ${port}`);

  // TODO: Add HTTP server for health checks
  // This would require adding express or a similar library
  // For now, the service being alive is the health check
}

/**
 * Helper to get a required service from context
 *
 * @throws Error if service is not available
 */
export function getRequiredService<T>(
  context: MicroserviceContext,
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
  context: MicroserviceContext,
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
