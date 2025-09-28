import {
  IAPIClient,
  AlertRuleData,
  Incident,
  Notification,
  PushSubscription,
  TestNotificationData,
  User,
  AuthSession,
} from "../interfaces/IAPIClient";
import {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
  AlertRule,
} from "~/lib/services/interfaces/ITargetRepository";

// pRPC-based API client implementation
export class APIClient implements IAPIClient {
  private async callPRPC<T>(endpoint: string, data?: unknown, method: string = "POST"): Promise<T> {
    const config: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Only add body for POST/PUT/PATCH requests
    if (method !== "GET" && method !== "HEAD" && data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(`/api/prpc/${endpoint}`, config);

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  async createTarget(data: CreateTargetData): Promise<Target> {
    return this.callPRPC<Target>("createTarget", {
      name: data.name,
      address: data.address,
    });
  }

  async getTarget(id: string): Promise<Target | null> {
    try {
      return await this.callPRPC<Target>("targets.get", { id });
    } catch (error) {
      if (error instanceof Error && error.message.includes("not found")) {
        return null;
      }
      throw error;
    }
  }

  async getTargets(): Promise<Target[]> {
    return this.callPRPC<Target[]>("getTargets", {}, "GET");
  }

  async updateTarget(id: string, data: UpdateTargetData): Promise<Target> {
    return this.callPRPC<Target>("targets.update", {
      id,
      ...data,
    });
  }

  async deleteTarget(id: string): Promise<void> {
    await this.callPRPC<{ success: boolean }>("targets.delete", { id });
  }

  // Monitoring operations
  async runSpeedTest(
    targetId: string,
    timeout?: number
  ): Promise<SpeedTestResult> {
    return this.callPRPC<SpeedTestResult>("targets.runSpeedTest", {
      targetId,
      timeout,
    });
  }

  async startMonitoring(targetId: string, intervalMs: number): Promise<void> {
    await this.callPRPC<{ success: boolean }>("targets.startMonitoring", {
      targetId,
      intervalMs,
    });
  }

  async stopMonitoring(targetId: string): Promise<void> {
    await this.callPRPC<{ success: boolean }>("targets.stopMonitoring", {
      targetId,
    });
  }

  async getActiveTargets(): Promise<string[]> {
    return this.callPRPC<string[]>("targets.getActive", {}, "GET");
  }

  async getTargetResults(
    targetId: string,
    limit?: number
  ): Promise<SpeedTestResult[]> {
    const params = new URLSearchParams({ targetId });
    if (limit) params.append("limit", limit.toString());
    
    return this.callPRPC<SpeedTestResult[]>(`targets.getResults?${params}`, {}, "GET");
  }

  // Alert operations
  async createAlertRule(data: AlertRuleData): Promise<AlertRule> {
    return this.callPRPC<AlertRule>("createAlertRule", data);
  }

  async getAlertRules(targetId: string): Promise<AlertRule[]> {
    return this.callPRPC<AlertRule[]>("getAlertRules", { targetId });
  }

  async updateAlertRule(
    id: number,
    data: Partial<AlertRuleData>
  ): Promise<AlertRule> {
    return this.callPRPC<AlertRule>("updateAlertRule", { id, ...data });
  }

  async deleteAlertRule(id: number): Promise<void> {
    await this.callPRPC<{ success: boolean }>("deleteAlertRule", { id });
  }

  async getIncidents(targetId: string): Promise<Incident[]> {
    return this.callPRPC<Incident[]>("getIncidents", { targetId });
  }

  async resolveIncident(id: number): Promise<void> {
    await this.callPRPC<{ success: boolean }>("resolveIncident", { id });
  }

  // Notification operations
  async getNotifications(userId: string): Promise<Notification[]> {
    return this.callPRPC<Notification[]>("getNotifications", { userId });
  }

  async markNotificationAsRead(id: number): Promise<void> {
    await this.callPRPC<{ success: boolean }>("markNotificationAsRead", { id });
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.callPRPC<{ success: boolean }>("markAllNotificationsAsRead", {
      userId,
    });
  }

  async createPushSubscription(
    data: Omit<PushSubscription, "id">
  ): Promise<PushSubscription> {
    return this.callPRPC<PushSubscription>("createPushSubscription", data);
  }

  async getPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    return this.callPRPC<PushSubscription[]>("getPushSubscriptions", {
      userId,
    });
  }

  async deletePushSubscription(id: string): Promise<void> {
    await this.callPRPC<{ success: boolean }>("deletePushSubscription", { id });
  }

  async sendPushNotification(data: TestNotificationData): Promise<void> {
    await this.callPRPC<{ success: boolean }>("sendPushNotification", data);
  }

  // Authentication operations
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: User; session: AuthSession }> {
    return this.callPRPC<{ user: User; session: AuthSession }>("signIn", {
      email,
      password,
    });
  }

  async signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<{ user: User; session: AuthSession }> {
    return this.callPRPC<{ user: User; session: AuthSession }>("signUp", {
      email,
      password,
      name,
    });
  }

  async signOut(): Promise<void> {
    await this.callPRPC<{ success: boolean }>("signOut", {});
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.callPRPC<User>("getCurrentUser", {});
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("not authenticated")
      ) {
        return null;
      }
      throw error;
    }
  }

  async getSession(): Promise<AuthSession | null> {
    return this.callPRPC<AuthSession | null>("getSession", {});
  }

  async isAuthenticated(): Promise<boolean> {
    const result = await this.callPRPC<{ authenticated: boolean }>(
      "isAuthenticated",
      {}
    );
    return result.authenticated;
  }
}
