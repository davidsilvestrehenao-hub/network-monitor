import { getContainer } from "./flexible-container.js";
import { TYPES } from "./types.js";
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
  IUserSpeedTestPreferenceRepository,
  ISpeedTestConfigService,
} from "@network-monitor/shared";
import {
  getJsonAppContext,
  initializeJsonContainer,
} from "./json-container.js";
import { getBrowserAppContext } from "./container.browser.js";
// Justification: Dynamic import of fs module to avoid browser compatibility issues
// Justification: Dynamic import of path module to avoid browser compatibility issues

import { initializeBrowserContainer } from "./container.browser.js";

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
    const jsonConfigPath = join(cwd, "service-wiring/development.json");
    const { existsSync } = await import("fs");
    if (existsSync(jsonConfigPath)) {
      try {
        // Use JSON configuration
        await initializeJsonContainer();
        containerInitialized = true;
        return;
      } catch (error) {
        // Justification: Console usage for fallback error handling when JSON config fails
        // eslint-disable-next-line no-console
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
    "Service configuration not found. Please ensure service-wiring/development.json exists in the project root."
  );
}

export type AppContext = {
  userId: string | null;
  services: {
    logger: ILogger | null;
    eventBus: IEventBus | null;
    database: IDatabaseService | null;
    monitor: IMonitorService | null;
    alerting: IAlertingService | null;
    notification: INotificationService | null;
    auth: IAuthService | null;
    speedTestConfigService: ISpeedTestConfigService | null;
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
    userSpeedTestPreference: IUserSpeedTestPreferenceRepository | null;
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
    const jsonConfigPath = join(cwd, "service-wiring/development.json");
    const { existsSync } = await import("fs");
    if (existsSync(jsonConfigPath)) {
      try {
        return await getJsonAppContext();
      } catch (error) {
        // Justification: Console usage for fallback error handling when JSON app context fails
        // eslint-disable-next-line no-console
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
    userId: null,
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
      speedTestConfigService: container.has(TYPES.ISpeedTestConfigService)
        ? container.get<ISpeedTestConfigService>(TYPES.ISpeedTestConfigService)
        : null,
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
      userSpeedTestPreference:
        container.get<IUserSpeedTestPreferenceRepository>(
          TYPES.IUserSpeedTestPreferenceRepository
        ),
    },
  };
}

// Auto-initialize container when this module is imported
// Only if not using bootstrapMicroservice (which handles its own initialization)
// Skip auto-initialization in web app context (SolidStart/Vite)
if (
  typeof window === "undefined" &&
  process.env.SKIP_AUTO_INIT !== "true" &&
  !process.env.NODE_ENV?.includes("web") &&
  !process.env.VITE
) {
  // Only initialize on server side
  initializeContainer().catch(error => {
    // Use console here as logger may not be initialized yet
    // eslint-disable-next-line no-console
    console.error("Failed to initialize container:", error);
  });
}
