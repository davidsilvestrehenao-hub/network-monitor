import { getContainer } from "./flexible-container";
import type { ServiceConfig } from "./types";
import { TYPES } from "./types";
import type {
  ILogger,
  IEventBus,
  ISpeedTestConfigService,
} from "@network-monitor/shared";
import { browserServiceConfig } from "./service-config.browser";

let containerInitialized = false;

export async function initializeBrowserContainer(): Promise<void> {
  if (containerInitialized) {
    return;
  }

  const container = getContainer();

  // Register all services from browserServiceConfig
  for (const symbolKey of Object.getOwnPropertySymbols(browserServiceConfig)) {
    container.register(
      symbolKey,
      browserServiceConfig[
        symbolKey as keyof typeof browserServiceConfig
      ] as ServiceConfig
    );
  }

  // Initialize container
  await container.initialize();

  containerInitialized = true;
}

export async function getBrowserAppContext() {
  if (!containerInitialized) {
    await initializeBrowserContainer();
  }
  const container = getContainer();

  return {
    userId: null,
    services: {
      logger: container.get<ILogger>(TYPES.ILogger),
      eventBus: container.get<IEventBus>(TYPES.IEventBus),
      database: null,
      monitor: null,
      alerting: null,
      notification: null,
      auth: null,
      speedTestConfigService: container.has(TYPES.ISpeedTestConfigService)
        ? (container.get(
            TYPES.ISpeedTestConfigService
          ) as ISpeedTestConfigService)
        : null,
    },
    repositories: {
      user: null,
      monitoringTarget: null,
      speedTestResult: null,
      alertRule: null,
      incidentEvent: null,
      pushSubscription: null,
      notification: null,
      target: null,
      speedTest: null,
      userSpeedTestPreference: null,
    },
  };
}
