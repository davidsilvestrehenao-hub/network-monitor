import type { INotificationService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";
import type { IEventBus } from "@network-monitor/shared";
import type {
  MockNotification as MockNotificationType,
  MockPushSubscription,
  AlertTriggeredEventData,
  NotificationEventData,
  AlertTriggeredData,
} from "@network-monitor/shared";
import type {
  Notification,
  CreateNotificationData,
} from "@network-monitor/shared";
import type {
  PushSubscription,
  CreatePushSubscriptionData,
} from "@network-monitor/shared";
import {
  EventKeys,
  MonitoringMetrics,
  NotificationTypes,
} from "@network-monitor/shared";

export class MockNotification implements INotificationService {
  private subscriptions: Map<string, MockPushSubscription> = new Map();
  private notifications: MockNotificationType[] = [];

  private eventBus: IEventBus;
  private logger?: ILogger;

  constructor(eventBus: IEventBus, logger?: ILogger) {
    this.eventBus = eventBus;
    this.logger = logger;
    this.logger?.debug("MockNotification: Initialized");
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.onDynamic(
      EventKeys.ALERT_TRIGGERED,
      (data?: AlertTriggeredData) => {
        if (!data) {
          return;
        }
        // Convert the event data to AlertTriggeredEventData format
        const alertData: AlertTriggeredEventData = {
          targetId: data.targetId,
          ruleId: data.ruleId.toString(),
          metric: MonitoringMetrics.PING,
          value: data.value,
          threshold: data.threshold,
          message: "Alert triggered",
        };
        this.handleAlertTriggered(alertData);
      }
    );
  }

  private async handleAlertTriggered(
    data: AlertTriggeredEventData
  ): Promise<void> {
    this.logger?.debug("MockNotification: Handling alert triggered", { data });

    const notification: MockNotificationType = {
      id: `notif-${Date.now()}`,
      message: `Alert triggered: ${data.ruleId}`,
      timestamp: new Date().toISOString(),
      data: {
        ownerId: data.targetId, // Using targetId as ownerId for mock
        ruleId: data.ruleId,
        metric: data.metric,
        value: data.value,
        threshold: data.threshold,
      },
    };

    this.notifications.push(notification);
    this.eventBus.emitDynamic(EventKeys.NOTIFICATION_SENT, {
      id: notification.id,
      userId: (notification.data?.ownerId as string) || "",
      message: notification.message,
      sentAt: notification.timestamp,
    });
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.subscriptions.set(subscription.id, subscription);
    this.eventBus.emitDynamic(EventKeys.PUSH_SUBSCRIPTION_CREATED, {
      id: subscription.id,
      ownerId: subscription.userId || "",
      endpoint: subscription.endpoint,
      createdAt: subscription.createdAt,
    });
    return subscription;
  }

  async deletePushSubscription(id: string): Promise<void> {
    this.logger?.debug("MockNotification: Deleting push subscription", { id });

    if (this.subscriptions.has(id)) {
      this.subscriptions.delete(id);
      this.eventBus.emitDynamic(EventKeys.PUSH_SUBSCRIPTION_DELETED, {
        id,
        ownerId: "unknown", // We don't have ownerId after deletion
        deletedAt: new Date().toISOString(),
      });
    } else {
      throw new Error(`Push subscription ${id} not found`);
    }
  }

  async getPushSubscriptions(ownerId: string): Promise<PushSubscription[]> {
    this.logger?.debug("MockNotification: Getting push subscriptions", {
      ownerId,
    });

    const subscriptions = Array.from(this.subscriptions.values());
    return subscriptions.filter(sub => sub.userId === ownerId);
  }

  async sendNotification(data: NotificationEventData): Promise<void> {
    this.logger?.debug("MockNotification: Sending notification", { data });

    const notification: MockNotificationType = {
      id: `notif-${Date.now()}`,
      message: data.message,
      timestamp: new Date().toISOString(),
      data: {
        userId: data.userId,
        type: data.type,
        ...data.data,
      },
    };

    this.notifications.push(notification);
    this.eventBus.emitDynamic(EventKeys.NOTIFICATION_SENT, {
      id: notification.id,
      userId: (notification.data?.ownerId as string) || "",
      message: notification.message,
      sentAt: notification.timestamp,
    });
  }

  async getNotifications(ownerId: string): Promise<Notification[]> {
    this.logger?.debug("MockNotification: Getting notifications", { ownerId });

    const userNotifications = this.notifications.filter(
      notif => notif.data?.userId === ownerId
    );

    // Convert mock notifications to domain notifications
    return userNotifications.map(notif => ({
      id: notif.id,
      message: notif.message,
      sentAt: notif.timestamp,
      read: notif.data?.read || false,
      userId: notif.data?.userId || ownerId,
    }));
  }

  async markNotificationAsRead(id: string): Promise<void> {
    this.logger?.debug("MockNotification: Marking notification as read", {
      id,
    });

    const notification = this.notifications.find(notif => notif.id === id);
    if (notification) {
      notification.data = { ...notification.data, read: true };
      this.eventBus.emitDynamic(EventKeys.NOTIFICATION_READ, {
        id: notification.id,
        userId: (notification.data?.ownerId as string) || "",
        readAt: new Date().toISOString(),
      });
    } else {
      throw new Error(`Notification ${id} not found`);
    }
  }

  async markAllNotificationsAsRead(ownerId: string): Promise<void> {
    this.logger?.debug("MockNotification: Marking all notifications as read", {
      ownerId,
    });

    const userNotifications = this.notifications.filter(
      notif => notif.data?.userId === ownerId
    );
    userNotifications.forEach(notif => {
      notif.data = { ...notif.data, read: true };
    });

    this.eventBus.emitDynamic(EventKeys.ALL_NOTIFICATIONS_READ, {
      ownerId,
      count: userNotifications.length,
      readAt: new Date().toISOString(),
    });
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
      timestamp: new Date().toISOString(),
      data: {
        ownerId: data.ownerId,
        read: false,
      },
    };

    this.notifications.push(notification);
    this.eventBus.emitDynamic(EventKeys.NOTIFICATION_CREATED, {
      id: notification.id,
      userId: (notification.data?.ownerId as string) || "",
      message: notification.message,
      createdAt: notification.timestamp,
    });

    return {
      id: notification.id,
      message: notification.message,
      sentAt: notification.timestamp,
      read: false,
      userId: data.ownerId, // Map ownerId from DTO to userId in domain type
    };
  }

  async deleteNotification(id: string): Promise<void> {
    this.logger?.debug("MockNotification: Deleting notification", { id });

    const index = this.notifications.findIndex(notif => notif.id === id);
    if (index !== -1) {
      const notification = this.notifications[index];
      this.notifications.splice(index, 1);
      this.eventBus.emitDynamic(EventKeys.NOTIFICATION_DELETED, {
        id: notification.id,
        userId: (notification.data?.ownerId as string) || "",
        deletedAt: new Date().toISOString(),
      });
    } else {
      throw new Error(`Notification ${id} not found`);
    }
  }

  async sendPushNotification(ownerId: string, message: string): Promise<void> {
    this.logger?.debug("MockNotification: Sending push notification", {
      ownerId,
      message,
    });

    const notification: MockNotificationType = {
      id: `notif-${Date.now()}`,
      message,
      timestamp: new Date().toISOString(),
      data: {
        userId: ownerId,
        type: NotificationTypes.PUSH,
        read: false,
      },
    };

    // Find or create a mock subscription for the user
    const userSubscriptions = Array.from(this.subscriptions.values()).filter(
      sub => sub.userId === ownerId
    );
    const subscription = userSubscriptions[0] || {
      id: `sub-${ownerId}-${Date.now()}`,
      userId: ownerId,
      endpoint: `mock-endpoint-${ownerId}`,
      p256dh: "mock-p256dh",
      auth: "mock-auth",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.notifications.push(notification);
    this.eventBus.emitDynamic(EventKeys.PUSH_NOTIFICATION_SENT, {
      subscriptionId: subscription.id,
      ownerId: subscription.userId || "",
      message: notification.message,
      sentAt: notification.timestamp,
    });
  }

  async sendBulkPushNotification(
    ownerIds: string[],
    message: string
  ): Promise<void> {
    this.logger?.debug("MockNotification: Sending bulk push notification", {
      ownerIds,
      message,
    });

    for (const ownerId of ownerIds) {
      await this.sendPushNotification(ownerId, message);
    }
  }

  async sendTestNotification(ownerId: string): Promise<void> {
    this.logger?.debug("MockNotification: Sending test notification", {
      ownerId,
    });

    await this.sendPushNotification(
      ownerId,
      "This is a test notification from Network Monitor"
    );
  }

  // Base IService interface methods
  async getById(id: string | number): Promise<Notification | null> {
    this.logger?.debug("MockNotification: Getting notification by ID", { id });

    const notification = this.notifications.find(
      notif => notif.id === id.toString()
    );

    if (!notification) {
      return null;
    }

    return {
      id: notification.id,
      message: notification.message,
      sentAt: notification.timestamp,
      read: notification.data?.read || false,
      userId: (notification.data?.ownerId as string) || "",
    };
  }

  async getAll(limit?: number, offset?: number): Promise<Notification[]> {
    this.logger?.debug("MockNotification: Getting all notifications", {
      limit,
      offset,
    });

    const allNotifications = this.notifications.map(notif => ({
      id: notif.id,
      message: notif.message,
      sentAt: notif.timestamp,
      read: notif.data?.read || false,
      userId: (notif.data?.userId as string) || "",
    }));

    const start = offset || 0;
    const end = limit ? start + limit : allNotifications.length;
    return allNotifications.slice(start, end);
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    return this.createNotification(data);
  }

  async update(
    id: string | number,
    data: { message?: string; read?: boolean }
  ): Promise<Notification> {
    this.logger?.debug("MockNotification: Updating notification", { id, data });

    const notification = this.notifications.find(
      notif => notif.id === id.toString()
    );

    if (!notification) {
      throw new Error(`Notification ${id} not found`);
    }

    if (data.message) {
      notification.message = data.message;
    }
    if (data.read !== undefined) {
      notification.data = { ...notification.data, read: data.read };
    }

    this.eventBus.emitDynamic(EventKeys.NOTIFICATION_UPDATED, {
      id: notification.id,
      userId: (notification.data?.ownerId as string) || "",
      message: notification.message,
      updatedAt: new Date().toISOString(),
    });

    return {
      id: notification.id,
      message: notification.message,
      sentAt: notification.timestamp,
      read: notification.data?.read || false,
      userId: (notification.data?.ownerId as string) || "",
    };
  }

  async delete(id: string | number): Promise<void> {
    return this.deleteNotification(id.toString());
  }
}
