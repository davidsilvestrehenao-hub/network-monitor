import type {
  INotificationRepository,
  Notification,
  CreateNotificationData,
  UpdateNotificationData,
  NotificationQuery,
} from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class MockNotificationRepository implements INotificationRepository {
  private notifications: Notification[] = [];
  private nextId = 1;

  constructor(private logger?: ILogger) {
    this.seedNotifications();
  }

  private seedNotifications(): void {
    const now = new Date();

    this.notifications = [
      {
        id: this.nextId++,
        message: "High ping detected on Google DNS (150ms)",
        sentAt: new Date(now.getTime() - 1800000), // 30 minutes ago
        read: false,
        userId: "user-1",
      },
      {
        id: this.nextId++,
        message: "Connection timeout on Cloudflare DNS",
        sentAt: new Date(now.getTime() - 3600000), // 1 hour ago
        read: true,
        userId: "user-1",
      },
      {
        id: this.nextId++,
        message: "Low download speed on GitHub (25Mbps)",
        sentAt: new Date(now.getTime() - 900000), // 15 minutes ago
        read: false,
        userId: "user-2",
      },
      {
        id: this.nextId++,
        message: "Monitoring started for Google DNS",
        sentAt: new Date(now.getTime() - 7200000), // 2 hours ago
        read: true,
        userId: "user-1",
      },
    ];
  }

  async findById(id: number): Promise<Notification | null> {
    this.logger?.debug(
      "MockNotificationRepository: Finding notification by ID",
      { id }
    );
    return this.notifications.find(notif => notif.id === id) || null;
  }

  async findByUserId(userId: string, limit = 100): Promise<Notification[]> {
    this.logger?.debug(
      "MockNotificationRepository: Finding notifications by user ID",
      { userId, limit }
    );
    return this.notifications
      .filter(notif => notif.userId === userId)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(0, limit);
  }

  async findByQuery(query: NotificationQuery): Promise<Notification[]> {
    this.logger?.debug(
      "MockNotificationRepository: Finding notifications by query",
      { query }
    );

    let filteredNotifications = [...this.notifications];

    if (query.userId) {
      filteredNotifications = filteredNotifications.filter(
        notif => notif.userId === query.userId
      );
    }

    if (query.read !== undefined) {
      filteredNotifications = filteredNotifications.filter(
        notif => notif.read === query.read
      );
    }

    if (query.startDate) {
      filteredNotifications = filteredNotifications.filter(
        notif => notif.sentAt >= (query.startDate as Date)
      );
    }

    if (query.endDate) {
      filteredNotifications = filteredNotifications.filter(
        notif => notif.sentAt <= (query.endDate as Date)
      );
    }

    return filteredNotifications
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));
  }

  async getUnreadByUserId(userId: string): Promise<Notification[]> {
    this.logger?.debug(
      "MockNotificationRepository: Getting unread notifications by user ID",
      { userId }
    );
    return this.notifications
      .filter(notif => notif.userId === userId && !notif.read)
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime());
  }

  async getAll(limit = 100, offset = 0): Promise<Notification[]> {
    this.logger?.debug(
      "MockNotificationRepository: Getting all notifications",
      { limit, offset }
    );
    return this.notifications
      .sort((a, b) => b.sentAt.getTime() - a.sentAt.getTime())
      .slice(offset, offset + limit);
  }

  async count(): Promise<number> {
    this.logger?.debug("MockNotificationRepository: Counting notifications");
    return this.notifications.length;
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    this.logger?.debug("MockNotificationRepository: Creating notification", {
      data,
    });

    const notification: Notification = {
      id: this.nextId++,
      message: data.message,
      sentAt: new Date(),
      read: false,
      userId: data.userId,
    };

    this.notifications.push(notification);
    return notification;
  }

  async update(
    id: number,
    data: UpdateNotificationData
  ): Promise<Notification> {
    this.logger?.debug("MockNotificationRepository: Updating notification", {
      id,
      data,
    });

    const notifIndex = this.notifications.findIndex(notif => notif.id === id);
    if (notifIndex === -1) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    const notification = this.notifications[notifIndex];
    this.notifications[notifIndex] = {
      ...notification,
      ...data,
    };

    return this.notifications[notifIndex];
  }

  async delete(id: number): Promise<void> {
    this.logger?.debug("MockNotificationRepository: Deleting notification", {
      id,
    });

    const notifIndex = this.notifications.findIndex(notif => notif.id === id);
    if (notifIndex === -1) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    this.notifications.splice(notifIndex, 1);
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.logger?.debug(
      "MockNotificationRepository: Deleting notifications by user ID",
      { userId }
    );
    this.notifications = this.notifications.filter(
      notif => notif.userId !== userId
    );
  }

  async markAsRead(id: number): Promise<Notification> {
    this.logger?.debug(
      "MockNotificationRepository: Marking notification as read",
      { id }
    );

    const notifIndex = this.notifications.findIndex(notif => notif.id === id);
    if (notifIndex === -1) {
      throw new Error(`Notification with ID ${id} not found`);
    }

    this.notifications[notifIndex].read = true;
    return this.notifications[notifIndex];
  }

  async markAllAsReadByUserId(userId: string): Promise<number> {
    this.logger?.debug(
      "MockNotificationRepository: Marking all notifications as read by user ID",
      { userId }
    );

    let markedCount = 0;
    this.notifications.forEach(notif => {
      if (notif.userId === userId && !notif.read) {
        notif.read = true;
        markedCount++;
      }
    });

    return markedCount;
  }

  async deleteOldNotifications(olderThan: Date): Promise<number> {
    this.logger?.debug(
      "MockNotificationRepository: Deleting old notifications",
      { olderThan }
    );

    const initialCount = this.notifications.length;
    this.notifications = this.notifications.filter(
      notif => notif.sentAt >= olderThan
    );

    return initialCount - this.notifications.length;
  }

  // Helper method for testing
  setSeedData(notifications: Notification[]): void {
    this.notifications = notifications;
    this.nextId = Math.max(...notifications.map(n => n.id), 0) + 1;
  }

  // Helper method to get all notifications for testing
  getAllNotifications(): Notification[] {
    return [...this.notifications];
  }
}
