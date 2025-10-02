import type {
  Notification,
  CreateNotificationData,
  UpdateNotificationData,
} from "../repositories/INotificationRepository";
import type {
  PushSubscription,
  CreatePushSubscriptionData,
} from "../repositories/IPushSubscriptionRepository";
import type { IService } from "../base/IService";

export interface INotificationService
  extends IService<
    Notification,
    CreateNotificationData,
    UpdateNotificationData
  > {
  // Domain-specific notification methods
  getNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

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
