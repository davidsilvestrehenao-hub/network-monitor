// Domain types for Notification entity
export interface Notification {
  id: number;
  message: string;
  sentAt: Date;
  read: boolean;
  userId: string;
}

export interface CreateNotificationData {
  message: string;
  userId: string;
}

export interface UpdateNotificationData {
  message?: string;
  read?: boolean;
}

export interface NotificationQuery {
  userId?: string;
  read?: boolean;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// Repository interface
export interface INotificationRepository {
  // Query methods
  findById(id: number): Promise<Notification | null>;
  findByUserId(userId: string, limit?: number): Promise<Notification[]>;
  findByQuery(query: NotificationQuery): Promise<Notification[]>;
  getUnreadByUserId(userId: string): Promise<Notification[]>;
  getAll(limit?: number, offset?: number): Promise<Notification[]>;
  count(): Promise<number>;

  // Command methods
  create(data: CreateNotificationData): Promise<Notification>;
  update(id: number, data: UpdateNotificationData): Promise<Notification>;
  delete(id: number): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  markAsRead(id: number): Promise<Notification>;
  markAllAsReadByUserId(userId: string): Promise<number>;
  deleteOldNotifications(olderThan: Date): Promise<number>;
}
