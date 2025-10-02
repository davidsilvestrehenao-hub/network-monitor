import { beforeAll, afterEach, afterAll, vi } from "vitest";
import { FlexibleContainer } from "@network-monitor/infrastructure/container";
import { TYPES } from "@network-monitor/infrastructure/container/types";
import type { Container } from "@network-monitor/infrastructure/container/types";

// Global test container
let testContainer: Container;

// Mock implementations
const mockImplementations = new Map<symbol, unknown>();

// Test utilities
export class TestContainer {
  private container: Container;

  constructor() {
    this.container = new FlexibleContainer();
  }

  async initialize(): Promise<void> {
    await this.container.initialize();
  }

  // Register a mock implementation
  registerMock<T>(key: symbol, mock: T): void {
    this.container.register(key, {
      factory: () => mock,
      dependencies: [],
      singleton: true,
      description: `Mock implementation for ${key.toString()}`,
    });
  }

  // Get a service (will return mock if registered)
  get<T>(key: symbol): T {
    return this.container.get<T>(key);
  }

  // Check if a service is registered
  has(key: symbol): boolean {
    return this.container.has(key);
  }

  // Get all registered services
  getRegisteredTypes(): symbol[] {
    return this.container.getRegisteredTypes();
  }

  // Clear all registrations
  clear(): void {
    this.container = new FlexibleContainer();
  }
}

// Global test container instance
export function getTestContainer(): TestContainer {
  if (!testContainer) {
    testContainer = new TestContainer();
  }
  return testContainer as TestContainer;
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
  const listeners = new Map<string, Set<Function>>();

  return {
    on: vi.fn((event: string, listener: Function) => {
      if (!listeners.has(event)) {
        listeners.set(event, new Set());
      }
      listeners.get(event)!.add(listener);
    }),
    off: vi.fn((event: string, listener: Function) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.delete(listener);
      }
    }),
    emit: vi.fn((event: string, data?: unknown) => {
      const eventListeners = listeners.get(event);
      if (eventListeners) {
        eventListeners.forEach(listener => listener(data));
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
  private target: any = {};

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

  withSpeedTestResults(results: any[]): TargetBuilder {
    this.target.speedTestResults = results;
    return this;
  }

  withAlertRules(rules: any[]): TargetBuilder {
    this.target.alertRules = rules;
    return this;
  }

  build(): any {
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
  private result: any = {};

  withId(id: number): SpeedTestResultBuilder {
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

  withStatus(status: string): SpeedTestResultBuilder {
    this.result.status = status;
    return this;
  }

  withError(error: string): SpeedTestResultBuilder {
    this.result.error = error;
    return this;
  }

  build(): any {
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
