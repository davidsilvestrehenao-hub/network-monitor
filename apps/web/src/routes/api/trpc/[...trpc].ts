import { type APIEvent } from "@solidjs/start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/trpc/router";
import type { AppContext } from "@network-monitor/infrastructure";
import { bootstrapMicroservice } from "@network-monitor/infrastructure";
import type {
  IAlertingService,
  IAuthService,
  IDatabaseService,
  IEventBus,
  IIncidentEventRepository,
  IMonitoringTargetRepository,
  IMonitorService,
  INotificationRepository,
  INotificationService,
  IPushSubscriptionRepository,
  ISpeedTestRepository,
  ISpeedTestResultRepository,
  ISpeedTestUrlRepository,
  ITargetRepository,
  IUserRepository,
  IUserSpeedTestPreferenceRepository,
  ILogger,
  IAlertRuleRepository,
} from "@network-monitor/shared";

let bootstrapPromise: Promise<{
  logger: ILogger;
  eventBus: IEventBus;
  database: IDatabaseService | null;
  services: Record<string, unknown>;
  repositories: Record<string, unknown>;
}> | null = null;

async function getWiredContext(): Promise<AppContext> {
  if (!bootstrapPromise) {
    const wiringConfig =
      process.env.SERVICE_WIRING_CONFIG ||
      process.env.NODE_ENV ||
      "development";
    const configPath = `service-wiring/${wiringConfig}.json`;

    // Justification: Bootstrap logging is necessary for debugging service initialization
    // eslint-disable-next-line no-console
    console.log(`[Web App] Bootstrapping with config: ${configPath}`);

    try {
      bootstrapPromise = bootstrapMicroservice({
        applicationName: "Web App (tRPC)",
        configPath,
        showBanner: false,
      });
    } catch (error) {
      // Justification: Error logging is necessary for debugging service initialization failures
      // eslint-disable-next-line no-console
      console.error(`[Web App] Bootstrap error:`, error);
      throw error;
    }
  }

  const ctx = await bootstrapPromise;

  return {
    userId: null,
    services: {
      logger: (ctx.logger as ILogger) ?? null,
      eventBus: (ctx.eventBus as IEventBus) ?? null,
      database: (ctx.database as IDatabaseService | null) ?? null,
      monitor: (ctx.services["monitor"] as IMonitorService | null) ?? null,
      alerting: (ctx.services["alerting"] as IAlertingService | null) ?? null,
      notification:
        (ctx.services["notification"] as INotificationService | null) ?? null,
      auth: (ctx.services["auth"] as IAuthService | null) ?? null,
      speedTestConfigService:
        (ctx.services[
          "speedTestConfigService"
        ] as ISpeedTestUrlRepository | null) ?? null,
    },
    repositories: {
      user: (ctx.repositories["user"] as IUserRepository | null) ?? null,
      monitoringTarget:
        (ctx.repositories[
          "monitoringTarget"
        ] as IMonitoringTargetRepository | null) ?? null,
      speedTestResult:
        (ctx.repositories[
          "speedTestResult"
        ] as ISpeedTestResultRepository | null) ?? null,
      alertRule:
        (ctx.repositories["alertRule"] as IAlertRuleRepository | null) ?? null,
      incidentEvent:
        (ctx.repositories[
          "incidentEvent"
        ] as IIncidentEventRepository | null) ?? null,
      notification:
        (ctx.repositories["notification"] as INotificationRepository | null) ??
        null,
      pushSubscription:
        (ctx.repositories[
          "pushSubscription"
        ] as IPushSubscriptionRepository | null) ?? null,
      userSpeedTestPreference:
        (ctx.repositories[
          "userSpeedTestPreference"
        ] as IUserSpeedTestPreferenceRepository | null) ?? null,
      // Legacy repositories
      target: (ctx.repositories["target"] as ITargetRepository | null) ?? null,
      speedTest:
        (ctx.repositories["speedTest"] as ISpeedTestRepository | null) ?? null,
    },
  };
}

const handler = (event: APIEvent) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: event.request,
    router: appRouter,
    createContext: async (): Promise<AppContext> => {
      return getWiredContext();
    },
  });

export const GET = handler;
export const POST = handler;
export { getWiredContext };
