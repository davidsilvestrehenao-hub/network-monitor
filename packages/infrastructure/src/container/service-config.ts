import { TYPES } from "./types";
import { createServiceFactory } from "./flexible-container";
import { LoggerService } from "../services/concrete/LoggerService";
import { LogLevel } from "../services/concrete/LoggerService";
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
import { MockSpeedTestService } from "../services/mocks/MockSpeedTestService";
import { SpeedTestConfigService } from "../services/concrete/SpeedTestConfigService";
import { AlertingService } from "../services/concrete/AlertingService";
import { NotificationService } from "../services/concrete/NotificationService";
import { AuthService } from "../services/concrete/AuthService";
import type { ILogger } from "@network-monitor/shared"ILogger";
import type { IEventBus } from "@network-monitor/shared"IEventBus";
import type { IDatabaseService } from "@network-monitor/shared"IDatabaseService";
import type { IUserRepository } from "@network-monitor/shared"IUserRepository";
import type { IMonitoringTargetRepository } from "@network-monitor/shared"IMonitoringTargetRepository";
import type { ISpeedTestResultRepository } from "@network-monitor/shared"ISpeedTestResultRepository";
import type { IAlertRuleRepository } from "@network-monitor/shared"IAlertRuleRepository";
import type { IIncidentEventRepository } from "@network-monitor/shared"IIncidentEventRepository";
import type { IPushSubscriptionRepository } from "@network-monitor/shared"IPushSubscriptionRepository";
import type { INotificationRepository } from "@network-monitor/shared"INotificationRepository";
import type { ITargetRepository } from "@network-monitor/shared"ITargetRepository";
import type { ISpeedTestRepository } from "@network-monitor/shared"ISpeedTestRepository";
import type { IMonitorService } from "@network-monitor/shared"IMonitorService";
import type { ISpeedTestService } from "@network-monitor/shared"ISpeedTestService";
import type { ISpeedTestConfigService } from "@network-monitor/shared"ISpeedTestConfig";
import type { IAlertingService } from "@network-monitor/shared"IAlertingService";
import type { INotificationService } from "@network-monitor/shared"INotificationService";
import type { IAuthService } from "@network-monitor/shared"IAuthService";

export const baseServiceConfig = {
  // Core services
  [TYPES.ILogger]: {
    factory: createServiceFactory<ILogger>(
      () => new LoggerService(LogLevel.DEBUG)
    ),
    dependencies: [],
    singleton: true,
    description: "Console logger service for application logging",
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
        new MockSpeedTestService(
          container.get<ILogger>(TYPES.ILogger),
          container.get<ISpeedTestConfigService>(TYPES.ISpeedTestConfigService)
        )
    ),
    dependencies: [
      TYPES.ILogger,
      TYPES.ISpeedTestConfigService,
    ],
    singleton: true,
    description:
      "Mock speed test service for browser environment",
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
