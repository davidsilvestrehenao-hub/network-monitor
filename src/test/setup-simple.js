import { beforeEach, afterEach, vi } from "vitest";
import {
  FlexibleContainer,
  TYPES,
} from "@network-monitor/infrastructure/container";
// Global test container
let testContainer;
// Mock implementations
export function createMockLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    setLevel: vi.fn(),
    getLevel: vi.fn(() => "debug"),
  };
}
export function createMockEventBus() {
  const listeners = new Map();
  const mockEventBus = {
    on: vi.fn((event, listener) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event).add(listener);
    }),
    off: vi.fn((event, listener) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(listener);
      }
    }),
    emit: vi.fn((event, data) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(async listener => {
          try {
            const result = listener(data);
            if (result instanceof Promise) {
              await result.catch(error => {
                console.error(
                  `Async error in event handler for ${event}:`,
                  error
                );
              });
            }
          } catch (error) {
            console.error(`Sync error in event handler for ${event}:`, error);
          }
        });
      }
    }),
    removeAllListeners: vi.fn(event => {
      if (event) {
        listeners.delete(event);
      } else {
        listeners.clear();
      }
    }),
  };
  return mockEventBus;
}
export function createMockDatabaseService() {
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
export function createMockTargetRepository() {
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
export function createMockSpeedTestResultRepository() {
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
export function createMockSpeedTestRepository() {
  return {
    runSpeedTest: vi.fn(),
  };
}
export function createMockMonitoringTargetRepository() {
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
export function createMockAlertRuleRepository() {
  return {
    findById: vi.fn(),
    findByTargetId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
    toggleEnabled: vi.fn(),
  };
}
export function createMockIncidentEventRepository() {
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
export function createMockNotificationRepository() {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsReadByUserId: vi.fn(),
  };
}
export function createMockPushSubscriptionRepository() {
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
export function createMockUserRepository() {
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
export function createMockUserSpeedTestPreferenceRepository() {
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
export function registerMockServices(container) {
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
  target = {};
  withId(id) {
    this.target.id = id;
    return this;
  }
  withName(name) {
    this.target.name = name;
    return this;
  }
  withAddress(address) {
    this.target.address = address;
    return this;
  }
  withOwnerId(ownerId) {
    this.target.ownerId = ownerId;
    return this;
  }
  withSpeedTestResults(results) {
    this.target.speedTestResults = results;
    return this;
  }
  withAlertRules(rules) {
    this.target.alertRules = rules;
    return this;
  }
  build(overrides) {
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
  result = {};
  withId(id) {
    this.result.id = id;
    return this;
  }
  withTargetId(targetId) {
    this.result.targetId = targetId;
    return this;
  }
  withPing(ping) {
    this.result.ping = ping;
    return this;
  }
  withDownload(download) {
    this.result.download = download;
    return this;
  }
  withUpload(upload) {
    this.result.upload = upload;
    return this;
  }
  withStatus(status) {
    this.result.status = status;
    return this;
  }
  withError(error) {
    this.result.error = error;
    return this;
  }
  build(overrides) {
    return {
      id: 1,
      targetId: "target-123",
      ping: 50,
      download: 100,
      upload: 50,
      status: "SUCCESS",
      error: null,
      createdAt: new Date(),
      ...overrides,
      ...this.result,
    };
  }
}
// Helper functions for creating test data
export const createTestTarget = overrides =>
  new TargetBuilder().build(overrides);
export const createTestSpeedTestResult = overrides =>
  new SpeedTestResultBuilder().build(overrides);
export const createTestAlertRule = overrides => ({
  id: "alert-123",
  targetId: "target-123",
  metric: "ping",
  operator: "gt",
  threshold: 100,
  enabled: true,
  ...overrides,
});
export const createTestIncidentEvent = overrides => ({
  id: "incident-123",
  alertRuleId: "alert-123",
  targetId: "target-123",
  status: "active",
  triggeredAt: new Date(),
  ...overrides,
});
export const createTestNotification = overrides => ({
  id: "notification-123",
  userId: "user-123",
  message: "Test notification",
  read: false,
  createdAt: new Date(),
  ...overrides,
});
export const createTestPushSubscription = overrides => ({
  id: "sub-123",
  userId: "user-123",
  endpoint: "https://example.com/push",
  p256dh: "p256dh-key",
  auth: "auth-key",
  ...overrides,
});
export const createTestUser = overrides => ({
  id: "user-123",
  email: "test@example.com",
  password: "hashedpassword",
  ...overrides,
});
// Custom matchers or utility functions
export const expectServiceToBeCalledWith = (spy, ...args) => {
  expect(spy).toHaveBeenCalledWith(...args);
};
export const expectEventToBeEmitted = (eventBus, event, data) => {
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
