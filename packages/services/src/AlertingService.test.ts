import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AlertingService } from "./AlertingService";
import {
  createTestContainer,
  registerMockServices,
  createMockAlertRuleRepository,
  createMockIncidentEventRepository,
  createMockEventBus,
  createMockLogger,
  createTestAlertRule,
  createTestIncidentEvent,
  createTestSpeedTestResult,
} from "@network-monitor/shared/test-utils";
import { TYPES } from "@network-monitor/infrastructure/container";

describe("AlertingService", () => {
  let alertingService: AlertingService;
  let container: ReturnType<typeof createTestContainer>;
  let mockAlertRuleRepository: ReturnType<typeof createMockAlertRuleRepository>;
  let mockIncidentEventRepository: ReturnType<
    typeof createMockIncidentEventRepository
  >;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(async () => {
    // Clear all mocks first
    vi.clearAllMocks();

    // Create test container
    container = createTestContainer();
    registerMockServices(container);

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

    // Create service instance with the actual mock instances
    alertingService = new AlertingService(
      mockAlertRuleRepository,
      mockIncidentEventRepository,
      mockEventBus,
      mockLogger
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Base Interface Methods", () => {
    describe("getById", () => {
      it("should get alert rule by id", async () => {
        const testRule = createTestAlertRule();
        mockAlertRuleRepository.findById.mockResolvedValue(testRule);

        const result = await alertingService.getById(1);

        expect(result).toEqual(testRule);
        expect(mockAlertRuleRepository.findById).toHaveBeenCalledWith(1);
      });

      it("should return null when rule not found", async () => {
        mockAlertRuleRepository.findById.mockResolvedValue(null);

        const result = await alertingService.getById(999);

        expect(result).toBeNull();
      });
    });

    describe("getAll", () => {
      it("should get all alert rules", async () => {
        const testRules = [
          createTestAlertRule(),
          createTestAlertRule({ id: 2 }),
        ];
        mockAlertRuleRepository.getAll.mockResolvedValue(testRules);

        const result = await alertingService.getAll(10, 0);

        expect(result).toEqual(testRules);
        expect(mockAlertRuleRepository.getAll).toHaveBeenCalledWith(10, 0);
      });
    });

    describe("create", () => {
      it("should create a new alert rule", async () => {
        const ruleData = {
          name: "High Ping Alert",
          metric: "ping" as const,
          condition: "GREATER_THAN" as const,
          threshold: 100,
          enabled: true,
          targetId: "target-123",
        };
        const createdRule = createTestAlertRule();
        mockAlertRuleRepository.create.mockResolvedValue(createdRule);

        const result = await alertingService.create(ruleData);

        expect(result).toEqual(createdRule);
        expect(mockAlertRuleRepository.create).toHaveBeenCalledWith(ruleData);
      });
    });

    describe("update", () => {
      it("should update an existing alert rule", async () => {
        const updateData = { threshold: 150 };
        const updatedRule = createTestAlertRule({ threshold: 150 });
        mockAlertRuleRepository.update.mockResolvedValue(updatedRule);

        const result = await alertingService.update(1, updateData);

        expect(result).toEqual(updatedRule);
        expect(mockAlertRuleRepository.update).toHaveBeenCalledWith(
          1,
          updateData
        );
      });
    });

    describe("delete", () => {
      it("should delete an alert rule", async () => {
        await alertingService.delete(1);

        expect(mockAlertRuleRepository.delete).toHaveBeenCalledWith(1);
      });
    });
  });

  describe("Observable Service Methods", () => {
    it("should register event listeners", () => {
      const handler = vi.fn();
      alertingService.on("TEST_EVENT", handler);

      expect(mockEventBus.onDynamic).toHaveBeenCalledWith(
        "TEST_EVENT",
        handler
      );
    });

    it("should remove event listeners", () => {
      const handler = vi.fn();
      alertingService.off("TEST_EVENT", handler);

      expect(mockEventBus.offDynamic).toHaveBeenCalledWith(
        "TEST_EVENT",
        handler
      );
    });

    it("should emit events", () => {
      const data = { test: "data" };
      alertingService.emit("TEST_EVENT", data);

      expect(mockEventBus.emitDynamic).toHaveBeenCalledWith("TEST_EVENT", data);
    });
  });

  describe("Alert Rule Management", () => {
    describe("createAlertRule", () => {
      it("should create alert rule and emit event", async () => {
        const ruleData = {
          name: "High Ping Alert",
          metric: "ping" as const,
          condition: "GREATER_THAN" as const,
          threshold: 100,
          enabled: true,
          targetId: "target-123",
        };
        const createdRule = createTestAlertRule();
        mockAlertRuleRepository.create.mockResolvedValue(createdRule);

        const result = await alertingService.createAlertRule(ruleData);

        expect(result).toEqual(createdRule);
        expect(mockEventBus.emitDynamic).toHaveBeenCalledWith(
          "ALERT_RULE_CREATED",
          {
            id: createdRule.id,
            targetId: createdRule.targetId,
            rule: createdRule,
          }
        );
      });

      it("should handle creation errors", async () => {
        const ruleData = {
          name: "High Ping Alert",
          metric: "ping" as const,
          condition: "GREATER_THAN" as const,
          threshold: 100,
          enabled: true,
          targetId: "target-123",
        };
        const error = new Error("Database error");
        mockAlertRuleRepository.create.mockRejectedValue(error);

        await expect(alertingService.createAlertRule(ruleData)).rejects.toThrow(
          "Database error"
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "AlertingService: Alert rule creation failed",
          {
            error,
            data: ruleData,
          }
        );
      });
    });

    describe("getAlertRule", () => {
      it("should get alert rule by id", async () => {
        const testRule = createTestAlertRule();
        mockAlertRuleRepository.findById.mockResolvedValue(testRule);

        const result = await alertingService.getAlertRule(1);

        expect(result).toEqual(testRule);
        expect(mockAlertRuleRepository.findById).toHaveBeenCalledWith(1);
      });
    });

    describe("updateAlertRule", () => {
      it("should update alert rule and emit event", async () => {
        const updateData = { threshold: 150 };
        const updatedRule = createTestAlertRule({ threshold: 150 });
        mockAlertRuleRepository.update.mockResolvedValue(updatedRule);

        const result = await alertingService.updateAlertRule(1, updateData);

        expect(result).toEqual(updatedRule);
        expect(mockEventBus.emitDynamic).toHaveBeenCalledWith(
          "ALERT_RULE_UPDATED",
          {
            id: updatedRule.id,
            rule: updatedRule,
            previousData: updateData,
          }
        );
      });
    });

    describe("deleteAlertRule", () => {
      it("should delete alert rule and emit event", async () => {
        await alertingService.deleteAlertRule(1);

        expect(mockAlertRuleRepository.delete).toHaveBeenCalledWith(1);
        expect(mockEventBus.emitDynamic).toHaveBeenCalledWith(
          "ALERT_RULE_DELETED",
          {
            id: 1,
            targetId: "unknown",
          }
        );
      });
    });

    describe("getAlertRulesByTargetId", () => {
      it("should get alert rules for a target", async () => {
        const targetId = "target-123";
        const rules = [createTestAlertRule(), createTestAlertRule({ id: 2 })];
        mockAlertRuleRepository.findByTargetId.mockResolvedValue(rules);

        const result = await alertingService.getAlertRulesByTargetId(targetId);

        expect(result).toEqual(rules);
        expect(mockAlertRuleRepository.findByTargetId).toHaveBeenCalledWith(
          targetId
        );
      });
    });

    describe("toggleAlertRule", () => {
      it("should toggle alert rule enabled state", async () => {
        const toggledRule = createTestAlertRule({ enabled: false });
        mockAlertRuleRepository.toggleEnabled.mockResolvedValue(toggledRule);

        const result = await alertingService.toggleAlertRule(1, false);

        expect(result).toEqual(toggledRule);
        expect(mockAlertRuleRepository.toggleEnabled).toHaveBeenCalledWith(
          1,
          false
        );
        expect(mockEventBus.emitDynamic).toHaveBeenCalledWith(
          "ALERT_RULE_UPDATED",
          {
            id: toggledRule.id,
            rule: toggledRule,
            previousData: { enabled: true },
          }
        );
      });

      it("should handle toggle errors", async () => {
        const error = new Error("Database error");
        mockAlertRuleRepository.toggleEnabled.mockRejectedValue(error);

        await expect(alertingService.toggleAlertRule(1, false)).rejects.toThrow(
          "Database error"
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "AlertingService: Alert rule toggle failed",
          {
            error,
            id: 1,
            enabled: false,
          }
        );
      });
    });
  });

  describe("Incident Management", () => {
    describe("getIncidentsByTargetId", () => {
      it("should get incidents for a target", async () => {
        const targetId = "target-123";
        const incidents = [
          createTestIncidentEvent(),
          createTestIncidentEvent({ id: 2 }),
        ];
        mockIncidentEventRepository.findByTargetId.mockResolvedValue(incidents);

        const result = await alertingService.getIncidentsByTargetId(targetId);

        expect(result).toEqual(incidents);
        expect(mockIncidentEventRepository.findByTargetId).toHaveBeenCalledWith(
          targetId
        );
      });
    });

    describe("resolveIncident", () => {
      it("should resolve an incident and emit event", async () => {
        await alertingService.resolveIncident(1);

        expect(mockIncidentEventRepository.resolve).toHaveBeenCalledWith(1);
        expect(mockEventBus.emitDynamic).toHaveBeenCalledWith(
          "INCIDENT_RESOLVED",
          expect.objectContaining({
            id: 1,
            targetId: "unknown",
            duration: expect.any(Number),
            resolvedAt: expect.any(Date),
          })
        );
      });

      it("should handle resolution errors", async () => {
        const error = new Error("Database error");
        mockIncidentEventRepository.resolve.mockRejectedValue(error);

        await expect(alertingService.resolveIncident(1)).rejects.toThrow(
          "Database error"
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "AlertingService: Incident resolution failed",
          {
            error,
            id: 1,
          }
        );
      });
    });

    describe("getUnresolvedIncidents", () => {
      it("should get unresolved incidents", async () => {
        const incidents = [
          createTestIncidentEvent(),
          createTestIncidentEvent({ id: 2 }),
        ];
        mockIncidentEventRepository.findUnresolved.mockResolvedValue(incidents);

        const result = await alertingService.getUnresolvedIncidents();

        expect(result).toEqual(incidents);
        expect(mockIncidentEventRepository.findUnresolved).toHaveBeenCalled();
      });
    });

    describe("createIncident", () => {
      it("should create incident and emit events", async () => {
        const incidentData = {
          type: "ALERT" as const,
          description: "High ping detected",
          targetId: "target-123",
          ruleId: 1,
        };
        const createdIncident = createTestIncidentEvent();
        mockIncidentEventRepository.create.mockResolvedValue(createdIncident);

        const result = await alertingService.createIncident(incidentData);

        expect(result).toEqual(createdIncident);
        expect(mockIncidentEventRepository.create).toHaveBeenCalledWith(
          incidentData
        );
        expect(mockEventBus.emitDynamic).toHaveBeenCalledWith(
          "INCIDENT_CREATED",
          expect.objectContaining({
            id: createdIncident.id,
            targetId: createdIncident.targetId,
            type: "ALERT",
            description: "Test incident",
            ruleId: createdIncident.ruleId,
            createdAt: expect.any(Date),
          })
        );
      });

      it("should handle creation errors", async () => {
        const incidentData = {
          type: "ALERT" as const,
          description: "High ping detected",
          targetId: "target-123",
          ruleId: 1,
        };
        const error = new Error("Database error");
        mockIncidentEventRepository.create.mockRejectedValue(error);

        await expect(
          alertingService.createIncident(incidentData)
        ).rejects.toThrow("Database error");
        expect(mockLogger.error).toHaveBeenCalledWith(
          "AlertingService: Incident creation failed",
          {
            error,
            data: incidentData,
          }
        );
      });
    });
  });

  describe("Speed Test Evaluation", () => {
    describe("processSpeedTestResult", () => {
      it("should process speed test result", async () => {
        const result = createTestSpeedTestResult();
        const rules = [createTestAlertRule()];
        mockAlertRuleRepository.findByTargetId.mockResolvedValue(rules);

        await alertingService.processSpeedTestResult(result);

        expect(mockAlertRuleRepository.findByTargetId).toHaveBeenCalledWith(
          result.targetId
        );
      });
    });

    describe("checkAlertRules", () => {
      it("should check alert rules for a target", async () => {
        const targetId = "target-123";
        const result = createTestSpeedTestResult();
        const rules = [createTestAlertRule()];
        mockAlertRuleRepository.findByTargetId.mockResolvedValue(rules);

        await alertingService.checkAlertRules(targetId, result);

        expect(mockAlertRuleRepository.findByTargetId).toHaveBeenCalledWith(
          targetId
        );
      });
    });

    describe("evaluateSpeedTestResult", () => {
      it("should evaluate enabled rules only", async () => {
        const result = createTestSpeedTestResult();
        const rules = [
          createTestAlertRule({ id: 1, enabled: true }),
          createTestAlertRule({ id: 2, enabled: false }),
        ];
        mockAlertRuleRepository.findByTargetId.mockResolvedValue(rules);

        await alertingService.evaluateSpeedTestResult(result);

        expect(mockAlertRuleRepository.findByTargetId).toHaveBeenCalledWith(
          result.targetId
        );
      });

      it("should handle evaluation errors", async () => {
        const result = createTestSpeedTestResult();
        const error = new Error("Database error");
        mockAlertRuleRepository.findByTargetId.mockRejectedValue(error);

        await alertingService.evaluateSpeedTestResult(result);

        expect(mockLogger.error).toHaveBeenCalledWith(
          "AlertingService: Speed test evaluation failed",
          {
            error,
            targetId: result.targetId,
          }
        );
      });
    });

    describe("evaluateRule", () => {
      it("should trigger alert for ping greater than threshold", async () => {
        const rule = createTestAlertRule({
          metric: "ping" as const,
          condition: "GREATER_THAN" as const,
          threshold: 100,
        });
        const result = {
          id: 1,
          targetId: "target-123",
          ping: 150,
          download: 100,
          upload: 50,
          status: "SUCCESS",
          error: null,
          createdAt: new Date(),
        };
        const createdIncident = createTestIncidentEvent();
        mockIncidentEventRepository.create.mockResolvedValue(createdIncident);

        // Access private method through any cast
        // Justification: Using any type to access private evaluateRule method for testing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (alertingService as any).evaluateRule(rule, result);

        expect(mockIncidentEventRepository.create).toHaveBeenCalledWith({
          targetId: result.targetId,
          type: "ALERT",
          description: `Alert triggered: ping GREATER_THAN 100 (actual: 150)`,
          ruleId: rule.id,
        });
        expect(mockEventBus.emitDynamic).toHaveBeenCalledWith(
          "ALERT_TRIGGERED",
          expect.objectContaining({
            targetId: result.targetId,
            ruleId: rule.id,
            ruleName: rule.name,
            metric: rule.metric,
            value: 150,
            threshold: 100,
            condition: rule.condition,
            triggeredAt: expect.any(Date),
          })
        );
      });

      it("should trigger alert for download less than threshold", async () => {
        const rule = createTestAlertRule({
          metric: "download" as const,
          condition: "LESS_THAN" as const,
          threshold: 50,
        });
        const result = {
          id: 1,
          targetId: "target-123",
          ping: 50,
          download: 25,
          upload: 50,
          status: "SUCCESS",
          error: null,
          createdAt: new Date(),
        };
        const createdIncident = createTestIncidentEvent();
        mockIncidentEventRepository.create.mockResolvedValue(createdIncident);

        // Justification: Using any type to access private evaluateRule method for testing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (alertingService as any).evaluateRule(rule, result);

        expect(mockIncidentEventRepository.create).toHaveBeenCalledWith({
          targetId: result.targetId,
          type: "ALERT",
          description: `Alert triggered: download LESS_THAN 50 (actual: 25)`,
          ruleId: rule.id,
        });
        expect(mockEventBus.emitDynamic).toHaveBeenCalledWith(
          "ALERT_TRIGGERED",
          expect.objectContaining({
            targetId: result.targetId,
            ruleId: rule.id,
            ruleName: rule.name,
            metric: rule.metric,
            value: 25,
            threshold: 50,
            condition: rule.condition,
            triggeredAt: expect.any(Date),
          })
        );
      });

      it("should not trigger alert when condition not met", async () => {
        const rule = createTestAlertRule({
          metric: "ping" as const,
          condition: "GREATER_THAN" as const,
          threshold: 100,
        });
        const result = createTestSpeedTestResult({ ping: 50 });

        // Justification: Using any type to access private evaluateRule method for testing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (alertingService as any).evaluateRule(rule, result);

        expect(mockIncidentEventRepository.create).not.toHaveBeenCalled();
        expect(mockEventBus.emitDynamic).not.toHaveBeenCalledWith(
          "ALERT_TRIGGERED",
          expect.any(Object)
        );
      });

      it("should skip evaluation when metric value is null", async () => {
        const rule = createTestAlertRule({
          metric: "ping" as const,
          condition: "GREATER_THAN" as const,
          threshold: 100,
        });
        const result = createTestSpeedTestResult({ ping: null });

        // Justification: Using any type to access private evaluateRule method for testing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (alertingService as any).evaluateRule(rule, result);

        expect(mockIncidentEventRepository.create).not.toHaveBeenCalled();
        expect(mockLogger.debug).toHaveBeenCalledWith(
          "AlertingService: Evaluating rule",
          {
            ruleId: rule.id,
            metric: rule.metric,
            condition: rule.condition,
            threshold: rule.threshold,
          }
        );
      });
    });
  });

  describe("Event Handlers", () => {
    describe("handleSpeedTestCompleted", () => {
      it("should process speed test result when event is received", async () => {
        const eventData = {
          targetId: "target-123",
          result: createTestSpeedTestResult(),
        };
        const rules = [createTestAlertRule()];
        mockAlertRuleRepository.findByTargetId.mockResolvedValue(rules);

        // Emit the event
        mockEventBus.emit("SPEED_TEST_COMPLETED", eventData);

        // Wait for async processing
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(mockAlertRuleRepository.findByTargetId).toHaveBeenCalledWith(
          eventData.result.targetId
        );
      });
    });
  });
});
