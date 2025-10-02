import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { NotificationService } from "./NotificationService";
import {
  createTestContainer,
  registerMockServices,
  createMockNotificationRepository,
  createMockPushSubscriptionRepository,
  createMockEventBus,
  createMockLogger,
} from "@network-monitor/shared/test-utils";
import { TYPES } from "@network-monitor/infrastructure/container";

describe("NotificationService", () => {
  let notificationService: NotificationService;
  let container: ReturnType<typeof createTestContainer>;
  let mockNotificationRepository: ReturnType<
    typeof createMockNotificationRepository
  >;
  let mockPushSubscriptionRepository: ReturnType<
    typeof createMockPushSubscriptionRepository
  >;
  let mockEventBus: ReturnType<typeof createMockEventBus>;
  let mockLogger: ReturnType<typeof createMockLogger>;

  beforeEach(async () => {
    // Create test container
    container = createTestContainer();
    registerMockServices(container);

    // Create mock repositories
    mockNotificationRepository = createMockNotificationRepository();
    mockPushSubscriptionRepository = createMockPushSubscriptionRepository();
    mockEventBus = createMockEventBus();
    mockLogger = createMockLogger();

    // Register mocks in container
    container.register(TYPES.INotificationRepository, {
      factory: () => mockNotificationRepository,
      dependencies: [],
      singleton: true,
      description: "Mock Notification Repository",
    });
    container.register(TYPES.IPushSubscriptionRepository, {
      factory: () => mockPushSubscriptionRepository,
      dependencies: [],
      singleton: true,
      description: "Mock Push Subscription Repository",
    });
    container.register(TYPES.IEventBus, {
      factory: () => mockEventBus,
      dependencies: [],
      singleton: true,
      description: "Mock Event Bus",
    });
    container.register(TYPES.ILogger, {
      factory: () => mockLogger,
      dependencies: [],
      singleton: true,
      description: "Mock Logger",
    });

    await container.initialize();

    // Create service instance with the actual mock instances
    notificationService = new NotificationService(
      mockNotificationRepository,
      mockPushSubscriptionRepository,
      mockEventBus,
      mockLogger
    );
  });

  afterEach(() => {
    // Clear mocks but preserve event bus listeners
    mockNotificationRepository.findById.mockClear();
    mockNotificationRepository.findByUserId.mockClear();
    mockNotificationRepository.create.mockClear();
    mockNotificationRepository.update.mockClear();
    mockNotificationRepository.delete.mockClear();
    mockNotificationRepository.count.mockClear();
    mockNotificationRepository.getAll.mockClear();
    mockNotificationRepository.markAsRead.mockClear();
    mockNotificationRepository.markAllAsReadByUserId.mockClear();

    mockPushSubscriptionRepository.findById.mockClear();
    mockPushSubscriptionRepository.findByUserId.mockClear();
    mockPushSubscriptionRepository.findByEndpoint.mockClear();
    mockPushSubscriptionRepository.create.mockClear();
    mockPushSubscriptionRepository.update.mockClear();
    mockPushSubscriptionRepository.delete.mockClear();
    mockPushSubscriptionRepository.count.mockClear();
    mockPushSubscriptionRepository.getAll.mockClear();
    mockPushSubscriptionRepository.deleteByEndpoint.mockClear();

    mockLogger.debug.mockClear();
    mockLogger.info.mockClear();
    mockLogger.warn.mockClear();
    mockLogger.error.mockClear();

    // Clear emit calls but preserve listeners
    mockEventBus.emit.mockClear();
  });

  describe("Base Interface Methods", () => {
    describe("getById", () => {
      it("should get notification by id", async () => {
        const testNotification = {
          id: 1,
          message: "Test notification",
          userId: "user-123",
          read: false,
          sentAt: new Date(),
        };
        mockNotificationRepository.findById.mockResolvedValue(testNotification);

        const result = await notificationService.getById(1);

        expect(result).toEqual(testNotification);
        expect(mockNotificationRepository.findById).toHaveBeenCalledWith(1);
      });

      it("should return null when notification not found", async () => {
        mockNotificationRepository.findById.mockResolvedValue(null);

        const result = await notificationService.getById(999);

        expect(result).toBeNull();
      });
    });

    describe("getAll", () => {
      it("should get all notifications", async () => {
        const testNotifications = [
          {
            id: 1,
            message: "Test 1",
            userId: "user-123",
            read: false,
            sentAt: new Date(),
          },
          {
            id: 2,
            message: "Test 2",
            userId: "user-123",
            read: true,
            sentAt: new Date(),
          },
        ];
        mockNotificationRepository.getAll.mockResolvedValue(testNotifications);

        const result = await notificationService.getAll(10, 0);

        expect(result).toEqual(testNotifications);
        expect(mockNotificationRepository.getAll).toHaveBeenCalledWith(10, 0);
      });
    });

    describe("create", () => {
      it("should create a new notification", async () => {
        const notificationData = {
          userId: "user-123",
          message: "Test notification",
        };
        const createdNotification = {
          id: 1,
          ...notificationData,
          read: false,
          sentAt: new Date(),
        };
        mockNotificationRepository.create.mockResolvedValue(
          createdNotification
        );

        const result = await notificationService.create(notificationData);

        expect(result).toEqual(createdNotification);
        expect(mockNotificationRepository.create).toHaveBeenCalledWith(
          notificationData
        );
        expect(mockEventBus.emit).toHaveBeenCalledWith("NOTIFICATION_CREATED", {
          id: createdNotification.id,
          userId: createdNotification.userId,
          message: createdNotification.message,
        });
      });
    });

    describe("update", () => {
      it("should update a notification", async () => {
        const updateData = { message: "Updated message" };
        const updatedNotification = {
          id: 1,
          message: "Updated message",
          userId: "user-123",
          read: false,
          sentAt: new Date(),
        };
        mockNotificationRepository.update.mockResolvedValue(
          updatedNotification
        );

        const result = await notificationService.update(1, updateData);

        expect(result).toEqual(updatedNotification);
        expect(mockNotificationRepository.update).toHaveBeenCalledWith(
          1,
          updateData
        );
      });
    });

    describe("delete", () => {
      it("should delete a notification", async () => {
        await notificationService.delete(1);

        expect(mockNotificationRepository.delete).toHaveBeenCalledWith(1);
      });
    });
  });

  describe("Notification Management", () => {
    describe("createNotification", () => {
      it("should create notification and emit event", async () => {
        const notificationData = {
          userId: "user-123",
          message: "Test notification",
        };
        const createdNotification = {
          id: 1,
          ...notificationData,
          read: false,
          sentAt: new Date(),
        };
        mockNotificationRepository.create.mockResolvedValue(
          createdNotification
        );

        const result =
          await notificationService.createNotification(notificationData);

        expect(result).toEqual(createdNotification);
        expect(mockEventBus.emit).toHaveBeenCalledWith("NOTIFICATION_CREATED", {
          id: createdNotification.id,
          userId: createdNotification.userId,
          message: createdNotification.message,
        });
      });

      it("should handle creation errors", async () => {
        const notificationData = {
          userId: "user-123",
          message: "Test notification",
        };
        const error = new Error("Database error");
        mockNotificationRepository.create.mockRejectedValue(error);

        await expect(
          notificationService.createNotification(notificationData)
        ).rejects.toThrow("Database error");
        expect(mockLogger.error).toHaveBeenCalledWith(
          "NotificationService: Notification creation failed",
          {
            error,
            data: notificationData,
          }
        );
      });
    });

    describe("getNotifications", () => {
      it("should get notifications for a user", async () => {
        const userId = "user-123";
        const notifications = [
          { id: 1, message: "Test 1", userId, read: false, sentAt: new Date() },
          { id: 2, message: "Test 2", userId, read: true, sentAt: new Date() },
        ];
        mockNotificationRepository.findByUserId.mockResolvedValue(
          notifications
        );

        const result = await notificationService.getNotifications(userId);

        expect(result).toEqual(notifications);
        expect(mockNotificationRepository.findByUserId).toHaveBeenCalledWith(
          userId
        );
      });
    });

    describe("markNotificationAsRead", () => {
      it("should mark notification as read and emit event", async () => {
        await notificationService.markNotificationAsRead(1);

        expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith(1);
        expect(mockEventBus.emit).toHaveBeenCalledWith("NOTIFICATION_READ", {
          id: 1,
        });
      });

      it("should handle mark as read errors", async () => {
        const error = new Error("Database error");
        mockNotificationRepository.markAsRead.mockRejectedValue(error);

        await expect(
          notificationService.markNotificationAsRead(1)
        ).rejects.toThrow("Database error");
        expect(mockLogger.error).toHaveBeenCalledWith(
          "NotificationService: Mark as read failed",
          {
            error,
            id: 1,
          }
        );
      });
    });

    describe("markAsRead", () => {
      it("should mark notification as read and return updated notification", async () => {
        const updatedNotification = {
          id: 1,
          message: "Test notification",
          userId: "user-123",
          read: true,
          sentAt: new Date(),
        };
        mockNotificationRepository.markAsRead.mockResolvedValue(
          updatedNotification
        );

        const result = await notificationService.markAsRead(1);

        expect(result).toEqual(updatedNotification);
        expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith(1);
        expect(mockEventBus.emit).toHaveBeenCalledWith("NOTIFICATION_READ", {
          id: updatedNotification.id,
          userId: updatedNotification.userId,
        });
      });
    });

    describe("markAllNotificationsAsRead", () => {
      it("should mark all notifications as read for a user", async () => {
        const userId = "user-123";
        await notificationService.markAllNotificationsAsRead(userId);

        expect(
          mockNotificationRepository.markAllAsReadByUserId
        ).toHaveBeenCalledWith(userId);
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          "ALL_NOTIFICATIONS_READ",
          { userId }
        );
      });
    });

    describe("markAllAsRead", () => {
      it("should mark all notifications as read and return count", async () => {
        const userId = "user-123";
        const count = 5;
        mockNotificationRepository.markAllAsReadByUserId.mockResolvedValue(
          count
        );

        const result = await notificationService.markAllAsRead(userId);

        expect(result).toBe(count);
        expect(
          mockNotificationRepository.markAllAsReadByUserId
        ).toHaveBeenCalledWith(userId);
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          "ALL_NOTIFICATIONS_READ",
          { userId, count }
        );
      });
    });

    describe("deleteNotification", () => {
      it("should delete notification and emit event", async () => {
        await notificationService.deleteNotification(1);

        expect(mockNotificationRepository.delete).toHaveBeenCalledWith(1);
        expect(mockEventBus.emit).toHaveBeenCalledWith("NOTIFICATION_DELETED", {
          id: 1,
        });
      });

      it("should handle deletion errors", async () => {
        const error = new Error("Database error");
        mockNotificationRepository.delete.mockRejectedValue(error);

        await expect(notificationService.deleteNotification(1)).rejects.toThrow(
          "Database error"
        );
        expect(mockLogger.error).toHaveBeenCalledWith(
          "NotificationService: Notification deletion failed",
          {
            error,
            id: 1,
          }
        );
      });
    });
  });

  describe("Push Subscription Management", () => {
    describe("createPushSubscription", () => {
      it("should create push subscription and emit event", async () => {
        const subscriptionData = {
          userId: "user-123",
          endpoint: "https://fcm.googleapis.com/fcm/send/...",
          p256dh: "key1",
          auth: "key2",
        };
        const createdSubscription = {
          id: "sub-123",
          ...subscriptionData,
        };
        mockPushSubscriptionRepository.create.mockResolvedValue(
          createdSubscription
        );

        const result =
          await notificationService.createPushSubscription(subscriptionData);

        expect(result).toEqual(createdSubscription);
        expect(mockPushSubscriptionRepository.create).toHaveBeenCalledWith(
          subscriptionData
        );
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          "PUSH_SUBSCRIPTION_CREATED",
          {
            id: createdSubscription.id,
            userId: createdSubscription.userId,
          }
        );
      });

      it("should handle creation errors", async () => {
        const subscriptionData = {
          userId: "user-123",
          endpoint: "https://fcm.googleapis.com/fcm/send/...",
          p256dh: "key1",
          auth: "key2",
        };
        const error = new Error("Database error");
        mockPushSubscriptionRepository.create.mockRejectedValue(error);

        await expect(
          notificationService.createPushSubscription(subscriptionData)
        ).rejects.toThrow("Database error");
        expect(mockLogger.error).toHaveBeenCalledWith(
          "NotificationService: Push subscription creation failed",
          {
            error,
            data: subscriptionData,
          }
        );
      });
    });

    describe("getPushSubscriptions", () => {
      it("should get push subscriptions for a user", async () => {
        const userId = "user-123";
        const subscriptions = [
          {
            id: "sub-1",
            userId,
            endpoint: "https://fcm.googleapis.com/fcm/send/...",
            p256dh: "key1",
            auth: "key2",
          },
        ];
        mockPushSubscriptionRepository.findByUserId.mockResolvedValue(
          subscriptions
        );

        const result = await notificationService.getPushSubscriptions(userId);

        expect(result).toEqual(subscriptions);
        expect(
          mockPushSubscriptionRepository.findByUserId
        ).toHaveBeenCalledWith(userId);
      });
    });

    describe("deletePushSubscription", () => {
      it("should delete push subscription and emit event", async () => {
        const subscriptionId = "sub-123";
        await notificationService.deletePushSubscription(subscriptionId);

        expect(mockPushSubscriptionRepository.delete).toHaveBeenCalledWith(
          subscriptionId
        );
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          "PUSH_SUBSCRIPTION_DELETED",
          { id: subscriptionId }
        );
      });
    });

    describe("deletePushSubscriptionByEndpoint", () => {
      it("should delete push subscription by endpoint and emit event", async () => {
        const endpoint = "https://fcm.googleapis.com/fcm/send/...";
        await notificationService.deletePushSubscriptionByEndpoint(endpoint);

        expect(
          mockPushSubscriptionRepository.deleteByEndpoint
        ).toHaveBeenCalledWith(endpoint);
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          "PUSH_SUBSCRIPTION_DELETED_BY_ENDPOINT",
          { endpoint }
        );
      });
    });
  });

  describe("Push Notifications", () => {
    describe("sendPushNotification", () => {
      it("should send push notification to all user subscriptions", async () => {
        const userId = "user-123";
        const message = "Test message";
        const title = "Test title";
        const subscriptions = [
          {
            id: "sub-1",
            userId,
            endpoint: "https://fcm.googleapis.com/fcm/send/...",
            p256dh: "key1",
            auth: "key2",
          },
        ];
        mockPushSubscriptionRepository.findByUserId.mockResolvedValue(
          subscriptions
        );
        mockNotificationRepository.create.mockResolvedValue({
          id: 1,
          userId,
          message: `${title}: ${message}`,
          read: false,
          sentAt: new Date(),
        });

        await notificationService.sendPushNotification(userId, message, title);

        expect(
          mockPushSubscriptionRepository.findByUserId
        ).toHaveBeenCalledWith(userId);
        expect(mockNotificationRepository.create).toHaveBeenCalledWith({
          userId,
          message: `${title}: ${message}`,
        });
        expect(mockEventBus.emit).toHaveBeenCalledWith(
          "PUSH_NOTIFICATION_SENT",
          {
            userId,
            message,
            title,
            subscriptionCount: 1,
          }
        );
      });

      it("should handle case when user has no subscriptions", async () => {
        const userId = "user-123";
        const message = "Test message";
        mockPushSubscriptionRepository.findByUserId.mockResolvedValue([]);

        await notificationService.sendPushNotification(userId, message);

        expect(mockLogger.warn).toHaveBeenCalledWith(
          "NotificationService: No push subscriptions found for user",
          {
            userId,
          }
        );
        expect(mockNotificationRepository.create).not.toHaveBeenCalled();
      });

      it("should handle sending errors", async () => {
        const userId = "user-123";
        const message = "Test message";
        const error = new Error("Network error");
        mockPushSubscriptionRepository.findByUserId.mockRejectedValue(error);

        await expect(
          notificationService.sendPushNotification(userId, message)
        ).rejects.toThrow("Network error");
        expect(mockLogger.error).toHaveBeenCalledWith(
          "NotificationService: Push notification sending failed",
          {
            error,
            userId,
            message,
          }
        );
      });
    });

    describe("sendBulkPushNotification", () => {
      it("should send push notification to multiple users", async () => {
        const userIds = ["user-1", "user-2"];
        const message = "Bulk message";

        // Mock each user to have subscriptions
        mockPushSubscriptionRepository.findByUserId.mockResolvedValue([
          {
            id: "sub-1",
            userId: "user-1",
            endpoint: "endpoint1",
            p256dh: "key1",
            auth: "auth1",
          },
        ]);
        mockNotificationRepository.create.mockResolvedValue({
          id: 1,
          userId: "user-1",
          message,
          read: false,
          sentAt: new Date(),
        });

        await notificationService.sendBulkPushNotification(userIds, message);

        expect(
          mockPushSubscriptionRepository.findByUserId
        ).toHaveBeenCalledTimes(2);
        expect(mockNotificationRepository.create).toHaveBeenCalledTimes(2);
      });
    });

    describe("sendTestNotification", () => {
      it("should send test notification", async () => {
        const userId = "user-123";
        const subscriptions = [
          {
            id: "sub-1",
            userId,
            endpoint: "endpoint1",
            p256dh: "key1",
            auth: "auth1",
          },
        ];
        mockPushSubscriptionRepository.findByUserId.mockResolvedValue(
          subscriptions
        );
        mockNotificationRepository.create.mockResolvedValue({
          id: 1,
          userId,
          message:
            "Test Notification: This is a test notification from Network Monitor",
          read: false,
          sentAt: new Date(),
        });

        await notificationService.sendTestNotification(userId);

        expect(
          mockPushSubscriptionRepository.findByUserId
        ).toHaveBeenCalledWith(userId);
        expect(mockNotificationRepository.create).toHaveBeenCalledWith({
          userId,
          message:
            "Test Notification: This is a test notification from Network Monitor",
        });
      });
    });
  });

  describe("Event Handlers", () => {
    describe("handleAlertTriggered", () => {
      it("should send push notification when alert is triggered", async () => {
        const eventData = {
          targetId: "target-123",
          ruleId: 1,
          value: 150,
          threshold: 100,
        };
        const subscriptions = [
          {
            id: "sub-1",
            userId: "anonymous",
            endpoint: "endpoint1",
            p256dh: "key1",
            auth: "auth1",
          },
        ];

        // Set up mocks before emitting the event
        mockPushSubscriptionRepository.findByUserId.mockResolvedValue(
          subscriptions
        );
        mockNotificationRepository.create.mockResolvedValue({
          id: 1,
          userId: "anonymous",
          message: "Connection Alert: Alert: 150 100 threshold exceeded",
          read: false,
          sentAt: new Date(),
        });

        // Emit the event
        mockEventBus.emit("ALERT_TRIGGERED", eventData);

        // Wait for async processing - increase timeout for event handler execution
        await new Promise(resolve => setTimeout(resolve, 200));

        expect(
          mockPushSubscriptionRepository.findByUserId
        ).toHaveBeenCalledWith("anonymous");
        expect(mockNotificationRepository.create).toHaveBeenCalledWith({
          userId: "anonymous",
          message: "Connection Alert: Alert: 150 100 threshold exceeded",
        });
      });
    });

    describe("handleIncidentCreated", () => {
      it("should send push notification when incident is created", async () => {
        const eventData = {
          id: 1,
          targetId: "target-123",
          type: "ALERT",
          description: "High ping detected",
        };
        const subscriptions = [
          {
            id: "sub-1",
            userId: "anonymous",
            endpoint: "endpoint1",
            p256dh: "key1",
            auth: "auth1",
          },
        ];
        mockPushSubscriptionRepository.findByUserId.mockResolvedValue(
          subscriptions
        );
        mockNotificationRepository.create.mockResolvedValue({
          id: 1,
          userId: "anonymous",
          message: "System Alert: Incident: High ping detected",
          read: false,
          sentAt: new Date(),
        });

        // Emit the event
        mockEventBus.emit("INCIDENT_CREATED", eventData);

        // Wait for async processing - increase timeout for event handler execution
        await new Promise(resolve => setTimeout(resolve, 200));

        expect(
          mockPushSubscriptionRepository.findByUserId
        ).toHaveBeenCalledWith("anonymous");
        expect(mockNotificationRepository.create).toHaveBeenCalledWith({
          userId: "anonymous",
          message: "System Alert: Incident: High ping detected",
        });
      });
    });
  });
});
