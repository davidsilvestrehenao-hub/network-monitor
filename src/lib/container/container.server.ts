import { getContainer } from "./container-instance";
import type { ServiceConfig } from "./types";
import { TYPES } from "./types";
import type { IDatabaseService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";
import type { IEventBus } from "@network-monitor/shared";
import type { IUserRepository } from "@network-monitor/shared";
import type { IMonitoringTargetRepository } from "@network-monitor/shared";
import type { ISpeedTestResultRepository } from "@network-monitor/shared";
import type { IAlertRuleRepository } from "@network-monitor/shared";
import type { IIncidentEventRepository } from "@network-monitor/shared";
import type { IPushSubscriptionRepository } from "@network-monitor/shared";
import type { INotificationRepository } from "@network-monitor/shared";
import type { ITargetRepository } from "@network-monitor/shared";
import type { ISpeedTestRepository } from "@network-monitor/shared";
import type { IMonitorService } from "@network-monitor/shared";
import type { IAlertingService } from "@network-monitor/shared";
import type { INotificationService } from "@network-monitor/shared";
import type { IAuthService } from "@network-monitor/shared";
import {
  getConfigAppContext,
  initializeConfigContainer,
} from "./config-container";

let containerInitialized = false;

export async function initializeContainer(): Promise<void> {
  if (containerInitialized) {
    return;
  }

  try {
    await initializeConfigContainer();
    containerInitialized = true;
  } catch (error) {
    console.error("Failed to initialize container:", error);
    throw error;
  }
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

export async function getServerAppContext(): Promise<AppContext> {
  if (!containerInitialized) {
    await initializeContainer();
  }
  return getConfigAppContext();
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
