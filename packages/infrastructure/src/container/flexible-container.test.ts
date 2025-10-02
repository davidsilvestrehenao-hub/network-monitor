import { describe, it, expect, beforeEach, vi } from "vitest";
import { FlexibleContainer } from "./flexible-container";
import type { Container, ServiceConfig } from "./types";
import { TYPES } from "./types";

describe("FlexibleContainer", () => {
  let container: Container;

  beforeEach(() => {
    container = new FlexibleContainer();
  });

  describe("service registration", () => {
    it("should register a service", () => {
      const mockConfig: ServiceConfig = {
        factory: () => ({ test: true }),
        dependencies: [],
        singleton: false,
        description: "Test logger service",
      };

      container.register(TYPES.ILogger, mockConfig);

      const registeredTypes = container.getRegisteredTypes();
      expect(registeredTypes).toContain(TYPES.ILogger);
    });

    it("should allow registering multiple services with different keys", () => {
      const loggerConfig: ServiceConfig = {
        factory: () => ({ debug: vi.fn(), info: vi.fn() }),
        dependencies: [],
        singleton: true,
        description: "Logger service",
      };

      const eventBusConfig: ServiceConfig = {
        factory: () => ({ on: vi.fn(), emit: vi.fn() }),
        dependencies: [],
        singleton: true,
        description: "Event bus service",
      };

      container.register(TYPES.ILogger, loggerConfig);
      container.register(TYPES.IEventBus, eventBusConfig);

      const registeredTypes = container.getRegisteredTypes();
      expect(registeredTypes).toContain(TYPES.ILogger);
      expect(registeredTypes).toContain(TYPES.IEventBus);
      expect(registeredTypes).toHaveLength(2);
    });
  });

  describe("service resolution", () => {
    it("should resolve a registered service", async () => {
      const mockLogger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };
      const mockConfig: ServiceConfig = {
        factory: () => mockLogger,
        dependencies: [],
        singleton: false,
        description: "Mock logger service",
      };

      container.register(TYPES.ILogger, mockConfig);
      await container.initialize();

      const resolved = container.get(TYPES.ILogger);
      expect(resolved).toBe(mockLogger);
    });

    it("should throw error when resolving unregistered service", async () => {
      await container.initialize();

      expect(() => {
        container.get(TYPES.IMonitorService);
      }).toThrow(
        `Service with key ${TYPES.IMonitorService.toString()} not found`
      );
    });

    it("should return same instance for singleton services", async () => {
      const mockConfig: ServiceConfig = {
        factory: () => ({ id: Math.random() }),
        dependencies: [],
        singleton: true,
        description: "Singleton logger service",
      };

      container.register(TYPES.ILogger, mockConfig);
      await container.initialize();

      const instance1 = container.get(TYPES.ILogger);
      const instance2 = container.get(TYPES.ILogger);

      expect(instance1).toBe(instance2);
    });

    it("should return different instances for non-singleton services", async () => {
      const mockConfig: ServiceConfig = {
        factory: () => ({ id: Math.random() }),
        dependencies: [],
        singleton: false,
        description: "Non-singleton logger service",
      };

      container.register(TYPES.ILogger, mockConfig);
      await container.initialize();

      const instance1 = container.get(TYPES.ILogger);
      const instance2 = container.get(TYPES.ILogger);

      expect(instance1).not.toBe(instance2);
    });
  });

  describe("initialization", () => {
    it("should initialize successfully", async () => {
      const mockConfig: ServiceConfig = {
        factory: () => ({ debug: vi.fn() }),
        dependencies: [],
        singleton: false,
        description: "Mock logger service",
      };

      container.register(TYPES.ILogger, mockConfig);

      // Should not throw when initializing
      await expect(container.initialize()).resolves.toBeUndefined();
    });

    it("should allow multiple initializations without error", async () => {
      await container.initialize();

      // Second initialization should not throw (idempotent)
      await expect(container.initialize()).resolves.toBeUndefined();
    });
  });

  describe("utility methods", () => {
    it("should return registered types", () => {
      const loggerConfig: ServiceConfig = {
        factory: () => ({ debug: vi.fn() }),
        dependencies: [],
        singleton: false,
        description: "Logger service",
      };

      const eventBusConfig: ServiceConfig = {
        factory: () => ({ on: vi.fn() }),
        dependencies: [],
        singleton: false,
        description: "Event bus service",
      };

      container.register(TYPES.ILogger, loggerConfig);
      container.register(TYPES.IEventBus, eventBusConfig);

      const types = container.getRegisteredTypes();
      expect(types).toContain(TYPES.ILogger);
      expect(types).toContain(TYPES.IEventBus);
      expect(types).toHaveLength(2);
    });

    it("should check if service is registered using has method", () => {
      const mockConfig: ServiceConfig = {
        factory: () => ({ debug: vi.fn() }),
        dependencies: [],
        singleton: false,
        description: "Logger service",
      };

      container.register(TYPES.ILogger, mockConfig);

      expect(container.has(TYPES.ILogger)).toBe(true);
      expect(container.has(TYPES.IMonitorService)).toBe(false);
    });

    it("should throw error when getting service before initialization", () => {
      const mockConfig: ServiceConfig = {
        factory: () => ({ debug: vi.fn() }),
        dependencies: [],
        singleton: false,
        description: "Logger service",
      };

      container.register(TYPES.ILogger, mockConfig);

      expect(() => {
        container.get(TYPES.ILogger);
      }).toThrow("Container not initialized. Call initialize() first.");
    });
  });
});
