import type { IWorker, WorkerConfig } from "../infrastructure/IWorker";

/**
 * Notification Worker Interface
 *
 * Handles push notifications and in-app notification delivery.
 * Listens to incident events and sends notifications to users.
 */
export interface INotificationWorker extends IWorker {
  // Push subscription management
  addPushSubscription(subscription: PushSubscriptionData): Promise<void>;
  removePushSubscription(subscriptionId: string): Promise<void>;

  // Notification delivery
  sendPushNotification(
    userId: string,
    notification: NotificationData
  ): Promise<void>;
  sendTestNotification(userId: string): Promise<void>;

  // In-app notifications
  createInAppNotification(
    userId: string,
    notification: NotificationData
  ): Promise<void>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Statistics
  getNotificationStats(): NotificationStats;

  // Health checks
  testPushService(): Promise<boolean>;
}

export interface PushSubscriptionData {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
}

export interface NotificationStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  notificationsSentToday: number;
  notificationsDelivered: number;
  notificationsFailed: number;
  averageDeliveryTime: number;
}

export interface NotificationWorkerConfig extends WorkerConfig {
  vapidPublicKey: string;
  vapidPrivateKey: string;
  vapidSubject: string;
  maxRetryAttempts: number;
  deliveryTimeout: number;
}
