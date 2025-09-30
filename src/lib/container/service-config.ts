import { TYPES } from "./types";
import { createServiceFactory } from "./flexible-container";
import { LogLevel } from "../services/concrete/LoggerService";
import { WinstonLoggerService } from "../services/concrete/WinstonLoggerService";
import { EventBus } from "../services/concrete/EventBus";
import { DatabaseService } from "../services/concrete/DatabaseService";
import { UserRepository } from "../services/concrete/UserRepository";
import { MonitoringTargetRepository } from "../services/concrete/MonitoringTargetRepository";
import { SpeedTestResultRepository } from "../services/concrete/SpeedTestResultRepository";
import { AlertRuleRepository } from "../services/concrete/AlertRuleRepository";
import { IncidentEventRepository } from "../services/concrete/IncidentEventRepository";
import { PushSubscriptionRepository } from "../services/concrete/PushSubscriptionRepository";
import { NotificationRepository } from "../services/concrete/NotificationRepository";
import { TargetRepository } from "../services/concrete/TargetRepository";
import { SpeedTestRepository } from "../services/concrete/SpeedTestRepository";
import { MonitorService } from "../services/concrete/MonitorService";
import { SpeedTestService } from "../services/concrete/SpeedTestService";
import { SpeedTestConfigService } from "../services/concrete/SpeedTestConfigService";
import { AlertingService } from "../services/concrete/AlertingService";
import { NotificationService } from "../services/concrete/NotificationService";
import { AuthService } from "../services/concrete/AuthService";
import type { ILogger } from "../services/interfaces/ILogger";
import type { IEventBus } from "../services/interfaces/IEventBus";
import type { IDatabaseService } from "../services/interfaces/IDatabaseService";
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
import type { ISpeedTestService } from "../services/interfaces/ISpeedTestService";
import type { ISpeedTestConfigService } from "../services/interfaces/ISpeedTestConfig";
import type { IAlertingService } from "../services/interfaces/IAlertingService";
import type { INotificationService } from "../services/interfaces/INotificationService";
import type { IAuthService } from "../services/interfaces/IAuthService";

export const baseServiceConfig = {
  // Core services
  [TYPES.ILogger]: {
    factory: createServiceFactory<ILogger>(
      () => new WinstonLoggerService(LogLevel.DEBUG)
    ),
    dependencies: [],
    singleton: true,
    description: "Winston logger service for application logging",
  },

  [TYPES.IEventBus]: {
    factory: createServiceFactory<IEventBus>(() => new EventBus()),
    dependencies: [],
    singleton: true,
    description: "Event bus for inter-service communication",
  },

  [TYPES.IDatabaseService]: {
    factory: createServiceFactory<IDatabaseService>(
      container => new DatabaseService(container.get<ILogger>(TYPES.ILogger))
    ),
    dependencies: [TYPES.ILogger],
    singleton: true,
    description: "Database service for Prisma client management",
  },

  // Repositories
  [TYPES.IUserRepository]: {
    factory: createServiceFactory<IUserRepository>(
      container =>
        new UserRepository(
          container.get<IDatabaseService>(TYPES.IDatabaseService),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [TYPES.IDatabaseService, TYPES.ILogger],
    singleton: true,
    description: "User repository for database operations",
  },

  [TYPES.IMonitoringTargetRepository]: {
    factory: createServiceFactory<IMonitoringTargetRepository>(
      container =>
        new MonitoringTargetRepository(
          container.get<IDatabaseService>(TYPES.IDatabaseService),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [TYPES.IDatabaseService, TYPES.ILogger],
    singleton: true,
    description: "Monitoring target repository for database operations",
  },

  [TYPES.ISpeedTestResultRepository]: {
    factory: createServiceFactory<ISpeedTestResultRepository>(
      container =>
        new SpeedTestResultRepository(
          container.get<IDatabaseService>(TYPES.IDatabaseService),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [TYPES.IDatabaseService, TYPES.ILogger],
    singleton: true,
    description: "Speed test result repository for database operations",
  },

  [TYPES.IAlertRuleRepository]: {
    factory: createServiceFactory<IAlertRuleRepository>(
      container =>
        new AlertRuleRepository(
          container.get<IDatabaseService>(TYPES.IDatabaseService),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [TYPES.IDatabaseService, TYPES.ILogger],
    singleton: true,
    description: "Alert rule repository for database operations",
  },

  [TYPES.IIncidentEventRepository]: {
    factory: createServiceFactory<IIncidentEventRepository>(
      container =>
        new IncidentEventRepository(
          container.get<IDatabaseService>(TYPES.IDatabaseService),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [TYPES.IDatabaseService, TYPES.ILogger],
    singleton: true,
    description: "Incident event repository for database operations",
  },

  [TYPES.IPushSubscriptionRepository]: {
    factory: createServiceFactory<IPushSubscriptionRepository>(
      container =>
        new PushSubscriptionRepository(
          container.get<IDatabaseService>(TYPES.IDatabaseService),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [TYPES.IDatabaseService, TYPES.ILogger],
    singleton: true,
    description: "Push subscription repository for database operations",
  },

  [TYPES.INotificationRepository]: {
    factory: createServiceFactory<INotificationRepository>(
      container =>
        new NotificationRepository(
          container.get<IDatabaseService>(TYPES.IDatabaseService),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [TYPES.IDatabaseService, TYPES.ILogger],
    singleton: true,
    description: "Notification repository for database operations",
  },

  // Legacy repositories (for backward compatibility)
  [TYPES.ITargetRepository]: {
    factory: createServiceFactory<ITargetRepository>(
      container =>
        new TargetRepository(
          container.get<IDatabaseService>(TYPES.IDatabaseService),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [TYPES.IDatabaseService, TYPES.ILogger],
    singleton: true,
    description: "Target repository for database operations (legacy)",
  },

  [TYPES.ISpeedTestRepository]: {
    factory: createServiceFactory<ISpeedTestRepository>(
      container =>
        new SpeedTestRepository(
          container.get<IDatabaseService>(TYPES.IDatabaseService),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [TYPES.IDatabaseService, TYPES.ILogger],
    singleton: true,
    description: "Speed test repository for database operations (legacy)",
  },

  // Business services
  [TYPES.IMonitorService]: {
    factory: createServiceFactory<IMonitorService>(
      container =>
        new MonitorService(
          container.get<ITargetRepository>(TYPES.ITargetRepository),
          container.get<ISpeedTestRepository>(TYPES.ISpeedTestRepository),
          container.get<IMonitoringTargetRepository>(
            TYPES.IMonitoringTargetRepository
          ),
          container.get<ISpeedTestResultRepository>(
            TYPES.ISpeedTestResultRepository
          ),
          container.get<IEventBus>(TYPES.IEventBus),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [
      TYPES.ITargetRepository,
      TYPES.ISpeedTestRepository,
      TYPES.IMonitoringTargetRepository,
      TYPES.ISpeedTestResultRepository,
      TYPES.IEventBus,
      TYPES.ILogger,
    ],
    singleton: true,
    description: "Monitor service for target management and monitoring",
  },

  [TYPES.ISpeedTestConfigService]: {
    factory: createServiceFactory<ISpeedTestConfigService>(
      container =>
        new SpeedTestConfigService(container.get<ILogger>(TYPES.ILogger))
    ),
    dependencies: [TYPES.ILogger],
    singleton: true,
    description:
      "Speed test URL configuration service for managing test URLs and providers",
  },

  [TYPES.ISpeedTestService]: {
    factory: createServiceFactory<ISpeedTestService>(
      container =>
        new SpeedTestService(
          container.get<ISpeedTestRepository>(TYPES.ISpeedTestRepository),
          container.get<ITargetRepository>(TYPES.ITargetRepository),
          container.get<IEventBus>(TYPES.IEventBus),
          container.get<ILogger>(TYPES.ILogger),
          container.get<ISpeedTestConfigService>(TYPES.ISpeedTestConfigService)
        )
    ),
    dependencies: [
      TYPES.ISpeedTestRepository,
      TYPES.ITargetRepository,
      TYPES.IEventBus,
      TYPES.ILogger,
      TYPES.ISpeedTestConfigService,
    ],
    singleton: true,
    description:
      "Speed test service for continuous monitoring and performance testing",
  },

  [TYPES.IAlertingService]: {
    factory: createServiceFactory<IAlertingService>(
      container =>
        new AlertingService(
          container.get<IAlertRuleRepository>(TYPES.IAlertRuleRepository),
          container.get<IIncidentEventRepository>(
            TYPES.IIncidentEventRepository
          ),
          container.get<IEventBus>(TYPES.IEventBus),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [
      TYPES.IAlertRuleRepository,
      TYPES.IIncidentEventRepository,
      TYPES.IEventBus,
      TYPES.ILogger,
    ],
    singleton: true,
    description:
      "Alerting service for alert rule management and incident handling",
  },

  [TYPES.INotificationService]: {
    factory: createServiceFactory<INotificationService>(
      container =>
        new NotificationService(
          container.get<INotificationRepository>(TYPES.INotificationRepository),
          container.get<IPushSubscriptionRepository>(
            TYPES.IPushSubscriptionRepository
          ),
          container.get<IEventBus>(TYPES.IEventBus),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [
      TYPES.INotificationRepository,
      TYPES.IPushSubscriptionRepository,
      TYPES.IEventBus,
      TYPES.ILogger,
    ],
    singleton: true,
    description:
      "Notification service for push notifications and in-app notifications",
  },

  [TYPES.IAuthService]: {
    factory: createServiceFactory<IAuthService>(
      container =>
        new AuthService(
          container.get<IUserRepository>(TYPES.IUserRepository),
          container.get<IEventBus>(TYPES.IEventBus),
          container.get<ILogger>(TYPES.ILogger)
        )
    ),
    dependencies: [TYPES.IUserRepository, TYPES.IEventBus, TYPES.ILogger],
    singleton: true,
    description:
      "Authentication service for user management and session handling",
  },
};
