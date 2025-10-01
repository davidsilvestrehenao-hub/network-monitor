import type { INotificationService } from "../interfaces/INotificationService";
import type { ILogger } from "../interfaces/ILogger";
import type { IEventBus } from "../interfaces/IEventBus";
import type {
  MockNotification as MockNotificationType,
  MockPushSubscription,
  AlertTriggeredEventData,
  NotificationEventData,
} from "~/lib/types/mock-types";
import type {
  Notification,
  CreateNotificationData,
} from "../interfaces/INotificationRepository";
import type {
  PushSubscription,
  CreatePushSubscriptionData,
} from "../interfaces/IPushSubscriptionRepository";

export class MockNotification implements INotificationService {
  private subscriptions: Map<string, MockPushSubscription> = new Map();
  private notifications: MockNotificationType[] = [];

  constructor(
    private eventBus: IEventBus,
    private logger?: ILogger
  ) {
    this.logger?.debug("MockNotification: Initialized");
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.on("ALERT_TRIGGERED", (data: unknown) => {
      this.handleAlertTriggered(data as AlertTriggeredEventData);
    });
  }

  private async handleAlertTriggered(
    data: AlertTriggeredEventData
  ): Promise<void> {
    this.logger?.debug("MockNotification: Handling alert triggered", { data });

    const notification: MockNotificationType = {
      id: `notif-${Date.now()}`,
      message: `Alert triggered: ${data.ruleId}`,
      timestamp: new Date(),
      data: {
        userId: data.targetId, // Using targetId as userId for mock
        ruleId: data.ruleId,
        metric: data.metric,
        value: data.value,
        threshold: data.threshold,
      },
    };

    this.notifications.push(notification);
    this.eventBus.emit("NOTIFICATION_SENT", notification);
  }

  async createPushSubscription(
    data: CreatePushSubscriptionData
  ): Promise<PushSubscription> {
    this.logger?.debug("MockNotification: Creating push subscription", {
      data,
    });

    const subscription: MockPushSubscription = {
      id: `sub-${Date.now()}`,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      userId: data.userId,
      createdAt: new Date(),
    };

    this.subscriptions.set(subscription.id, subscription);
    this.eventBus.emit("PUSH_SUBSCRIPTION_CREATED", subscription);
    return subscription;
  }

  async deletePushSubscription(id: string): Promise<void> {
    this.logger?.debug("MockNotification: Deleting push subscription", { id });

    if (this.subscriptions.has(id)) {
      this.subscriptions.delete(id);
      this.eventBus.emit("PUSH_SUBSCRIPTION_DELETED", { id });
    } else {
      throw new Error(`Push subscription ${id} not found`);
    }
  }

  async getPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    this.logger?.debug("MockNotification: Getting push subscriptions", {
      userId,
    });

    const subscriptions = Array.from(this.subscriptions.values());
    return subscriptions.filter(sub => sub.userId === userId);
  }

  async sendNotification(data: NotificationEventData): Promise<void> {
    this.logger?.debug("MockNotification: Sending notification", { data });

    const notification: MockNotificationType = {
      id: `notif-${Date.now()}`,
      message: data.message,
      timestamp: new Date(),
      data: {
        userId: data.userId,
        type: data.type,
        ...data.data,
      },
    };

    this.notifications.push(notification);
    this.eventBus.emit("NOTIFICATION_SENT", notification);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    this.logger?.debug("MockNotification: Getting notifications", { userId });

    const userNotifications = this.notifications.filter(
      notif => notif.data?.userId === userId
    );

    // Convert mock notifications to domain notifications
    return userNotifications.map(notif => ({
      id: parseInt(notif.id.replace("notif-", "")),
      message: notif.message,
      sentAt: notif.timestamp,
      read: notif.data?.read || false,
      userId: notif.data?.userId || userId,
    }));
  }

  async markNotificationAsRead(id: number): Promise<void> {
    this.logger?.debug("MockNotification: Marking notification as read", {
      id,
    });

    const notification = this.notifications.find(
      notif => notif.id === `notif-${id}`
    );
    if (notification) {
      notification.data = { ...notification.data, read: true };
      this.eventBus.emit("NOTIFICATION_READ", { id });
    } else {
      throw new Error(`Notification ${id} not found`);
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    this.logger?.debug("MockNotification: Marking all notifications as read", {
      userId,
    });

    const userNotifications = this.notifications.filter(
      notif => notif.data?.userId === userId
    );
    userNotifications.forEach(notif => {
      notif.data = { ...notif.data, read: true };
    });

    this.eventBus.emit("ALL_NOTIFICATIONS_READ", { userId });
  }

  // Mock-specific methods for testing
  getNotificationCount(): number {
    return this.notifications.length;
  }

  clearNotifications(): void {
    this.notifications = [];
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  clearSubscriptions(): void {
    this.subscriptions.clear();
  }

  getLastNotification(): MockNotificationType | undefined {
    return this.notifications[this.notifications.length - 1];
  }

  // Additional methods to match INotificationService interface
  async createNotification(
    data: CreateNotificationData
  ): Promise<Notification> {
    this.logger?.debug("MockNotification: Creating notification", { data });

    const notification: MockNotificationType = {
      id: `notif-${Date.now()}`,
      message: data.message,
      timestamp: new Date(),
      data: {
        userId: data.userId,
        read: false,
      },
    };

    this.notifications.push(notification);
    this.eventBus.emit("NOTIFICATION_CREATED", notification);

    return {
      id: parseInt(notification.id.replace("notif-", "")),
      message: notification.message,
      sentAt: notification.timestamp,
      read: false,
      userId: data.userId,
    };
  }

  async deleteNotification(id: number): Promise<void> {
    this.logger?.debug("MockNotification: Deleting notification", { id });

    const index = this.notifications.findIndex(
      notif => notif.id === `notif-${id}`
    );
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.eventBus.emit("NOTIFICATION_DELETED", { id });
    } else {
      throw new Error(`Notification ${id} not found`);
    }
  }

  async sendPushNotification(userId: string, message: string): Promise<void> {
    this.logger?.debug("MockNotification: Sending push notification", {
      userId,
      message,
    });

    const notification: MockNotificationType = {
      id: `notif-${Date.now()}`,
      message,
      timestamp: new Date(),
      data: {
        userId,
        type: "push",
        read: false,
      },
    };

    this.notifications.push(notification);
    this.eventBus.emit("PUSH_NOTIFICATION_SENT", notification);
  }

  async sendBulkPushNotification(
    userIds: string[],
    message: string
  ): Promise<void> {
    this.logger?.debug("MockNotification: Sending bulk push notification", {
      userIds,
      message,
    });

    for (const userId of userIds) {
      await this.sendPushNotification(userId, message);
    }
  }

  async sendTestNotification(userId: string): Promise<void> {
    this.logger?.debug("MockNotification: Sending test notification", {
      userId,
    });

    await this.sendPushNotification(
      userId,
      "This is a test notification from Network Monitor"
    );
  }
}
