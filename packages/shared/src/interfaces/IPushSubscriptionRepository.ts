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
export interface IPushSubscriptionRepository {
  // Query methods
  findById(id: string): Promise<PushSubscription | null>;
  findByUserId(userId: string): Promise<PushSubscription[]>;
  findByEndpoint(endpoint: string): Promise<PushSubscription | null>;
  getAll(limit?: number, offset?: number): Promise<PushSubscription[]>;
  count(): Promise<number>;

  // Command methods
  create(data: CreatePushSubscriptionData): Promise<PushSubscription>;
  update(
    id: string,
    data: UpdatePushSubscriptionData
  ): Promise<PushSubscription>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  deleteByEndpoint(endpoint: string): Promise<void>;
}
