// Types for mock services and test data

import type {
  Notification,
  CreateNotificationData,
} from "@network-monitor/shared";
import type {
  PushSubscription,
  CreatePushSubscriptionData,
} from "@network-monitor/shared";
import type { CreateAlertRuleData } from "@network-monitor/shared";
import type {
  Target,
  CreateTargetData,
  SpeedTestResult,
  AlertRule,
} from "@network-monitor/shared";

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
export interface MockTarget extends Target {
  id: string; // Ensure string ID for mocks
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

// Mock database client interface
export interface MockPrismaClient {
  monitoringTarget: {
    findUnique: (args: { where: { id: string } }) => Promise<Target | null>;
    findMany: (args?: { where?: Record<string, unknown> }) => Promise<Target[]>;
    create: (args: { data: CreateTargetData }) => Promise<Target>;
    update: (args: {
      where: { id: string };
      data: Partial<CreateTargetData>;
    }) => Promise<Target>;
    delete: (args: { where: { id: string } }) => Promise<Target>;
  };
  speedTestResult: {
    findMany: (args?: {
      where?: Record<string, unknown>;
    }) => Promise<SpeedTestResult[]>;
    create: (args: {
      data: Omit<SpeedTestResult, "id">;
    }) => Promise<SpeedTestResult>;
  };
  alertRule: {
    findMany: (args?: {
      where?: Record<string, unknown>;
    }) => Promise<AlertRule[]>;
    create: (args: { data: CreateAlertRuleData }) => Promise<AlertRule>;
    update: (args: {
      where: { id: number };
      data: Partial<CreateAlertRuleData>;
    }) => Promise<AlertRule>;
    delete: (args: { where: { id: number } }) => Promise<AlertRule>;
  };
  notification: {
    findMany: (args?: {
      where?: Record<string, unknown>;
    }) => Promise<Notification[]>;
    create: (args: { data: CreateNotificationData }) => Promise<Notification>;
  };
  pushSubscription: {
    findMany: (args?: {
      where?: Record<string, unknown>;
    }) => Promise<PushSubscription[]>;
    create: (args: {
      data: CreatePushSubscriptionData;
    }) => Promise<PushSubscription>;
    delete: (args: { where: { id: string } }) => Promise<PushSubscription>;
  };
}
