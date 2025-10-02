/**
 * Standardized DTO types for all domain entities
 * Provides consistent Create, Update, and Query patterns
 */

import type {
  IBaseCreateDTO,
  IBaseUpdateDTO,
  IUserOwnedCreateDTO,
  IUserOwnedQueryDTO,
  IStatusCreateDTO,
  IStatusUpdateDTO,
  IBaseQueryDTO,
} from "../interfaces/base/IBaseDTO";
import type { EntityStatus } from "../interfaces/base/IBaseEntity";

// User DTOs
export interface CreateUserDTO extends IStatusCreateDTO {
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
}

export interface UpdateUserDTO extends IStatusUpdateDTO {
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
}

export interface UserQueryDTO extends IBaseQueryDTO {
  email?: string;
  emailVerified?: boolean;
  nameContains?: string;
  status?: EntityStatus | EntityStatus[];
}

// Monitoring Target DTOs
export interface CreateMonitoringTargetDTO
  extends IUserOwnedCreateDTO,
    IStatusCreateDTO {
  name: string;
  address: string;
  monitoringEnabled?: boolean;
  monitoringInterval?: number; // seconds, defaults to 30
}

export interface UpdateMonitoringTargetDTO extends IStatusUpdateDTO {
  name?: string;
  address?: string;
  monitoringEnabled?: boolean;
  monitoringInterval?: number;
}

export interface MonitoringTargetQueryDTO extends IUserOwnedQueryDTO {
  name?: string;
  nameContains?: string;
  address?: string;
  addressContains?: string;
  monitoringEnabled?: boolean;
  lastMonitoredAfter?: Date;
  lastMonitoredBefore?: Date;
  status?: EntityStatus | EntityStatus[];
}

// Speed Test Result DTOs
export interface CreateSpeedTestResultDTO extends IBaseCreateDTO {
  targetId: string;
  ping?: number | null;
  download?: number | null;
  upload?: number | null;
  status: "SUCCESS" | "FAILURE";
  error?: string | null;
  testDuration?: number;
  testServer?: string;
  testMethod?: string;
}

export interface UpdateSpeedTestResultDTO extends IBaseUpdateDTO {
  // Speed test results are generally immutable, but allow status updates
  status?: "SUCCESS" | "FAILURE";
  error?: string | null;
}

export interface SpeedTestResultQueryDTO extends Omit<IBaseQueryDTO, "status"> {
  targetId?: string | string[];
  status?: "SUCCESS" | "FAILURE" | ("SUCCESS" | "FAILURE")[];
  pingMin?: number;
  pingMax?: number;
  downloadMin?: number;
  downloadMax?: number;
  uploadMin?: number;
  uploadMax?: number;
  testServer?: string;
  testMethod?: string;
  hasError?: boolean;
}

// Alert Rule DTOs
export interface CreateAlertRuleDTO extends IStatusCreateDTO {
  targetId: string;
  name: string;
  metric: "ping" | "download" | "upload" | "status";
  condition: "GREATER_THAN" | "LESS_THAN" | "EQUALS" | "NOT_EQUALS";
  threshold: number;
  enabled?: boolean;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  cooldownPeriod?: number;
  maxAlerts?: number;
}

export interface UpdateAlertRuleDTO extends IStatusUpdateDTO {
  name?: string;
  metric?: "ping" | "download" | "upload" | "status";
  condition?: "GREATER_THAN" | "LESS_THAN" | "EQUALS" | "NOT_EQUALS";
  threshold?: number;
  enabled?: boolean;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  cooldownPeriod?: number;
  maxAlerts?: number;
}

export interface AlertRuleQueryDTO extends IBaseQueryDTO {
  targetId?: string | string[];
  metric?: "ping" | "download" | "upload" | "status";
  condition?: "GREATER_THAN" | "LESS_THAN" | "EQUALS" | "NOT_EQUALS";
  enabled?: boolean;
  severity?:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL"
    | ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")[];
  thresholdMin?: number;
  thresholdMax?: number;
  status?: EntityStatus | EntityStatus[];
}

// Incident Event DTOs
export interface CreateIncidentEventDTO extends IStatusCreateDTO {
  targetId: string;
  ruleId?: string | null;
  type: "OUTAGE" | "ALERT" | "RECOVERY" | "MAINTENANCE";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  resolved?: boolean;
  affectedUsers?: number;
  rootCause?: string | null;
}

export interface UpdateIncidentEventDTO extends IStatusUpdateDTO {
  type?: "OUTAGE" | "ALERT" | "RECOVERY" | "MAINTENANCE";
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description?: string;
  resolved?: boolean;
  resolvedBy?: string;
  affectedUsers?: number;
  rootCause?: string | null;
  resolution?: string | null;
}

export interface IncidentEventQueryDTO extends IBaseQueryDTO {
  targetId?: string | string[];
  ruleId?: string | string[];
  type?:
    | "OUTAGE"
    | "ALERT"
    | "RECOVERY"
    | "MAINTENANCE"
    | ("OUTAGE" | "ALERT" | "RECOVERY" | "MAINTENANCE")[];
  severity?:
    | "LOW"
    | "MEDIUM"
    | "HIGH"
    | "CRITICAL"
    | ("LOW" | "MEDIUM" | "HIGH" | "CRITICAL")[];
  resolved?: boolean;
  resolvedAfter?: Date;
  resolvedBefore?: Date;
  descriptionContains?: string;
  rootCauseContains?: string;
  resolutionContains?: string;
  status?: EntityStatus | EntityStatus[];
}

// Push Subscription DTOs
export interface CreatePushSubscriptionDTO extends IBaseCreateDTO {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string | null;
  deviceType?: "desktop" | "mobile" | "tablet" | null;
  enabled?: boolean;
}

export interface UpdatePushSubscriptionDTO extends IStatusUpdateDTO {
  endpoint?: string;
  p256dh?: string;
  auth?: string;
  userAgent?: string | null;
  deviceType?: "desktop" | "mobile" | "tablet" | null;
  enabled?: boolean;
}

export interface PushSubscriptionQueryDTO extends IUserOwnedQueryDTO {
  endpoint?: string;
  deviceType?: "desktop" | "mobile" | "tablet";
  enabled?: boolean;
  lastUsedAfter?: Date;
  lastUsedBefore?: Date;
  status?: EntityStatus | EntityStatus[];
}

// Notification DTOs
export interface CreateNotificationDTO extends IBaseCreateDTO {
  ownerId: string;
  message: string;
  title?: string | null;
  type?: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  source?: string | null;
  actionUrl?: string | null;
  expiresAt?: Date | null;
}

export interface UpdateNotificationDTO extends IStatusUpdateDTO {
  message?: string;
  title?: string | null;
  type?: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  priority?: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  read?: boolean;
  source?: string | null;
  actionUrl?: string | null;
  expiresAt?: Date | null;
}

export interface NotificationQueryDTO extends IUserOwnedQueryDTO {
  type?:
    | "INFO"
    | "WARNING"
    | "ERROR"
    | "SUCCESS"
    | ("INFO" | "WARNING" | "ERROR" | "SUCCESS")[];
  priority?:
    | "LOW"
    | "NORMAL"
    | "HIGH"
    | "URGENT"
    | ("LOW" | "NORMAL" | "HIGH" | "URGENT")[];
  read?: boolean;
  readAfter?: Date;
  readBefore?: Date;
  sentAfter?: Date;
  sentBefore?: Date;
  source?: string;
  messageContains?: string;
  titleContains?: string;
  expired?: boolean;
  status?: EntityStatus | EntityStatus[];
}

// Speed Test URL DTOs
export interface CreateSpeedTestUrlDTO extends IStatusCreateDTO {
  name: string;
  url: string;
  sizeBytes: number;
  provider: string;
  region?: string | null;
  enabled?: boolean;
  priority?: number;
}

export interface UpdateSpeedTestUrlDTO extends IStatusUpdateDTO {
  name?: string;
  url?: string;
  sizeBytes?: number;
  provider?: string;
  region?: string | null;
  enabled?: boolean;
  priority?: number;
  averageSpeed?: number | null;
  reliability?: number | null;
}

export interface SpeedTestUrlQueryDTO extends IBaseQueryDTO {
  name?: string;
  nameContains?: string;
  url?: string;
  urlContains?: string;
  provider?: string | string[];
  region?: string | string[];
  enabled?: boolean;
  priorityMin?: number;
  priorityMax?: number;
  sizeBytesMin?: number;
  sizeBytesMax?: number;
  lastTestedAfter?: Date;
  lastTestedBefore?: Date;
  status?: EntityStatus | EntityStatus[];
}

// User Speed Test Preference DTOs
export interface CreateUserSpeedTestPreferenceDTO
  extends IUserOwnedCreateDTO,
    IStatusCreateDTO {
  speedTestUrlId: string;
  autoSelect?: boolean;
  preferredRegion?: string | null;
  maxTestDuration?: number | null;
}

export interface UpdateUserSpeedTestPreferenceDTO extends IStatusUpdateDTO {
  speedTestUrlId?: string;
  autoSelect?: boolean;
  preferredRegion?: string | null;
  maxTestDuration?: number | null;
}

export interface UserSpeedTestPreferenceQueryDTO extends IUserOwnedQueryDTO {
  speedTestUrlId?: string | string[];
  autoSelect?: boolean;
  preferredRegion?: string | string[];
  maxTestDurationMin?: number;
  maxTestDurationMax?: number;
  status?: EntityStatus | EntityStatus[];
}

// Legacy DTO aliases for backward compatibility
export type CreateTargetData = CreateMonitoringTargetDTO;
export type UpdateTargetData = UpdateMonitoringTargetDTO;
export type CreateSpeedTestResultData = CreateSpeedTestResultDTO;
export type UpdateSpeedTestResultData = UpdateSpeedTestResultDTO;
export type CreateAlertRuleData = CreateAlertRuleDTO;
export type UpdateAlertRuleData = UpdateAlertRuleDTO;
export type CreateIncidentEventData = CreateIncidentEventDTO;
export type UpdateIncidentEventData = UpdateIncidentEventDTO;
export type CreatePushSubscriptionData = CreatePushSubscriptionDTO;
export type UpdatePushSubscriptionData = UpdatePushSubscriptionDTO;
export type CreateNotificationData = CreateNotificationDTO;
export type UpdateNotificationData = UpdateNotificationDTO;
export type CreateUserData = CreateUserDTO;
export type UpdateUserData = UpdateUserDTO;
export type CreateSpeedTestUrlData = CreateSpeedTestUrlDTO;
export type UpdateSpeedTestUrlData = UpdateSpeedTestUrlDTO;
