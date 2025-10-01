import type {
  IPushSubscriptionRepository,
  PushSubscription,
  CreatePushSubscriptionData,
  UpdatePushSubscriptionData,
} from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class MockPushSubscriptionRepository
  implements IPushSubscriptionRepository
{
  private subscriptions: PushSubscription[] = [];

  constructor(private logger?: ILogger) {
    this.seedSubscriptions();
  }

  private seedSubscriptions(): void {
    this.subscriptions = [
      {
        id: "sub-1",
        endpoint: "https://fcm.googleapis.com/fcm/send/example1",
        p256dh: "example-p256dh-key-1",
        auth: "example-auth-key-1",
        userId: "user-1",
      },
      {
        id: "sub-2",
        endpoint: "https://fcm.googleapis.com/fcm/send/example2",
        p256dh: "example-p256dh-key-2",
        auth: "example-auth-key-2",
        userId: "user-1",
      },
      {
        id: "sub-3",
        endpoint: "https://fcm.googleapis.com/fcm/send/example3",
        p256dh: "example-p256dh-key-3",
        auth: "example-auth-key-3",
        userId: "user-2",
      },
    ];
  }

  async findById(id: string): Promise<PushSubscription | null> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Finding subscription by ID",
      { id }
    );
    return this.subscriptions.find(sub => sub.id === id) || null;
  }

  async findByUserId(userId: string): Promise<PushSubscription[]> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Finding subscriptions by user ID",
      { userId }
    );
    return this.subscriptions.filter(sub => sub.userId === userId);
  }

  async findByEndpoint(endpoint: string): Promise<PushSubscription | null> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Finding subscription by endpoint",
      { endpoint }
    );
    return this.subscriptions.find(sub => sub.endpoint === endpoint) || null;
  }

  async getAll(limit = 100, offset = 0): Promise<PushSubscription[]> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Getting all subscriptions",
      { limit, offset }
    );
    return this.subscriptions.slice(offset, offset + limit);
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

    const subscription: PushSubscription = {
      id: `sub-${Date.now()}`,
      endpoint: data.endpoint,
      p256dh: data.p256dh,
      auth: data.auth,
      userId: data.userId,
    };

    this.subscriptions.push(subscription);
    return subscription;
  }

  async update(
    id: string,
    data: UpdatePushSubscriptionData
  ): Promise<PushSubscription> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Updating subscription",
      { id, data }
    );

    const subIndex = this.subscriptions.findIndex(sub => sub.id === id);
    if (subIndex === -1) {
      throw new Error(`Push subscription with ID ${id} not found`);
    }

    const subscription = this.subscriptions[subIndex];
    this.subscriptions[subIndex] = {
      ...subscription,
      ...data,
    };

    return this.subscriptions[subIndex];
  }

  async delete(id: string): Promise<void> {
    this.logger?.debug(
      "MockPushSubscriptionRepository: Deleting subscription",
      { id }
    );

    const subIndex = this.subscriptions.findIndex(sub => sub.id === id);
    if (subIndex === -1) {
      throw new Error(`Push subscription with ID ${id} not found`);
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
