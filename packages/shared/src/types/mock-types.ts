// Types for mock services and test data
// These are simplified versions without external dependencies

// Mock notification types
export interface MockNotification {
  id: string;
  message: string;
  timestamp: string; // Changed from Date to string to match domain type
  data: {
    userId?: string;
    read?: boolean;
    // Justification: Mock notifications can have arbitrary additional data for testing
    // Using unknown allows flexible test scenarios while maintaining type safety
    [key: string]: unknown;
  };
}

export interface MockPushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Mock alert types
export interface MockAlertRule {
  id: string;
  name: string;
  metric: "ping" | "download";
  condition: "GREATER_THAN" | "LESS_THAN";
  threshold: number;
  enabled: boolean;
  targetId: string;
}

export interface MockTriggeredAlert {
  ruleId: string;
  targetId: string;
  timestamp: Date;
  data: {
    metric: string;
    value: number;
    threshold: number;
    // Justification: Mock alerts can have additional metadata for testing scenarios
    // Using unknown allows flexible test data while maintaining type safety
    [key: string]: unknown;
  };
}

// Note: MockTarget and MockSpeedTestResult removed to avoid duplicates
// Use MonitoringTarget and SpeedTestResult from domain-types.ts instead

// Event data types for mock services
export interface AlertTriggeredEventData {
  ruleId: string;
  targetId: string;
  metric: string;
  value: number;
  threshold: number;
  message: string;
}

// SpeedTestCompletedEventData is now defined in event-handler-types.ts
// Note: Using SpeedTestResult from domain-types instead of MockSpeedTestResult
import type { SpeedTestResult } from "./domain-types.js";

export interface MockSpeedTestCompletedEventData {
  targetId: string;
  result: SpeedTestResult;
  success: boolean;
  error?: string;
}

export interface NotificationEventData {
  message: string;
  userId: string;
  type?: "info" | "warning" | "error" | "success";
  data?: Record<string, unknown>;
}
