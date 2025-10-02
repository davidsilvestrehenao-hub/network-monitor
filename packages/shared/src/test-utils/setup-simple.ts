import { beforeEach, afterEach, vi, expect } from "vitest";
import {
  FlexibleContainer,
  // Justification: setContainer is exported for use by test files that import this setup utility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setContainer,
  TYPES,
} from "@network-monitor/infrastructure";
import type { Container } from "@network-monitor/infrastructure";
import type {
  Target,
  // Justification: These Create*Data types are exported for use by test files that import this setup utility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateTargetData,
  SpeedTestResult,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateSpeedTestResultData,
  AlertRule,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateAlertRuleData,
  IncidentEvent,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateIncidentEventData,
  Notification,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateNotificationData,
  PushSubscription,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreatePushSubscriptionData,
  User,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  CreateUserData,
} from "../interfaces/index.js";

// Global test container
// Justification: testContainer is exported for use by test files that import this setup utility
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let testContainer: Container;

// Mock implementations
// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockLogger(): any {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    setLevel: vi.fn(),
    getLevel: vi.fn(() => "debug"),
  };
}

// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockEventBus(): any {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  const mockEventBus = {
    on: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(listener);
    }),
    off: vi.fn((event: string, listener: (...args: unknown[]) => void) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(listener);
      }
    }),
    emit: vi.fn((event: string, data?: unknown) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(async listener => {
          try {
            const result: unknown = listener(data);
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
    }),
    removeAllListeners: vi.fn((event?: string) => {
      if (event) {
        listeners.delete(event);
      } else {
        listeners.clear();
      }
    }),
  };

  return mockEventBus;
}

// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockDatabaseService(): any {
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
    isConnected: vi.fn(() => true),
  };
}

// Mock repository functions
// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockTargetRepository(): any {
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

// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockSpeedTestResultRepository(): any {
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

// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockSpeedTestRepository(): any {
  return {
    runSpeedTest: vi.fn(),
  };
}

// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockMonitoringTargetRepository(): any {
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

// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockAlertRuleRepository(): any {
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

// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockIncidentEventRepository(): any {
  return {
    findById: vi.fn(),
    findByTargetId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
    resolve: vi.fn(),
    findUnresolved: vi.fn(),
  };
}

// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockNotificationRepository(): any {
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

// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockPushSubscriptionRepository(): any {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findByEndpoint: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
    deleteByEndpoint: vi.fn(),
  };
}

// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockUserRepository(): any {
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

// Justification: Using any type to avoid vitest spy type inference portability issues
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockUserSpeedTestPreferenceRepository(): any {
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

  withStatus(status: "SUCCESS" | "FAILURE"): SpeedTestResultBuilder {
    this.result.status = status;
    return this;
  }

  withError(error?: string): SpeedTestResultBuilder {
    this.result.error = error;
    return this;
  }

  build(overrides?: Partial<SpeedTestResult>): SpeedTestResult {
    return {
      id: "result-123",
      targetId: "target-123",
      ping: 50,
      download: 100,
      upload: 50,
      status: "SUCCESS",
      error: undefined,
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
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
  id: 1,
  name: "Test Alert Rule",
  targetId: "target-123",
  metric: "ping",
  condition: "GREATER_THAN",
  threshold: 100,
  enabled: true,
  triggeredEvents: [],
  ...overrides,
});

export const createTestIncidentEvent = (
  overrides?: Partial<IncidentEvent>
): IncidentEvent => ({
  id: 1,
  timestamp: new Date(),
  type: "ALERT",
  description: "Test incident",
  resolved: false,
  targetId: "target-123",
  ruleId: 1,
  triggeredByRule: null,
  ...overrides,
});

export const createTestNotification = (
  overrides?: Partial<Notification>
): Notification => ({
  id: 1,
  message: "Test notification",
  sentAt: new Date(),
  read: false,
  userId: "user-123",
  ...overrides,
});

export const createTestPushSubscription = (
  overrides?: Partial<PushSubscription>
): PushSubscription => ({
  id: "sub-123",
  userId: "user-123",
  endpoint: "https://example.com/push",
  p256dh: "p256dh-key",
  auth: "auth-key",
  ...overrides,
});

export const createTestUser = (overrides?: Partial<User>): User => ({
  id: "user-123",
  name: "Test User",
  email: "test@example.com",
  emailVerified: null,
  image: null,
  monitoringTargets: [],
  pushSubscriptions: [],
  notifications: [],
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

export const expectEventToBeEmitted = (
  eventBus: ReturnType<typeof createMockEventBus>,
  event: string,
  data?: unknown
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
