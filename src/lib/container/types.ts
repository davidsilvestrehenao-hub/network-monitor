// Service type identifiers
export const TYPES = {
  // Core services
  ILogger: Symbol("ILogger"),
  IEventBus: Symbol("IEventBus"),
  IDatabaseService: Symbol("IDatabaseService"),

  // Business services
  IMonitorService: Symbol("IMonitorService"),
  ISpeedTestService: Symbol("ISpeedTestService"),
  ISpeedTestConfigService: Symbol("ISpeedTestConfigService"),
  IAlertingService: Symbol("IAlertingService"),
  INotificationService: Symbol("INotificationService"),
  IAuthService: Symbol("IAuthService"),

  // Repositories
  IUserRepository: Symbol("IUserRepository"),
  IMonitoringTargetRepository: Symbol("IMonitoringTargetRepository"),
  ISpeedTestResultRepository: Symbol("ISpeedTestResultRepository"),
  IAlertRuleRepository: Symbol("IAlertRuleRepository"),
  IIncidentEventRepository: Symbol("IIncidentEventRepository"),
  IPushSubscriptionRepository: Symbol("IPushSubscriptionRepository"),
  INotificationRepository: Symbol("INotificationRepository"),

  // Legacy repository (for backward compatibility)
  ITargetRepository: Symbol("ITargetRepository"),
  ISpeedTestRepository: Symbol("ISpeedTestRepository"),

  // Frontend services
  IAPIClient: Symbol("IAPIClient"),
  ICommandQueryService: Symbol("ICommandQueryService"),
  IPerformanceMonitor: Symbol("IPerformanceMonitor"),
  ICacheManager: Symbol("ICacheManager"),
  IPWAService: Symbol("IPWAService"),
} as const;

// Service factory type
export type ServiceFactory<T> = (container: Container) => T;

// Service configuration
export interface ServiceConfig {
  factory: ServiceFactory<unknown>;
  dependencies: symbol[];
  singleton: boolean;
  description: string;
}

// Container interface
export interface Container {
  register(key: symbol, config: ServiceConfig): void;
  get<T>(key: symbol): T;
  has(key: symbol): boolean;
  getRegisteredTypes(): symbol[];
  initialize(): Promise<void>;
}

// Service registry type
export type ServiceRegistry = Map<symbol, ServiceConfig>;
