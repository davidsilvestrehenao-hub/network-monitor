import { getContainer } from "./flexible-container";
import type { ServiceConfig } from "./types";
import { TYPES } from "./types";
import type {
  IDatabaseService,
  ILogger,
  IEventBus,
  IUserRepository,
  IMonitoringTargetRepository,
  ISpeedTestResultRepository,
  IAlertRuleRepository,
  IIncidentEventRepository,
  IPushSubscriptionRepository,
  INotificationRepository,
  ITargetRepository,
  ISpeedTestRepository,
  IMonitorService,
  IAlertingService,
  INotificationService,
  IAuthService,
} from "@network-monitor/shared";
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

  // Fallback: Throw error if JSON config not found
  // Justification: Console usage in container initialization for critical system setup logging
  // eslint-disable-next-line no-console
  console.error("❌ No service configuration found! JSON config is required.");
  throw new Error(
    "Service configuration not found. Please ensure service-config.json exists in the project root."
  );
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
