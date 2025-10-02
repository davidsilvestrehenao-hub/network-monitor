import { beforeEach, afterEach, vi, expect } from "vitest";
import type { EventHandler, Event } from "../interfaces/base/IEventBus";
import type { EventMap } from "../types/event-map-types";
import {
  FlexibleContainer,
  // Justification: setContainer is exported for use by test files that import this setup utility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setContainer,
  TYPES,
} from "@network-monitor/infrastructure";
import type { Container } from "@network-monitor/infrastructure";
import type {
  // Target imported from standardized-domain-types below
  // Justification: These Create*Data types are exported for use by test files that import this setup utility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateTargetData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateSpeedTestResultData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateAlertRuleData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateIncidentEventData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateNotificationData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreatePushSubscriptionData,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateUserData,
} from "../interfaces/index.js";
import type {
  Target,
  SpeedTestResult,
  AlertRule,
  IncidentEvent,
  Notification,
  PushSubscription,
  User,
} from "../types/standardized-domain-types.js";
import type {
  MockLogger,
  MockEventBus,
  MockDatabaseService,
  MockTargetRepository,
  MockSpeedTestResultRepository,
  MockSpeedTestRepository,
  MockMonitoringTargetRepository,
  MockAlertRuleRepository,
  MockIncidentEventRepository,
  MockNotificationRepository,
  MockPushSubscriptionRepository,
  MockUserRepository,
  MockUserSpeedTestPreferenceRepository,
} from "../types/test-mock-interfaces.js";
import {
  SpeedTestStatus,
  MonitoringMetrics,
  AlertConditions,
  IncidentTypes,
} from "../constants/domain-constants";
import { EntityStatus } from "../interfaces/base/IBaseEntity";

// Global test container
// Justification: testContainer is exported for use by test files that import this setup utility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let testContainer: Container;

// Mock implementations
export function createMockLogger(): MockLogger {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
    setLevel: vi.fn(),
    getLevel: vi.fn(() => "debug"),
    isLevelEnabled: vi.fn(() => true),
    setContext: vi.fn(),
    getContext: vi.fn(() => ({})),
    child: vi.fn(() => createMockLogger()),
  };
}

export function createMockEventBus(): MockEventBus {
  const listeners = new Map<string, Set<EventHandler>>();

  const onImpl = <T = unknown>(event: string, listener: EventHandler<T>) => {
    if (!listeners.has(event)) {
      listeners.set(event, new Set());
    }
    listeners.get(event)!.add(listener as EventHandler);
  };

  const offImpl = <T = unknown>(event: string, listener: EventHandler<T>) => {
    const eventListeners = listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(listener as EventHandler);
    }
  };

  const emitImpl = <T = unknown>(event: string, data?: T) => {
    const eventListeners = listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(async listener => {
        try {
          const result = listener(data);
          if (result instanceof Promise) {
            await result.catch(error => {
              // Justification: Console logging is appropriate in test utilities for debugging
              // eslint-disable-next-line no-console
              console.error(
                `Async error in event handler for ${event}:`,
                error
              );
            });
          }
        } catch (error) {
          // Justification: Console logging is appropriate in test utilities for debugging
          // eslint-disable-next-line no-console
          console.error(`Sync error in event handler for ${event}:`, error);
        }
      });
    }
  };

  const emitAsyncImpl = async <T = unknown>(event: string, data?: T) => {
    const eventListeners = listeners.get(event);
    if (eventListeners) {
      const promises = Array.from(eventListeners).map(async listener => {
        try {
          const result = listener(data);
          if (result instanceof Promise) {
            await result;
          }
        } catch (error) {
          // Justification: Console logging is appropriate in test utilities for debugging
          // eslint-disable-next-line no-console
          console.error(`Error in async event handler for ${event}:`, error);
        }
      });
      await Promise.all(promises);
    }
  };

  const mockEventBus = {
    // Strongly-typed event methods (preferred)
    on: vi.fn().mockImplementation(onImpl),
    once: vi
      .fn()
      .mockImplementation(
        <T = unknown>(event: string, listener: EventHandler<T>) => {
          const onceListener = (data?: T) => {
            listener(data);
            mockEventBus.off(event, onceListener as EventHandler<unknown>);
          };
          mockEventBus.on(event, onceListener as EventHandler<unknown>);
        }
      ),
    off: vi.fn().mockImplementation(offImpl),
    emit: vi.fn().mockImplementation(emitImpl),
    emitAsync: vi.fn().mockImplementation(emitAsyncImpl),

    // Dynamic event methods (for events not in EventMap)
    onDynamic: vi.fn().mockImplementation(onImpl),
    onceDynamic: vi
      .fn()
      .mockImplementation(
        <T = unknown>(event: string, listener: EventHandler<T>) => {
          const onceListener = (data?: T) => {
            listener(data);
            mockEventBus.offDynamic(
              event,
              onceListener as EventHandler<unknown>
            );
          };
          mockEventBus.onDynamic(event, onceListener as EventHandler<unknown>);
        }
      ),
    offDynamic: vi.fn().mockImplementation(offImpl),
    emitDynamic: vi.fn().mockImplementation(emitImpl),
    emitAsyncDynamic: vi.fn().mockImplementation(emitAsyncImpl),

    // Typed event object methods
    publishEvent: vi.fn((event: Event) => {
      mockEventBus.emitDynamic(event.type, event);
    }),
    subscribeToEvent: vi.fn((eventType: string, handler: EventHandler) => {
      mockEventBus.onDynamic(eventType, handler);
    }),

    // Event management
    removeAllListeners: vi.fn((event?: string) => {
      if (event) {
        listeners.delete(event);
      } else {
        listeners.clear();
      }
    }),
    listenerCount: vi.fn((event: string) => {
      return listeners.get(event)?.size || 0;
    }),
    eventNames: vi.fn(() => {
      return Array.from(listeners.keys());
    }),
    getTypedEventNames: vi.fn(() => {
      return Array.from(listeners.keys());
    }),

    // Lifecycle
    connect: vi.fn(async () => {}),
    disconnect: vi.fn(async () => {
      listeners.clear();
    }),
    isConnected: vi.fn(() => true),

    // Event validation
    isValidEventType: (eventType: string): eventType is keyof EventMap => true,
    validateEventData: <T extends keyof EventMap>(
      eventType: T,
      data: unknown
    ): data is EventMap[T] => true,
  };

  return mockEventBus;
}

export function createMockDatabaseService(): MockDatabaseService {
  return {
    getClient: vi.fn(() => ({
      monitoringTarget: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      speedTestResult: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      alertRule: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      incidentEvent: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      pushSubscription: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      notification: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      $transaction: vi.fn(),
    })),
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
}

// Mock repository functions
export function createMockTargetRepository(): MockTargetRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
    findByIdWithRelations: vi.fn(),
    findByUserIdWithRelations: vi.fn(),
    getAllWithRelations: vi.fn(),
  };
}

export function createMockSpeedTestResultRepository(): MockSpeedTestResultRepository {
  return {
    findById: vi.fn(),
    findByTargetId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}

export function createMockSpeedTestRepository(): MockSpeedTestRepository {
  return {
    runSpeedTest: vi.fn(),
  };
}

export function createMockMonitoringTargetRepository(): MockMonitoringTargetRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}

export function createMockAlertRuleRepository(): MockAlertRuleRepository {
  return {
    findById: vi.fn(),
    findByTargetId: vi.fn(),
    findByQuery: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteByTargetId: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
    toggleEnabled: vi.fn(),
  };
}

export function createMockIncidentEventRepository(): MockIncidentEventRepository {
  return {
    findById: vi.fn(),
    findByTargetId: vi.fn(),
    findByQuery: vi.fn(),
    getUnresolvedByTargetId: vi.fn(),
    findUnresolved: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteByTargetId: vi.fn(),
    resolve: vi.fn(),
    resolveByTargetId: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}

export function createMockNotificationRepository(): MockNotificationRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findByQuery: vi.fn(),
    getUnreadByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteByUserId: vi.fn(),
    deleteOldNotifications: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsReadByUserId: vi.fn(),
  };
}

export function createMockPushSubscriptionRepository(): MockPushSubscriptionRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findByEndpoint: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    deleteByUserId: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
    deleteByEndpoint: vi.fn(),
  };
}

export function createMockUserRepository(): MockUserRepository {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}

export function createMockUserSpeedTestPreferenceRepository(): MockUserSpeedTestPreferenceRepository {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}

// Additional mock functions
export function createTestContainer() {
  return new FlexibleContainer();
}

export function registerMockServices(container: Container) {
  // Register common mock services
  container.register(TYPES.ILogger, {
    factory: () => createMockLogger(),
    dependencies: [],
    singleton: true,
    description: "Mock Logger",
  });

  container.register(TYPES.IEventBus, {
    factory: () => createMockEventBus(),
    dependencies: [],
    singleton: true,
    description: "Mock Event Bus",
  });

  container.register(TYPES.IDatabaseService, {
    factory: () => createMockDatabaseService(),
    dependencies: [],
    singleton: true,
    description: "Mock Database Service",
  });
}

// Test data builders
export class TargetBuilder {
  private target: Partial<Target> = {};

  withId(id: string): TargetBuilder {
    this.target.id = id;
    return this;
  }

  withName(name: string): TargetBuilder {
    this.target.name = name;
    return this;
  }

  withAddress(address: string): TargetBuilder {
    this.target.address = address;
    return this;
  }

  withOwnerId(ownerId: string): TargetBuilder {
    this.target.ownerId = ownerId;
    return this;
  }

  withSpeedTestResults(results: SpeedTestResult[]): TargetBuilder {
    this.target.speedTestResults = results;
    return this;
  }

  withAlertRules(rules: AlertRule[]): TargetBuilder {
    this.target.alertRules = rules;
    return this;
  }

  build(overrides?: Partial<Target>): Target {
    return {
      id: "target-123",
      name: "Test Target",
      address: "https://test.com",
      ownerId: "user-123",
      status: EntityStatus.ACTIVE,
      monitoringEnabled: true,
      monitoringInterval: 30,
      version: 1,
      deletedAt: null,
      isActive: true,
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      speedTestResults: [],
      alertRules: [],
      ...this.target,
      ...overrides,
    };
  }
}

export class SpeedTestResultBuilder {
  private result: Partial<SpeedTestResult> = {};

  withId(id: string): SpeedTestResultBuilder {
    this.result.id = id;
    return this;
  }

  withTargetId(targetId: string): SpeedTestResultBuilder {
    this.result.targetId = targetId;
    return this;
  }

  withPing(ping: number): SpeedTestResultBuilder {
    this.result.ping = ping;
    return this;
  }

  withDownload(download: number): SpeedTestResultBuilder {
    this.result.download = download;
    return this;
  }

  withUpload(upload: number): SpeedTestResultBuilder {
    this.result.upload = upload;
    return this;
  }

  withStatus(
    status: typeof SpeedTestStatus.SUCCESS | typeof SpeedTestStatus.FAILURE
  ): SpeedTestResultBuilder {
    this.result.status = status;
    return this;
  }

  withError(error?: string): SpeedTestResultBuilder {
    this.result.error = error;
    return this;
  }

  withCreatedAt(createdAt: Date): SpeedTestResultBuilder {
    this.result.createdAt = createdAt;
    return this;
  }

  withTimestamp(_timestamp: string): SpeedTestResultBuilder {
    // Note: StandardizedSpeedTestResult doesn't have a timestamp property
    // This method is kept for backward compatibility but doesn't set any property
    return this;
  }

  build(overrides?: Partial<SpeedTestResult>): SpeedTestResult {
    return {
      id: "result-123",
      targetId: "target-123",
      ping: 50,
      download: 100,
      upload: 50,
      status: SpeedTestStatus.SUCCESS,
      error: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...this.result,
      ...overrides,
    };
  }
}

// Helper functions for creating test data
export const createTestTarget = (overrides?: Partial<Target>): Target =>
  new TargetBuilder().build(overrides);

export const createTestSpeedTestResult = (
  overrides?: Partial<SpeedTestResult>
): SpeedTestResult => new SpeedTestResultBuilder().build(overrides);

export const createTestAlertRule = (
  overrides?: Partial<AlertRule>
): AlertRule => ({
  id: "rule-123",
  name: "Test Alert Rule",
  targetId: "target-123",
  metric: MonitoringMetrics.PING,
  condition: AlertConditions.GREATER_THAN,
  threshold: 100,
  enabled: true,
  severity: "MEDIUM",
  cooldownPeriod: 300,
  maxAlerts: 10,
  status: EntityStatus.ACTIVE,
  version: 1,
  deletedAt: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestIncidentEvent = (
  overrides?: Partial<IncidentEvent>
): IncidentEvent => ({
  id: "incident-123",
  targetId: "target-123",
  ruleId: "rule-123",
  type: IncidentTypes.ALERT,
  severity: "MEDIUM",
  description: "Test incident",
  resolved: false,
  resolvedAt: null,
  resolvedBy: null,
  duration: undefined,
  affectedUsers: undefined,
  rootCause: null,
  resolution: null,
  status: EntityStatus.ACTIVE,
  version: 1,
  deletedAt: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestNotification = (
  overrides?: Partial<Notification>
): Notification => ({
  id: "notification-123",
  message: "Test notification",
  title: null,
  type: "INFO",
  priority: "NORMAL",
  read: false,
  readAt: null,
  sentAt: new Date(),
  source: null,
  actionUrl: null,
  expiresAt: null,
  ownerId: "user-123",
  status: EntityStatus.ACTIVE,
  version: 1,
  deletedAt: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestPushSubscription = (
  overrides?: Partial<PushSubscription>
): PushSubscription => ({
  id: "sub-123",
  endpoint: "https://example.com/push",
  p256dh: "p256dh-key",
  auth: "auth-key",
  userAgent: null,
  deviceType: null,
  enabled: true,
  lastUsedAt: null,
  ownerId: "user-123",
  status: EntityStatus.ACTIVE,
  version: 1,
  deletedAt: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

export const createTestUser = (overrides?: Partial<User>): User => ({
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  emailVerified: null,
  image: null,
  status: EntityStatus.ACTIVE,
  version: 1,
  deletedAt: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

// Custom matchers or utility functions
export const expectServiceToBeCalledWith = (
  spy: ReturnType<typeof vi.fn>,
  ...args: unknown[]
) => {
  // Justification: Using expect from vitest global context in test utilities
  expect(spy).toHaveBeenCalledWith(...args);
};

export const expectEventToBeEmitted = <T = unknown>(
  eventBus: ReturnType<typeof createMockEventBus>,
  event: string,
  data?: T
) => {
  // Justification: Using expect from vitest global context in test utilities
  expect(eventBus.emit).toHaveBeenCalledWith(event, data);
};

// Setup and teardown
beforeEach(() => {
  // Clear all mocks before each test
  vi.clearAllMocks();
});

afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
});
