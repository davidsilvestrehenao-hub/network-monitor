// Import all interface types from shared package
import type {
  // Database interfaces
  IDatabaseService,

  // Logger interfaces
  ILogger,

  // Repository interfaces
  IUserRepository,
  IMonitoringTargetRepository,
  ISpeedTestResultRepository,
  IAlertRuleRepository,
  IIncidentEventRepository,
  IPushSubscriptionRepository,
  INotificationRepository,
  IUserSpeedTestPreferenceRepository,
  ISpeedTestUrlRepository,
  ITargetRepository,
  ISpeedTestRepository,

  // Service interfaces
  IMonitorService,
  IAlertingService,
  INotificationService,
  IAuthService,

  // Infrastructure interfaces
  IEventBus,
} from "@network-monitor/shared";

// Service type identifiers (simplified flat structure)
export const TYPES = {
  // Database
  IDatabaseService: Symbol("IDatabaseService"),

  // Loggers
  ILogger: Symbol("ILogger"),

  // Repositories
  IUserRepository: Symbol("IUserRepository"),
  IMonitoringTargetRepository: Symbol("IMonitoringTargetRepository"),
  ISpeedTestResultRepository: Symbol("ISpeedTestResultRepository"),
  IAlertRuleRepository: Symbol("IAlertRuleRepository"),
  IIncidentEventRepository: Symbol("IIncidentEventRepository"),
  IPushSubscriptionRepository: Symbol("IPushSubscriptionRepository"),
  INotificationRepository: Symbol("INotificationRepository"),
  IUserSpeedTestPreferenceRepository: Symbol(
    "IUserSpeedTestPreferenceRepository"
  ),
  ISpeedTestUrlRepository: Symbol("ISpeedTestUrlRepository"),
  ITargetRepository: Symbol("ITargetRepository"),
  ISpeedTestRepository: Symbol("ISpeedTestRepository"),

  // Services
  IMonitorService: Symbol("IMonitorService"),
  IAlertingService: Symbol("IAlertingService"),
  INotificationService: Symbol("INotificationService"),
  IAuthService: Symbol("IAuthService"),

  // Infrastructure
  IEventBus: Symbol("IEventBus"),
} as const;

// Strongly typed service factory
export type ServiceFactory<T> = (container: Container) => T;

// Strongly typed service configuration
export interface ServiceConfig<T = unknown> {
  factory: ServiceFactory<T>;
  dependencies: symbol[];
  singleton: boolean;
  description: string;
}

// Strongly typed container interface
export interface Container {
  register<T>(key: symbol, config: ServiceConfig<T>): void;
  get<T>(key: symbol): T;
  has(key: symbol): boolean;
  getRegisteredTypes(): symbol[];
  initialize(): Promise<void>;
}

export type ServiceRegistry = Map<symbol, ServiceConfig>;

// AppContext type for tRPC and API usage
export interface AppContext {
  userId: string | null;
  services: {
    logger: ILogger | null;
    eventBus: IEventBus | null;
    database: IDatabaseService | null;
    monitor: IMonitorService | null;
    alerting: IAlertingService | null;
    notification: INotificationService | null;
    auth: IAuthService | null;
    speedTestConfigService: ISpeedTestUrlRepository | null;
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
}
