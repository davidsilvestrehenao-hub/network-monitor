import { getContainer } from "./flexible-container";
import type { ServiceConfig } from "./types";
import { TYPES } from "./types";
import type { IDatabaseService } from "../services/interfaces/IDatabaseService";
import type { ILogger } from "../services/interfaces/ILogger";
import type { IEventBus } from "../services/interfaces/IEventBus";
import type { IUserRepository } from "../services/interfaces/IUserRepository";
import type { IMonitoringTargetRepository } from "../services/interfaces/IMonitoringTargetRepository";
import type { ISpeedTestResultRepository } from "../services/interfaces/ISpeedTestResultRepository";
import type { IAlertRuleRepository } from "../services/interfaces/IAlertRuleRepository";
import type { IIncidentEventRepository } from "../services/interfaces/IIncidentEventRepository";
import type { IPushSubscriptionRepository } from "../services/interfaces/IPushSubscriptionRepository";
import type { INotificationRepository } from "../services/interfaces/INotificationRepository";
import type { ITargetRepository } from "../services/interfaces/ITargetRepository";
import type { ISpeedTestRepository } from "../services/interfaces/ISpeedTestRepository";
import type { IMonitorService } from "../services/interfaces/IMonitorService";
import type { IAlertingService } from "../services/interfaces/IAlertingService";
import type { INotificationService } from "../services/interfaces/INotificationService";
import type { IAuthService } from "../services/interfaces/IAuthService";
import { getJsonAppContext, initializeJsonContainer } from "./json-container";
import { getBrowserAppContext } from "./container.browser";
// Justification: Dynamic import of fs module to avoid browser compatibility issues
// Justification: Dynamic import of path module to avoid browser compatibility issues

import { initializeBrowserContainer } from "./container.browser";

let containerInitialized = false;

export async function initializeContainer(): Promise<void> {
  if (typeof window !== "undefined") {
    return initializeBrowserContainer();
  }

  if (containerInitialized) {
    return;
  }

  // Check if we're in a Node.js environment
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    // Justification: Dynamic import of path module to avoid browser compatibility issues
    const { join } = await import("path");
    const cwd = process.cwd();
    const jsonConfigPath = join(cwd, "service-config.json");
    const { existsSync } = await import("fs");
    if (existsSync(jsonConfigPath)) {
      try {
        // Use JSON configuration
        await initializeJsonContainer();
        containerInitialized = true;
        return;
      } catch (error) {
        console.warn(
          "⚠️ Failed to load JSON configuration, falling back to hardcoded configuration:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  // Fallback to hardcoded configuration
  console.log("📋 Using hardcoded service configuration");
  const container = getContainer();

  // Dynamically import baseServiceConfig to avoid loading Winston when using JSON config
  const { baseServiceConfig } = await import("./service-config");

  // Register all services
  container.register(
    TYPES.ILogger,
    baseServiceConfig[TYPES.ILogger] as ServiceConfig
  );
  container.register(
    TYPES.IEventBus,
    baseServiceConfig[TYPES.IEventBus] as ServiceConfig
  );
  container.register(
    TYPES.IDatabaseService,
    baseServiceConfig[TYPES.IDatabaseService] as ServiceConfig
  );

  // Register all repositories
  container.register(
    TYPES.IUserRepository,
    baseServiceConfig[TYPES.IUserRepository] as ServiceConfig
  );
  container.register(
    TYPES.IMonitoringTargetRepository,
    baseServiceConfig[TYPES.IMonitoringTargetRepository] as ServiceConfig
  );
  container.register(
    TYPES.ISpeedTestResultRepository,
    baseServiceConfig[TYPES.ISpeedTestResultRepository] as ServiceConfig
  );
  container.register(
    TYPES.IAlertRuleRepository,
    baseServiceConfig[TYPES.IAlertRuleRepository] as ServiceConfig
  );
  container.register(
    TYPES.IIncidentEventRepository,
    baseServiceConfig[TYPES.IIncidentEventRepository] as ServiceConfig
  );
  container.register(
    TYPES.IPushSubscriptionRepository,
    baseServiceConfig[TYPES.IPushSubscriptionRepository] as ServiceConfig
  );
  container.register(
    TYPES.INotificationRepository,
    baseServiceConfig[TYPES.INotificationRepository] as ServiceConfig
  );

  // Register legacy repositories
  container.register(
    TYPES.ITargetRepository,
    baseServiceConfig[TYPES.ITargetRepository] as ServiceConfig
  );
  container.register(
    TYPES.ISpeedTestRepository,
    baseServiceConfig[TYPES.ISpeedTestRepository] as ServiceConfig
  );

  // Register business services
  container.register(
    TYPES.IMonitorService,
    baseServiceConfig[TYPES.IMonitorService] as ServiceConfig
  );
  container.register(
    TYPES.IAlertingService,
    baseServiceConfig[TYPES.IAlertingService] as ServiceConfig
  );
  container.register(
    TYPES.INotificationService,
    baseServiceConfig[TYPES.INotificationService] as ServiceConfig
  );
  container.register(
    TYPES.IAuthService,
    baseServiceConfig[TYPES.IAuthService] as ServiceConfig
  );

  // Initialize container
  await container.initialize();

  // Initialize database connection
  const databaseService = container.get<IDatabaseService>(
    TYPES.IDatabaseService
  );
  await databaseService.connect();

  containerInitialized = true;
}

export type AppContext = {
  services: {
    logger: ILogger | null;
    eventBus: IEventBus | null;
    database: IDatabaseService | null;
    monitor: IMonitorService | null;
    alerting: IAlertingService | null;
    notification: INotificationService | null;
    auth: IAuthService | null;
  };
  repositories: {
    user: IUserRepository | null;
    monitoringTarget: IMonitoringTargetRepository | null;
    speedTestResult: ISpeedTestResultRepository | null;
    alertRule: IAlertRuleRepository | null;
    incidentEvent: IIncidentEventRepository | null;
    pushSubscription: IPushSubscriptionRepository | null;
    notification: INotificationRepository | null;
    target: ITargetRepository | null;
    speedTest: ISpeedTestRepository | null;
  };
};

export async function getAppContext(): Promise<AppContext> {
  if (typeof window !== "undefined") {
    return getBrowserAppContext();
  }

  // Check if we're in a Node.js environment
  if (typeof process !== "undefined" && typeof process.cwd === "function") {
    // Justification: Dynamic import of path module to avoid browser compatibility issues
    const { join } = await import("path");
    const cwd = process.cwd();
    const jsonConfigPath = join(cwd, "service-config.json");
    const { existsSync } = await import("fs");
    if (existsSync(jsonConfigPath)) {
      try {
        return await getJsonAppContext();
      } catch (error) {
        console.warn(
          "⚠️ Failed to get JSON app context, falling back to hardcoded configuration:",
          error instanceof Error ? error.message : String(error)
        );
      }
    }
  }

  // Fallback to hardcoded configuration for browser or if JSON config fails
  await initializeContainer();
  const container = getContainer();

  return {
    services: {
      logger: container.get<ILogger>(TYPES.ILogger),
      eventBus: container.get<IEventBus>(TYPES.IEventBus),
      database: container.get<IDatabaseService>(TYPES.IDatabaseService),
      monitor: container.get<IMonitorService>(TYPES.IMonitorService),
      alerting: container.get<IAlertingService>(TYPES.IAlertingService),
      notification: container.get<INotificationService>(
        TYPES.INotificationService
      ),
      auth: container.get<IAuthService>(TYPES.IAuthService),
    },
    repositories: {
      user: container.get<IUserRepository>(TYPES.IUserRepository),
      monitoringTarget: container.get<IMonitoringTargetRepository>(
        TYPES.IMonitoringTargetRepository
      ),
      speedTestResult: container.get<ISpeedTestResultRepository>(
        TYPES.ISpeedTestResultRepository
      ),
      alertRule: container.get<IAlertRuleRepository>(
        TYPES.IAlertRuleRepository
      ),
      incidentEvent: container.get<IIncidentEventRepository>(
        TYPES.IIncidentEventRepository
      ),
      pushSubscription: container.get<IPushSubscriptionRepository>(
        TYPES.IPushSubscriptionRepository
      ),
      notification: container.get<INotificationRepository>(
        TYPES.INotificationRepository
      ),
      // Legacy repositories
      target: container.get<ITargetRepository>(TYPES.ITargetRepository),
      speedTest: container.get<ISpeedTestRepository>(
        TYPES.ISpeedTestRepository
      ),
    },
  };
}

// Auto-initialize container when this module is imported
if (typeof window === "undefined") {
  // Only initialize on server side
  initializeContainer().catch(error => {
    // Use console here as logger may not be initialized yet
    // eslint-disable-next-line no-console
    console.error("Failed to initialize container:", error);
  });
}
