import type {
  IAPIClient,
  TestNotificationData,
  AuthSession,
} from "../interfaces/IAPIClient";
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
import { trpc } from "~/lib/trpc";

// tRPC-based API client implementation
export class APIClient implements IAPIClient {
  async createTarget(data: CreateTargetData): Promise<Target> {
    const result = await trpc.targets.create.mutate({
      name: data.name,
      address: data.address,
    });
    if (!result) throw new Error("Failed to create target");
    return result as unknown as Target;
  }

  async getTarget(id: string): Promise<Target | null> {
    try {
      const result = await trpc.targets.getById.query({ id });
      return result ? (result as unknown as Target) : null;
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async getTargets(): Promise<Target[]> {
    const result = await trpc.targets.getAll.query();
    return (result || []) as unknown as Target[];
  }

  async updateTarget(id: string, data: UpdateTargetData): Promise<Target> {
    const result = await trpc.targets.update.mutate({
      id,
      ...data,
    });
    if (!result) throw new Error("Failed to update target");
    return result as unknown as Target;
  }

  async deleteTarget(id: string): Promise<void> {
    await trpc.targets.delete.mutate({ id });
  }

  // Monitoring operations
  async runSpeedTest(
    targetId: string,
    _timeout?: number
  ): Promise<SpeedTestResult> {
    const target = await this.getTarget(targetId);
    if (!target) throw new Error("Target not found");

    const result = await trpc.speedTests.runTest.mutate({
      targetId,
      target: target.address,
    });
    if (!result) throw new Error("Failed to run speed test");
    return result as unknown as SpeedTestResult;
  }

  async startMonitoring(targetId: string, intervalMs: number): Promise<void> {
    await trpc.targets.startMonitoring.mutate({
      targetId,
      intervalMs,
    });
  }

  async stopMonitoring(targetId: string): Promise<void> {
    await trpc.targets.stopMonitoring.mutate({ targetId });
  }

  async getActiveTargets(): Promise<string[]> {
    const result = await trpc.targets.getActiveTargets.query();
    return result;
  }

  async getTargetResults(
    targetId: string,
    limit?: number
  ): Promise<SpeedTestResult[]> {
    const result = await trpc.speedTests.getByTargetId.query({
      targetId,
      limit,
    });
    return result || [];
  }

  // Alert operations
  async createAlertRule(data: CreateAlertRuleData): Promise<AlertRule> {
    const result = await trpc.alertRules.create.mutate(data);
    if (!result) throw new Error("Failed to create alert rule");
    return result as unknown as AlertRule;
  }

  async getAlertRules(targetId: string): Promise<AlertRule[]> {
    const result = await trpc.alertRules.getByTargetId.query({ targetId });
    return (result || []) as unknown as AlertRule[];
  }

  async updateAlertRule(
    id: number,
    data: UpdateAlertRuleData
  ): Promise<AlertRule> {
    const result = await trpc.alertRules.update.mutate({ id, ...data });
    if (!result) throw new Error("Failed to update alert rule");
    return result as unknown as AlertRule;
  }

  async deleteAlertRule(id: number): Promise<void> {
    await trpc.alertRules.delete.mutate({ id });
  }

  async getIncidents(targetId: string): Promise<IncidentEvent[]> {
    const result = await trpc.incidents.getByTargetId.query({ targetId });
    return (result || []).map(
      (incident: {
        id: number;
        timestamp: Date | string;
        type: "OUTAGE" | "ALERT";
        description: string;
        resolved: boolean;
        targetId: string;
        ruleId?: number;
      }) => ({
        id: incident.id,
        timestamp:
          incident.timestamp instanceof Date
            ? incident.timestamp
            : new Date(incident.timestamp),
        type: incident.type,
        description: incident.description,
        resolved: incident.resolved,
        targetId: incident.targetId,
        ruleId: incident.ruleId,
        triggeredByRule: null, // Will be populated by the backend
      })
    );
  }

  async resolveIncident(id: number): Promise<void> {
    await trpc.incidents.resolve.mutate({ id });
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    const result = await trpc.notifications.getByUserId.query({ userId });
    return (result || []).map(
      (notification: {
        id: number;
        message: string;
        sentAt: Date | string;
        read: boolean;
        userId: string;
      }) => ({
        id: notification.id,
        message: notification.message,
        sentAt:
          notification.sentAt instanceof Date
            ? notification.sentAt
            : new Date(notification.sentAt),
        read: notification.read,
        userId: notification.userId,
      })
    );
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await trpc.notifications.markAsRead.mutate({ id });
  }

  async markAllNotificationsAsRead(_userId: string): Promise<void> {
    await trpc.notifications.markAllAsRead.mutate();
  }

  async createPushSubscription(
    data: Omit<PushSubscription, "id">
  ): Promise<PushSubscription> {
    const result = await trpc.pushSubscriptions.create.mutate({
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
    });
    if (!result) throw new Error("Failed to create push subscription");
    return result as unknown as PushSubscription;
  }

  async getPushSubscriptions(_userId: string): Promise<PushSubscription[]> {
    const result = await trpc.pushSubscriptions.getByUserId.query();
    return result || [];
  }

  async deletePushSubscription(id: string): Promise<void> {
    await trpc.pushSubscriptions.delete.mutate({ id });
  }

  async sendPushNotification(_data: TestNotificationData): Promise<void> {
    // TODO: Implement push notification sending via tRPC
    throw new Error("sendPushNotification not yet implemented with tRPC");
  }

  // Authentication operations
  private mapUser(backendUser: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified?: Date | null;
    image: string | null;
  }): User {
    return {
      id: backendUser.id,
      name: backendUser.name,
      email: backendUser.email,
      emailVerified: backendUser.emailVerified ?? null,
      image: backendUser.image,
      monitoringTargets: [],
      pushSubscriptions: [],
      notifications: [],
    };
  }

  async signIn(
    _email: string,
    _password: string
  ): Promise<{ user: User; session: AuthSession }> {
    // TODO: Implement authentication via tRPC
    throw new Error("signIn not yet implemented with tRPC");
  }

  async signUp(
    _name: string,
    _email: string,
    _password: string
  ): Promise<{ user: User; session: AuthSession }> {
    // TODO: Implement authentication via tRPC
    throw new Error("signUp not yet implemented with tRPC");
  }

  async signOut(): Promise<void> {
    // TODO: Implement authentication via tRPC
    throw new Error("signOut not yet implemented with tRPC");
  }

  async getCurrentUser(): Promise<User | null> {
    const result = await trpc.users.getCurrent.query();
    if (!result) return null;
    return this.mapUser(
      result as unknown as {
        id: string;
        name: string | null;
        email: string | null;
        emailVerified?: Date | null;
        image: string | null;
      }
    );
  }

  async getSession(): Promise<AuthSession | null> {
    // TODO: Implement session management via tRPC
    const user = await this.getCurrentUser();
    if (!user) return null;
    // Mock session for now
    return {
      user,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      accessToken: "mock-access-token",
    };
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }
}
