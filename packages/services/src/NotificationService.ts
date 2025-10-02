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
import type {
  NotificationSendRequestData,
  PushSubscriptionCreateRequestData,
  AlertTriggeredData,
  IncidentCreatedData,
} from "@network-monitor/shared";
import { EventKeys } from "@network-monitor/shared";

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
    this.eventBus.onDynamic(
      EventKeys.NOTIFICATION_SEND_REQUESTED,
      this.handleNotificationSendRequested.bind(this)
    );
    this.eventBus.onDynamic(
      EventKeys.PUSH_SUBSCRIPTION_CREATE_REQUESTED,
      this.handlePushSubscriptionCreateRequested.bind(this)
    );
    this.eventBus.onDynamic(
      EventKeys.ALERT_TRIGGERED,
      this.handleAlertTriggered.bind(this) as (data?: unknown) => void
    );
    this.eventBus.onDynamic(
      EventKeys.INCIDENT_CREATED,
      this.handleIncidentCreated.bind(this) as (data?: unknown) => void
    );
  }

  async createNotification(
    data: CreateNotificationData
  ): Promise<Notification> {
    this.logger.debug("NotificationService: Creating notification", { data });

    try {
      const notification = await this.notificationRepository.create(data);
      this.eventBus.emitDynamic(EventKeys.NOTIFICATION_CREATED, {
        id: notification.id,
        ownerId: notification.userId,
        message: notification.message,
        createdAt: new Date(),
      });
      return notification as Notification;
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
    const notifications = await this.notificationRepository.findByUserId(userId);
    return notifications as Notification[];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    this.logger.debug("NotificationService: Marking notification as read", {
      id,
    });

    try {
      const notification = await this.notificationRepository.findById(id);
      await this.notificationRepository.markAsRead(id);
      this.eventBus.emitDynamic(EventKeys.NOTIFICATION_READ, {
        id,
        ownerId: notification?.userId || "unknown",
        readAt: new Date(),
      });
    } catch (error) {
      this.logger.error("NotificationService: Mark as read failed", {
        error,
        id,
      });
      throw error;
    }
  }

  async markAllNotificationsAsRead(ownerId: string): Promise<void> {
    this.logger.debug(
      "NotificationService: Marking all notifications as read",
      {
        ownerId,
      }
    );

    try {
      const count =
        await this.notificationRepository.markAllAsReadByUserId(ownerId);
      this.eventBus.emitDynamic(EventKeys.ALL_NOTIFICATIONS_READ, {
        ownerId,
        count: count || 0,
        readAt: new Date(),
      });
    } catch (error) {
      this.logger.error("NotificationService: Mark all as read failed", {
        error,
        ownerId,
      });
      throw error;
    }
  }

  async markAsRead(id: string): Promise<Notification> {
    this.logger.debug("NotificationService: Marking notification as read", {
      id,
    });

    try {
      const notification = await this.notificationRepository.markAsRead(id);
      this.eventBus.emitDynamic(EventKeys.NOTIFICATION_READ, {
        id: notification.id,
        ownerId: notification.userId,
        readAt: new Date(),
      });
      return notification as Notification;
    } catch (error) {
      this.logger.error("NotificationService: Mark as read failed", {
        error,
        id,
      });
      throw error;
    }
  }

  async markAllAsRead(ownerId: string): Promise<number> {
    this.logger.debug(
      "NotificationService: Marking all notifications as read",
      {
        ownerId,
      }
    );

    try {
      const count =
        await this.notificationRepository.markAllAsReadByUserId(ownerId);
      this.eventBus.emitDynamic(EventKeys.ALL_NOTIFICATIONS_READ, {
        ownerId,
        count,
        readAt: new Date(),
      });
      return count;
    } catch (error) {
      this.logger.error("NotificationService: Mark all as read failed", {
        error,
        ownerId,
      });
      throw error;
    }
  }

  async deleteNotification(id: string): Promise<void> {
    this.logger.debug("NotificationService: Deleting notification", { id });

    try {
      const notification = await this.notificationRepository.findById(id);
      await this.notificationRepository.delete(id);
      this.eventBus.emitDynamic(EventKeys.NOTIFICATION_DELETED, {
        id,
        ownerId: notification?.userId || "unknown",
        deletedAt: new Date(),
      });
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
      this.eventBus.emitDynamic(EventKeys.PUSH_SUBSCRIPTION_CREATED, {
        id: subscription.id,
        ownerId: subscription.userId,
        endpoint: subscription.endpoint,
        createdAt: new Date(),
      });
      return subscription as PushSubscription;
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
    return (subscriptions || []) as PushSubscription[];
  }

  async deletePushSubscription(id: string): Promise<void> {
    this.logger.debug("NotificationService: Deleting push subscription", {
      id,
    });

    try {
      const subscription = await this.pushSubscriptionRepository.findById(id);
      await this.pushSubscriptionRepository.delete(id);
      this.eventBus.emitDynamic(EventKeys.PUSH_SUBSCRIPTION_DELETED, {
        id,
        ownerId: subscription?.userId || "unknown",
        deletedAt: new Date(),
      });
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
      this.eventBus.emitDynamic("PUSH_SUBSCRIPTION_DELETED_BY_ENDPOINT", {
        endpoint,
        deletedAt: new Date(),
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
    ownerId: string,
    message: string,
    title?: string
  ): Promise<void> {
    this.logger.debug("NotificationService: Sending push notification", {
      ownerId,
      message,
      title,
    });

    try {
      // Get user's push subscriptions
      const subscriptions = await this.getPushSubscriptions(ownerId);

      if (subscriptions.length === 0) {
        this.logger.warn(
          "NotificationService: No push subscriptions found for user",
          {
            ownerId,
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
        ownerId,
        message: title ? `${title}: ${message}` : message,
      });

      this.eventBus.emitDynamic(EventKeys.PUSH_NOTIFICATION_SENT, {
        subscriptionId: subscriptions[0]?.id || "unknown",
        ownerId,
        message: title ? `${title}: ${message}` : message,
        sentAt: new Date(),
      });
    } catch (error) {
      this.logger.error(
        "NotificationService: Push notification sending failed",
        {
          error,
          ownerId,
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

  private async handleNotificationSendRequested(
    data?: NotificationSendRequestData
  ): Promise<void> {
    if (!data) {
      return;
    }
    await this.createNotification({
      ownerId: data.userId,
      message: data.message,
    });
  }

  private async handlePushSubscriptionCreateRequested(
    data?: PushSubscriptionCreateRequestData
  ): Promise<void> {
    if (!data) {
      return;
    }

    await this.createPushSubscription(data.subscription);
  }

  private async handleAlertTriggered(data?: AlertTriggeredData): Promise<void> {
    if (!data) {
      return;
    }
    const message = `Alert: ${data.value} ${data.threshold} threshold exceeded`;
    await this.sendPushNotification("anonymous", message, "Connection Alert");
  }

  private async handleIncidentCreated(
    data?: IncidentCreatedData
  ): Promise<void> {
    if (!data) {
      return;
    }
    const message = `Incident: ${data.description}`;
    await this.sendPushNotification("anonymous", message, "System Alert");
  }

  async sendBulkPushNotification(
    ownerIds: string[],
    message: string
  ): Promise<void> {
    this.logger.debug("NotificationService: Sending bulk push notification", {
      ownerIds,
      message,
    });

    for (const ownerId of ownerIds) {
      await this.sendPushNotification(ownerId, message);
    }
  }

  async sendTestNotification(ownerId: string): Promise<void> {
    this.logger.debug("NotificationService: Sending test notification", {
      ownerId,
    });

    const message = "This is a test notification from Network Monitor";
    await this.sendPushNotification(ownerId, message, "Test Notification");
  }

  // Base IService interface methods
  async getById(id: string): Promise<Notification | null> {
    this.logger.debug("NotificationService: Getting notification by ID", {
      id,
    });
    const notification = await this.notificationRepository.findById(id);
    return notification as Notification | null;
  }

  async getAll(limit?: number, offset?: number): Promise<Notification[]> {
    this.logger.debug("NotificationService: Getting all notifications", {
      limit,
      offset,
    });
    const notifications = await this.notificationRepository.getAll(limit, offset);
    return notifications as Notification[];
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    return this.createNotification(data);
  }

  async update(
    id: string,
    data: UpdateNotificationData
  ): Promise<Notification> {
    this.logger.debug("NotificationService: Updating notification", {
      id,
      data,
    });
    const notification = await this.notificationRepository.update(id, data);
    return notification as Notification;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug("NotificationService: Deleting notification", { id });
    return this.notificationRepository.delete(id);
  }
}
