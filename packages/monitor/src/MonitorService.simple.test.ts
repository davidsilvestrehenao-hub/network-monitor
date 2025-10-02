import { describe, it, expect, beforeEach, vi } from "vitest";
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
  return {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
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

function createMockSpeedTestRepository() {
  return {
    runSpeedTest: vi.fn(),
  };
}

function createMockMonitoringTargetRepository() {
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

describe("MonitorService - Simple Test", () => {
  let monitorService: MonitorService;
  // Justification: Using any type for mock repositories in simple test to avoid complex type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockTargetRepository: any;
  // Justification: Using any type for mock repositories in simple test to avoid complex type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSpeedTestRepository: any;
  // Justification: Using any type for mock repositories in simple test to avoid complex type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockMonitoringTargetRepository: any;
  // Justification: Using any type for mock repositories in simple test to avoid complex type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSpeedTestResultRepository: any;
  // Justification: Using any type for mock services in simple test to avoid complex type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockEventBus: any;
  // Justification: Using any type for mock services in simple test to avoid complex type definitions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockLogger: any;

  beforeEach(() => {
    // Create mocks
    mockTargetRepository = createMockTargetRepository();
    mockSpeedTestRepository = createMockSpeedTestRepository();
    mockMonitoringTargetRepository = createMockMonitoringTargetRepository();
    mockSpeedTestResultRepository = createMockSpeedTestResultRepository();
    mockEventBus = createMockEventBus();
    mockLogger = createMockLogger();

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

  it("should be defined", () => {
    expect(monitorService).toBeDefined();
  });

  it("should create a target", async () => {
    const targetData = {
      name: "Test Target",
      address: "https://test.com",
      ownerId: "user-123",
    };

    const expectedTarget = createTestTarget(targetData);
    mockTargetRepository.create.mockResolvedValue(expectedTarget);

    const result = await monitorService.createTarget(targetData);

    expect(result).toEqual(expectedTarget);
    expect(mockTargetRepository.create).toHaveBeenCalledWith(targetData);
    // Note: createTarget doesn't emit events, only the event handlers do
  });

  it("should get target by id", async () => {
    const targetId = "target-123";
    const expectedTarget = createTestTarget({ id: targetId });
    mockTargetRepository.findByIdWithRelations.mockResolvedValue(
      expectedTarget
    );

    const result = await monitorService.getById(targetId);

    expect(result).toEqual(expectedTarget);
    expect(mockTargetRepository.findByIdWithRelations).toHaveBeenCalledWith(
      targetId
    );
  });

  it("should return null when target not found", async () => {
    const targetId = "nonexistent";
    mockTargetRepository.findByIdWithRelations.mockResolvedValue(null);

    const result = await monitorService.getById(targetId);

    expect(result).toBeNull();
    expect(mockTargetRepository.findByIdWithRelations).toHaveBeenCalledWith(
      targetId
    );
  });
});
