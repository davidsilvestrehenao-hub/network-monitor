/**
 * Environment Configuration Loader
 *
 * 12-Factor App Compliance (Factor III: Config)
 * - All configuration comes from environment variables
 * - Strict validation of required variables
 * - Type-safe access to configuration
 * - No hardcoded defaults for production
 */

/**
 * Environment variable schema
 */
export interface EnvironmentConfig {
  // Core application
  nodeEnv: "development" | "staging" | "production" | "test";
  port: number;
  host: string;

  // Database (Factor IV: Backing Services)
  databaseUrl: string;
  databasePoolMin?: number;
  databasePoolMax?: number;

  // Authentication
  authSecret: string;
  authUrl: string;
  authProviders: string[];

  // Services
  monitorServiceEnabled: boolean;
  alertingServiceEnabled: boolean;
  notificationServiceEnabled: boolean;

  // Event Bus (Factor IV: Backing Services)
  eventBusType: "in-memory" | "rabbitmq";
  rabbitmqUrl?: string;
  rabbitmqExchange?: string;
  rabbitmqQueuePrefix?: string;

  // Logging (Factor XI: Logs)
  logLevel: "error" | "warn" | "info" | "debug";
  logFormat: "json" | "text";
  logEnableConsole: boolean;
  logEnableTimestamps: boolean;

  // Monitoring
  enableMetrics: boolean;
  metricsPort?: number;
  enableHealthCheck: boolean;
  healthCheckPath: string;

  // Caching (optional)
  redisUrl?: string;
  cacheTtl?: number;

  // Feature flags
  enableMockAuth: boolean;
  enableDebugMode: boolean;
  enableMaintenanceMode: boolean;
  enableBrowserLaunch: boolean;

  // Deployment
  deploymentEnv: string;
  deploymentRegion?: string;
  autoMigrate: boolean;
}

/**
 * Validation error class
 */
export class EnvironmentValidationError extends Error {
  public readonly missingVariables: string[];

  constructor(message: string, missingVariables: string[]) {
    super(message);
    this.name = "EnvironmentValidationError";
    this.missingVariables = missingVariables;
  }
}

/**
 * Parse a boolean environment variable
 */
function parseBoolean(
  value: string | undefined,
  defaultValue: boolean
): boolean {
  if (value === undefined) {
    return defaultValue;
  }
  return value.toLowerCase() === "true" || value === "1";
}

/**
 * Parse an integer environment variable
 */
function parseInteger(
  value: string | undefined,
  defaultValue: number,
  min?: number,
  max?: number
): number {
  if (value === undefined) {
    return defaultValue;
  }
  const parsed = parseInt(value, 10);
  if (isNaN(parsed)) {
    return defaultValue;
  }
  if (min !== undefined && parsed < min) {
    return min;
  }
  if (max !== undefined && parsed > max) {
    return max;
  }
  return parsed;
}

/**
 * Parse a comma-separated list
 */
function parseList(
  value: string | undefined,
  defaultValue: string[]
): string[] {
  if (!value) {
    return defaultValue;
  }
  return value
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Validate required environment variables
 */
function validateRequired(variables: Record<string, string | undefined>): void {
  const missing = Object.entries(variables)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new EnvironmentValidationError(
      `Missing required environment variables: ${missing.join(", ")}`,
      missing
    );
  }
}

/**
 * Load and validate environment configuration
 *
 * This is the ONLY way to access configuration in the application.
 * Never access process.env directly in your code.
 *
 * @throws {EnvironmentValidationError} If required variables are missing
 */
export function loadEnvironment(): EnvironmentConfig {
  const nodeEnv = (process.env.NODE_ENV ||
    "development") as EnvironmentConfig["nodeEnv"];
  const isProduction = nodeEnv === "production";

  // Required variables in production
  const required: Record<string, string | undefined> = {
    DATABASE_URL: process.env.DATABASE_URL,
  };

  // Add production-specific requirements
  if (isProduction) {
    required.AUTH_SECRET = process.env.AUTH_SECRET;
    if (
      !process.env.AUTH_SECRET ||
      process.env.AUTH_SECRET === "your-secret-key-here-change-in-production"
    ) {
      throw new EnvironmentValidationError(
        "AUTH_SECRET must be set to a secure value in production",
        ["AUTH_SECRET"]
      );
    }
  }

  // Validate required variables
  validateRequired(required);

  // Build configuration object
  const config: EnvironmentConfig = {
    // Core application
    nodeEnv,
    port: parseInteger(process.env.PORT, 3000, 1, 65535),
    host: process.env.HOST || "0.0.0.0",

    // Database
    databaseUrl: process.env.DATABASE_URL!,
    databasePoolMin: process.env.DATABASE_POOL_MIN
      ? parseInteger(process.env.DATABASE_POOL_MIN, 2, 1, 100)
      : undefined,
    databasePoolMax: process.env.DATABASE_POOL_MAX
      ? parseInteger(process.env.DATABASE_POOL_MAX, 10, 1, 100)
      : undefined,

    // Authentication
    authSecret: process.env.AUTH_SECRET || "dev-secret-change-in-production",
    authUrl: process.env.AUTH_URL || "http://localhost:3000",
    authProviders: parseList(process.env.AUTH_PROVIDERS, ["mock"]),

    // Services
    monitorServiceEnabled: parseBoolean(
      process.env.MONITOR_SERVICE_ENABLED,
      true
    ),
    alertingServiceEnabled: parseBoolean(
      process.env.ALERTING_SERVICE_ENABLED,
      true
    ),
    notificationServiceEnabled: parseBoolean(
      process.env.NOTIFICATION_SERVICE_ENABLED,
      true
    ),

    // Event Bus
    eventBusType:
      (process.env.EVENT_BUS_TYPE as EnvironmentConfig["eventBusType"]) ||
      "in-memory",
    rabbitmqUrl: process.env.RABBITMQ_URL,
    rabbitmqExchange: process.env.RABBITMQ_EXCHANGE || "network-monitor-events",
    rabbitmqQueuePrefix: process.env.RABBITMQ_QUEUE_PREFIX || "network-monitor",

    // Logging (Factor XI: All logs to stdout/stderr)
    logLevel:
      (process.env.LOG_LEVEL as EnvironmentConfig["logLevel"]) || "info",
    logFormat:
      (process.env.LOG_FORMAT as EnvironmentConfig["logFormat"]) || "json",
    logEnableConsole: parseBoolean(process.env.LOG_ENABLE_CONSOLE, true),
    logEnableTimestamps: parseBoolean(process.env.LOG_ENABLE_TIMESTAMPS, true),

    // Monitoring
    enableMetrics: parseBoolean(process.env.ENABLE_METRICS, true),
    metricsPort: process.env.METRICS_PORT
      ? parseInteger(process.env.METRICS_PORT, 9090, 1, 65535)
      : undefined,
    enableHealthCheck: parseBoolean(process.env.ENABLE_HEALTH_CHECK, true),
    healthCheckPath: process.env.HEALTH_CHECK_PATH || "/health",

    // Caching
    redisUrl: process.env.REDIS_URL,
    cacheTtl: process.env.CACHE_TTL
      ? parseInteger(process.env.CACHE_TTL, 3600)
      : undefined,

    // Feature flags
    enableMockAuth: parseBoolean(process.env.ENABLE_MOCK_AUTH, !isProduction),
    enableDebugMode: parseBoolean(process.env.ENABLE_DEBUG_MODE, false),
    enableMaintenanceMode: parseBoolean(
      process.env.ENABLE_MAINTENANCE_MODE,
      false
    ),
    enableBrowserLaunch: parseBoolean(
      process.env.ENABLE_BROWSER_LAUNCH,
      !isProduction && process.env.CI !== "true"
    ),

    // Deployment
    deploymentEnv: process.env.DEPLOYMENT_ENV || "local",
    deploymentRegion: process.env.DEPLOYMENT_REGION,
    autoMigrate: parseBoolean(process.env.AUTO_MIGRATE, false),
  };

  // Validate event bus configuration
  if (config.eventBusType === "rabbitmq" && !config.rabbitmqUrl) {
    throw new EnvironmentValidationError(
      "RABBITMQ_URL must be set when EVENT_BUS_TYPE=rabbitmq",
      ["RABBITMQ_URL"]
    );
  }

  return config;
}

/**
 * Cached environment configuration
 * Loaded once at startup for performance
 */
let cachedConfig: EnvironmentConfig | null = null;

/**
 * Get environment configuration (cached)
 *
 * Usage:
 *   const config = getEnvironment();
 *   console.log(`Server running on port ${config.port}`);
 *
 * @returns Environment configuration
 */
export function getEnvironment(): EnvironmentConfig {
  if (!cachedConfig) {
    cachedConfig = loadEnvironment();
  }
  return cachedConfig;
}

/**
 * Reset cached configuration (useful for testing)
 */
export function resetEnvironmentCache(): void {
  cachedConfig = null;
}

/**
 * Validate environment at startup
 *
 * Call this at the very beginning of your application:
 *
 * ```typescript
 * import { validateEnvironment } from '@network-monitor/infrastructure';
 *
 * validateEnvironment(); // Will throw if config is invalid
 * ```
 */
export function validateEnvironment(): void {
  try {
    const config = getEnvironment();

    // Additional runtime validation
    if (config.nodeEnv === "production") {
      // Production-specific checks
      if (
        config.authSecret.includes("dev") ||
        config.authSecret.includes("change")
      ) {
        throw new Error("Production AUTH_SECRET contains suspicious values");
      }

      if (config.databaseUrl.includes("localhost")) {
        throw new Error(
          "Production DATABASE_URL should not point to localhost"
        );
      }

      if (config.enableMockAuth) {
        throw new Error(
          "Mock authentication should not be enabled in production"
        );
      }
    }

    // Log successful validation
    const safeConfig = {
      ...config,
      authSecret: "***REDACTED***",
      databaseUrl: config.databaseUrl.replace(/:[^:]*@/, ":***@"), // Hide password
    };

    // Justification: Console log for successful environment validation during startup
    // eslint-disable-next-line no-console
    console.log(
      "✅ Environment configuration loaded and validated",
      JSON.stringify(safeConfig, null, 2)
    );
  } catch (error) {
    if (error instanceof EnvironmentValidationError) {
      // Justification: Console errors for environment validation failure - critical startup errors
      // eslint-disable-next-line no-console
      console.error("❌ Environment validation failed:", error.message);
      // eslint-disable-next-line no-console
      console.error("Missing variables:", error.missingVariables);
      // eslint-disable-next-line no-console
      console.error("\nPlease check your environment configuration:");
      // eslint-disable-next-line no-console
      console.error("1. Copy .env.example to .env");
      // eslint-disable-next-line no-console
      console.error("2. Fill in all required values");
      // eslint-disable-next-line no-console
      console.error("3. Restart the application");
    } else {
      // Justification: Console error for unexpected environment validation failure
      // eslint-disable-next-line no-console
      console.error("❌ Environment validation failed:", error);
    }
    process.exit(1);
  }
}

/**
 * Print environment configuration (with secrets redacted)
 *
 * Useful for debugging startup issues
 */
export function printEnvironment(): void {
  const config = getEnvironment();
  const safeConfig = {
    ...config,
    authSecret: "***REDACTED***",
    databaseUrl: config.databaseUrl.replace(/:[^:]*@/, ":***@"),
  };

  // Justification: Console output for debugging utility - prints environment configuration
  // eslint-disable-next-line no-console
  console.log("📋 Environment Configuration:");
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(safeConfig, null, 2));
}
