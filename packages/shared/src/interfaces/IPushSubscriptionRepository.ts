// Domain types for PushSubscription entity
export interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: string;
}

export interface CreatePushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: string;
}

export interface UpdatePushSubscriptionData {
  endpoint?: string;
  p256dh?: string;
  auth?: string;
}

// Repository interface
export interface IPushSubscriptionRepository
  extends IRepository<
    PushSubscription,
    CreatePushSubscriptionData,
    UpdatePushSubscriptionData
  > {
  // Domain-specific query methods
  findByUserId(userId: string): Promise<PushSubscription[]>;
  findByEndpoint(endpoint: string): Promise<PushSubscription | null>;

  // Domain-specific command methods
  update(
    id: string,
    data: UpdatePushSubscriptionData
  ): Promise<PushSubscription>;
  deleteByUserId(userId: string): Promise<void>;
  deleteByEndpoint(endpoint: string): Promise<void>;
}

// Import base repository interface
import type { IRepository } from "./base/IRepository";
