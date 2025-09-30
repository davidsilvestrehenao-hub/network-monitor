import type {
  INotificationRepository,
  Notification,
  CreateNotificationData,
  UpdateNotificationData,
  NotificationQuery,
} from "../interfaces/INotificationRepository";
import type { IDatabaseService } from "../interfaces/IDatabaseService";
import type { ILogger } from "../interfaces/ILogger";

export class NotificationRepository implements INotificationRepository {
  constructor(
    private databaseService: IDatabaseService,
    private logger: ILogger
  ) {}

  async findById(id: number): Promise<Notification | null> {
    this.logger.debug("NotificationRepository: Finding notification by ID", {
      id,
    });

    const prismaNotification = await this.databaseService
      .getClient()
      .notification.findUnique({
        where: { id },
      });

    return prismaNotification
      ? this.mapToNotification(prismaNotification)
      : null;
  }

  async findByUserId(userId: string, limit = 100): Promise<Notification[]> {
    this.logger.debug(
      "NotificationRepository: Finding notifications by user ID",
      { userId, limit }
    );

    const prismaNotifications = await this.databaseService
      .getClient()
      .notification.findMany({
        where: { userId },
        orderBy: { sentAt: "desc" },
        take: limit,
      });

    return prismaNotifications.map(notif => this.mapToNotification(notif));
  }

  async findByQuery(query: NotificationQuery): Promise<Notification[]> {
    this.logger.debug(
      "NotificationRepository: Finding notifications by query",
      { query }
    );

    const where: Record<string, unknown> = {};

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.read !== undefined) {
      where.read = query.read;
    }

    if (query.startDate || query.endDate) {
      where.sentAt = {} as Record<string, Date>;
      if (query.startDate) {
        (where.sentAt as Record<string, Date>).gte = query.startDate;
      }
      if (query.endDate) {
        (where.sentAt as Record<string, Date>).lte = query.endDate;
      }
    }

    const prismaNotifications = await this.databaseService
      .getClient()
      .notification.findMany({
        where,
        orderBy: { sentAt: "desc" },
        take: query.limit || 100,
        skip: query.offset || 0,
      });

    return prismaNotifications.map(notif => this.mapToNotification(notif));
  }

  async getUnreadByUserId(userId: string): Promise<Notification[]> {
    this.logger.debug(
      "NotificationRepository: Getting unread notifications by user ID",
      { userId }
    );

    const prismaNotifications = await this.databaseService
      .getClient()
      .notification.findMany({
        where: {
          userId,
          read: false,
        },
        orderBy: { sentAt: "desc" },
      });

    return prismaNotifications.map(notif => this.mapToNotification(notif));
  }

  async getAll(limit = 100, offset = 0): Promise<Notification[]> {
    this.logger.debug("NotificationRepository: Getting all notifications", {
      limit,
      offset,
    });

    const prismaNotifications = await this.databaseService
      .getClient()
      .notification.findMany({
        orderBy: { sentAt: "desc" },
        take: limit,
        skip: offset,
      });

    return prismaNotifications.map(notif => this.mapToNotification(notif));
  }

  async count(): Promise<number> {
    this.logger.debug("NotificationRepository: Counting notifications");
    return await this.databaseService.getClient().notification.count();
  }

  async create(data: CreateNotificationData): Promise<Notification> {
    this.logger.debug("NotificationRepository: Creating notification", {
      data,
    });

    const prismaNotification = await this.databaseService
      .getClient()
      .notification.create({
        data,
      });

    return this.mapToNotification(prismaNotification);
  }

  async update(
    id: number,
    data: UpdateNotificationData
  ): Promise<Notification> {
    this.logger.debug("NotificationRepository: Updating notification", {
      id,
      data,
    });

    const prismaNotification = await this.databaseService
      .getClient()
      .notification.update({
        where: { id },
        data,
      });

    return this.mapToNotification(prismaNotification);
  }

  async delete(id: number): Promise<void> {
    this.logger.debug("NotificationRepository: Deleting notification", { id });
    await this.databaseService.getClient().notification.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.logger.debug(
      "NotificationRepository: Deleting notifications by user ID",
      { userId }
    );
    await this.databaseService.getClient().notification.deleteMany({
      where: { userId },
    });
  }

  async markAsRead(id: number): Promise<Notification> {
    this.logger.debug("NotificationRepository: Marking notification as read", {
      id,
    });

    const prismaNotification = await this.databaseService
      .getClient()
      .notification.update({
        where: { id },
        data: { read: true },
      });

    return this.mapToNotification(prismaNotification);
  }

  async markAllAsReadByUserId(userId: string): Promise<number> {
    this.logger.debug(
      "NotificationRepository: Marking all notifications as read by user ID",
      { userId }
    );

    const { count } = await this.databaseService
      .getClient()
      .notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: { read: true },
      });

    return count;
  }

  async deleteOldNotifications(olderThan: Date): Promise<number> {
    this.logger.debug("NotificationRepository: Deleting old notifications", {
      olderThan,
    });

    const { count } = await this.databaseService
      .getClient()
      .notification.deleteMany({
        where: {
          sentAt: {
            lt: olderThan,
          },
        },
      });

    return count;
  }

  private mapToNotification(prismaNotification: unknown): Notification {
    const notification = prismaNotification as {
      id: number;
      message: string;
      sentAt: Date;
      read: boolean;
      userId: string;
    };

    return {
      id: notification.id,
      message: notification.message,
      sentAt: notification.sentAt,
      read: notification.read,
      userId: notification.userId,
    };
  }
}
