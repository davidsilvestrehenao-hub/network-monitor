import { getContainer } from "./flexible-container";
import { baseServiceConfig } from "./service-config";
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
import { initializeJsonContainer, getJsonAppContext } from "./json-container";
import { existsSync } from "fs";
import { join } from "path";

let containerInitialized = false;

export async function initializeContainer(): Promise<void> {
  if (containerInitialized) {
    return;
  }

  // Check if JSON configuration exists
  const jsonConfigPath = join(process.cwd(), "service-config.json");

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

  // Fallback to hardcoded configuration
  console.log("📋 Using hardcoded service configuration");
  const container = getContainer();

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

export async function getAppContext() {
  // Check if JSON configuration exists and use it
  const jsonConfigPath = join(process.cwd(), "service-config.json");

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

  // Fallback to hardcoded configuration
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
  initializeContainer().catch(console.error);
}
