import {
  Notification,
  CreateNotificationData,
} from "./INotificationRepository";
import {
  PushSubscription,
  CreatePushSubscriptionData,
} from "./IPushSubscriptionRepository";

export interface INotificationService {
  // Notifications
  createNotification(data: CreateNotificationData): Promise<Notification>;
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;
  deleteNotification(id: number): Promise<void>;

  // Push subscriptions
  createPushSubscription(
    data: CreatePushSubscriptionData
  ): Promise<PushSubscription>;
  getPushSubscriptions(userId: string): Promise<PushSubscription[]>;
  deletePushSubscription(id: string): Promise<void>;

  // Sending notifications
  sendPushNotification(userId: string, message: string): Promise<void>;
  sendBulkPushNotification(userIds: string[], message: string): Promise<void>;
  sendTestNotification(userId: string): Promise<void>;
}
