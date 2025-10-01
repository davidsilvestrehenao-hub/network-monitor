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
export interface INotificationRepository
  extends IRepository<
    Notification,
    CreateNotificationData,
    UpdateNotificationData
  > {
  // Domain-specific query methods
  findByUserId(userId: string, limit?: number): Promise<Notification[]>;
  findByQuery(query: NotificationQuery): Promise<Notification[]>;
  getUnreadByUserId(userId: string): Promise<Notification[]>;

  // Domain-specific command methods
  deleteByUserId(userId: string): Promise<void>;
  markAsRead(id: number): Promise<Notification>;
  markAllAsReadByUserId(userId: string): Promise<number>;
  deleteOldNotifications(olderThan: Date): Promise<number>;
}

// Import base repository interface
import type { IRepository } from "./base/IRepository";
