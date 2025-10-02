import type { INotificationService } from "@network-monitor/shared";
import type { INotificationRepository } from "@network-monitor/shared";
import type { IPushSubscriptionRepository } from "@network-monitor/shared";
import type { IEventBus } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";
import type {
  Notification,
  CreateNotificationData,
} from "@network-monitor/shared";
import type {
  PushSubscription,
  CreatePushSubscriptionData,
} from "@network-monitor/shared";

export class NotificationService implements INotificationService {
  private notificationRepository: INotificationRepository;
  private pushSubscriptionRepository: IPushSubscriptionRepository;
  private eventBus: IEventBus;
  private logger: ILogger;

  constructor(
    notificationRepository: INotificationRepository,
    pushSubscriptionRepository: IPushSubscriptionRepository,
    eventBus: IEventBus,
    logger: ILogger
  ) {
    this.notificationRepository = notificationRepository;
    this.pushSubscriptionRepository = pushSubscriptionRepository;
    this.eventBus = eventBus;
    this.logger = logger;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.on(
      "NOTIFICATION_SEND_REQUESTED",
      this.handleNotificationSendRequested.bind(this) as (
        data?: unknown
      ) => void
    );
    this.eventBus.on(
      "PUSH_SUBSCRIPTION_CREATE_REQUESTED",
      this.handlePushSubscriptionCreateRequested.bind(this) as (
        data?: unknown
      ) => void
    );
    this.eventBus.on(
      "ALERT_TRIGGERED",
      this.handleAlertTriggered.bind(this) as (data?: unknown) => void
    );
    this.eventBus.on(
      "INCIDENT_CREATED",
      this.handleIncidentCreated.bind(this) as (data?: unknown) => void
    );
  }

  async createNotification(
    data: CreateNotificationData
  ): Promise<Notification> {
    this.logger.debug("NotificationService: Creating notification", { data });

    try {
      const notification = await this.notificationRepository.create(data);
      this.eventBus.emit("NOTIFICATION_CREATED", {
        id: notification.id,
        userId: notification.userId,
        message: notification.message,
      });
      return notification;
    } catch (error) {
      this.logger.error("NotificationService: Notification creation failed", {
        error,
        data,
      });
      throw error;
    }
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    this.logger.debug("NotificationService: Getting notifications by user ID", {
      userId,
    });
    return await this.notificationRepository.findByUserId(userId);
  }

  async markNotificationAsRead(id: number): Promise<void> {
    this.logger.debug("NotificationService: Marking notification as read", {
      id,
    });

    try {
      await this.notificationRepository.markAsRead(id);
      this.eventBus.emit("NOTIFICATION_READ", {
        id,
      });
    } catch (error) {
      this.logger.error("NotificationService: Mark as read failed", {
        error,
        id,
      });
      throw error;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    this.logger.debug(
      "NotificationService: Marking all notifications as read",
      {
        userId,
      }
    );

    try {
      await this.notificationRepository.markAllAsReadByUserId(userId);
      this.eventBus.emit("ALL_NOTIFICATIONS_READ", {
        userId,
      });
    } catch (error) {
      this.logger.error("NotificationService: Mark all as read failed", {
        error,
        userId,
      });
      throw error;
    }
  }

  async markAsRead(id: number): Promise<Notification> {
    this.logger.debug("NotificationService: Marking notification as read", {
      id,
    });

    try {
      const notification = await this.notificationRepository.markAsRead(id);
      this.eventBus.emit("NOTIFICATION_READ", {
        id: notification.id,
        userId: notification.userId,
      });
      return notification;
    } catch (error) {
      this.logger.error("NotificationService: Mark as read failed", {
        error,
        id,
      });
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    this.logger.debug(
      "NotificationService: Marking all notifications as read",
      {
        userId,
      }
    );

    try {
      const count =
        await this.notificationRepository.markAllAsReadByUserId(userId);
      this.eventBus.emit("ALL_NOTIFICATIONS_READ", {
        userId,
        count,
      });
      return count;
    } catch (error) {
      this.logger.error("NotificationService: Mark all as read failed", {
        error,
        userId,
      });
      throw error;
    }
  }

  async deleteNotification(id: number): Promise<void> {
    this.logger.debug("NotificationService: Deleting notification", { id });

    try {
      await this.notificationRepository.delete(id);
      this.eventBus.emit("NOTIFICATION_DELETED", { id });
    } catch (error) {
      this.logger.error("NotificationService: Notification deletion failed", {
        error,
        id,
      });
      throw error;
    }
  }

  async createPushSubscription(
    data: CreatePushSubscriptionData
  ): Promise<PushSubscription> {
    this.logger.debug("NotificationService: Creating push subscription", {
      data,
    });

    try {
      const subscription = await this.pushSubscriptionRepository.create(data);
      this.eventBus.emit("PUSH_SUBSCRIPTION_CREATED", {
        id: subscription.id,
        userId: subscription.userId,
      });
      return subscription;
    } catch (error) {
      this.logger.error(
        "NotificationService: Push subscription creation failed",
        {
          error,
          data,
        }
      );
      throw error;
    }
  }

  async getPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    this.logger.debug(
      "NotificationService: Getting push subscriptions by user ID",
      {
        userId,
      }
    );
    const subscriptions =
      await this.pushSubscriptionRepository.findByUserId(userId);
    return subscriptions || [];
  }

  async deletePushSubscription(id: string): Promise<void> {
    this.logger.debug("NotificationService: Deleting push subscription", {
      id,
    });

    try {
      await this.pushSubscriptionRepository.delete(id);
      this.eventBus.emit("PUSH_SUBSCRIPTION_DELETED", { id });
    } catch (error) {
      this.logger.error(
        "NotificationService: Push subscription deletion failed",
        {
          error,
          id,
        }
      );
      throw error;
    }
  }

  async deletePushSubscriptionByEndpoint(endpoint: string): Promise<void> {
    this.logger.debug(
      "NotificationService: Deleting push subscription by endpoint",
      {
        endpoint,
      }
    );

    try {
      await this.pushSubscriptionRepository.deleteByEndpoint(endpoint);
      this.eventBus.emit("PUSH_SUBSCRIPTION_DELETED_BY_ENDPOINT", {
        endpoint,
      });
    } catch (error) {
      this.logger.error(
        "NotificationService: Push subscription deletion by endpoint failed",
        {
          error,
          endpoint,
        }
      );
      throw error;
    }
  }

  async sendPushNotification(
    userId: string,
    message: string,
    title?: string
  ): Promise<void> {
    this.logger.debug("NotificationService: Sending push notification", {
      userId,
      message,
      title,
    });

    try {
      // Get user's push subscriptions
      const subscriptions = await this.getPushSubscriptions(userId);

      if (subscriptions.length === 0) {
        this.logger.warn(
          "NotificationService: No push subscriptions found for user",
          {
            userId,
          }
        );
        return;
      }

      // Send push notification to all subscriptions
      for (const subscription of subscriptions) {
        await this.sendToPushService(subscription, message, title);
      }

      // Create in-app notification
      await this.createNotification({
        userId,
        message: title ? `${title}: ${message}` : message,
      });

      this.eventBus.emit("PUSH_NOTIFICATION_SENT", {
        userId,
        message,
        title,
        subscriptionCount: subscriptions.length,
      });
    } catch (error) {
      this.logger.error(
        "NotificationService: Push notification sending failed",
        {
          error,
          userId,
          message,
        }
      );
      throw error;
    }
  }

  private async sendToPushService(
    subscription: PushSubscription,
    message: string,
    title?: string
  ): Promise<void> {
    // This is a mock implementation
    // In a real application, you would integrate with a push service like FCM or web-push
    this.logger.debug("NotificationService: Sending to push service", {
      endpoint: subscription.endpoint,
      message,
      title,
    });

    // Simulate push notification sending
    await new Promise(resolve => setTimeout(resolve, 100));

    this.logger.info("NotificationService: Push notification sent", {
      endpoint: subscription.endpoint,
      message,
      title,
    });
  }

  private async handleNotificationSendRequested(data: {
    userId: string;
    message: string;
  }): Promise<void> {
    await this.createNotification({
      userId: data.userId,
      message: data.message,
    });
  }

  private async handlePushSubscriptionCreateRequested(data: {
    userId: string;
    subscription: unknown;
  }): Promise<void> {
    await this.createPushSubscription(
      data.subscription as CreatePushSubscriptionData
    );
  }

  private async handleAlertTriggered(data: {
    targetId: string;
    ruleId: number;
    value: number;
    threshold: number;
  }): Promise<void> {
    const message = `Alert: ${data.value} ${data.threshold} threshold exceeded`;
    await this.sendPushNotification("anonymous", message, "Connection Alert");
  }

  private async handleIncidentCreated(data: {
    id: number;
    targetId: string;
    type: string;
    description: string;
  }): Promise<void> {
    const message = `Incident: ${data.description}`;
    await this.sendPushNotification("anonymous", message, "System Alert");
  }

  async sendBulkPushNotification(
    userIds: string[],
    message: string
  ): Promise<void> {
    this.logger.debug("NotificationService: Sending bulk push notification", {
      userIds,
      message,
    });

    for (const userId of userIds) {
      await this.sendPushNotification(userId, message);
    }
  }

  async sendTestNotification(userId: string): Promise<void> {
    this.logger.debug("NotificationService: Sending test notification", {
      userId,
    });

    const message = "This is a test notification from Network Monitor";
    await this.sendPushNotification(userId, message, "Test Notification");
  }

  // Base IService interface methods
  async getById(id: string | number): Promise<Notification | null> {
    this.logger.debug("NotificationService: Getting notification by ID", {
      id,
    });
    return this.notificationRepository.findById(
      typeof id === "string" ? parseInt(id) : id
    );
  }

  async getAll(limit?: number, offset?: number): Promise<Notification[]> {
    this.logger.debug("NotificationService: Getting all notifications", {
      limit,
      offset,
    });
    return this.notificationRepository.getAll(limit, offset);
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    return this.createNotification(data);
  }

  async update(
    id: string | number,
    data: { message?: string; read?: boolean }
  ): Promise<Notification> {
    this.logger.debug("NotificationService: Updating notification", {
      id,
      data,
    });
    return this.notificationRepository.update(
      typeof id === "string" ? parseInt(id) : id,
      data
    );
  }

  async delete(id: string | number): Promise<void> {
    this.logger.debug("NotificationService: Deleting notification", { id });
    return this.notificationRepository.delete(
      typeof id === "string" ? parseInt(id) : id
    );
  }
}
