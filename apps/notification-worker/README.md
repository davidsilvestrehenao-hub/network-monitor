# Notification Worker

A standalone background worker responsible for push notifications and in-app notification management.

## Overview

This worker handles all notification-related operations in the Network Monitor application. It manages push subscriptions and sends notifications to users.

## Responsibilities

- **Push Subscription Management**: Register and manage web push subscriptions
- **In-App Notifications**: Create and manage in-app notification messages
- **Notification Delivery**: Send push notifications to subscribed devices
- **Notification Status**: Track read/unread status of notifications

## Event-Driven Communication

### Listens To

- `PUSH_SUBSCRIPTION_CREATE_REQUESTED` - Register a new push subscription
- `PUSH_SUBSCRIPTION_DELETE_REQUESTED` - Delete a subscription
- `TEST_NOTIFICATION_SEND_REQUESTED` - Send a test notification
- `NOTIFICATION_MARK_READ_REQUESTED` - Mark notification as read
- `INCIDENT_CREATED` - Send alert notifications to users

### Emits

- `PUSH_SUBSCRIPTION_CREATED` - Subscription successfully registered
- `PUSH_SUBSCRIPTION_DELETED` - Subscription successfully deleted
- `NOTIFICATION_SENT` - Notification sent successfully
- `NOTIFICATION_READ` - Notification marked as read
- `ALL_NOTIFICATIONS_READ` - All notifications marked as read

## Configuration

Uses JSON-based DI container configuration from `service-wiring/`:

- `production.json` - Real database and repositories
- `development.json` - Mocked database for offline development

Environment is selected automatically based on `NODE_ENV`.

## Running

```bash
# Development (uses development.json)
bun run dev

# Production (uses production.json)
NODE_ENV=production bun run start

# Custom config
CONFIG_PATH=configs/custom.json bun run start
```

## Push Notification Flow

1. User subscribes via browser's Push API
2. Subscription details stored in database
3. When incidents occur, notification worker:
   - Creates in-app notification record
   - Sends push notification to all user's subscribed devices
   - Tracks delivery status

## Architecture

Follows the **Router → Service → Repository** pattern with complete loose coupling:

- No direct dependencies on other services
- All inter-service communication via EventBus
- Can be scaled independently
- Supports multiple push providers

## Dependencies

- `@network-monitor/shared` - Shared interfaces and types
- `@network-monitor/infrastructure` - DI container, EventBus, Logger
- `@network-monitor/database` - Repositories for data access
- `@network-monitor/notification` - NotificationService business logic
