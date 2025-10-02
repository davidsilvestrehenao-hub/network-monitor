// Import domain types
import type { Notification } from "../../types/domain-types";
import type {
  CreateNotificationDTO,
  UpdateNotificationDTO,
  NotificationQueryDTO,
} from "../../types/standardized-dto-types";

// Re-export for backward compatibility
export type { Notification };

// Use standardized DTO types for consistency
export type CreateNotificationData = CreateNotificationDTO;
export type UpdateNotificationData = UpdateNotificationDTO;
export type NotificationQuery = NotificationQueryDTO;

// Repository interface
export interface INotificationRepository
  extends IUserOwnedSimpleRepository<
    Notification,
    CreateNotificationData,
    UpdateNotificationData
  > {
  // Domain-specific query methods
  findByUserId(ownerId: string, limit?: number): Promise<Notification[]>;
  findByUserIdWithPagination(
    ownerId: string,
    limit?: number,
    offset?: number
  ): Promise<Notification[]>;
  countByUserId(ownerId: string): Promise<number>;
  findByQuery(query: NotificationQuery): Promise<Notification[]>;
  getUnreadByUserId(ownerId: string): Promise<Notification[]>;

  // Domain-specific command methods
  deleteByUserId(ownerId: string): Promise<void>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsReadByUserId(ownerId: string): Promise<number>;
  deleteOldNotifications(olderThan: Date): Promise<number>;
}

// Import base repository interface
import type { IUserOwnedSimpleRepository } from "../base/ISimpleRepository";
