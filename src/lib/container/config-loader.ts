import { TYPES } from "./types";
import { createServiceFactory } from "./utils";
import config from "config";

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

export class ConfigLoader {
  public async convertToServiceConfig(): Promise<Record<symbol, unknown>> {
    const serviceConfig: Record<symbol, unknown> = {};
    const services = config.get("services") as Record<
      string,
      { module: string; className: string; description: string }
    >;

    for (const [serviceName, jsonServiceConfig] of Object.entries(services)) {
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

  private async loadServiceModule(
    modulePath: string
  ): Promise<Record<string, unknown>> {
    // node-config resolves paths relative to the execution directory,
    // so we need to adjust the path to be relative to the project root.
    const projectRoot = process.cwd();
    const { resolve } = await import("path");
    const resolvedPath = resolve(projectRoot, modulePath.replace("../", ""));

    try {
      const module = await import(resolvedPath);
      return module as Record<string, unknown>;
    } catch (error) {
      throw new Error(`Failed to import module ${modulePath}: ${error}`);
    }
  }

  private createServiceFactory(
    serviceType: symbol,
    ServiceClass: new (...args: unknown[]) => unknown
  ): unknown {
    return createServiceFactory(container => {
      const dependencies = this.getServiceDependencies(serviceType);
      const resolvedDependencies = dependencies.map(dep => container.get(dep));
      return new ServiceClass(...resolvedDependencies);
    });
  }

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
      [TYPES.IAuthService]: [
        TYPES.IUserRepository,
        TYPES.IEventBus,
        TYPES.ILogger,
      ],
    };

    return dependencyMap[serviceType] || [];
  }
}
