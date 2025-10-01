import type {
  IPushSubscriptionRepository,
  PushSubscription,
  CreatePushSubscriptionData,
  UpdatePushSubscriptionData,
} from "@network-monitor/shared";
import type { IDatabaseService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class PushSubscriptionRepository implements IPushSubscriptionRepository {
  constructor(
    private databaseService: IDatabaseService,
    private logger: ILogger
  ) {}

  async findById(id: string): Promise<PushSubscription | null> {
    this.logger.debug(
      "PushSubscriptionRepository: Finding subscription by ID",
      { id }
    );

    const prismaSubscription = await this.databaseService
      .getClient()
      .pushSubscription.findUnique({
        where: { id },
      });

    return prismaSubscription
      ? this.mapToPushSubscription(prismaSubscription)
      : null;
  }

  async findByUserId(userId: string): Promise<PushSubscription[]> {
    this.logger.debug(
      "PushSubscriptionRepository: Finding subscriptions by user ID",
      { userId }
    );

    const prismaSubscriptions = await this.databaseService
      .getClient()
      .pushSubscription.findMany({
        where: { userId },
        orderBy: { id: "desc" },
      });

    return prismaSubscriptions.map(sub => this.mapToPushSubscription(sub));
  }

  async findByEndpoint(endpoint: string): Promise<PushSubscription | null> {
    this.logger.debug(
      "PushSubscriptionRepository: Finding subscription by endpoint",
      { endpoint }
    );

    const prismaSubscription = await this.databaseService
      .getClient()
      .pushSubscription.findUnique({
        where: { endpoint },
      });

    return prismaSubscription
      ? this.mapToPushSubscription(prismaSubscription)
      : null;
  }

  async getAll(limit = 100, offset = 0): Promise<PushSubscription[]> {
    this.logger.debug("PushSubscriptionRepository: Getting all subscriptions", {
      limit,
      offset,
    });

    const prismaSubscriptions = await this.databaseService
      .getClient()
      .pushSubscription.findMany({
        orderBy: { id: "desc" },
        take: limit,
        skip: offset,
      });

    return prismaSubscriptions.map(sub => this.mapToPushSubscription(sub));
  }

  async count(): Promise<number> {
    this.logger.debug("PushSubscriptionRepository: Counting subscriptions");
    return await this.databaseService.getClient().pushSubscription.count();
  }

  async create(data: CreatePushSubscriptionData): Promise<PushSubscription> {
    this.logger.debug("PushSubscriptionRepository: Creating subscription", {
      data,
    });

    const prismaSubscription = await this.databaseService
      .getClient()
      .pushSubscription.create({
        data,
      });

    return this.mapToPushSubscription(prismaSubscription);
  }

  async update(
    id: string,
    data: UpdatePushSubscriptionData
  ): Promise<PushSubscription> {
    this.logger.debug("PushSubscriptionRepository: Updating subscription", {
      id,
      data,
    });

    const prismaSubscription = await this.databaseService
      .getClient()
      .pushSubscription.update({
        where: { id },
        data,
      });

    return this.mapToPushSubscription(prismaSubscription);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug("PushSubscriptionRepository: Deleting subscription", {
      id,
    });
    await this.databaseService.getClient().pushSubscription.delete({
      where: { id },
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    this.logger.debug(
      "PushSubscriptionRepository: Deleting subscriptions by user ID",
      { userId }
    );
    await this.databaseService.getClient().pushSubscription.deleteMany({
      where: { userId },
    });
  }

  async deleteByEndpoint(endpoint: string): Promise<void> {
    this.logger.debug(
      "PushSubscriptionRepository: Deleting subscription by endpoint",
      { endpoint }
    );
    await this.databaseService.getClient().pushSubscription.deleteMany({
      where: { endpoint },
    });
  }

  private mapToPushSubscription(prismaSubscription: unknown): PushSubscription {
    const subscription = prismaSubscription as {
      id: string;
      endpoint: string;
      p256dh: string;
      auth: string;
      userId: string;
    };

    return {
      id: subscription.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.p256dh,
      auth: subscription.auth,
      userId: subscription.userId,
    };
  }
}
