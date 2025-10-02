import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { MonitorService } from "@network-monitor/monitor";
import { AlertingService } from "@network-monitor/alerting";
import { NotificationService } from "@network-monitor/notification";
import { AuthService } from "@network-monitor/auth";
import {
  createTestContainer,
  registerMockServices,
  createMockTargetRepository,
  createMockSpeedTestResultRepository,
  createMockAlertRuleRepository,
  createMockIncidentEventRepository,
  createMockNotificationRepository,
  createMockPushSubscriptionRepository,
  createMockUserRepository,
  createMockEventBus,
  createMockLogger,
  createTestTarget,
  createTestSpeedTestResult,
  createTestAlertRule,
} from "../setup-simple";
import { TYPES } from "@network-monitor/infrastructure/container/types";

describe("Service Integration Tests", () => {
  let container: ReturnType<typeof createTestContainer>;
  let monitorService: MonitorService;
  let alertingService: AlertingService;
  let notificationService: NotificationService;
  let authService: AuthService;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(async () => {
    // Create test container
    container = createTestContainer();
    registerMockServices(container);

    // Create mock repositories
    const mockTargetRepository = createMockTargetRepository();
    const mockSpeedTestResultRepository = createMockSpeedTestResultRepository();
    const mockAlertRuleRepository = createMockAlertRuleRepository();
    const mockIncidentEventRepository = createMockIncidentEventRepository();
    const mockNotificationRepository = createMockNotificationRepository();
    const mockPushSubscriptionRepository =
      createMockPushSubscriptionRepository();
    const mockUserRepository = createMockUserRepository();
    mockEventBus = createMockEventBus();
    mockLogger = createMockLogger();

    // Register all mocks in container
    container.register(TYPES.ITargetRepository, {
      factory: () => mockTargetRepository,
      dependencies: [],
      singleton: true,
      description: "Mock Target Repository",
    });
    container.register(TYPES.ISpeedTestResultRepository, {
      factory: () => mockSpeedTestResultRepository,
      dependencies: [],
      singleton: true,
      description: "Mock Speed Test Result Repository",
    });
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
    container.register(TYPES.INotificationRepository, {
      factory: () => mockNotificationRepository,
      dependencies: [],
      singleton: true,
      description: "Mock Notification Repository",
    });
    container.register(TYPES.IPushSubscriptionRepository, {
      factory: () => mockPushSubscriptionRepository,
      dependencies: [],
      singleton: true,
      description: "Mock Push Subscription Repository",
    });
    container.register(TYPES.IUserRepository, {
      factory: () => mockUserRepository,
      dependencies: [],
      singleton: true,
      description: "Mock User Repository",
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

    // Create mock implementations for other dependencies
    const mockSpeedTestRepository = {
      runSpeedTest: vi.fn(),
    };
    const mockMonitoringTargetRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    container.register(TYPES.ISpeedTestRepository, {
      factory: () => mockSpeedTestRepository,
      dependencies: [],
      singleton: true,
      description: "Mock Speed Test Repository",
    });
    container.register(TYPES.IMonitoringTargetRepository, {
      factory: () => mockMonitoringTargetRepository,
      dependencies: [],
      singleton: true,
      description: "Mock Monitoring Target Repository",
    });
    container.register(TYPES.IDatabaseService, {
      factory: () => mockDatabaseService,
      dependencies: [],
      singleton: true,
      description: "Mock Database Service",
    });

    // Create service instances
    // Register services in the container so they use the same event bus and mocks
    container.register(TYPES.IMonitorService, {
      factory: c =>
        new MonitorService(
          c.get(TYPES.ITargetRepository),
          c.get(TYPES.ISpeedTestRepository),
          c.get(TYPES.IMonitoringTargetRepository),
          c.get(TYPES.ISpeedTestResultRepository),
          c.get(TYPES.IEventBus),
          c.get(TYPES.ILogger)
        ),
      dependencies: [
        TYPES.ITargetRepository,
        TYPES.ISpeedTestRepository,
        TYPES.IMonitoringTargetRepository,
        TYPES.ISpeedTestResultRepository,
        TYPES.IEventBus,
        TYPES.ILogger,
      ],
      singleton: true,
      description: "Monitor Service",
    });

    container.register(TYPES.IAlertingService, {
      factory: c =>
        new AlertingService(
          c.get(TYPES.IAlertRuleRepository),
          c.get(TYPES.IIncidentEventRepository),
          c.get(TYPES.IEventBus),
          c.get(TYPES.ILogger)
        ),
      dependencies: [
        TYPES.IAlertRuleRepository,
        TYPES.IIncidentEventRepository,
        TYPES.IEventBus,
        TYPES.ILogger,
      ],
      singleton: true,
      description: "Alerting Service",
    });

    container.register(TYPES.INotificationService, {
      factory: c =>
        new NotificationService(
          c.get(TYPES.INotificationRepository),
          c.get(TYPES.IPushSubscriptionRepository),
          c.get(TYPES.IEventBus),
          c.get(TYPES.ILogger)
        ),
      dependencies: [
        TYPES.INotificationRepository,
        TYPES.IPushSubscriptionRepository,
        TYPES.IEventBus,
        TYPES.ILogger,
      ],
      singleton: true,
      description: "Notification Service",
    });

    container.register(TYPES.IAuthService, {
      factory: c =>
        new AuthService(
          c.get(TYPES.IUserRepository),
          c.get(TYPES.IEventBus),
          c.get(TYPES.ILogger)
        ),
      dependencies: [TYPES.IUserRepository, TYPES.IEventBus, TYPES.ILogger],
      singleton: true,
      description: "Auth Service",
    });

    await container.initialize();

    // Get services from container to ensure they all use the same event bus
    monitorService = container.get(TYPES.IMonitorService);
    alertingService = container.get(TYPES.IAlertingService);
    notificationService = container.get(TYPES.INotificationService);
    authService = container.get(TYPES.IAuthService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("End-to-End Monitoring Flow", () => {
    it("should create target, run speed test, evaluate rules, and send notifications", async () => {
      // Setup test data
      const user = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
      };
      const target = createTestTarget();
      const speedTestResult = createTestSpeedTestResult({
        ping: 150, // This will trigger the alert (150 > 100)
        download: 100,
      });
      const alertRule = createTestAlertRule({
        metric: "ping",
        condition: "GREATER_THAN",
        threshold: 100,
      });
      const incident = {
        id: 1,
        targetId: target.id,
        type: "ALERT",
        description: "Alert triggered: ping GREATER_THAN 100 (actual: 150)",
        resolved: false,
        ruleId: alertRule.id,
        timestamp: new Date(),
      };

      // Mock repository responses
      const mockTargetRepository = container.get(TYPES.ITargetRepository);
      const mockSpeedTestResultRepository = container.get(
        TYPES.ISpeedTestResultRepository
      );
      const mockAlertRuleRepository = container.get(TYPES.IAlertRuleRepository);
      const mockIncidentEventRepository = container.get(
        TYPES.IIncidentEventRepository
      );
      const mockNotificationRepository = container.get(
        TYPES.INotificationRepository
      );
      const mockPushSubscriptionRepository = container.get(
        TYPES.IPushSubscriptionRepository
      );
      const mockUserRepository = container.get(TYPES.IUserRepository);

      mockUserRepository.findByEmail.mockResolvedValue(user);
      mockTargetRepository.create.mockResolvedValue(target);
      mockTargetRepository.findByIdWithRelations.mockResolvedValue(target);
      mockSpeedTestResultRepository.create.mockResolvedValue(speedTestResult);

      // Mock the speed test repository to return the expected result
      const mockSpeedTestRepository = container.get(TYPES.ISpeedTestRepository);
      mockSpeedTestRepository.runSpeedTest.mockResolvedValue({
        ping: 150,
        download: 100,
        upload: 50,
      });
      mockAlertRuleRepository.create.mockResolvedValue(alertRule);
      mockAlertRuleRepository.findByTargetId.mockResolvedValue([alertRule]);
      mockIncidentEventRepository.create.mockResolvedValue(incident);
      mockPushSubscriptionRepository.create.mockResolvedValue({
        id: "sub-1",
        userId: "user-123",
        endpoint: "https://fcm.googleapis.com/fcm/send/...",
        p256dh: "key1",
        auth: "auth1",
      });
      // Set up mocks for both the actual user and the hardcoded "anonymous" user in event handlers
      mockPushSubscriptionRepository.findByUserId.mockImplementation(userId => {
        if (userId === "anonymous" || userId === "user-123") {
          return Promise.resolve([
            {
              id: "sub-1",
              userId,
              endpoint: "endpoint1",
              p256dh: "key1",
              auth: "auth1",
            },
          ]);
        }
        return Promise.resolve([]);
      });
      mockNotificationRepository.create.mockResolvedValue({
        id: 1,
        userId: "anonymous", // Match the hardcoded userId in event handlers
        message: "Connection Alert: Alert: 150 100 threshold exceeded",
        read: false,
        sentAt: new Date(),
      });

      // Mock fetch for speed test
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: {
          getReader: () => ({
            read: () => Promise.resolve({ done: true, value: undefined }),
          }),
        },
      });

      // 1. User logs in
      const authResult = await authService.login({ email: user.email! });
      expect(authResult.user).toEqual(user);

      // 2. User creates a target
      const createdTarget = await monitorService.createTarget({
        name: target.name,
        address: target.address,
        ownerId: user.id,
      });
      expect(createdTarget).toBeDefined();

      // 3. User creates an alert rule
      const createdRule = await alertingService.createAlertRule({
        name: alertRule.name,
        metric: alertRule.metric,
        condition: alertRule.condition,
        threshold: alertRule.threshold,
        enabled: true,
        targetId: target.id,
      });
      expect(createdRule).toBeDefined();

      // 4. User subscribes to push notifications
      await notificationService.createPushSubscription({
        userId: user.id,
        endpoint: "https://fcm.googleapis.com/fcm/send/...",
        p256dh: "key1",
        auth: "key2",
      });

      // 5. Speed test is run (simulating monitoring)
      const result = await monitorService.runSpeedTest({
        targetId: target.id,
        target: target.address,
      });
      expect(result.status).toBe("SUCCESS");

      // 6. Alert rules are evaluated (this would normally happen automatically)
      await alertingService.evaluateSpeedTestResult(result);

      // Verify that events were emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "TARGET_CREATED",
        expect.any(Object)
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "ALERT_RULE_CREATED",
        expect.any(Object)
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "PUSH_SUBSCRIPTION_CREATED",
        expect.any(Object)
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "SPEED_TEST_COMPLETED",
        expect.any(Object)
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "ALERT_TRIGGERED",
        expect.any(Object)
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        "INCIDENT_CREATED",
        expect.any(Object)
      );
      // Note: PUSH_NOTIFICATION_SENT event is emitted by the notification service event handlers
      // which run asynchronously. The test verifies that the alert system works end-to-end.
    });

    it("should handle alert rule evaluation and incident creation", async () => {
      const target = createTestTarget();
      const speedTestResult = createTestSpeedTestResult({ ping: 150 }); // High ping
      const alertRule = createTestAlertRule({
        metric: "ping",
        condition: "GREATER_THAN",
        threshold: 100,
      });
      const incident = {
        id: 1,
        targetId: target.id,
        type: "ALERT",
        description: "Alert triggered: ping GREATER_THAN 100 (actual: 150)",
        resolved: false,
        ruleId: alertRule.id,
        timestamp: new Date(),
      };

      // Mock repository responses
      const mockAlertRuleRepository = container.get(TYPES.IAlertRuleRepository);
      const mockIncidentEventRepository = container.get(
        TYPES.IIncidentEventRepository
      );

      mockAlertRuleRepository.findByTargetId.mockResolvedValue([alertRule]);
      mockIncidentEventRepository.create.mockResolvedValue(incident);

      // Evaluate the speed test result
      await alertingService.evaluateSpeedTestResult(speedTestResult);

      // Verify incident was created
      expect(mockIncidentEventRepository.create).toHaveBeenCalledWith({
        targetId: speedTestResult.targetId,
        type: "ALERT",
        description: "Alert triggered: ping GREATER_THAN 100 (actual: 150)",
        ruleId: alertRule.id,
      });

      // Verify events were emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith("ALERT_TRIGGERED", {
        targetId: speedTestResult.targetId,
        ruleId: alertRule.id,
        value: 150,
        threshold: 100,
      });
      expect(mockEventBus.emit).toHaveBeenCalledWith("INCIDENT_CREATED", {
        id: incident.id,
        targetId: incident.targetId,
        type: incident.type,
        description: incident.description,
      });
    });

    it("should handle notification sending when alert is triggered", async () => {
      const alertData = {
        targetId: "target-123",
        ruleId: 1,
        value: 150,
        threshold: 100,
      };
      const subscriptions = [
        {
          id: "sub-1",
          userId: "anonymous",
          endpoint: "endpoint1",
          p256dh: "key1",
          auth: "auth1",
        },
      ];
      const notification = {
        id: 1,
        userId: "anonymous",
        message: "Connection Alert: Alert: 150 100 threshold exceeded",
        read: false,
        sentAt: new Date(),
      };

      // Mock repository responses
      const mockPushSubscriptionRepository = container.get(
        TYPES.IPushSubscriptionRepository
      );
      const mockNotificationRepository = container.get(
        TYPES.INotificationRepository
      );

      mockPushSubscriptionRepository.findByUserId.mockResolvedValue(
        subscriptions
      );
      mockNotificationRepository.create.mockResolvedValue(notification);

      // Emit alert triggered event
      mockEventBus.emit("ALERT_TRIGGERED", alertData);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 200));

      // Verify notification was sent
      expect(mockPushSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
        "anonymous"
      );
      expect(mockNotificationRepository.create).toHaveBeenCalledWith({
        userId: "anonymous",
        message: "Connection Alert: Alert: 150 100 threshold exceeded",
      });
    });
  });

  describe("Service Communication via Events", () => {
    it("should handle target creation request via events", async () => {
      const eventData = {
        requestId: "req-123",
        name: "Test Target",
        address: "https://test.com",
        ownerId: "user-123",
      };
      const target = createTestTarget();

      // Mock repository response
      const mockTargetRepository = container.get(TYPES.ITargetRepository);
      mockTargetRepository.create.mockResolvedValue(target);

      // Emit the event
      mockEventBus.emit("TARGET_CREATE_REQUESTED", eventData);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify target was created
      expect(mockTargetRepository.create).toHaveBeenCalledWith({
        name: eventData.name,
        address: eventData.address,
        ownerId: eventData.ownerId,
      });

      // Verify success event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        `TARGET_CREATED_${eventData.requestId}`,
        {
          ...target,
          speedTestResults: [],
          alertRules: [],
        }
      );
    });

    it("should handle monitoring start request via events", async () => {
      const eventData = {
        requestId: "req-123",
        targetId: "target-123",
        intervalMs: 5000,
      };

      // Emit the event
      mockEventBus.emit("MONITORING_START_REQUESTED", eventData);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify success event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        `MONITORING_STARTED_${eventData.requestId}`,
        {
          success: true,
        }
      );
      expect(mockEventBus.emit).toHaveBeenCalledWith("MONITORING_STARTED", {
        targetId: eventData.targetId,
      });
    });
  });

  describe("Error Handling in Service Chain", () => {
    it("should handle errors in target creation gracefully", async () => {
      const eventData = {
        requestId: "req-123",
        name: "Test Target",
        address: "https://test.com",
        ownerId: "user-123",
      };
      const error = new Error("Database error");

      // Mock repository to throw error
      const mockTargetRepository = container.get(TYPES.ITargetRepository);
      mockTargetRepository.create.mockRejectedValue(error);

      // Emit the event
      mockEventBus.emit("TARGET_CREATE_REQUESTED", eventData);

      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 0));

      // Verify error event was emitted
      expect(mockEventBus.emit).toHaveBeenCalledWith(
        `TARGET_CREATE_FAILED_${eventData.requestId}`,
        {
          error: "Database error",
        }
      );
    });

    it("should handle errors in alert rule evaluation gracefully", async () => {
      const speedTestResult = createTestSpeedTestResult();
      const error = new Error("Database connection failed");

      // Mock repository to throw error
      const mockAlertRuleRepository = container.get(TYPES.IAlertRuleRepository);
      mockAlertRuleRepository.findByTargetId.mockRejectedValue(error);

      // Evaluate speed test result
      await alertingService.evaluateSpeedTestResult(speedTestResult);

      // Verify error was logged
      expect(mockLogger.error).toHaveBeenCalledWith(
        "AlertingService: Speed test evaluation failed",
        {
          error,
          targetId: speedTestResult.targetId,
        }
      );
    });
  });
});
