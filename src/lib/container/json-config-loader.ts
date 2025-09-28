import { readFileSync, existsSync } from "fs";
import { join, resolve } from "path";
import { TYPES } from "./types";
import { createServiceFactory } from "./flexible-container";
// Justification: These imports are for type checking and future use
// import { ILogger } from "../services/interfaces/ILogger";
// import { IEventBus } from "../services/interfaces/IEventBus";
// import { IDatabaseService } from "../services/interfaces/IDatabaseService";
// import { IUserRepository } from "../services/interfaces/IUserRepository";
// import { IMonitoringTargetRepository } from "../services/interfaces/IMonitoringTargetRepository";
// import { ISpeedTestResultRepository } from "../services/interfaces/ISpeedTestResultRepository";
// import { IAlertRuleRepository } from "../services/interfaces/IAlertRuleRepository";
// import { IIncidentEventRepository } from "../services/interfaces/IIncidentEventRepository";
// import { IPushSubscriptionRepository } from "../services/interfaces/IPushSubscriptionRepository";
// import { INotificationRepository } from "../services/interfaces/INotificationRepository";
// import { ITargetRepository } from "../services/interfaces/ITargetRepository";
// import { ISpeedTestRepository } from "../services/interfaces/ISpeedTestRepository";
// import { IMonitorService } from "../services/interfaces/IMonitorService";
// import { IAlertingService } from "../services/interfaces/IAlertingService";
// import { INotificationService } from "../services/interfaces/INotificationService";
// import { IAuthService } from "../services/interfaces/IAuthService";

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
  ILogger: TYPES.ILogger,
  IEventBus: TYPES.IEventBus,
  IDatabaseService: TYPES.IDatabaseService,
  IMonitorService: TYPES.IMonitorService,
  IAlertingService: TYPES.IAlertingService,
  INotificationService: TYPES.INotificationService,
  IAuthService: TYPES.IAuthService,
  IUserRepository: TYPES.IUserRepository,
  IMonitoringTargetRepository: TYPES.IMonitoringTargetRepository,
  ISpeedTestResultRepository: TYPES.ISpeedTestResultRepository,
  IAlertRuleRepository: TYPES.IAlertRuleRepository,
  IIncidentEventRepository: TYPES.IIncidentEventRepository,
  IPushSubscriptionRepository: TYPES.IPushSubscriptionRepository,
  INotificationRepository: TYPES.INotificationRepository,
  ITargetRepository: TYPES.ITargetRepository,
  ISpeedTestRepository: TYPES.ISpeedTestRepository,
};

// Justification: This map is for future use when we need to validate interface types
// const INTERFACE_TYPE_MAP: Record<symbol, any> = {
//   [TYPES.ILogger]: ILogger,
//   [TYPES.IEventBus]: IEventBus,
//   [TYPES.IDatabaseService]: IDatabaseService,
//   [TYPES.IMonitorService]: IMonitorService,
//   [TYPES.IAlertingService]: IAlertingService,
//   [TYPES.INotificationService]: INotificationService,
//   [TYPES.IAuthService]: IAuthService,
//   [TYPES.IUserRepository]: IUserRepository,
//   [TYPES.IMonitoringTargetRepository]: IMonitoringTargetRepository,
//   [TYPES.ISpeedTestResultRepository]: ISpeedTestResultRepository,
//   [TYPES.IAlertRuleRepository]: IAlertRuleRepository,
//   [TYPES.IIncidentEventRepository]: IIncidentEventRepository,
//   [TYPES.IPushSubscriptionRepository]: IPushSubscriptionRepository,
//   [TYPES.INotificationRepository]: INotificationRepository,
//   [TYPES.ITargetRepository]: ITargetRepository,
//   [TYPES.ISpeedTestRepository]: ISpeedTestRepository,
// };

export class JsonConfigLoader {
  private configPath: string;
  private projectRoot: string;

  constructor(configPath: string = "service-config.json") {
    this.configPath = configPath;
    this.projectRoot = process.cwd();
  }

  /**
   * Load configuration from JSON file
   */
  public loadConfiguration(): JsonConfiguration {
    const fullPath = join(this.projectRoot, this.configPath);

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
        console.warn(`Unknown service type: ${serviceName}`);
        continue;
      }

      try {
        // Dynamically import the service module
        const serviceModule = await this.loadServiceModule(
          jsonServiceConfig.module
        );
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

        serviceConfig[serviceType] = {
          factory,
          dependencies,
          singleton: true,
          description: jsonServiceConfig.description,
        };
      } catch (error) {
        throw new Error(`Failed to load service ${serviceName}: ${error}`);
      }
    }

    return serviceConfig;
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
      resolvedPath = resolve(this.projectRoot, cleanPath);
    } else if (modulePath.startsWith("./")) {
      // Resolve relative to current directory
      resolvedPath = resolve(process.cwd(), modulePath);
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
      [TYPES.ILogger]: [],
      [TYPES.IEventBus]: [],
      [TYPES.IDatabaseService]: [TYPES.ILogger],
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
      [TYPES.ITargetRepository]: [TYPES.IDatabaseService, TYPES.ILogger],
      [TYPES.ISpeedTestRepository]: [TYPES.IDatabaseService, TYPES.ILogger],
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
        console.warn(`Unknown service type: ${serviceName}`);
      }
    }
  }

  /**
   * Get available configuration files
   */
  public static getAvailableConfigurations(): string[] {
    const configsDir = join(process.cwd(), "configs");
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

    return configs.filter(config => existsSync(join(configsDir, config)));
  }
}
