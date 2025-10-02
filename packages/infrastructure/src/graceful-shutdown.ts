/**
 * Graceful Shutdown Handler
 *
 * 12-Factor App Compliance (Factor IX: Disposability)
 * - Fast startup
 * - Graceful shutdown
 * - Handle SIGTERM and SIGINT
 * - Close all connections cleanly
 */

import type {
  ILogger,
  IDatabaseService,
  IEventBus,
} from "@network-monitor/shared";

/**
 * Interface for applications that support graceful shutdown
 */
export interface IGracefulShutdown {
  /**
   * Initialize graceful shutdown handlers
   * Should be called during application startup
   */
  setupGracefulShutdown(): void;

  /**
   * Perform graceful shutdown
   * Should clean up resources and exit gracefully
   */
  shutdown(signal: string): Promise<void>;

  /**
   * Check if shutdown is in progress
   */
  isShuttingDown(): boolean;
}

/**
 * Graceful shutdown options
 */
export interface GracefulShutdownOptions {
  /** Logger for shutdown messages */
  logger: ILogger;

  /** Database service to disconnect */
  database?: IDatabaseService;

  /** Event bus to disconnect */
  eventBus?: IEventBus;

  /** Shutdown timeout in milliseconds (default: 30000) */
  shutdownTimeout?: number;

  /** Custom cleanup function */
  onShutdown?: () => Promise<void>;
}

/**
 * Create a graceful shutdown implementation
 *
 * This function returns a complete implementation of the IGracefulShutdown interface
 * that applications can use directly. Each app should create its own instance with
 * app-specific shutdown logic.
 */
export function createGracefulShutdown(
  logger: ILogger,
  performAppShutdown: () => Promise<void>,
  database?: IDatabaseService,
  eventBus?: IEventBus,
  shutdownTimeout: number = 30000
): IGracefulShutdown {
  let _isShuttingDown = false;

  /**
   * Complete shutdown process including app-specific and infrastructure cleanup
   */
  async function performCompleteShutdown(): Promise<void> {
    // 1. App-specific shutdown first
    logger.info("Starting application-specific shutdown...");
    await performAppShutdown();

    // 2. Infrastructure shutdown
    logger.info("Starting infrastructure shutdown...");
    await performInfrastructureShutdown();

    logger.info("All shutdown tasks completed");
  }

  /**
   * Perform infrastructure shutdown (database, event bus, etc.)
   */
  async function performInfrastructureShutdown(): Promise<void> {
    const shutdownTasks: Promise<void>[] = [];

    // Close event bus connections
    if (eventBus) {
      logger.info("Closing event bus connections...");
      shutdownTasks.push(
        eventBus.disconnect().catch(error => {
          logger.error("Error closing event bus", {
            error: error instanceof Error ? error.message : String(error),
          });
        })
      );
    }

    // Close database connections
    if (database) {
      logger.info("Closing database connections...");
      shutdownTasks.push(
        database.disconnect().catch(error => {
          logger.error("Error closing database", {
            error: error instanceof Error ? error.message : String(error),
          });
        })
      );
    }

    // Wait for all infrastructure shutdown tasks
    await Promise.allSettled(shutdownTasks);
    logger.info("Infrastructure shutdown complete");
  }

  async function shutdown(signal: string): Promise<void> {
    if (_isShuttingDown) {
      logger.warn("Shutdown already in progress, ignoring signal", { signal });
      return;
    }

    _isShuttingDown = true;
    logger.info(`Received ${signal}, starting graceful shutdown...`, {
      signal,
      timeout: shutdownTimeout,
    });

    const startTime = Date.now();

    try {
      // Set shutdown timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Shutdown timeout after ${shutdownTimeout}ms`));
        }, shutdownTimeout);
      });

      // Race between shutdown and timeout
      await Promise.race([performCompleteShutdown(), timeoutPromise]);

      const duration = Date.now() - startTime;
      logger.info("Graceful shutdown complete", {
        signal,
        duration: `${duration}ms`,
      });

      logger.info("Exiting process with code 0");
      process.exit(0);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Error during graceful shutdown", {
        error: error instanceof Error ? error.message : String(error),
        signal,
        duration: `${duration}ms`,
      });

      logger.info("Forcing process exit with code 1");
      process.exit(1);
    }
  }

  return {
    setupGracefulShutdown(): void {
      // Register signal handlers
      process.on("SIGTERM", () => {
        logger.info("Received SIGTERM signal");
        shutdown("SIGTERM");
      });

      process.on("SIGINT", () => {
        logger.info("Received SIGINT signal (Ctrl+C)");
        shutdown("SIGINT");
      });

      process.on("uncaughtException", error => {
        logger.error("Uncaught exception", {
          error: error.message,
          stack: error.stack,
        });
        shutdown("uncaughtException");
      });

      process.on("unhandledRejection", reason => {
        logger.error("Unhandled rejection", {
          reason: reason instanceof Error ? reason.message : String(reason),
          stack: reason instanceof Error ? reason.stack : undefined,
        });
        shutdown("unhandledRejection");
      });

      logger.info("Graceful shutdown handlers registered", {
        signals: ["SIGTERM", "SIGINT"],
        timeout: `${shutdownTimeout}ms`,
      });
    },

    shutdown,

    isShuttingDown(): boolean {
      return _isShuttingDown;
    },
  };
}

/**
 * @deprecated Use createGracefulShutdown function instead for new applications
 *
 * Legacy function kept for reference but not recommended for new code.
 * Use the interface-based approach with createGracefulShutdown function.
 */
export function setupGracefulShutdown(options: GracefulShutdownOptions): void {
  const {
    logger,
    database,
    eventBus,
    shutdownTimeout = 30000,
    onShutdown,
  } = options;

  let isShuttingDown = false;

  async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) {
      logger.warn("Shutdown already in progress, ignoring signal", { signal });
      return;
    }

    isShuttingDown = true;
    logger.info(`Received ${signal}, starting graceful shutdown...`, {
      signal,
      timeout: shutdownTimeout,
    });

    const startTime = Date.now();

    try {
      // Set shutdown timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Shutdown timeout after ${shutdownTimeout}ms`));
        }, shutdownTimeout);
      });

      // Shutdown sequence
      const shutdownPromise = (async () => {
        // 1. Stop accepting new requests (handled by server)
        logger.info("Step 1/5: Stopping new request acceptance...");

        // 2. Complete in-flight requests
        logger.info("Step 2/5: Completing in-flight requests...");
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Custom cleanup
        if (onShutdown) {
          logger.info("Step 3/5: Running custom cleanup...");
          await onShutdown();
        } else {
          logger.info("Step 3/5: No custom cleanup needed");
        }

        // 4. Close event bus (if it has a disconnect method)
        if (eventBus) {
          logger.info("Step 4/5: Cleaning up event bus...");
          // Remove all listeners to prevent memory leaks
          eventBus.removeAllListeners();
          logger.info("Event bus cleaned up");
        } else {
          logger.info("Step 4/5: No event bus to clean up");
        }

        // 5. Close database connections
        if (database) {
          logger.info("Step 5/5: Closing database connections...");
          await database.disconnect();
          logger.info("Database disconnected");
        } else {
          logger.info("Step 5/5: No database to disconnect");
        }

        const duration = Date.now() - startTime;
        logger.info("Graceful shutdown complete", {
          signal,
          duration: `${duration}ms`,
        });
      })();

      // Race between shutdown and timeout
      await Promise.race([shutdownPromise, timeoutPromise]);

      logger.info("Exiting process with code 0");
      process.exit(0);
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error("Error during graceful shutdown", {
        error: error instanceof Error ? error.message : String(error),
        signal,
        duration: `${duration}ms`,
      });

      logger.info("Forcing process exit with code 1");
      process.exit(1);
    }
  }

  // Register signal handlers
  process.on("SIGTERM", () => {
    logger.info("Received SIGTERM signal");
    shutdown("SIGTERM");
  });

  process.on("SIGINT", () => {
    logger.info("Received SIGINT signal (Ctrl+C)");
    shutdown("SIGINT");
  });

  // Handle uncaught errors
  process.on("uncaughtException", error => {
    logger.error("Uncaught exception", {
      error: error.message,
      stack: error.stack,
    });
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", reason => {
    logger.error("Unhandled rejection", {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    shutdown("unhandledRejection");
  });

  logger.info("Graceful shutdown handlers registered", {
    signals: ["SIGTERM", "SIGINT"],
    timeout: `${shutdownTimeout}ms`,
  });
}

/**
 * Create a timeout promise
 *
 * Useful for implementing timeouts in async operations
 */
export function createTimeout(ms: number, message?: string): Promise<never> {
  return new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error(message || `Operation timed out after ${ms}ms`));
    }, ms);
  });
}

/**
 * Wait for all promises to settle with a timeout
 *
 * Similar to Promise.allSettled but with a timeout
 */
export async function waitForShutdown<T>(
  promises: Promise<T>[],
  timeoutMs: number
): Promise<PromiseSettledResult<T>[]> {
  const timeoutPromise = createTimeout(
    timeoutMs,
    "Shutdown operations timeout"
  );

  return Promise.race([Promise.allSettled(promises), timeoutPromise]);
}
