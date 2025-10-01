import type { ICommandQueryService } from "../interfaces/ICommandQueryService";
import type {
  IAPIClient,
  Incident,
  TestNotificationData,
  AuthSession,
} from "../interfaces/IAPIClient";
import type {
  CreateAlertRuleData,
  UpdateAlertRuleData,
  Notification,
  PushSubscription,
  User,
} from "@network-monitor/shared";
import type { IEventBus } from "@network-monitor/shared";
import type { ILogger, LogContext } from "@network-monitor/shared";
import type {
  Target,
  CreateTargetData,
  UpdateTargetData,
  SpeedTestResult,
  AlertRule,
} from "@network-monitor/shared";

export class CommandQueryService implements ICommandQueryService {
  constructor(
    private apiClient: IAPIClient,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  // Commands (write operations)
  async createTarget(data: CreateTargetData): Promise<Target> {
    this.logger.debug(
      "CommandQueryService: Creating target",
      data as unknown as LogContext
    );

    try {
      const target = await this.apiClient.createTarget(data);
      this.eventBus.emit("TARGETS_LOADED", { targets: [target] });
      return target;
    } catch (error) {
      this.logger.error("CommandQueryService: Target creation failed", {
        error,
        data,
      });
      this.eventBus.emit("TARGETS_LOAD_FAILED", {
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
    }
  }

  async updateTarget(id: string, data: UpdateTargetData): Promise<Target> {
    this.logger.debug("CommandQueryService: Updating target", { id, data });

    try {
      const target = await this.apiClient.updateTarget(id, data);
      this.eventBus.emit("TARGETS_LOADED", { targets: [target] });
      return target;
    } catch (error) {
      this.logger.error("CommandQueryService: Target update failed", {
        error,
        id,
        data,
      });
      this.eventBus.emit("TARGETS_LOAD_FAILED", {
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
    }
  }

  async deleteTarget(id: string): Promise<void> {
    this.logger.debug("CommandQueryService: Deleting target", { id });

    try {
      await this.apiClient.deleteTarget(id);
      // Emit event to refresh targets list
      const targets = await this.getTargets();
      this.eventBus.emit("TARGETS_LOADED", { targets });
    } catch (error) {
      this.logger.error("CommandQueryService: Target deletion failed", {
        error,
        id,
      });
      this.eventBus.emit("TARGETS_LOAD_FAILED", {
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
    }
  }

  async runSpeedTest(
    targetId: string,
    timeout?: number
  ): Promise<SpeedTestResult> {
    this.logger.debug("CommandQueryService: Running speed test", {
      targetId,
      timeout,
    });

    try {
      const result = await this.apiClient.runSpeedTest(targetId, timeout);
      this.eventBus.emit("SPEED_TEST_RESULTS_LOADED", {
        targetId,
        results: [result],
      });
      return result;
    } catch (error) {
      this.logger.error("CommandQueryService: Speed test failed", {
        error,
        targetId,
      });
      this.eventBus.emit("SPEED_TEST_RESULTS_LOAD_FAILED", {
        targetId,
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
    }
  }

  async startMonitoring(targetId: string, intervalMs: number): Promise<void> {
    this.logger.debug("CommandQueryService: Starting monitoring", {
      targetId,
      intervalMs,
    });

    try {
      await this.apiClient.startMonitoring(targetId, intervalMs);
    } catch (error) {
      this.logger.error("CommandQueryService: Start monitoring failed", {
        error,
        targetId,
        intervalMs,
      });
      throw error;
    }
  }

  async stopMonitoring(targetId: string): Promise<void> {
    this.logger.debug("CommandQueryService: Stopping monitoring", { targetId });

    try {
      await this.apiClient.stopMonitoring(targetId);
    } catch (error) {
      this.logger.error("CommandQueryService: Stop monitoring failed", {
        error,
        targetId,
      });
      throw error;
    }
  }

  // Queries (read operations)
  async getTarget(id: string): Promise<Target | null> {
    this.logger.debug("CommandQueryService: Getting target", { id });

    try {
      return await this.apiClient.getTarget(id);
    } catch (error) {
      this.logger.error("CommandQueryService: Get target failed", {
        error,
        id,
      });
      throw error;
    }
  }

  async getTargets(): Promise<Target[]> {
    this.logger.debug("CommandQueryService: Getting targets");

    try {
      const targets = await this.apiClient.getTargets();
      this.eventBus.emit("TARGETS_LOADED", { targets });
      return targets;
    } catch (error) {
      this.logger.error("CommandQueryService: Get targets failed", { error });
      this.eventBus.emit("TARGETS_LOAD_FAILED", {
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
    }
  }

  async getActiveTargets(): Promise<string[]> {
    this.logger.debug("CommandQueryService: Getting active targets");

    try {
      return await this.apiClient.getActiveTargets();
    } catch (error) {
      this.logger.error("CommandQueryService: Get active targets failed", {
        error,
      });
      throw error;
    }
  }

  async getTargetResults(
    targetId: string,
    limit?: number
  ): Promise<SpeedTestResult[]> {
    this.logger.debug("CommandQueryService: Getting target results", {
      targetId,
      limit,
    });

    try {
      const results = await this.apiClient.getTargetResults(targetId, limit);
      this.eventBus.emit("SPEED_TEST_RESULTS_LOADED", {
        targetId,
        results,
      });
      return results;
    } catch (error) {
      this.logger.error("CommandQueryService: Get target results failed", {
        error,
        targetId,
      });
      this.eventBus.emit("SPEED_TEST_RESULTS_LOAD_FAILED", {
        targetId,
        error: error instanceof Error ? error.message : "An error occurred",
      });
      throw error;
    }
  }

  // Alert commands
  async createAlertRule(data: CreateAlertRuleData): Promise<AlertRule> {
    this.logger.debug(
      "CommandQueryService: Creating alert rule",
      data as unknown as LogContext
    );

    try {
      const rule = await this.apiClient.createAlertRule(data);
      this.eventBus.emit("ALERT_RULES_LOADED", {
        targetId: data.targetId,
        rules: [rule],
      });
      return rule;
    } catch (error) {
      this.logger.error("CommandQueryService: Alert rule creation failed", {
        error,
        data,
      });
      throw error;
    }
  }

  async updateAlertRule(
    id: number,
    data: UpdateAlertRuleData
  ): Promise<AlertRule> {
    this.logger.debug("CommandQueryService: Updating alert rule", { id, data });

    try {
      const rule = await this.apiClient.updateAlertRule(id, data);
      this.eventBus.emit("ALERT_RULES_LOADED", {
        targetId: rule.targetId,
        rules: [rule],
      });
      return rule;
    } catch (error) {
      this.logger.error("CommandQueryService: Alert rule update failed", {
        error,
        id,
        data,
      });
      throw error;
    }
  }

  async deleteAlertRule(id: number): Promise<void> {
    this.logger.debug("CommandQueryService: Deleting alert rule", { id });

    try {
      await this.apiClient.deleteAlertRule(id);
      this.eventBus.emit("ALERT_RULE_DELETED", { id });
    } catch (error) {
      this.logger.error("CommandQueryService: Alert rule deletion failed", {
        error,
        id,
      });
      throw error;
    }
  }

  async resolveIncident(id: number): Promise<void> {
    this.logger.debug("CommandQueryService: Resolving incident", { id });

    try {
      await this.apiClient.resolveIncident(id);
      this.eventBus.emit("INCIDENT_RESOLVED", { id });
    } catch (error) {
      this.logger.error("CommandQueryService: Incident resolution failed", {
        error,
        id,
      });
      throw error;
    }
  }

  // Notification commands
  async markNotificationAsRead(id: number): Promise<void> {
    this.logger.debug("CommandQueryService: Marking notification as read", {
      id,
    });

    try {
      await this.apiClient.markNotificationAsRead(id);
      this.eventBus.emit("NOTIFICATION_READ", { id });
    } catch (error) {
      this.logger.error(
        "CommandQueryService: Mark notification as read failed",
        {
          error,
          id,
        }
      );
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    this.logger.debug(
      "CommandQueryService: Marking all notifications as read",
      { userId }
    );

    try {
      await this.apiClient.markAllNotificationsAsRead(userId);
      this.eventBus.emit("ALL_NOTIFICATIONS_READ", { userId });
    } catch (error) {
      this.logger.error(
        "CommandQueryService: Mark all notifications as read failed",
        {
          error,
          userId,
        }
      );
      throw error;
    }
  }

  async createPushSubscription(
    data: Omit<PushSubscription, "id">
  ): Promise<PushSubscription> {
    this.logger.debug("CommandQueryService: Creating push subscription", data);

    try {
      const subscription = await this.apiClient.createPushSubscription(data);
      this.eventBus.emit("PUSH_SUBSCRIPTION_CREATED", { subscription });
      return subscription;
    } catch (error) {
      this.logger.error(
        "CommandQueryService: Push subscription creation failed",
        {
          error,
          data,
        }
      );
      throw error;
    }
  }

  async deletePushSubscription(id: string): Promise<void> {
    this.logger.debug("CommandQueryService: Deleting push subscription", {
      id,
    });

    try {
      await this.apiClient.deletePushSubscription(id);
      this.eventBus.emit("PUSH_SUBSCRIPTION_DELETED", { id });
    } catch (error) {
      this.logger.error(
        "CommandQueryService: Push subscription deletion failed",
        {
          error,
          id,
        }
      );
      throw error;
    }
  }

  async sendPushNotification(data: TestNotificationData): Promise<void> {
    this.logger.debug(
      "CommandQueryService: Sending push notification",
      data as unknown as LogContext
    );

    try {
      await this.apiClient.sendPushNotification(data);
      this.eventBus.emit("PUSH_NOTIFICATION_SENT", { data });
    } catch (error) {
      this.logger.error("CommandQueryService: Send push notification failed", {
        error,
        data,
      });
      throw error;
    }
  }

  // Auth commands
  async signIn(
    email: string,
    password: string
  ): Promise<{ user: User; session: AuthSession }> {
    this.logger.debug("CommandQueryService: Signing in user", { email });

    try {
      const result = await this.apiClient.signIn(email, password);
      this.eventBus.emit("USER_SIGNED_IN", { user: result.user });
      return result;
    } catch (error) {
      this.logger.error("CommandQueryService: Sign in failed", {
        error,
        email,
      });
      throw error;
    }
  }

  async signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<{ user: User; session: AuthSession }> {
    this.logger.debug("CommandQueryService: Signing up user", { email, name });

    try {
      const result = await this.apiClient.signUp(email, password, name);
      this.eventBus.emit("USER_SIGNED_UP", { user: result.user });
      return result;
    } catch (error) {
      this.logger.error("CommandQueryService: Sign up failed", {
        error,
        email,
        name,
      });
      throw error;
    }
  }

  async signOut(): Promise<void> {
    this.logger.debug("CommandQueryService: Signing out user");

    try {
      await this.apiClient.signOut();
      this.eventBus.emit("USER_SIGNED_OUT", {});
    } catch (error) {
      this.logger.error("CommandQueryService: Sign out failed", { error });
      throw error;
    }
  }

  // Alert queries
  async getAlertRules(targetId: string): Promise<AlertRule[]> {
    this.logger.debug("CommandQueryService: Getting alert rules", { targetId });

    try {
      const rules = await this.apiClient.getAlertRules(targetId);
      this.eventBus.emit("ALERT_RULES_LOADED", { targetId, rules });
      return rules;
    } catch (error) {
      this.logger.error("CommandQueryService: Get alert rules failed", {
        error,
        targetId,
      });
      throw error;
    }
  }

  async getIncidents(targetId: string): Promise<Incident[]> {
    this.logger.debug("CommandQueryService: Getting incidents", { targetId });

    try {
      const incidents = await this.apiClient.getIncidents(targetId);
      this.eventBus.emit("INCIDENTS_LOADED", { targetId, incidents });
      return incidents;
    } catch (error) {
      this.logger.error("CommandQueryService: Get incidents failed", {
        error,
        targetId,
      });
      throw error;
    }
  }

  // Notification queries
  async getNotifications(userId: string): Promise<Notification[]> {
    this.logger.debug("CommandQueryService: Getting notifications", { userId });

    try {
      const notifications = await this.apiClient.getNotifications(userId);
      this.eventBus.emit("NOTIFICATIONS_LOADED", { notifications });
      return notifications;
    } catch (error) {
      this.logger.error("CommandQueryService: Get notifications failed", {
        error,
        userId,
      });
      throw error;
    }
  }

  async getPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    this.logger.debug("CommandQueryService: Getting push subscriptions", {
      userId,
    });

    try {
      const subscriptions = await this.apiClient.getPushSubscriptions(userId);
      this.eventBus.emit("PUSH_SUBSCRIPTIONS_LOADED", { subscriptions });
      return subscriptions;
    } catch (error) {
      this.logger.error("CommandQueryService: Get push subscriptions failed", {
        error,
        userId,
      });
      throw error;
    }
  }

  // Auth queries
  async getCurrentUser(): Promise<User | null> {
    this.logger.debug("CommandQueryService: Getting current user");

    try {
      return await this.apiClient.getCurrentUser();
    } catch (error) {
      this.logger.error("CommandQueryService: Get current user failed", {
        error,
      });
      throw error;
    }
  }

  async getSession(): Promise<AuthSession | null> {
    this.logger.debug("CommandQueryService: Getting session");

    try {
      return await this.apiClient.getSession();
    } catch (error) {
      this.logger.error("CommandQueryService: Get session failed", { error });
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    this.logger.debug("CommandQueryService: Checking authentication status");

    try {
      return await this.apiClient.isAuthenticated();
    } catch (error) {
      this.logger.error("CommandQueryService: Check authentication failed", {
        error,
      });
      throw error;
    }
  }
}
