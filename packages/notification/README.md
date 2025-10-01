# @network-monitor/notification

Business logic package for push notifications and in-app notification management.

## Overview

This package contains the `NotificationService` which handles web push subscriptions and notification delivery.

## Exports

```typescript
import { NotificationService } from "@network-monitor/notification";
```

## NotificationService

The main service class that implements `INotificationService`.

### Responsibilities

- **Notification Management**: Create and manage in-app notifications
- **Push Subscriptions**: Register and manage web push subscriptions
- **Notification Delivery**: Send push notifications to subscribed devices
- **Event Handling**: Listen for alert and incident events
- **Status Tracking**: Track read/unread status of notifications

### Key Methods

```typescript
// In-app notifications
createNotification(data: CreateNotificationData): Promise<Notification>
getNotifications(userId: string): Promise<Notification[]>
markNotificationAsRead(id: number): Promise<void>
markAllNotificationsAsRead(userId: string): Promise<void>
deleteNotification(id: number): Promise<void>

// Repository delegation methods
markAsRead(id: number): Promise<Notification>
markAllAsRead(userId: string): Promise<number>

// Push subscriptions
createPushSubscription(data: CreatePushSubscriptionData): Promise<PushSubscription>
getPushSubscriptions(userId: string): Promise<PushSubscription[]>
deletePushSubscription(id: string): Promise<void>
deletePushSubscriptionByEndpoint(endpoint: string): Promise<void>

// Push notification delivery
sendPushNotification(userId: string, message: string, title?: string): Promise<void>
sendBulkPushNotification(userIds: string[], message: string): Promise<void>
sendTestNotification(userId: string): Promise<void>
```

## Dependencies

This service requires:
- `INotificationRepository` - Notification data access
- `IPushSubscriptionRepository` - Push subscription data access
- `IEventBus` - Event-driven communication
- `ILogger` - Logging

These are injected via the DI container.

## Event-Driven Architecture

### Listens To:
- `NOTIFICATION_SEND_REQUESTED` - Send a notification
- `PUSH_SUBSCRIPTION_CREATE_REQUESTED` - Register push subscription
- `ALERT_TRIGGERED` - Alert threshold breached (sends notification)
- `INCIDENT_CREATED` - Incident created (sends notification)

### Emits:
- `NOTIFICATION_SENT` - Notification sent successfully
- `NOTIFICATION_CREATED` - In-app notification created
- `NOTIFICATION_READ` - Notification marked as read
- `ALL_NOTIFICATIONS_READ` - All notifications marked as read
- `NOTIFICATION_DELETED` - Notification deleted
- `PUSH_SUBSCRIPTION_CREATED` - Subscription registered
- `PUSH_SUBSCRIPTION_DELETED` - Subscription deleted

## Usage Example

```typescript
import { NotificationService } from "@network-monitor/notification";

const service = new NotificationService(
  notificationRepository,
  pushSubscriptionRepository,
  eventBus,
  logger
);

// Create in-app notification
const notification = await service.createNotification({
  userId: "user-123",
  message: "High latency detected on Google DNS",
});

// Register push subscription
const subscription = await service.createPushSubscription({
  userId: "user-123",
  endpoint: "https://fcm.googleapis.com/fcm/send/...",
  p256dh: "...",
  auth: "...",
});

// Send push notification to user
await service.sendPushNotification(
  "user-123",
  "High latency detected!",
  "Network Monitor Alert"
);
```

## Web Push Integration

The service integrates with the **Web Push Protocol** to send notifications to browsers:

```typescript
// 1. User subscribes via browser Push API
const subscription = await navigator.serviceWorker.ready.then(reg => 
  reg.pushManager.subscribe({ ... })
);

// 2. Store subscription
await service.createPushSubscription({
  userId: currentUser.id,
  endpoint: subscription.endpoint,
  p256dh: subscription.keys.p256dh,
  auth: subscription.keys.auth,
});

// 3. Send notifications
await service.sendPushNotification(
  currentUser.id,
  "Your network is down!"
);
```

## Automatic Alert Notifications

The service automatically sends notifications when alerts are triggered:

```typescript
// Listen for INCIDENT_CREATED events
eventBus.on("INCIDENT_CREATED", async (data) => {
  // Create in-app notification
  await notificationRepository.create({
    userId: targetOwner.id,
    message: data.description,
  });
  
  // Send push notification to all subscribed devices
  await sendPushNotification(
    targetOwner.id,
    data.description
  );
});
```

## Testing

```bash
# Run tests
bun test

# Type checking
bun run type-check

# Linting
bun run lint
```

## Building

```bash
# Build TypeScript
bun run build

# Watch mode for development
bun run dev
```

## Security Notes

⚠️ **Important**: For production deployment:

1. Implement VAPID keys for web push
2. Add rate limiting for notification sending
3. Validate push subscription endpoints
4. Implement notification expiry
5. Add user preferences for notification types
6. Consider notification batching for performance

