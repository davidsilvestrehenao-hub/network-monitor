import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
  AlertRule,
  CreateAlertRuleData,
  UpdateAlertRuleData,
  IncidentEvent,
  Notification,
  PushSubscription,
  User,
} from "@network-monitor/shared";

// Re-export shared types for convenience
export type {
  AlertRule,
  CreateAlertRuleData,
  UpdateAlertRuleData,
  IncidentEvent,
  Notification,
  PushSubscription,
  User,
};

// Use IncidentEvent from shared package instead of Incident
export type Incident = IncidentEvent;

export interface TestNotificationData {
  message: string;
  userId: string;
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
  createAlertRule(data: CreateAlertRuleData): Promise<AlertRule>;
  getAlertRules(targetId: string): Promise<AlertRule[]>;
  updateAlertRule(id: number, data: UpdateAlertRuleData): Promise<AlertRule>;
  deleteAlertRule(id: number): Promise<void>;
  getIncidents(targetId: string): Promise<IncidentEvent[]>;
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
