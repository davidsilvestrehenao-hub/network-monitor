import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { MonitorService } from "./MonitorService";

// Local mock factory functions
function createMockTargetRepository() {
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

function createMockSpeedTestResultRepository() {
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

function createMockEventBus() {
  const listeners = new Map<string, Set<(...args: unknown[]) => void>>();

  return {
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
              await result.catch(() => {});
            }
          } catch (error) {
            // Ignore errors in test
          }
        });
      }
    }),
    removeAllListeners: vi.fn(),
  };
}

function createMockLogger() {
  return {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    setLevel: vi.fn(),
    getLevel: vi.fn(() => "debug"),
  };
}

function createTestTarget(overrides = {}) {
  return {
    id: "target-123",
    name: "Test Target",
    address: "https://test.com",
    ownerId: "user-123",
    speedTestResults: [],
    alertRules: [],
    ...overrides,
  };
}

function createTestSpeedTestResult(overrides = {}) {
  return {
    id: "result-123",
    targetId: "target-123",
    ping: 50,
    download: 100,
    upload: 50,
    status: "SUCCESS" as const,
    error: undefined,
    timestamp: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function expectEventToBeEmitted(
  eventBus: ReturnType<typeof createMockEventBus>,
  event: string,
  data?: unknown
) {
  expect(eventBus.emit).toHaveBeenCalledWith(event, data);
}

// Mock fetch globally
// Justification: Using any type for global fetch mock to avoid complex type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.fetch = vi.fn() as any;

describe("MonitorService", () => {
  let monitorService: MonitorService;
  let mockTargetRepository: ReturnType<typeof createMockTargetRepository>;
  // Justification: Using any type for mock repositories that don't have proper factory functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSpeedTestRepository: any;
  // Justification: Using any type for mock repositories that don't have proper factory functions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockMonitoringTargetRepository: any;
  let mockSpeedTestResultRepository: ReturnType<
    typeof createMockSpeedTestResultRepository
  >;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(() => {
    // Create mock repositories
    mockTargetRepository = createMockTargetRepository();
    mockSpeedTestResultRepository = createMockSpeedTestResultRepository();
    mockEventBus = createMockEventBus();
    mockLogger = createMockLogger();

    // Create mock implementations for other dependencies
    mockSpeedTestRepository = {
      runSpeedTest: vi.fn(),
    };
    mockMonitoringTargetRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      getAll: vi.fn(),
    };

    // Create service instance
    monitorService = new MonitorService(
      mockTargetRepository,
      mockSpeedTestRepository,
      mockMonitoringTargetRepository,
      mockSpeedTestResultRepository,
      mockEventBus,
      mockLogger
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Base Interface Methods", () => {
    describe("getById", () => {
      it("should get target by id", async () => {
        const testTarget = createTestTarget();
        mockTargetRepository.findByIdWithRelations.mockResolvedValue(
          testTarget
        );

        const result = await monitorService.getById("target-123");

        expect(result).toEqual(testTarget);
        expect(mockTargetRepository.findByIdWithRelations).toHaveBeenCalledWith(
          "target-123"
        );
      });

      it("should return null when target not found", async () => {
        mockTargetRepository.findByIdWithRelations.mockResolvedValue(null);

        const result = await monitorService.getById("nonexistent");

        expect(result).toBeNull();
      });
    });

    describe("getAll", () => {
      it("should get all targets", async () => {
        const testTargets = [
          createTestTarget(),
          createTestTarget({ id: "target-456" }),
        ];
        mockTargetRepository.getAllWithRelations.mockResolvedValue(testTargets);

        const result = await monitorService.getAll();

        expect(result).toEqual(testTargets);
        expect(mockTargetRepository.getAllWithRelations).toHaveBeenCalled();
      });
    });

    describe("create", () => {
      it("should create a new target", async () => {
        const targetData = {
          name: "Test Target",
          address: "https://test.com",
          ownerId: "user-123",
        };
        const createdTarget = createTestTarget();
        mockTargetRepository.create.mockResolvedValue(createdTarget);

        const result = await monitorService.create(targetData);

        expect(result).toEqual({
          ...createdTarget,
          speedTestResults: [],
          alertRules: [],
        });
        expect(mockTargetRepository.create).toHaveBeenCalledWith(targetData);
        expect(mockLogger.info).toHaveBeenCalledWith(
          "MonitorService: Creating target",
          targetData
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          "MonitorService: Target created",
          { id: createdTarget.id }
        );
      });
    });

    describe("update", () => {
      it("should update an existing target", async () => {
        const updateData = { name: "Updated Target" };
        const updatedTarget = createTestTarget({ name: "Updated Target" });
        mockTargetRepository.update.mockResolvedValue(updatedTarget);

        const result = await monitorService.update("target-123", updateData);

        expect(result).toEqual({
          ...updatedTarget,
          speedTestResults: [],
          alertRules: [],
        });
        expect(mockTargetRepository.update).toHaveBeenCalledWith(
          "target-123",
          updateData
        );
        expect(mockLogger.info).toHaveBeenCalledWith(
          "MonitorService: Updating target",
          { id: "target-123", data: updateData }
        );
      });
    });

    describe("delete", () => {
      it("should delete a target and stop monitoring", async () => {
        // Start monitoring first
        monitorService.startMonitoring("target-123", 1000);
        expect(monitorService.getActiveTargets()).toContain("target-123");

        await monitorService.delete("target-123");

        expect(mockTargetRepository.delete).toHaveBeenCalledWith("target-123");
        expect(mockLogger.info).toHaveBeenCalledWith(
          "MonitorService: Deleting target",
          { id: "target-123" }
        );
        expect(monitorService.getActiveTargets()).not.toContain("target-123");
      });
    });

    describe("getByUserId", () => {
      it("should get targets for a specific user", async () => {
        const userTargets = [
          createTestTarget(),
          createTestTarget({ id: "target-456" }),
        ];
        mockTargetRepository.findByUserIdWithRelations.mockResolvedValue(
          userTargets
        );

        const result = await monitorService.getByUserId("user-123");

        expect(result).toEqual(userTargets);
        expect(
          mockTargetRepository.findByUserIdWithRelations
        ).toHaveBeenCalledWith("user-123");
      });
    });
  });

  describe("Observable Service Methods", () => {
    it("should register event listeners", () => {
      const handler = vi.fn();
      monitorService.on("TEST_EVENT", handler);

      expect(mockEventBus.on).toHaveBeenCalledWith("TEST_EVENT", handler);
    });

    it("should remove event listeners", () => {
      const handler = vi.fn();
      monitorService.off("TEST_EVENT", handler);

      expect(mockEventBus.off).toHaveBeenCalledWith("TEST_EVENT", handler);
    });

    it("should emit events", () => {
      const data = { test: "data" };
      monitorService.emit("TEST_EVENT", data);

      expect(mockEventBus.emit).toHaveBeenCalledWith("TEST_EVENT", data);
    });
  });

  describe("Background Service Methods", () => {
    it("should start background monitoring", async () => {
      await monitorService.start();

      expect(mockLogger.info).toHaveBeenCalledWith(
        "MonitorService: Starting background monitoring"
      );
    });

    it("should stop background monitoring and clear active targets", async () => {
      // Start monitoring some targets
      monitorService.startMonitoring("target-1", 1000);
      monitorService.startMonitoring("target-2", 2000);
      expect(monitorService.getActiveTargets()).toHaveLength(2);

      await monitorService.stop();

      expect(mockLogger.info).toHaveBeenCalledWith(
        "MonitorService: Stopping background monitoring"
      );
      expect(monitorService.getActiveTargets()).toHaveLength(0);
    });
  });

  describe("Event Handlers", () => {
    describe("handleTargetCreateRequested", () => {
      it("should create target and emit success events", async () => {
        const eventData = {
          requestId: "req-123",
          name: "Test Target",
          address: "https://test.com",
          ownerId: "user-123",
        };
        const createdTarget = createTestTarget();
        mockTargetRepository.create.mockResolvedValue(createdTarget);

        // Emit the event
        mockEventBus.emit("TARGET_CREATE_REQUESTED", eventData);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockTargetRepository.create).toHaveBeenCalledWith({
          name: eventData.name,
          address: eventData.address,
          ownerId: eventData.ownerId,
        });
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          `TARGET_CREATED_${eventData.requestId}`,
          {
            ...createdTarget,
            speedTestResults: [],
            alertRules: [],
          }
        );
        expectEventToBeEmitted(mockEventBus, "TARGET_CREATED", {
          target: {
            ...createdTarget,
            speedTestResults: [],
            alertRules: [],
          },
        });
      });

      it("should handle creation errors and emit failure events", async () => {
        const eventData = {
          requestId: "req-123",
          name: "Test Target",
          address: "https://test.com",
          ownerId: "user-123",
        };
        const error = new Error("Database error");
        mockTargetRepository.create.mockRejectedValue(error);

        // Emit the event
        mockEventBus.emit("TARGET_CREATE_REQUESTED", eventData);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockEventBus.emit).toHaveBeenCalledWith(
          `TARGET_CREATE_FAILED_${eventData.requestId}`,
          {
            error: "Database error",
          }
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "MonitorService: Failed to create target",
          {
            error,
            data: eventData,
          }
        );
      });
    });

    describe("handleMonitoringStartRequested", () => {
      it("should start monitoring and emit success events", async () => {
        const eventData = {
          requestId: "req-123",
          targetId: "target-123",
          intervalMs: 5000,
        };

        // Emit the event
        mockEventBus.emit("MONITORING_START_REQUESTED", eventData);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockEventBus.emit).toHaveBeenCalledWith(
          `MONITORING_STARTED_${eventData.requestId}`,
          {
            success: true,
          }
        );
        expectEventToBeEmitted(mockEventBus, "MONITORING_STARTED", {
          targetId: eventData.targetId,
        });
        expect(monitorService.getActiveTargets()).toContain(eventData.targetId);
      });
    });
  });

  describe("Monitoring Methods", () => {
    describe("startMonitoring", () => {
      it("should start monitoring a target", () => {
        const targetId = "target-123";
        const intervalMs = 5000;

        monitorService.startMonitoring(targetId, intervalMs);

        expect(monitorService.getActiveTargets()).toContain(targetId);
        expect(mockLogger.info).toHaveBeenCalledWith(
          "MonitorService: Starting monitoring",
          {
            targetId,
            intervalMs,
          }
        );
      });

      it("should not start monitoring if already active", () => {
        const targetId = "target-123";
        const intervalMs = 5000;

        monitorService.startMonitoring(targetId, intervalMs);
        monitorService.startMonitoring(targetId, intervalMs); // Try again

        expect(monitorService.getActiveTargets()).toHaveLength(1);
        expect(mockLogger.warn).toHaveBeenCalledWith(
          "MonitorService: Target already being monitored",
          {
            targetId,
          }
        );
      });
    });

    describe("stopMonitoring", () => {
      it("should stop monitoring a target", () => {
        const targetId = "target-123";
        monitorService.startMonitoring(targetId, 5000);

        monitorService.stopMonitoring(targetId);

        expect(monitorService.getActiveTargets()).not.toContain(targetId);
        expect(mockLogger.info).toHaveBeenCalledWith(
          "MonitorService: Stopping monitoring",
          {
            targetId,
          }
        );
      });

      it("should handle stopping non-active target", () => {
        monitorService.stopMonitoring("nonexistent");

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "MonitorService: Target not being monitored",
          {
            targetId: "nonexistent",
          }
        );
      });
    });

    describe("getActiveTargets", () => {
      it("should return list of active targets", () => {
        expect(monitorService.getActiveTargets()).toEqual([]);

        monitorService.startMonitoring("target-1", 1000);
        monitorService.startMonitoring("target-2", 2000);

        expect(monitorService.getActiveTargets()).toEqual([
          "target-1",
          "target-2",
        ]);
      });
    });
  });

  describe("Speed Test Methods", () => {
    describe("runSpeedTest", () => {
      beforeEach(() => {
        // Mock fetch responses
        // Justification: Using any type for global fetch mock to avoid complex type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global.fetch as any).mockImplementation((url: string | URL) => {
          if (url.toString().includes("test.com")) {
            return Promise.resolve({
              ok: true,
              status: 200,
              body: {
                getReader: () => ({
                  read: () => Promise.resolve({ done: true, value: undefined }),
                }),
              },
              // Justification: Using any type for mock fetch response to avoid complex Response type definitions
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any);
          }
          return Promise.resolve({
            ok: true,
            status: 200,
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
            // Justification: Using any type for mock fetch response to avoid complex Response type definitions
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any);
        });
      });

      it("should run successful speed test", async () => {
        const config = {
          targetId: "target-123",
          target: "https://test.com",
        };
        const speedTestResult = createTestSpeedTestResult();
        mockSpeedTestResultRepository.create.mockResolvedValue(speedTestResult);

        // Mock the speed test repository to return successful results
        mockSpeedTestRepository.runSpeedTest.mockResolvedValue({
          ping: 50,
          download: 100,
          upload: 50,
        });

        const result = await monitorService.runSpeedTest(config);

        expect(result.status).toBe("SUCCESS");
        expect(result.targetId).toBe(config.targetId);
        expect(typeof result.ping).toBe("number");
        expect(typeof result.download).toBe("number");
        expect(mockSpeedTestResultRepository.create).toHaveBeenCalledWith({
          targetId: config.targetId,
          ping: expect.any(Number),
          download: expect.any(Number),
          upload: 0,
          status: "SUCCESS",
        });
      });

      it("should handle speed test failure", async () => {
        const config = {
          targetId: "target-123",
          target: "https://invalid.com",
        };

        // Mock fetch to throw an error for this test
        // Justification: Using any type for global fetch mock to avoid complex type definitions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (global.fetch as any).mockRejectedValue(new Error("Network error"));

        const result = await monitorService.runSpeedTest(config);

        expect(result.status).toBe("FAILURE");
        expect(result.error).toBe("Network error");
        expect(mockSpeedTestResultRepository.create).toHaveBeenCalledWith({
          targetId: config.targetId,
          ping: null,
          download: null,
          upload: null,
          status: "FAILURE",
          error: "Network error",
        });
      });
    });
  });

  describe("Target Results", () => {
    describe("getTargetResults", () => {
      it("should get speed test results for a target", async () => {
        const targetId = "target-123";
        const results = [
          createTestSpeedTestResult(),
          createTestSpeedTestResult({ id: "2" }),
        ];
        mockSpeedTestResultRepository.findByTargetId.mockResolvedValue(results);

        const result = await monitorService.getTargetResults(targetId, 10);

        expect(result).toEqual(results);
        expect(
          mockSpeedTestResultRepository.findByTargetId
        ).toHaveBeenCalledWith(targetId, 10);
      });
    });
  });
});
