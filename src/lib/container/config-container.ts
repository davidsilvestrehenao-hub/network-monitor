import { getContainer } from "./container-instance";
import { ConfigLoader } from "./config-loader";
import type { ServiceConfig } from "./types";
import { TYPES } from "./types";
import type { ILogger } from "../services/interfaces/ILogger";
import type { IEventBus } from "../services/interfaces/IEventBus";
import type { IMonitorService } from "../services/interfaces/IMonitorService";
import type { IAlertingService } from "../services/interfaces/IAlertingService";
import type { INotificationService } from "../services/interfaces/INotificationService";
import type { IAuthService } from "../services/interfaces/IAuthService";
import type { IUserRepository } from "../services/interfaces/IUserRepository";
import type { IMonitoringTargetRepository } from "../services/interfaces/IMonitoringTargetRepository";
import type { ISpeedTestResultRepository } from "../services/interfaces/ISpeedTestResultRepository";
import type { IAlertRuleRepository } from "../services/interfaces/IAlertRuleRepository";
import type { IIncidentEventRepository } from "../services/interfaces/IIncidentEventRepository";
import type { IPushSubscriptionRepository } from "../services/interfaces/IPushSubscriptionRepository";
import type { INotificationRepository } from "../services/interfaces/INotificationRepository";
import type { ITargetRepository } from "../services/interfaces/ITargetRepository";
import type { ISpeedTestRepository } from "../services/interfaces/ISpeedTestRepository";
import type { IDatabaseService } from "../services/interfaces/IDatabaseService";

export async function initializeConfigContainer(): Promise<void> {
  const loader = new ConfigLoader();
  const serviceConfig = await loader.convertToServiceConfig();

  const container = getContainer();

  for (const key in serviceConfig) {
    const symbolKey = key as unknown as symbol;
    container.register(symbolKey, serviceConfig[symbolKey] as ServiceConfig);
  }

  await container.initialize();

  const databaseService = container.get<IDatabaseService>(
    TYPES.IDatabaseService
  );
  if (databaseService) {
    await databaseService.connect();
  }
}

export async function getConfigAppContext() {
  const container = getContainer();

  return {
    services: {
      logger: container.get<ILogger>(TYPES.ILogger),
      eventBus: container.get<IEventBus>(TYPES.IEventBus),
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
      target: container.get<ITargetRepository>(TYPES.ITargetRepository),
      speedTest: container.get<ISpeedTestRepository>(
        TYPES.ISpeedTestRepository
      ),
    },
  };
}
