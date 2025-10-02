// Domain entity types
// These represent the core business entities in the application

// Legacy domain types - moved to standardized-domain-types.ts
// These are kept for internal reference but must be exported for backward compatibility
export interface User {
  id: string;
  name?: string;
  email?: string;
  emailVerified?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  monitoringTargets?: MonitoringTarget[];
  pushSubscriptions?: PushSubscription[];
  notifications?: Notification[];
}

export interface MonitoringTarget {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  speedTestResults?: SpeedTestResult[];
  alertRules?: AlertRule[];
  incidentEvents?: IncidentEvent[];
}

export interface SpeedTestResult {
  id: string; // Updated to CUID for consistency
  ping?: number;
  download?: number;
  upload?: number;
  status: string; // SUCCESS or FAILURE
  error?: string;
  targetId: string;
  timestamp: string; // When the test was performed
  createdAt: string;
}

export interface AlertRule {
  id: string; // Updated to CUID for consistency
  name: string;
  metric: "ping" | "download" | "upload" | "status";
  condition: "GREATER_THAN" | "LESS_THAN" | "EQUALS" | "NOT_EQUALS";
  threshold: number;
  enabled: boolean;
  targetId: string;
  createdAt: string;
  updatedAt: string;
}

export interface IncidentEvent {
  id: string; // Updated to CUID for consistency
  timestamp: string;
  type: string;
  description: string;
  resolved: boolean;
  targetId: string;
  ruleId?: string; // Updated to match AlertRule.id
  createdAt: string;
  updatedAt: string;
}

export interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: string; // User ID for the subscription owner
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string; // Updated to CUID for consistency
  message: string;
  sentAt: string;
  read: boolean;
  userId: string; // User ID for the notification recipient
}

export interface SpeedTestUrl {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  provider: string;
  region?: string;
  enabled: boolean;
  priority: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Legacy types for backward compatibility - moved to standardized-domain-types.ts
// These are kept for internal reference but not exported to avoid conflicts
export type Target = MonitoringTarget;
export type SpeedTest = SpeedTestResult;
