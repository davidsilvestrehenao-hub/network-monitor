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

// Repository interface
export interface IUserRepository {
  // Query methods
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  getAll(limit?: number, offset?: number): Promise<User[]>;
  count(): Promise<number>;

  // Command methods
  create(data: CreateUserData): Promise<User>;
  update(id: string, data: UpdateUserData): Promise<User>;
  delete(id: string): Promise<void>;
}

// Import related types
import { MonitoringTarget } from "./IMonitoringTargetRepository";
import { PushSubscription } from "./IPushSubscriptionRepository";
import { Notification } from "./INotificationRepository";
