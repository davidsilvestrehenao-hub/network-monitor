// Domain types for User entity
export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  monitoringTargets: MonitoringTarget[];
  pushSubscriptions: PushSubscription[];
  notifications: Notification[];
}

export interface CreateUserData {
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
}

export interface UserSpeedTestPreference {
  userId: string;
  speedTestUrlId: string;
  updatedAt: Date;
}

export interface IUserSpeedTestPreferenceRepository {
  getByUserId(userId: string): Promise<UserSpeedTestPreference | null>;
  upsert(
    userId: string,
    speedTestUrlId: string
  ): Promise<UserSpeedTestPreference>;
}

// Repository interface
export interface IUserRepository
  extends IRepository<User, CreateUserData, UpdateUserData> {
  // Domain-specific query methods
  findByEmail(email: string): Promise<User | null>;
}

// Import related types
import type { MonitoringTarget } from "./IMonitoringTargetRepository";
import type { PushSubscription } from "./IPushSubscriptionRepository";
import type { Notification } from "./INotificationRepository";
import type { IRepository } from "./base/IRepository";
