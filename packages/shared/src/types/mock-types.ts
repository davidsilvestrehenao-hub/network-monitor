// Types for mock services and test data
// These are simplified versions without external dependencies

// Mock notification types
export interface MockNotification {
  id: string;
  message: string;
  timestamp: Date;
  data: {
    userId?: string;
    read?: boolean;
    [key: string]: unknown;
  };
}

export interface MockPushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: string;
  createdAt: Date;
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
    [key: string]: unknown;
  };
}

// Mock target types
export interface MockTarget {
  id: string;
  name: string;
  address: string;
  ownerId: string;
}

export interface MockSpeedTestResult {
  id: string;
  ping?: number;
  download?: number;
  status: string;
  error?: string;
  createdAt: Date;
  targetId: string;
}

// Event data types for mock services
export interface AlertTriggeredEventData {
  ruleId: string;
  targetId: string;
  metric: string;
  value: number;
  threshold: number;
  message: string;
}

export interface SpeedTestCompletedEventData {
  targetId: string;
  result: MockSpeedTestResult;
  success: boolean;
  error?: string;
}

export interface NotificationEventData {
  message: string;
  userId: string;
  type?: "info" | "warning" | "error" | "success";
  data?: Record<string, unknown>;
}
