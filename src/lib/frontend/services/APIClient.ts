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
    const result = await prpc.createAlertRule();
    return {
      ...result.data,
      targetId: data.targetId,
    };
  }

  async getAlertRules(targetId: string): Promise<AlertRule[]> {
    const result = await prpc.getAlertRules();
    return result.data.map(rule => ({
      ...rule,
      targetId,
    }));
  }

  async updateAlertRule(
    id: number,
    data: Partial<AlertRuleData>
  ): Promise<AlertRule> {
    const result = await prpc.updateAlertRule();
    return {
      ...result.data,
      targetId: data.targetId || "mock-target",
    };
  }

  async deleteAlertRule(_id: number): Promise<void> {
    await prpc.deleteAlertRule();
  }

  async getIncidents(_targetId: string): Promise<Incident[]> {
    const result = await prpc.getIncidents();
    return result.data;
  }

  async resolveIncident(_id: number): Promise<void> {
    await prpc.resolveIncident();
  }

  // Notification operations
  async getNotifications(_userId: string): Promise<Notification[]> {
    const result = await prpc.getNotifications();
    return result.data;
  }

  async markNotificationAsRead(_id: number): Promise<void> {
    await prpc.markNotificationAsRead();
  }

  async markAllNotificationsAsRead(_userId: string): Promise<void> {
    await prpc.markAllNotificationsAsRead();
  }

  async createPushSubscription(
    data: PushSubscription
  ): Promise<PushSubscription> {
    const result = await prpc.createPushSubscription();
    return {
      ...result.data,
      userId: data.userId,
    };
  }

  async getPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    const result = await prpc.getPushSubscriptions();
    return result.data.map(sub => ({
      ...sub,
      userId,
    }));
  }

  async deletePushSubscription(_id: string): Promise<void> {
    await prpc.deletePushSubscription();
  }

  async sendPushNotification(data: TestNotificationData): Promise<void> {
    await prpc.sendPushNotification(data);
  }

  // Authentication operations
  async signIn(
    _email: string,
    _password: string
  ): Promise<{ user: User; session: AuthSession }> {
    const result = await prpc.signIn();
    return {
      user: result.data.user,
      session: {
        ...result.data.session,
        user: result.data.user,
        expires: new Date(result.data.session.expiresAt),
      },
    };
  }

  async signUp(
    _name: string,
    _email: string,
    _password: string
  ): Promise<{ user: User; session: AuthSession }> {
    const result = await prpc.signUp();
    return {
      user: result.data.user,
      session: {
        ...result.data.session,
        user: result.data.user,
        expires: new Date(result.data.session.expiresAt),
      },
    };
  }

  async signOut(): Promise<void> {
    await prpc.signOut();
  }

  async getCurrentUser(): Promise<User | null> {
    const result = await prpc.getCurrentUser();
    return result.data;
  }

  async getSession(): Promise<AuthSession | null> {
    const result = await prpc.getSession();
    return result.data;
  }

  async isAuthenticated(): Promise<boolean> {
    const result = await prpc.isAuthenticated();
    return result.data.authenticated;
  }
}
