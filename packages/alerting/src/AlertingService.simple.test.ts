import { describe, it, expect, beforeEach } from "vitest";
import { AlertingService } from "./AlertingService";
import {
  createTestContainer,
  createMockAlertRuleRepository,
  createMockIncidentEventRepository,
  createMockEventBus,
  createMockLogger,
  createTestAlertRule,
} from "@network-monitor/shared/test-utils";
import { TYPES } from "@network-monitor/infrastructure/container";

describe("AlertingService - Simple Test", () => {
  let alertingService: AlertingService;
  let container: ReturnType<typeof createTestContainer>;
  let mockAlertRuleRepository: ReturnType<typeof createMockAlertRuleRepository>;
  let mockIncidentEventRepository: ReturnType<
    typeof createMockIncidentEventRepository
  >;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(async () => {
    // Create test container
    container = createTestContainer();

    // Create mock repositories
    mockAlertRuleRepository = createMockAlertRuleRepository();
    mockIncidentEventRepository = createMockIncidentEventRepository();
    mockEventBus = createMockEventBus();
    mockLogger = createMockLogger();

    // Register mocks in container
    container.register(TYPES.IAlertRuleRepository, {
      factory: () => mockAlertRuleRepository,
      dependencies: [],
      singleton: true,
      description: "Mock Alert Rule Repository",
    });
    container.register(TYPES.IIncidentEventRepository, {
      factory: () => mockIncidentEventRepository,
      dependencies: [],
      singleton: true,
      description: "Mock Incident Event Repository",
    });
    container.register(TYPES.IEventBus, {
      factory: () => mockEventBus,
      dependencies: [],
      singleton: true,
      description: "Mock Event Bus",
    });
    container.register(TYPES.ILogger, {
      factory: () => mockLogger,
      dependencies: [],
      singleton: true,
      description: "Mock Logger",
    });

    await container.initialize();

    // Create service instance
    alertingService = new AlertingService(
      mockAlertRuleRepository,
      mockIncidentEventRepository,
      mockEventBus,
      mockLogger
    );
  });

  it("should be defined", () => {
    expect(alertingService).toBeDefined();
  });

  it("should have toggleEnabled method on mock repository", () => {
    expect(typeof mockAlertRuleRepository.toggleEnabled).toBe("function");
  });

  it("should have resolve method on mock repository", () => {
    expect(typeof mockIncidentEventRepository.resolve).toBe("function");
  });

  it("should have findUnresolved method on mock repository", () => {
    expect(typeof mockIncidentEventRepository.findUnresolved).toBe("function");
  });

  it("should create an alert rule", async () => {
    const alertRuleData = {
      name: "Test Alert Rule",
      targetId: "target-123",
      metric: "ping" as const,
      condition: "GREATER_THAN" as const,
      threshold: 100,
      enabled: true,
    };

    const expectedRule = createTestAlertRule(alertRuleData);
    mockAlertRuleRepository.create.mockResolvedValue(expectedRule);

    const result = await alertingService.createAlertRule(alertRuleData);

    expect(result).toEqual(expectedRule);
    expect(mockAlertRuleRepository.create).toHaveBeenCalledWith(alertRuleData);
  });

  it("should get alert rule by id", async () => {
    const ruleId = 1;
    const expectedRule = createTestAlertRule({ id: ruleId });
    mockAlertRuleRepository.findById.mockResolvedValue(expectedRule);

    const result = await alertingService.getAlertRule(ruleId);

    expect(result).toEqual(expectedRule);
    expect(mockAlertRuleRepository.findById).toHaveBeenCalledWith(ruleId);
  });
});
