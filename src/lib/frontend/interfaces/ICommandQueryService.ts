import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
  AlertRule,
} from "~/lib/services/interfaces/ITargetRepository";
import type {
  AlertRuleData,
  Incident,
  Notification,
  PushSubscription,
  TestNotificationData,
  User,
  AuthSession,
} from "./IAPIClient";

export interface ICommandQueryService {
  // Commands (write operations)
  createTarget(data: CreateTargetData): Promise<Target>;
  updateTarget(id: string, data: UpdateTargetData): Promise<Target>;
  deleteTarget(id: string): Promise<void>;
  runSpeedTest(targetId: string, timeout?: number): Promise<SpeedTestResult>;
  startMonitoring(targetId: string, intervalMs: number): Promise<void>;
  stopMonitoring(targetId: string): Promise<void>;

  // Alert commands
  createAlertRule(data: AlertRuleData): Promise<AlertRule>;
  updateAlertRule(id: number, data: Partial<AlertRuleData>): Promise<AlertRule>;
  deleteAlertRule(id: number): Promise<void>;
  resolveIncident(id: number): Promise<void>;

  // Notification commands
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  createPushSubscription(
    data: Omit<PushSubscription, "id">
  ): Promise<PushSubscription>;
  deletePushSubscription(id: string): Promise<void>;
  sendPushNotification(data: TestNotificationData): Promise<void>;

  // Auth commands
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

  // Queries (read operations)
  getTarget(id: string): Promise<Target | null>;
  getTargets(): Promise<Target[]>;
  getActiveTargets(): Promise<string[]>;
  getTargetResults(
    targetId: string,
    limit?: number
  ): Promise<SpeedTestResult[]>;

  // Alert queries
  getAlertRules(targetId: string): Promise<AlertRule[]>;
  getIncidents(targetId: string): Promise<Incident[]>;

  // Notification queries
  getNotifications(userId: string): Promise<Notification[]>;
  getPushSubscriptions(userId: string): Promise<PushSubscription[]>;

  // Auth queries
  getCurrentUser(): Promise<User | null>;
  getSession(): Promise<AuthSession | null>;
  isAuthenticated(): Promise<boolean>;
}
