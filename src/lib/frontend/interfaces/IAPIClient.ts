import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
  AlertRule,
} from "~/lib/services/interfaces/ITargetRepository";

// Additional interfaces for alerts and notifications
export interface AlertRuleData {
  targetId: string;
  name: string;
  metric: "ping" | "download";
  condition: "GREATER_THAN" | "LESS_THAN";
  threshold: number;
}

export interface Incident {
  id: number;
  timestamp: string;
  type: "OUTAGE" | "ALERT";
  description: string;
  resolved: boolean;
  targetId: string;
  ruleId?: number;
}

export interface Notification {
  id: number;
  message: string;
  sentAt: string;
  read: boolean;
  userId: string;
}

export interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: string;
}

export interface TestNotificationData {
  message: string;
  userId: string;
}

export interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

export interface AuthSession {
  user: User;
  expires: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface IAPIClient {
  // Target operations
  createTarget(data: CreateTargetData): Promise<Target>;
  getTarget(id: string): Promise<Target | null>;
  getTargets(): Promise<Target[]>;
  updateTarget(id: string, data: UpdateTargetData): Promise<Target>;
  deleteTarget(id: string): Promise<void>;

  // Monitoring operations
  runSpeedTest(targetId: string, timeout?: number): Promise<SpeedTestResult>;
  startMonitoring(targetId: string, intervalMs: number): Promise<void>;
  stopMonitoring(targetId: string): Promise<void>;
  getActiveTargets(): Promise<string[]>;
  getTargetResults(
    targetId: string,
    limit?: number
  ): Promise<SpeedTestResult[]>;

  // Alert operations
  createAlertRule(data: AlertRuleData): Promise<AlertRule>;
  getAlertRules(targetId: string): Promise<AlertRule[]>;
  updateAlertRule(id: number, data: Partial<AlertRuleData>): Promise<AlertRule>;
  deleteAlertRule(id: number): Promise<void>;
  getIncidents(targetId: string): Promise<Incident[]>;
  resolveIncident(id: number): Promise<void>;

  // Notification operations
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  createPushSubscription(
    data: Omit<PushSubscription, "id">
  ): Promise<PushSubscription>;
  getPushSubscriptions(userId: string): Promise<PushSubscription[]>;
  deletePushSubscription(id: string): Promise<void>;
  sendPushNotification(data: TestNotificationData): Promise<void>;

  // Authentication operations
  signIn(
    email: string,
    password: string
  ): Promise<{ user: User; session: AuthSession }>;
  signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<{ user: User; session: AuthSession }>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getSession(): Promise<AuthSession | null>;
  isAuthenticated(): Promise<boolean>;
}
