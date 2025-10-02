/**
 * Standardized domain types that extend base entity interfaces
 * All domain entities now have consistent properties and audit trails
 */

import type {
  IBaseEntity,
  IUserOwnedEntity,
  ISoftDeletableEntity,
  IVersionedEntity,
  ITaggableEntity,
  EntityStatus,
} from "../interfaces/base/IBaseEntity";

// User entity - extends base with authentication fields
export interface StandardizedUser
  extends IBaseEntity,
    ISoftDeletableEntity,
    IVersionedEntity {
  id: string; // CUID for users
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  status: EntityStatus;

  // Relations (optional for different contexts)
  monitoringTargets?: StandardizedMonitoringTarget[];
  pushSubscriptions?: StandardizedPushSubscription[];
  notifications?: StandardizedNotification[];
}

// Monitoring target entity - user-owned with full features
export interface StandardizedMonitoringTarget
  extends IUserOwnedEntity,
    ISoftDeletableEntity,
    IVersionedEntity,
    ITaggableEntity {
  id: string; // CUID for targets
  name: string;
  address: string;
  status: EntityStatus;

  // Monitoring-specific fields
  monitoringEnabled: boolean;
  monitoringInterval: number; // seconds
  lastMonitoredAt?: Date | null;

  // Relations (optional for different contexts)
  speedTestResults?: StandardizedSpeedTestResult[];
  alertRules?: StandardizedAlertRule[];
  incidentEvents?: StandardizedIncidentEvent[];
}

// Speed test result entity - immutable measurement data
export interface StandardizedSpeedTestResult extends IBaseEntity {
  id: string; // CUID for results (changed from number)
  targetId: string;

  // Measurement data
  ping?: number | null;
  download?: number | null;
  upload?: number | null;
  status: "SUCCESS" | "FAILURE";
  error?: string | null;

  // Test metadata
  testDuration?: number; // milliseconds
  testServer?: string;
  testMethod?: string;

  // Optional soft delete for cleanup/retention policies
  deletedAt?: Date | null;
  isActive?: boolean;
}

// Alert rule entity - configuration for monitoring alerts
export interface StandardizedAlertRule
  extends IBaseEntity,
    ISoftDeletableEntity,
    IVersionedEntity {
  id: string; // CUID for rules (changed from number)
  targetId: string;

  name: string;
  metric: "ping" | "download" | "upload" | "status";
  condition: "GREATER_THAN" | "LESS_THAN" | "EQUALS" | "NOT_EQUALS";
  threshold: number;
  enabled: boolean;
  status: EntityStatus;

  // Alert configuration
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  cooldownPeriod: number; // seconds to wait before re-alerting
  maxAlerts: number; // maximum alerts per day

  // Relations
  triggeredEvents?: StandardizedIncidentEvent[];
}

// Incident event entity - tracks alerts and outages
export interface StandardizedIncidentEvent
  extends IBaseEntity,
    ISoftDeletableEntity,
    IVersionedEntity {
  id: string; // CUID for events (changed from number)
  targetId: string;
  ruleId?: string | null; // Changed from number to string

  type: "OUTAGE" | "ALERT" | "RECOVERY" | "MAINTENANCE";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  description: string;
  resolved: boolean;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;

  // Incident metadata
  duration?: number; // milliseconds (calculated when resolved)
  affectedUsers?: number;
  rootCause?: string | null;
  resolution?: string | null;

  status: EntityStatus;
}

// Push subscription entity - web push notification endpoints
export interface StandardizedPushSubscription
  extends IUserOwnedEntity,
    ISoftDeletableEntity,
    IVersionedEntity {
  id: string; // CUID

  // Push subscription data
  endpoint: string;
  p256dh: string;
  auth: string;

  // Subscription metadata
  userAgent?: string | null;
  deviceType?: "desktop" | "mobile" | "tablet" | null;
  enabled: boolean;
  lastUsedAt?: Date | null;

  status: EntityStatus;
}

// Notification entity - in-app messages
export interface StandardizedNotification
  extends IUserOwnedEntity,
    ISoftDeletableEntity,
    IVersionedEntity {
  id: string; // CUID (changed from number)

  message: string;
  title?: string | null;
  type: "INFO" | "WARNING" | "ERROR" | "SUCCESS";
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";

  // Notification state
  read: boolean;
  readAt?: Date | null;
  sentAt: Date;

  // Notification metadata
  source?: string | null; // Which service/component sent it
  actionUrl?: string | null; // URL to navigate to when clicked
  expiresAt?: Date | null; // When notification should be auto-deleted

  status: EntityStatus;
}

// Speed test URL entity - configuration for speed test endpoints
export interface StandardizedSpeedTestUrl
  extends IBaseEntity,
    ISoftDeletableEntity,
    IVersionedEntity,
    ITaggableEntity {
  id: string; // CUID

  name: string;
  url: string;
  sizeBytes: number;
  provider: string;
  region?: string | null;

  enabled: boolean;
  priority: number;

  // Performance metadata
  averageSpeed?: number | null;
  reliability?: number | null; // percentage
  lastTestedAt?: Date | null;

  status: EntityStatus;
}

// User preferences entity - user-specific settings
export interface StandardizedUserSpeedTestPreference
  extends IUserOwnedEntity,
    ISoftDeletableEntity,
    IVersionedEntity {
  id: string; // CUID
  speedTestUrlId: string;

  // Preference settings
  autoSelect: boolean;
  preferredRegion?: string | null;
  maxTestDuration?: number | null; // seconds

  status: EntityStatus;
}

// Legacy type aliases for backward compatibility
export type User = StandardizedUser;
export type MonitoringTarget = StandardizedMonitoringTarget;
export type Target = StandardizedMonitoringTarget; // Legacy alias
export type SpeedTestResult = StandardizedSpeedTestResult;
export type SpeedTest = StandardizedSpeedTestResult; // Legacy alias
export type AlertRule = StandardizedAlertRule;
export type IncidentEvent = StandardizedIncidentEvent;
export type PushSubscription = StandardizedPushSubscription;
export type Notification = StandardizedNotification;
export type SpeedTestUrl = StandardizedSpeedTestUrl;
export type UserSpeedTestPreference = StandardizedUserSpeedTestPreference;
