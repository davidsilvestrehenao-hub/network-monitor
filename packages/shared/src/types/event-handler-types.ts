/**
 * Shared types for event handler parameters
 * These types are used across multiple services for event-driven communication
 */

// Import required types from interfaces
import type { SpeedTestConfig } from "../interfaces/services/IMonitorService";
import type {
  CreateAlertRuleData,
  UpdateAlertRuleData,
} from "../interfaces/repositories/IAlertRuleRepository";
import type { CreatePushSubscriptionData } from "../interfaces/repositories/IPushSubscriptionRepository";
import type { StandardizedSpeedTestResult } from "./standardized-domain-types";

// Auth types need to be defined here since they're in the auth package
export interface LoginCredentials {
  email: string;
  password?: string; // Optional for OAuth flows
}

export interface RegisterData {
  email: string;
  name?: string;
  password?: string;
}

// Target-related event handler types
export interface TargetCreateRequestData {
  requestId?: string;
  name: string;
  address: string;
  ownerId: string;
}

export interface TargetUpdateRequestData {
  requestId?: string;
  id: string;
  name?: string;
  address?: string;
}

export interface TargetDeleteRequestData {
  requestId?: string;
  id: string;
}

// Monitoring-related event handler types
export interface MonitoringStartRequestData {
  requestId?: string;
  targetId: string;
  intervalMs?: number;
}

export interface MonitoringStopRequestData {
  requestId?: string;
  targetId: string;
}

export interface SpeedTestRequestData {
  requestId?: string;
  targetId: string;
}

export interface SpeedTestConfigRequestData {
  requestId?: string;
  config: SpeedTestConfig; // Import from shared interfaces
}

export interface SpeedTestCompletedEventData {
  targetId: string;
  result: StandardizedSpeedTestResult;
}

// Alert-related event handler types
export interface AlertTriggeredData {
  targetId: string;
  ruleId: number;
  value: number;
  threshold: number;
}

export interface AlertRuleCreateRequestData {
  requestId?: string;
  targetId: string;
  rule: CreateAlertRuleData;
}

export interface AlertRuleUpdateRequestData {
  requestId?: string;
  id: number;
  rule: UpdateAlertRuleData;
}

export interface AlertRuleDeleteRequestData {
  requestId?: string;
  id: number;
}

// Incident-related event handler types
export interface IncidentCreatedData {
  id: number;
  targetId: string;
  type: string;
  description: string;
}

// Notification-related event handler types
export interface NotificationSendRequestData {
  userId: string;
  message: string;
}

export interface PushSubscriptionCreateRequestData {
  userId: string;
  subscription: CreatePushSubscriptionData;
}

// Auth-related event handler types
export interface UserLoginRequestData {
  credentials: LoginCredentials;
}

export interface UserRegisterRequestData {
  data: RegisterData;
}

export interface UserLogoutRequestData {
  sessionToken: string;
}

// Generic event handler types
export interface ErrorEventData {
  error: string;
}

export interface IdEventData {
  id: string;
}

export interface TargetIdEventData {
  targetId: string;
}

// Alias for backward compatibility
export type TargetIdData = TargetIdEventData;
