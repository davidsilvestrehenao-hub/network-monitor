// Tests for strongly-typed event map system
// Ensures type safety and proper event handling

import { describe, it, expect } from "vitest";
import type { EventName, EventData } from "../types/event-map-types";
import { createTypedEvent, isValidEventType } from "../types/event-map-types";
import {
  AlertConditions,
  MonitoringMetrics,
  SpeedTestStatus,
} from "../constants/domain-constants";

describe("Event Map Types", () => {
  describe("Type Safety", () => {
    it("should enforce correct event data types", () => {
      // This test verifies compile-time type safety
      const targetCreatedData: EventData<"TARGET_CREATED"> = {
        id: "target-123",
        name: "Test Target",
        address: "https://test.com",
        ownerId: "user-456",
      };

      expect(targetCreatedData.id).toBe("target-123");
      expect(targetCreatedData.name).toBe("Test Target");
      expect(targetCreatedData.address).toBe("https://test.com");
      expect(targetCreatedData.ownerId).toBe("user-456");
    });

    it("should enforce correct event names", () => {
      const validEventNames: EventName[] = [
        "TARGET_CREATED",
        "TARGET_DELETED",
        "SPEED_TEST_COMPLETED",
        "ALERT_TRIGGERED",
        "USER_LOGIN_SUCCESS",
      ];

      validEventNames.forEach(eventName => {
        expect(typeof eventName).toBe("string");
        expect(eventName.length).toBeGreaterThan(0);
      });
    });
  });

  describe("createTypedEvent", () => {
    it("should create a properly typed event", () => {
      const eventData: EventData<"TARGET_CREATED"> = {
        id: "target-123",
        name: "Test Target",
        address: "https://test.com",
        ownerId: "user-456",
      };

      const event = createTypedEvent("TARGET_CREATED", eventData);

      expect(event.type).toBe("TARGET_CREATED");
      expect(event.data).toEqual(eventData);
      expect(event.metadata.id).toBeDefined();
      expect(event.metadata.timestamp).toBeInstanceOf(Date);
      expect(event.metadata.source).toBe("network-monitor");
      expect(event.metadata.version).toBe("1.0.0");
    });

    it("should create event with custom metadata", () => {
      const eventData: EventData<"SPEED_TEST_COMPLETED"> = {
        targetId: "target-123",
        result: {
          id: "result-123",
          ping: 50,
          download: 100,
          upload: 50,
          status: SpeedTestStatus.SUCCESS,
          createdAt: new Date().toISOString(),
          targetId: "target-123",
          timestamp: new Date().toISOString(),
        },
        duration: 5000,
      };

      const customMetadata = {
        correlationId: "correlation-123",
        causationId: "causation-456",
      };

      const event = createTypedEvent(
        "SPEED_TEST_COMPLETED",
        eventData,
        customMetadata
      );

      expect(event.metadata.correlationId).toBe("correlation-123");
      expect(event.metadata.causationId).toBe("causation-456");
    });
  });

  describe("isValidEventType", () => {
    it("should validate known event types", () => {
      expect(isValidEventType("TARGET_CREATED")).toBe(true);
      expect(isValidEventType("TARGET_DELETED")).toBe(true);
      expect(isValidEventType("SPEED_TEST_COMPLETED")).toBe(true);
      expect(isValidEventType("ALERT_TRIGGERED")).toBe(true);
    });

    it("should reject unknown event types", () => {
      expect(isValidEventType("UNKNOWN_EVENT")).toBe(false);
      expect(isValidEventType("")).toBe(false);
      expect(isValidEventType("invalid-event")).toBe(false);
    });

    it("should handle edge cases", () => {
      expect(isValidEventType("target_created")).toBe(false); // Wrong case
      expect(isValidEventType("TARGET_CREATED_EXTRA")).toBe(false); // Extra suffix
      expect(isValidEventType("123")).toBe(false); // Numbers only
    });
  });

  describe("Event Data Validation", () => {
    it("should validate target events", () => {
      const targetCreatedData: EventData<"TARGET_CREATED"> = {
        id: "target-123",
        name: "Test Target",
        address: "https://test.com",
        ownerId: "user-456",
      };

      expect(targetCreatedData.id).toMatch(/^target-/);
      expect(targetCreatedData.name).toBeTruthy();
      expect(targetCreatedData.address).toMatch(/^https?:\/\//);
      expect(targetCreatedData.ownerId).toMatch(/^user-/);
    });

    it("should validate monitoring events", () => {
      const monitoringStartedData: EventData<"MONITORING_STARTED"> = {
        targetId: "target-123",
        intervalMs: 30000,
        startedAt: new Date(),
      };

      expect(monitoringStartedData.targetId).toBeTruthy();
      expect(monitoringStartedData.intervalMs).toBeGreaterThan(0);
      expect(monitoringStartedData.startedAt).toBeInstanceOf(Date);
    });

    it("should validate alert events", () => {
      const alertTriggeredData: EventData<"ALERT_TRIGGERED"> = {
        targetId: "target-123",
        ruleId: 1,
        ruleName: "High Latency Alert",
        metric: MonitoringMetrics.PING,
        value: 150,
        threshold: 100,
        condition: AlertConditions.GREATER_THAN,
        triggeredAt: new Date(),
      };

      expect(alertTriggeredData.targetId).toBeTruthy();
      expect(alertTriggeredData.ruleId).toBeGreaterThan(0);
      expect(alertTriggeredData.metric).toMatch(/^(ping|download)$/);
      expect(alertTriggeredData.condition).toMatch(
        /^(GREATER_THAN|LESS_THAN)$/
      );
      expect(alertTriggeredData.value).toBeGreaterThan(
        alertTriggeredData.threshold
      );
    });
  });

  describe("Complex Event Scenarios", () => {
    it("should handle authentication flow events", () => {
      const loginRequestData: EventData<"USER_LOGIN_REQUESTED"> = {
        email: "user@example.com",
        provider: "oauth",
      };

      const loginSuccessData: EventData<"USER_LOGIN_SUCCESS"> = {
        user: {
          id: "user-123",
          name: "Test User",
          email: "user@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        sessionToken: "session-token-123",
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
        loginAt: new Date(),
      };

      expect(loginRequestData.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      expect(loginSuccessData.user.id).toBeTruthy();
      expect(loginSuccessData.sessionToken).toBeTruthy();
      expect(loginSuccessData.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("should handle error scenarios", () => {
      const targetCreateFailedData: EventData<"TARGET_CREATE_FAILED"> = {
        error: "Validation failed: invalid URL",
        requestData: {
          name: "Invalid Target",
          address: "not-a-url",
          ownerId: "user-123",
        },
      };

      expect(targetCreateFailedData.error).toBeTruthy();
      expect(targetCreateFailedData.requestData.name).toBeTruthy();
      expect(targetCreateFailedData.requestData.address).toBeTruthy();
      expect(targetCreateFailedData.requestData.ownerId).toBeTruthy();
    });

    it("should handle system events", () => {
      const serviceStartedData: EventData<"SERVICE_STARTED"> = {
        serviceName: "monitor-service",
        version: "1.0.0",
        startedAt: new Date(),
        environment: "production",
      };

      expect(serviceStartedData.serviceName).toBeTruthy();
      expect(serviceStartedData.version).toMatch(/^\d+\.\d+\.\d+$/);
      expect(serviceStartedData.environment).toMatch(
        /^(development|test|staging|production)$/
      );
    });
  });

  describe("Performance Events", () => {
    it("should handle performance metrics", () => {
      const performanceMetricData: EventData<"PERFORMANCE_METRIC"> = {
        metric: "response_time",
        value: 150,
        unit: "ms",
        timestamp: new Date(),
        context: {
          endpoint: "/api/targets",
          method: "GET",
          statusCode: 200,
        },
      };

      expect(performanceMetricData.metric).toBeTruthy();
      expect(performanceMetricData.value).toBeGreaterThan(0);
      expect(performanceMetricData.unit).toBeTruthy();
      expect(performanceMetricData.context).toBeDefined();
    });

    it("should handle cache events", () => {
      const cacheHitData: EventData<"CACHE_HIT"> = {
        key: "targets:user-123",
        hitAt: new Date(),
      };

      const cacheMissData: EventData<"CACHE_MISS"> = {
        key: "targets:user-456",
        missAt: new Date(),
      };

      expect(cacheHitData.key).toBeTruthy();
      expect(cacheHitData.hitAt).toBeInstanceOf(Date);
      expect(cacheMissData.key).toBeTruthy();
      expect(cacheMissData.missAt).toBeInstanceOf(Date);
    });
  });

  describe("Event Metadata", () => {
    it("should generate unique IDs for events", () => {
      const event1 = createTypedEvent("TARGET_CREATED", {
        id: "target-1",
        name: "Target 1",
        address: "https://test1.com",
        ownerId: "user-1",
      });

      const event2 = createTypedEvent("TARGET_CREATED", {
        id: "target-2",
        name: "Target 2",
        address: "https://test2.com",
        ownerId: "user-2",
      });

      expect(event1.metadata.id).not.toBe(event2.metadata.id);
      expect(event1.metadata.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(event2.metadata.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });

    it("should include proper timestamps", () => {
      const before = new Date();
      const event = createTypedEvent("TARGET_CREATED", {
        id: "target-123",
        name: "Test Target",
        address: "https://test.com",
        ownerId: "user-456",
      });
      const after = new Date();

      expect(event.metadata.timestamp.getTime()).toBeGreaterThanOrEqual(
        before.getTime()
      );
      expect(event.metadata.timestamp.getTime()).toBeLessThanOrEqual(
        after.getTime()
      );
    });
  });
});
