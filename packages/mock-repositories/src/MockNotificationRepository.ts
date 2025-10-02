import type { INotificationRepository } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

// Import legacy domain types to match interface expectations
interface Notification {
  id: string;
  message: string;
  sentAt: string;
  read: boolean;
  userId: string;
}

interface CreateNotificationData {
  message: string;
  ownerId: string;
}

interface UpdateNotificationData {
  message?: string;
  read?: boolean;
}

interface NotificationQuery {
  ownerId?: string | string[];
  read?: boolean;
  sentAfter?: Date;
  sentBefore?: Date;
  limit?: number;
  offset?: number;
}

export class MockNotificationRepository implements INotificationRepository {
  private notifications: Notification[] = [];
  private nextId = 1;
  private logger?: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger;
    this.seedNotifications();
  }

  private seedNotifications(): void {
    const now = new Date();

    this.notifications = [
      {
        id: `notif-${this.nextId++}`,
        message: "High ping detected on Google DNS (150ms)",
        sentAt: new Date(now.getTime() - 1800000).toISOString(), // 30 minutes ago
        read: false,
        userId: "user-1",
      },
      {
        id: `notif-${this.nextId++}`,
        message: "Connection timeout on Cloudflare DNS",
        sentAt: new Date(now.getTime() - 3600000).toISOString(), // 1 hour ago
        read: true,
        userId: "user-1",
      },
      {
        id: `notif-${this.nextId++}`,
        message: "Low download speed on GitHub (25Mbps)",
        sentAt: new Date(now.getTime() - 900000).toISOString(), // 15 minutes ago
        read: false,
        userId: "user-2",
      },
      {
        id: `notif-${this.nextId++}`,
        message: "Monitoring started for Google DNS",
        sentAt: new Date(now.getTime() - 7200000).toISOString(), // 2 hours ago
        read: true,
        userId: "user-1",
      },
    ];
  }

  async findById(id: string | number): Promise<Notification | null> {
    this.logger?.debug(
      "MockNotificationRepository: Finding notification by ID",
      { id }
    );
    return this.notifications.find(notif => notif.id === id) || null;
  }

  async findByUserId(ownerId: string, limit = 100): Promise<Notification[]> {
    this.logger?.debug(
      "MockNotificationRepository: Finding notifications by user ID",
      { ownerId, limit }
    );
    return this.notifications
      .filter(notif => notif.userId === ownerId)
      .sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      )
      .slice(0, limit);
  }

  async findByUserIdWithPagination(
    ownerId: string,
    limit = 100,
    offset = 0
  ): Promise<Notification[]> {
    this.logger?.debug(
      "MockNotificationRepository: Finding notifications by user ID with pagination",
      { ownerId, limit, offset }
    );
    const userNotifications = this.notifications
      .filter(notif => notif.userId === ownerId)
      .sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );
    return userNotifications.slice(offset, offset + limit);
  }

  async countByUserId(ownerId: string): Promise<number> {
    this.logger?.debug(
      "MockNotificationRepository: Counting notifications by user ID",
      { ownerId }
    );
    return this.notifications.filter(notif => notif.userId === ownerId).length;
  }

  async findByQuery(query: NotificationQuery): Promise<Notification[]> {
    this.logger?.debug(
      "MockNotificationRepository: Finding notifications by query",
      { query }
    );

    let filteredNotifications = [...this.notifications];

    if (query.ownerId) {
      const userIds = Array.isArray(query.ownerId)
        ? query.ownerId
        : [query.ownerId];
      filteredNotifications = filteredNotifications.filter(notif =>
        userIds.includes(notif.userId)
      );
    }

    if (query.read !== undefined) {
      filteredNotifications = filteredNotifications.filter(
        notif => notif.read === query.read
      );
    }

    if (query.sentAfter) {
      filteredNotifications = filteredNotifications.filter(
        notif => new Date(notif.sentAt) >= query.sentAfter!
      );
    }

    if (query.sentBefore) {
      filteredNotifications = filteredNotifications.filter(
        notif => new Date(notif.sentAt) <= query.sentBefore!
      );
    }

    return filteredNotifications
      .sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      )
      .slice(query.offset || 0, (query.offset || 0) + (query.limit || 100));
  }

  async getUnreadByUserId(ownerId: string): Promise<Notification[]> {
    this.logger?.debug(
      "MockNotificationRepository: Getting unread notifications by user ID",
      { ownerId }
    );
    return this.notifications
      .filter(notif => notif.userId === ownerId && !notif.read)
      .sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      );
  }

  async getAll(limit = 100, offset = 0): Promise<Notification[]> {
    this.logger?.debug(
      "MockNotificationRepository: Getting all notifications",
      { limit, offset }
    );
    return this.notifications
      .sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
      )
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
      id: `notif-${this.nextId++}`,
      message: data.message,
      sentAt: new Date().toISOString(),
      read: false,
      userId: data.ownerId,
    };

    this.notifications.push(notification);
    return notification;
  }

  async update(
    id: string | number,
    data: UpdateNotificationData
  ): Promise<Notification> {
    this.logger?.debug("MockNotificationRepository: Updating notification", {
      id,
      data,
    });

    const notifIndex = this.notifications.findIndex(
      notif => notif.id === String(id)
    );
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

  async delete(id: string | number): Promise<void> {
    this.logger?.debug("MockNotificationRepository: Deleting notification", {
      id,
    });

    const notifIndex = this.notifications.findIndex(
      notif => notif.id === String(id)
    );
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

  async markAsRead(id: string): Promise<Notification> {
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

  async markAllAsReadByUserId(ownerId: string): Promise<number> {
    this.logger?.debug(
      "MockNotificationRepository: Marking all notifications as read by user ID",
      { ownerId }
    );

    let markedCount = 0;
    this.notifications.forEach(notif => {
      if (notif.userId === ownerId && !notif.read) {
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
      notif => new Date(notif.sentAt) >= olderThan
    );

    return initialCount - this.notifications.length;
  }

  // Helper method for testing
  setSeedData(notifications: Notification[]): void {
    this.notifications = notifications;
    // Extract numeric IDs from string IDs and find the maximum
    const numericIds = notifications
      .map(n => {
        const match = n.id.match(/notif-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(id => !isNaN(id));
    this.nextId = Math.max(...numericIds, 0) + 1;
  }

  // Helper method to get all notifications for testing
  getAllNotifications(): Notification[] {
    return [...this.notifications];
  }
}
