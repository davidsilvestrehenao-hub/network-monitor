import type {
  IPushSubscriptionRepository,
  CreatePushSubscriptionData,
  UpdatePushSubscriptionData,
} from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";
import type { PushSubscription } from "@network-monitor/shared/dist/types/domain-types";

export class MockPushSubscriptionRepository
  implements IPushSubscriptionRepository
{
  private subscriptions: PushSubscription[] = [];
  private logger?: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger;
    this.seedSubscriptions();
  }

  private seedSubscriptions(): void {
    const now = new Date().toISOString();
    this.subscriptions = [
      {
        id: "sub-1",
        endpoint: "https://fcm.googleapis.com/fcm/send/example1",
        p256dh: "example-p256dh-key-1",
        auth: "example-auth-key-1",
        userId: "user-1",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "sub-2",
        endpoint: "https://fcm.googleapis.com/fcm/send/example2",
        p256dh: "example-p256dh-key-2",
        auth: "example-auth-key-2",
        userId: "user-1",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "sub-3",
        endpoint: "https://fcm.googleapis.com/fcm/send/example3",
        p256dh: "example-p256dh-key-3",
        auth: "example-auth-key-3",
        userId: "user-2",
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  async findById(id: string | number): Promise<PushSubscription | null> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Finding subscription by ID",
      { id }
    );
    const stringId = String(id);
    return this.subscriptions.find(sub => sub.id === stringId) || null;
  }

  async findByUserId(userId: string): Promise<PushSubscription[]> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Finding subscriptions by user ID",
      { userId }
    );
    return this.subscriptions.filter(sub => sub.userId === userId);
  }

  async findByUserIdWithPagination(
    userId: string,
    limit = 100,
    offset = 0
  ): Promise<PushSubscription[]> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Finding subscriptions by user ID with pagination",
      { userId, limit, offset }
    );
    const userSubscriptions = this.subscriptions.filter(
      sub => sub.ownerId === userId
    );
    return userSubscriptions.slice(offset, offset + limit);
  }

  async countByUserId(userId: string): Promise<number> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Counting subscriptions by user ID",
      { userId }
    );
    return this.subscriptions.filter(sub => sub.ownerId === userId).length;
  }

  async findByEndpoint(endpoint: string): Promise<PushSubscription | null> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Finding subscription by endpoint",
      { endpoint }
    );
    return this.subscriptions.find(sub => sub.endpoint === endpoint) || null;
  }

  async getAll(limit?: number, offset?: number): Promise<PushSubscription[]> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Getting all subscriptions",
      { limit, offset }
    );
    let results = [...this.subscriptions];
    if (offset) {
      results = results.slice(offset);
    }
    if (limit) {
      results = results.slice(0, limit);
    }
    return results;
  }

  async count(): Promise<number> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Counting subscriptions"
    );
    return this.subscriptions.length;
  }

  async create(data: CreatePushSubscriptionData): Promise<PushSubscription> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Creating subscription",
      { data }
    );

    const now = new Date().toISOString();
    const subscription: PushSubscription = {
      id: `sub-${Date.now()}`,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      userId: data.userId,
      createdAt: now,
      updatedAt: now,
    };

    this.subscriptions.push(subscription);
    return subscription;
  }

  async update(
    id: string | number,
    data: UpdatePushSubscriptionData
  ): Promise<PushSubscription> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Updating subscription",
      { id, data }
    );

    const stringId = String(id);
    const subIndex = this.subscriptions.findIndex(sub => sub.id === stringId);
    if (subIndex === -1) {
      throw new Error(`Push subscription with ID ${stringId} not found`);
    }

    const subscription = this.subscriptions[subIndex];
    this.subscriptions[subIndex] = {
      ...subscription,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return this.subscriptions[subIndex];
  }

  async delete(id: string | number): Promise<void> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Deleting subscription",
      { id }
    );

    const stringId = String(id);
    const subIndex = this.subscriptions.findIndex(sub => sub.id === stringId);
    if (subIndex === -1) {
      throw new Error(`Push subscription with ID ${stringId} not found`);
    }

    this.subscriptions.splice(subIndex, 1);
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Deleting subscriptions by user ID",
      { userId }
    );
    this.subscriptions = this.subscriptions.filter(
      sub => sub.userId !== userId
    );
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Deleting subscription by endpoint",
      { endpoint }
    );
    this.subscriptions = this.subscriptions.filter(
      sub => sub.endpoint !== endpoint
    );
  }

  // Helper method for testing
  setSeedData(subscriptions: PushSubscription[]): void {
    this.subscriptions = subscriptions;
  }

  // Helper method to get all subscriptions for testing
  getAllSubscriptions(): PushSubscription[] {
    return [...this.subscriptions];
  }
}
