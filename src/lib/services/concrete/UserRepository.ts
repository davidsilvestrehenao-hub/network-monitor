import {
  IUserRepository,
  User,
  CreateUserData,
  UpdateUserData,
} from "../interfaces/IUserRepository";
import { IDatabaseService } from "../interfaces/IDatabaseService";
import { ILogger } from "../interfaces/ILogger";

export class UserRepository implements IUserRepository {
  constructor(
    private databaseService: IDatabaseService,
    private logger: ILogger
  ) {}

  async findById(id: string): Promise<User | null> {
    this.logger.debug("UserRepository: Finding user by ID", { id });

    const prismaUser = await this.databaseService.getClient().user.findUnique({
      where: { id },
      include: {
        monitoringTargets: {
          include: {
            speedTestResults: true,
            alertRules: true,
            incidentEvents: true,
          },
        },
        pushSubscriptions: true,
        notifications: true,
      },
    });

    return prismaUser ? this.mapToUser(prismaUser) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug("UserRepository: Finding user by email", { email });

    const prismaUser = await this.databaseService.getClient().user.findUnique({
      where: { email },
      include: {
        monitoringTargets: {
          include: {
            speedTestResults: true,
            alertRules: true,
            incidentEvents: true,
          },
        },
        pushSubscriptions: true,
        notifications: true,
      },
    });

    return prismaUser ? this.mapToUser(prismaUser) : null;
  }

  async getAll(limit = 100, offset = 0): Promise<User[]> {
    this.logger.debug("UserRepository: Getting all users", { limit, offset });

    const prismaUsers = await this.databaseService.getClient().user.findMany({
      take: limit,
      skip: offset,
      include: {
        monitoringTargets: {
          include: {
            speedTestResults: true,
            alertRules: true,
            incidentEvents: true,
          },
        },
        pushSubscriptions: true,
        notifications: true,
      },
      orderBy: { id: "desc" },
    });

    return prismaUsers.map(user => this.mapToUser(user));
  }

  async count(): Promise<number> {
    this.logger.debug("UserRepository: Counting users");
    return await this.databaseService.getClient().user.count();
  }

  async create(data: CreateUserData): Promise<User> {
    this.logger.debug("UserRepository: Creating user", { data });

    const prismaUser = await this.databaseService.getClient().user.create({
      data,
      include: {
        monitoringTargets: {
          include: {
            speedTestResults: true,
            alertRules: true,
            incidentEvents: true,
          },
        },
        pushSubscriptions: true,
        notifications: true,
      },
    });

    return this.mapToUser(prismaUser);
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    this.logger.debug("UserRepository: Updating user", { id, data });

    const prismaUser = await this.databaseService.getClient().user.update({
      where: { id },
      data,
      include: {
        monitoringTargets: {
          include: {
            speedTestResults: true,
            alertRules: true,
            incidentEvents: true,
          },
        },
        pushSubscriptions: true,
        notifications: true,
      },
    });

    return this.mapToUser(prismaUser);
  }

  async delete(id: string): Promise<void> {
    this.logger.debug("UserRepository: Deleting user", { id });
    await this.databaseService.getClient().user.delete({
      where: { id },
    });
  }

  private mapToUser(prismaUser: unknown): User {
    const user = prismaUser as {
      id: string;
      name: string | null;
      email: string | null;
      emailVerified: Date | null;
      image: string | null;
      monitoringTargets?: Array<{
        id: string;
        name: string;
        address: string;
        ownerId: string;
        speedTestResults?: Array<{
          id: number;
          ping: number | null;
          download: number | null;
          status: string;
          error: string | null;
          createdAt: Date;
          targetId: string;
        }>;
        incidentEvents?: Array<{
          id: number;
          timestamp: Date;
          type: string;
          description: string;
          resolved: boolean;
          targetId: string;
          ruleId: number | null;
          triggeredByRule?: {
            id: number;
            name: string;
            metric: string;
            condition: string;
            threshold: number;
            enabled: boolean;
            targetId: string;
          } | null;
        }>;
        alertRules?: Array<{
          id: number;
          name: string;
          metric: string;
          condition: string;
          threshold: number;
          enabled: boolean;
          targetId: string;
        }>;
      }>;
      pushSubscriptions?: Array<{
        id: string;
        endpoint: string;
        p256dh: string;
        auth: string;
        userId: string;
      }>;
      notifications?: Array<{
        id: number;
        message: string;
        sentAt: Date;
        read: boolean;
        userId: string;
      }>;
    };

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      monitoringTargets:
        user.monitoringTargets?.map(target => ({
          id: target.id,
          name: target.name,
          address: target.address,
          ownerId: target.ownerId,
          speedTestResults:
            target.speedTestResults?.map(result => ({
              id: result.id,
              ping: result.ping,
              download: result.download,
              status: result.status as "SUCCESS" | "FAILURE",
              error: result.error,
              createdAt: result.createdAt,
              targetId: result.targetId,
            })) || [],
          incidentEvents:
            target.incidentEvents?.map(event => ({
              id: event.id,
              timestamp: event.timestamp,
              type: event.type as "OUTAGE" | "ALERT",
              description: event.description,
              resolved: event.resolved,
              targetId: event.targetId,
              ruleId: event.ruleId ?? undefined,
              triggeredByRule: event.triggeredByRule
                ? {
                    id: event.triggeredByRule.id,
                    name: event.triggeredByRule.name,
                    metric: event.triggeredByRule.metric as "ping" | "download",
                    condition: event.triggeredByRule.condition as
                      | "GREATER_THAN"
                      | "LESS_THAN",
                    threshold: event.triggeredByRule.threshold,
                    enabled: event.triggeredByRule.enabled,
                    targetId: event.triggeredByRule.targetId,
                    triggeredEvents: [],
                  }
                : null,
            })) || [],
          alertRules:
            target.alertRules?.map(rule => ({
              id: rule.id,
              name: rule.name,
              metric: rule.metric as "ping" | "download",
              condition: rule.condition as "GREATER_THAN" | "LESS_THAN",
              threshold: rule.threshold,
              enabled: rule.enabled,
              targetId: rule.targetId,
              triggeredEvents: [],
            })) || [],
        })) || [],
      pushSubscriptions:
        user.pushSubscriptions?.map(sub => ({
          id: sub.id,
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth,
          userId: sub.userId,
        })) || [],
      notifications:
        user.notifications?.map(notif => ({
          id: notif.id,
          message: notif.message,
          sentAt: notif.sentAt,
          read: notif.read,
          userId: notif.userId,
        })) || [],
    };
  }
}
