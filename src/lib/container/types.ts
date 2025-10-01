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

export type ServiceConfigMap = Record<string, ServiceConfig>;

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

export interface AppContext {
  services: {
    logger: ILogger;
    eventBus: IEventBus;
    monitor: IMonitorService;
    alerting: IAlertingService;
    notification: INotificationService;
    auth: IAuthService;
  };
  repositories?: {
    user: IUserRepository;
    monitoringTarget: IMonitoringTargetRepository;
    speedTestResult: ISpeedTestResultRepository;
    alertRule: IAlertRuleRepository;
    incidentEvent: IIncidentEventRepository;
    pushSubscription: IPushSubscriptionRepository;
    notification: INotificationRepository;
    target: ITargetRepository;
    speedTest: ISpeedTestRepository;
  };
}
