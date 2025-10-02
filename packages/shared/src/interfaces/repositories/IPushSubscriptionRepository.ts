// Import domain types
import type { PushSubscription } from "../../types/domain-types";

// Re-export for backward compatibility
export type { PushSubscription };

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
  extends IUserOwnedSimpleRepository<
    PushSubscription,
    CreatePushSubscriptionData,
    UpdatePushSubscriptionData
  > {
  // Domain-specific query methods
  findByEndpoint(endpoint: string): Promise<PushSubscription | null>;

  // Domain-specific command methods
  deleteByEndpoint(endpoint: string): Promise<void>;
}

// Import base repository interface
import type { IUserOwnedSimpleRepository } from "../base/ISimpleRepository";
