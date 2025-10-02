/**
 * Web Application Graceful Shutdown
 *
 * Provides graceful shutdown functionality for the SolidStart web application.
 * This handles cleanup of web-specific resources and integrates with the
 * bootstrap context if available.
 */

import {
  createGracefulShutdown,
  type IGracefulShutdown,
  type AppContext,
} from "@network-monitor/infrastructure";
import type { ILogger, LogContext } from "@network-monitor/shared";

/**
 * Create Web Application graceful shutdown handler
 */
async function createWebAppGracefulShutdown(): Promise<IGracefulShutdown> {
  // Get context from bootstrap if available
  const context = await getWebAppContext();
  const logger: ILogger = context?.services?.logger || getWebAppLogger();

  async function performAppShutdown(): Promise<void> {
    logger.info("Shutting down web application...");

    // Clean up web-specific resources
    await cleanupWebResources();

    // Clean up any client-side resources
    await cleanupClientResources();

    logger.info("Web application shutdown complete");
  }

  async function cleanupWebResources(): Promise<void> {
    logger.debug("Cleaning up web-specific resources...");

    // Server-side cleanup
    // - Close any open server connections
    // - Clean up server-side timers/intervals
    // - Save any pending server state

    logger.debug("Web-specific resources cleaned up");
  }

  async function cleanupClientResources(): Promise<void> {
    // Client-side cleanup (if running in browser)
    if (typeof window !== "undefined") {
      logger.debug("Performing client-side cleanup");

      // Clear any storage or cached data if needed
      // Note: Most client-side cleanup happens automatically on page unload

      // Clear any client-side timers or intervals
      // TODO: Add specific cleanup for client-side resources
    }
  }

  const gracefulShutdown = createGracefulShutdown(
    logger,
    performAppShutdown,
    context?.services?.database || undefined,
    context?.services?.eventBus || undefined,
    30000 // 30 second timeout
  );

  return gracefulShutdown;
}

/**
 * Get logger for web app
 * Tries to get from bootstrap context, falls back to console logger
 */
function getWebAppLogger(): ILogger {
  try {
    // Try to get from bootstrap context if available
    const context = getWebAppContextSync();
    if (context?.services?.logger) {
      return context.services.logger;
    }
  } catch (error) {
    // Bootstrap context not available, use console logger
  }

  // Fallback to simple console logger
  return {
    debug: <T = unknown>(message: string, context?: LogContext<T>) => {
      if (process.env.NODE_ENV === "development") {
        // Justification: Console logging for web app graceful shutdown debug messages
        // eslint-disable-next-line no-console
        console.debug(`[Web App] ${message}`, context);
      }
    },
    info: <T = unknown>(message: string, context?: LogContext<T>) => {
      // Justification: Console logging for web app graceful shutdown info messages
      // eslint-disable-next-line no-console
      console.info(`[Web App] ${message}`, context);
    },
    warn: <T = unknown>(message: string, context?: LogContext<T>) => {
      // Justification: Console logging for web app graceful shutdown warnings
      // eslint-disable-next-line no-console
      console.warn(`[Web App] ${message}`, context);
    },
    error: <T = unknown>(message: string, context?: LogContext<T>) => {
      // Justification: Console logging for web app graceful shutdown errors
      // eslint-disable-next-line no-console
      console.error(`[Web App] ${message}`, context);
    },
    fatal: <T = unknown>(message: string, context?: LogContext<T>) => {
      // Justification: Console logging for web app graceful shutdown fatal errors
      // eslint-disable-next-line no-console
      console.error(`[Web App] FATAL: ${message}`, context);
    },
    setLevel: () => {},
    getLevel: () => "info" as const,
    isLevelEnabled: () => true,
    setContext: () => {},
    getContext: <T = unknown>() => ({}) as LogContext<T>,
    child: () => getWebAppLogger() as ILogger,
  };
}

/**
 * Get web app context (async)
 * Returns the bootstrap context if available
 */
async function getWebAppContext(): Promise<AppContext | null> {
  try {
    // Try to import the tRPC context getter
    const { getWiredContext } = await import("../routes/api/trpc/[...trpc]");
    const context = await getWiredContext();
    return context;
  } catch (error) {
    // Bootstrap context not available
    return null;
  }
}

/**
 * Get web app context (sync)
 * Returns null if not available synchronously
 */
function getWebAppContextSync(): AppContext | null {
  // For now, return null since we can't get context synchronously
  // This could be enhanced in the future if needed
  return null;
}

// Initialize graceful shutdown for web app
// Only initialize on server side (Node.js environment)
if (typeof process !== "undefined" && process.versions?.node) {
  createWebAppGracefulShutdown()
    .then(gracefulShutdown => {
      gracefulShutdown.setupGracefulShutdown();
    })
    .catch(error => {
      // Justification: Console error for web app graceful shutdown initialization failure
      // eslint-disable-next-line no-console
      console.error("Failed to initialize web app graceful shutdown:", error);
    });
}

export { createWebAppGracefulShutdown };
