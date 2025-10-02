// Justification: Dynamic import of path module to avoid browser compatibility issues
import { TYPES } from "./types.js";
import { createServiceFactory } from "./flexible-container.js";

// JSON configuration interfaces
export interface JsonServiceConfig {
  module: string;
  className: string;
  isMock?: boolean;
  description: string;
}

export interface JsonConfiguration {
  name: string;
  description: string;
  environment: string;
  services: Record<string, JsonServiceConfig>;
}

// Service type mapping for JSON configuration
const SERVICE_TYPE_MAP: Record<string, symbol> = {
  // Database
  IDatabaseService: TYPES.IDatabaseService,

  // Loggers
  ILogger: TYPES.ILogger,

  // Repositories
  IUserRepository: TYPES.IUserRepository,
  IMonitoringTargetRepository: TYPES.IMonitoringTargetRepository,
  ISpeedTestResultRepository: TYPES.ISpeedTestResultRepository,
  IAlertRuleRepository: TYPES.IAlertRuleRepository,
  IIncidentEventRepository: TYPES.IIncidentEventRepository,
  IPushSubscriptionRepository: TYPES.IPushSubscriptionRepository,
  INotificationRepository: TYPES.INotificationRepository,
  IUserSpeedTestPreferenceRepository: TYPES.IUserSpeedTestPreferenceRepository,
  ISpeedTestUrlRepository: TYPES.ISpeedTestUrlRepository,
  ITargetRepository: TYPES.ITargetRepository,
  ISpeedTestRepository: TYPES.ISpeedTestRepository,

  // Services
  IMonitorService: TYPES.IMonitorService,
  IAlertingService: TYPES.IAlertingService,
  INotificationService: TYPES.INotificationService,
  IAuthService: TYPES.IAuthService,

  // Infrastructure
  IEventBus: TYPES.IEventBus,
};

export class JsonConfigLoader {
  private configPath: string;
  private projectRoot: string;

  constructor(configPath: string = "service-wiring/development.json") {
    this.configPath = configPath;
    // Justification: Use browser-compatible path for project root
    this.projectRoot =
      typeof process !== "undefined" && typeof process.cwd === "function"
        ? process.cwd()
        : "/";
  }

  /**
   * Load configuration from JSON file
   */
  public async loadConfiguration(): Promise<JsonConfiguration> {
    // Check if we're in a browser environment
    if (typeof window !== "undefined") {
      // Browser environment - use fetch
      try {
        const response = await fetch(`/${this.configPath}`);
        if (!response.ok) {
          throw new Error(`Configuration file not found: ${response.status}`);
        }
        const configContent = await response.text();
        const config = JSON.parse(configContent) as JsonConfiguration;
        // Justification: Console usage for debugging configuration loading in development
        // eslint-disable-next-line no-console
        console.log(
          `[ConfigLoader] Loaded configuration: ${config.name} (${config.environment})`
        );

        // Validate configuration structure
        this.validateConfiguration(config);

        return config;
      } catch (error) {
        throw new Error(
          `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    } else {
      // Node.js environment - use fs
      // Justification: Dynamic import of path module to avoid browser compatibility issues
      const { join } = await import("path");
      const fullPath = join(this.projectRoot, this.configPath);

      // Justification: Dynamic import of fs module to avoid browser compatibility issues
      const { readFileSync, existsSync } = await import("fs");

      if (!existsSync(fullPath)) {
        throw new Error(`Configuration file not found: ${fullPath}`);
      }

      try {
        const configContent = readFileSync(fullPath, "utf-8");
        const config = JSON.parse(configContent) as JsonConfiguration;

        // Validate configuration structure
        this.validateConfiguration(config);

        return config;
      } catch (error) {
        throw new Error(`Failed to load configuration: ${error}`);
      }
    }
  }

  /**
   * Convert JSON configuration to service configuration
   */
  public async convertToServiceConfig(
    jsonConfig: JsonConfiguration
  ): Promise<Record<symbol, unknown>> {
    const serviceConfig: Record<symbol, unknown> = {};

    for (const [serviceName, jsonServiceConfig] of Object.entries(
      jsonConfig.services
    )) {
      const serviceType = SERVICE_TYPE_MAP[serviceName];

      if (!serviceType) {
        // Justification: Console usage for warning about unknown service types during config loading
        // eslint-disable-next-line no-console
        console.warn(
          `[ConfigLoader] Unknown service type: ${serviceName} - skipping`
        );
        continue;
      }

      try {
        const config = await this.createServiceConfigFromJson(
          serviceType,
          jsonServiceConfig,
          serviceName
        );
        Object.assign(serviceConfig, { [serviceType]: config });
      } catch (error) {
        throw new Error(`Failed to load service ${serviceName}: ${error}`);
      }
    }

    return serviceConfig;
  }

  /**
   * Create service configuration from JSON service config
   */
  private async createServiceConfigFromJson(
    serviceType: symbol,
    jsonServiceConfig: JsonServiceConfig,
    _serviceName: string
  ) {
    // Dynamically import the service module
    const serviceModule = await this.loadServiceModule(
      jsonServiceConfig.module
    );
    // Justification: Dynamic service loading requires unknown types for flexible class instantiation
    const ServiceClass = serviceModule[jsonServiceConfig.className] as new (
      ...args: unknown[]
    ) => unknown;

    if (!ServiceClass) {
      throw new Error(
        `Class ${jsonServiceConfig.className} not found in module ${jsonServiceConfig.module}`
      );
    }

    // Create service factory based on service type
    const factory = this.createServiceFactory(serviceType, ServiceClass);

    // Determine dependencies based on service type
    const dependencies = this.getServiceDependencies(serviceType);

    return {
      factory,
      dependencies,
      singleton: true,
      description: jsonServiceConfig.description,
    };
  }

  /**
   * Dynamically load service module
   */
  private async loadServiceModule(
    modulePath: string
  ): Promise<Record<string, unknown>> {
    // Handle relative paths that start with ../
    let resolvedPath: string;

    if (modulePath.startsWith("../")) {
      // For paths like "../src/lib/services/concrete/LoggerService"
      // Remove the "../" and resolve from project root
      const cleanPath = modulePath.replace("../", "");
      // Justification: Dynamic import of path module to avoid browser compatibility issues
      const { resolve } = await import("path");
      resolvedPath = resolve(this.projectRoot, cleanPath);
    } else if (modulePath.startsWith("./")) {
      // Resolve relative to current directory
      // Justification: Dynamic import of path module to avoid browser compatibility issues
      const { resolve } = await import("path");
      // Justification: Use browser-compatible path resolution
      const cwd =
        typeof process !== "undefined" && typeof process.cwd === "function"
          ? process.cwd()
          : "/";
      resolvedPath = resolve(cwd, modulePath);
    } else {
      // Assume it's a module name or absolute path
      resolvedPath = modulePath;
    }

    try {
      // Dynamic import with resolved path
      const module = await import(resolvedPath);
      return module as Record<string, unknown>;
    } catch (error) {
      // Try alternative resolution strategies
      try {
        // Try with .js extension
        const jsPath = resolvedPath + ".js";
        const module = await import(jsPath);
        return module as Record<string, unknown>;
      } catch (jsError) {
        try {
          // Try with .ts extension
          const tsPath = resolvedPath + ".ts";
          const module = await import(tsPath);
          return module as Record<string, unknown>;
        } catch (tsError) {
          throw new Error(
            `Failed to import module ${modulePath} (tried ${resolvedPath}, ${resolvedPath}.js, ${resolvedPath}.ts): ${error}. JS Error: ${jsError}. TS Error: ${tsError}`
          );
        }
      }
    }
  }

  /**
   * Create service factory based on service type
   */
  private createServiceFactory(
    serviceType: symbol,
    // Justification: Service factory must handle any service class type for flexible DI
    ServiceClass: new (...args: unknown[]) => unknown
  ): unknown {
    return createServiceFactory(container => {
      // Get dependencies for this service
      const dependencies = this.getServiceDependencies(serviceType);
      const resolvedDependencies = dependencies.map(dep => container.get(dep));

      // Create service instance with resolved dependencies
      return new ServiceClass(...resolvedDependencies);
    });
  }

  /**
   * Get dependencies for a service type
   */
  private getServiceDependencies(serviceType: symbol): symbol[] {
    const dependencyMap: Record<symbol, symbol[]> = {
      // Loggers
      [TYPES.ILogger]: [],

      // Infrastructure
      [TYPES.IEventBus]: [],

      // Database
      [TYPES.IDatabaseService]: [TYPES.ILogger],

      // Repositories
      [TYPES.IUserRepository]: [TYPES.IDatabaseService, TYPES.ILogger],
      [TYPES.IMonitoringTargetRepository]: [
        TYPES.IDatabaseService,
        TYPES.ILogger,
      ],
      [TYPES.ISpeedTestResultRepository]: [
        TYPES.IDatabaseService,
        TYPES.ILogger,
      ],
      [TYPES.IAlertRuleRepository]: [TYPES.IDatabaseService, TYPES.ILogger],
      [TYPES.IIncidentEventRepository]: [TYPES.IDatabaseService, TYPES.ILogger],
      [TYPES.IPushSubscriptionRepository]: [
        TYPES.IDatabaseService,
        TYPES.ILogger,
      ],
      [TYPES.INotificationRepository]: [TYPES.IDatabaseService, TYPES.ILogger],
      [TYPES.IUserSpeedTestPreferenceRepository]: [
        TYPES.IDatabaseService,
        TYPES.ILogger,
      ],
      [TYPES.ISpeedTestUrlRepository]: [TYPES.IDatabaseService, TYPES.ILogger],
      [TYPES.ITargetRepository]: [TYPES.IDatabaseService, TYPES.ILogger],
      [TYPES.ISpeedTestRepository]: [TYPES.IDatabaseService, TYPES.ILogger],

      // Services
      [TYPES.IMonitorService]: [
        TYPES.ITargetRepository,
        TYPES.ISpeedTestRepository,
        TYPES.IMonitoringTargetRepository,
        TYPES.ISpeedTestResultRepository,
        TYPES.IEventBus,
        TYPES.ILogger,
      ],
      [TYPES.IAlertingService]: [
        TYPES.IAlertRuleRepository,
        TYPES.IIncidentEventRepository,
        TYPES.IEventBus,
        TYPES.ILogger,
      ],
      [TYPES.INotificationService]: [
        TYPES.INotificationRepository,
        TYPES.IPushSubscriptionRepository,
        TYPES.IEventBus,
        TYPES.ILogger,
      ],
      [TYPES.IAuthService]: [TYPES.ILogger],

      // Infrastructure services
      [TYPES.IEventBus]: [],
    };

    return dependencyMap[serviceType] || [];
  }

  /**
   * Validate configuration structure
   */
  private validateConfiguration(config: JsonConfiguration): void {
    if (!config.name || !config.description || !config.environment) {
      throw new Error(
        "Configuration must have name, description, and environment"
      );
    }

    if (!config.services || typeof config.services !== "object") {
      throw new Error("Configuration must have services object");
    }

    // Validate each service configuration
    for (const [serviceName, serviceConfig] of Object.entries(
      config.services
    )) {
      if (
        !serviceConfig.module ||
        !serviceConfig.className ||
        !serviceConfig.description
      ) {
        throw new Error(
          `Service ${serviceName} must have module, className, and description`
        );
      }

      if (!SERVICE_TYPE_MAP[serviceName]) {
        // Justification: Console usage for warning about unknown service types during config validation
        // eslint-disable-next-line no-console
        console.warn(
          `[ConfigLoader] Unknown service type in validation: ${serviceName}`
        );
      }
    }
  }

  /**
   * Get available configuration files
   */
  public static async getAvailableConfigurations(): Promise<string[]> {
    // Justification: Dynamic import of path module to avoid browser compatibility issues
    const { join } = await import("path");
    // Justification: Use browser-compatible path for configs directory
    const cwd =
      typeof process !== "undefined" && typeof process.cwd === "function"
        ? process.cwd()
        : "/";
    const configsDir = join(cwd, "configs");
    const configs = [
      "all-concrete.json",
      "auth-mock-only.json",
      "all-mock.json",
      "offline-development.json",
      "performance-testing.json",
      "database-testing.json",
      "notification-testing.json",
      "monitoring-testing.json",
      "alerting-testing.json",
    ];

    // Justification: Dynamic import of fs module to avoid browser compatibility issues
    const { existsSync } = await import("fs");
    return configs.filter(config => existsSync(join(configsDir, config)));
  }
}
