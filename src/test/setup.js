import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { FlexibleContainer } from "@network-monitor/infrastructure/container";
// Global test container
let testContainer;
// Mock implementations
const mockImplementations = new Map();
// Test utilities
export class TestContainer {
  container;
  constructor() {
    this.container = new FlexibleContainer();
  }
  async initialize() {
    await this.container.initialize();
  }
  // Register a mock implementation
  registerMock(key, mock) {
    this.container.register(key, {
      factory: () => mock,
      dependencies: [],
      singleton: true,
      description: `Mock implementation for ${key.toString()}`,
    });
  }
  // Get a service (will return mock if registered)
  get(key) {
    return this.container.get(key);
  }
  // Check if a service is registered
  has(key) {
    return this.container.has(key);
  }
  // Get all registered services
  getRegisteredTypes() {
    return this.container.getRegisteredTypes();
  }
  // Clear all registrations
  clear() {
    this.container = new FlexibleContainer();
  }
}
// Global test container instance
export function getTestContainer() {
  if (!testContainer) {
    testContainer = new TestContainer();
  }
  return testContainer;
}
// Mock factory utilities
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
  return {
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
        eventListeners.forEach(listener => listener(data));
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
  build() {
    return {
      id: "target-123",
      name: "Test Target",
      address: "https://test.com",
      ownerId: "user-123",
      speedTestResults: [],
      alertRules: [],
      ...this.target,
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
  build() {
    return {
      id: 1,
      targetId: "target-123",
      ping: 50,
      download: 100,
      upload: 50,
      status: "SUCCESS",
      error: null,
      createdAt: new Date(),
      ...this.result,
    };
  }
}
// Setup and teardown
beforeAll(async () => {
  // Initialize test container
  testContainer = new TestContainer();
  await testContainer.initialize();
});
afterEach(() => {
  // Clear all mocks after each test
  vi.clearAllMocks();
  // Clear test container
  if (testContainer) {
    testContainer.clear();
  }
});
afterAll(() => {
  // Cleanup
  vi.restoreAllMocks();
});
