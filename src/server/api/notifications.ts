import { getAppContext } from "~/lib/container/container";
import {
  CreateNotificationData,
  Notification,
  NotificationQuery,
} from "~/lib/services/interfaces/INotificationRepository";
import {
  PushSubscription,
  CreatePushSubscriptionData,
} from "~/lib/services/interfaces/IPushSubscriptionRepository";

// Notification management endpoints
export async function createNotification(
  data: CreateNotificationData
): Promise<Notification> {
  const ctx = await getAppContext();
  if (!ctx.services.notification) {
    throw new Error("Notification service not available");
  }
  return await ctx.services.notification.createNotification(data);
}

export async function getNotification(
  _id: number
): Promise<Notification | null> {
  const ctx = await getAppContext();
  if (!ctx.services.notification) {
    throw new Error("Notification service not available");
  }
  // TODO: Implement getNotification method
  throw new Error("Get notification not implemented");
}

export async function getNotificationsByUserId(
  userId: string,
  _query?: NotificationQuery
): Promise<Notification[]> {
  const ctx = await getAppContext();
  if (!ctx.services.notification) {
    throw new Error("Notification service not available");
  }
  return await ctx.services.notification.getNotifications(userId);
}

export async function markAsRead(id: number): Promise<void> {
  const ctx = await getAppContext();
  if (!ctx.services.notification) {
    throw new Error("Notification service not available");
  }
  await ctx.services.notification.markNotificationAsRead(id);
}

export async function markAllAsRead(userId: string): Promise<void> {
  const ctx = await getAppContext();
  if (!ctx.services.notification) {
    throw new Error("Notification service not available");
  }
  await ctx.services.notification.markAllNotificationsAsRead(userId);
}

export async function deleteNotification(id: number): Promise<void> {
  const ctx = await getAppContext();
  if (!ctx.services.notification) {
    throw new Error("Notification service not available");
  }
  await ctx.services.notification.deleteNotification(id);
}

// Push subscription management endpoints
export async function createPushSubscription(
  data: CreatePushSubscriptionData
): Promise<PushSubscription> {
  const ctx = await getAppContext();
  if (!ctx.services.notification) {
    throw new Error("Notification service not available");
  }
  return await ctx.services.notification.createPushSubscription(data);
}

export async function getPushSubscriptionsByUserId(
  userId: string
): Promise<PushSubscription[]> {
  const ctx = await getAppContext();
  if (!ctx.services.notification) {
    throw new Error("Notification service not available");
  }
  return await ctx.services.notification.getPushSubscriptions(userId);
}

export async function deletePushSubscription(id: string): Promise<void> {
  const ctx = await getAppContext();
  if (!ctx.services.notification) {
    throw new Error("Notification service not available");
  }
  await ctx.services.notification.deletePushSubscription(id);
}

export async function deletePushSubscriptionByEndpoint(
  _endpoint: string
): Promise<void> {
  const ctx = await getAppContext();
  if (!ctx.services.notification) {
    throw new Error("Notification service not available");
  }
  // TODO: Implement deletePushSubscriptionByEndpoint method
  throw new Error("Delete push subscription by endpoint not implemented");
}

// Push notification endpoints
export async function sendPushNotification(
  userId: string,
  message: string,
  _title?: string
): Promise<void> {
  const ctx = await getAppContext();
  if (!ctx.services.notification) {
    throw new Error("Notification service not available");
  }
  await ctx.services.notification.sendPushNotification(userId, message);
}
