import type {
  INotificationRepository,
  Notification,
  CreateNotificationData,
  UpdateNotificationData,
  NotificationQuery,
} from "@network-monitor/shared";
import type { IPrisma } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class NotificationRepository implements INotificationRepository {
  private databaseService: IPrisma;
  private logger: ILogger;

  constructor(databaseService: IPrisma, logger: ILogger) {
    this.databaseService = databaseService;
    this.logger = logger;
  }

  async findById(id: string): Promise<Notification | null> {
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
      "NotificationRepository: Finding notifications by owner ID",
      { ownerId: userId, limit }
    );

    const prismaNotifications = await this.databaseService
      .getClient()
      .notification.findMany({
        where: { ownerId: userId }, // Updated to use ownerId field
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

    if (query.ownerId) {
      where.ownerId = query.ownerId;
    }

    if (query.read !== undefined) {
      where.read = query.read;
    }

    if (query.sentAfter || query.sentBefore) {
      where.sentAt = {} as Record<string, Date>;
      if (query.sentAfter) {
        (where.sentAt as Record<string, Date>).gte = query.sentAfter;
      }
      if (query.sentBefore) {
        (where.sentAt as Record<string, Date>).lte = query.sentBefore;
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
      "NotificationRepository: Getting unread notifications by owner ID",
      { ownerId: userId }
    );

    const prismaNotifications = await this.databaseService
      .getClient()
      .notification.findMany({
        where: {
          ownerId: userId, // Updated to use ownerId field
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

    // Convert metadata to Prisma Json type
    const prismaData = {
      ...data,
      metadata: data.metadata as any, // Type assertion for Prisma Json compatibility
    };

    const prismaNotification = await this.databaseService
      .getClient()
      .notification.create({
        data: prismaData,
      });

    return this.mapToNotification(prismaNotification);
  }

  async update(
    id: string,
    data: UpdateNotificationData
  ): Promise<Notification> {
    this.logger.debug("NotificationRepository: Updating notification", {
      id,
      data,
    });

    // Convert metadata to Prisma Json type
    const prismaData = {
      ...data,
      metadata: data.metadata as any, // Type assertion for Prisma Json compatibility
    };

    const prismaNotification = await this.databaseService
      .getClient()
      .notification.update({
        where: { id },
        data: prismaData,
      });

    return this.mapToNotification(prismaNotification);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug("NotificationRepository: Deleting notification", { id });
    await this.databaseService.getClient().notification.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.logger.debug(
      "NotificationRepository: Deleting notifications by user ID",
      { ownerId: userId }
    );
    await this.databaseService.getClient().notification.deleteMany({
      where: { ownerId: userId },
    });
  }

  async markAsRead(id: string): Promise<Notification> {
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
      { ownerId: userId }
    );

    const { count } = await this.databaseService
      .getClient()
      .notification.updateMany({
        where: {
          ownerId: userId,
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

  async findByUserIdWithPagination(
    userId: string,
    limit = 100,
    offset = 0
  ): Promise<Notification[]> {
    this.logger.debug(
      "NotificationRepository: Finding notifications by user ID with pagination",
      { userId, limit, offset }
    );

    const prismaNotifications = await this.databaseService
      .getClient()
      .notification.findMany({
        where: { ownerId: userId },
        orderBy: { sentAt: "desc" },
        take: limit,
        skip: offset,
      });

    return prismaNotifications.map(notif => this.mapToNotification(notif));
  }

  async countByUserId(userId: string): Promise<number> {
    this.logger.debug(
      "NotificationRepository: Counting notifications by user ID",
      { userId }
    );
    return await this.databaseService.getClient().notification.count({
      where: { ownerId: userId },
    });
  }

  private mapToNotification(prismaNotification: unknown): Notification {
    const notification = prismaNotification as {
      id: string;
      message: string;
      sentAt: Date;
      read: boolean;
      ownerId: string;
    };

    return {
      id: notification.id,
      message: notification.message,
      sentAt: notification.sentAt.toISOString(),
      read: notification.read,
      userId: notification.ownerId, // Map ownerId to userId for domain type
    };
  }
}
