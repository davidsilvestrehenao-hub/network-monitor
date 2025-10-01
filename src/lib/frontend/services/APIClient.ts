import type {
  IAPIClient,
  AlertRuleData,
  Incident,
  Notification,
  PushSubscription,
  TestNotificationData,
  User,
  AuthSession,
} from "../interfaces/IAPIClient";
import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
  AlertRule,
} from "~/lib/services/interfaces/ITargetRepository";
import * as prpc from "~/server/prpc";

// pRPC-based API client implementation
export class APIClient implements IAPIClient {
  async createTarget(data: CreateTargetData): Promise<Target> {
    const result = await prpc.createTarget({
      name: data.name,
      address: data.address,
    });
    return {
      ...result,
      ownerId: data.ownerId,
    };
  }

  async getTarget(id: string): Promise<Target | null> {
    try {
      const result = await prpc.getTarget({ id });
      return {
        ...result,
        ownerId: "mock-user", // Mock owner ID
      };
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async getTargets(): Promise<Target[]> {
    const result = await prpc.getTargets({});
    return result.map(target => ({
      ...target,
      ownerId: "mock-user", // Mock owner ID
    }));
  }

  async updateTarget(id: string, data: UpdateTargetData): Promise<Target> {
    const result = await prpc.updateTarget({
      id,
      ...data,
    });
    return {
      ...result,
      ownerId: "mock-user", // Mock owner ID
    };
  }

  async deleteTarget(id: string): Promise<void> {
    await prpc.deleteTarget({ id });
  }

  // Monitoring operations
  async runSpeedTest(
    targetId: string,
    _timeout?: number
  ): Promise<SpeedTestResult> {
    const result = await prpc.runSpeedTest({
      targetId,
    });
    return {
      ...result,
      error: null, // Add missing error property
    };
  }

  async startMonitoring(targetId: string, intervalMs: number): Promise<void> {
    await prpc.startMonitoring({
      targetId,
      intervalMs,
    });
  }

  async stopMonitoring(targetId: string): Promise<void> {
    await prpc.stopMonitoring({
      targetId,
    });
  }

  async getActiveTargets(): Promise<string[]> {
    const result = await prpc.getActiveTargets();
    return result;
  }

  async getTargetResults(
    targetId: string,
    limit?: number
  ): Promise<SpeedTestResult[]> {
    const result = await prpc.getTargetResults({
      targetId,
      limit: limit || 10,
    });
    return result.map(item => ({
      ...item,
      error: null, // Add missing error property
    }));
  }

  // Alert operations
  async createAlertRule(data: AlertRuleData): Promise<AlertRule> {
    const result = await prpc.createAlertRule(data);
    return {
      ...result.data,
      targetId: data.targetId,
    };
  }

  async getAlertRules(targetId: string): Promise<AlertRule[]> {
    const result = await prpc.getAlertRules({ targetId });
    return result.data.map(rule => ({
      ...rule,
      targetId,
    }));
  }

  async updateAlertRule(
    id: number,
    data: Partial<AlertRuleData>
  ): Promise<AlertRule> {
    const result = await prpc.updateAlertRule({ id, ...data });
    return {
      ...result.data,
      targetId: data.targetId || "mock-target",
    };
  }

  async deleteAlertRule(id: number): Promise<void> {
    await prpc.deleteAlertRule({ id });
  }

  async getIncidents(targetId: string): Promise<Incident[]> {
    const result = await prpc.getIncidents({ targetId });
    return result.data.map(incident => ({
      ...incident,
      timestamp: incident.timestamp.toISOString(),
    }));
  }

  async resolveIncident(id: number): Promise<void> {
    await prpc.resolveIncident({ id });
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    const result = await prpc.getNotifications({ userId });
    return result.data.map(notification => ({
      ...notification,
      sentAt: notification.sentAt.toISOString(),
    }));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await prpc.markNotificationAsRead({ id });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await prpc.markAllNotificationsAsRead({ userId });
  }

  async createPushSubscription(
    data: PushSubscription
  ): Promise<PushSubscription> {
    const result = await prpc.createPushSubscription(data);
    return {
      ...result.data,
      userId: data.userId,
    };
  }

  async getPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    const result = await prpc.getPushSubscriptions({ userId });
    return result.data.map(sub => ({
      ...sub,
      userId,
    }));
  }

  async deletePushSubscription(id: string): Promise<void> {
    await prpc.deletePushSubscription({ id });
  }

  async sendPushNotification(data: TestNotificationData): Promise<void> {
    await prpc.sendPushNotification(data);
  }

  // Authentication operations
  private mapUser(backendUser: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
  }): User {
    return {
      id: backendUser.id,
      name: backendUser.name ?? undefined,
      email: backendUser.email ?? undefined,
      image: backendUser.image ?? undefined,
    };
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ user: User; session: AuthSession }> {
    const result = await prpc.signIn({ email, password });
    const user = this.mapUser(result.data.user);
    return {
      user,
      session: {
        ...result.data.session,
        user,
        expires: result.data.session.expiresAt,
      },
    };
  }

  async signUp(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: User; session: AuthSession }> {
    const result = await prpc.signUp({ name, email, password });
    const user = this.mapUser(result.data.user);
    return {
      user,
      session: {
        ...result.data.session,
        user,
        expires: result.data.session.expiresAt,
      },
    };
  }

  async signOut(): Promise<void> {
    await prpc.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const result = await prpc.getCurrentUser();
    if (!result.data) return null;
    return this.mapUser(result.data);
  }

  async getSession(): Promise<AuthSession | null> {
    const result = await prpc.getSession();
    if (!result.data) return null;
    const user = await this.getCurrentUser();
    if (!user) return null;
    return {
      ...result.data,
      user,
      expires: result.data.expiresAt,
    };
  }

  async isAuthenticated(): Promise<boolean> {
    const result = await prpc.isAuthenticated();
    return result.data.authenticated;
  }
}
