import type {
  IUserRepository,
  User,
  CreateUserData,
  UpdateUserData,
} from "@network-monitor/shared";
import type { IPrisma } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class UserRepository implements IUserRepository {
  private databaseService: IPrisma;
  private logger: ILogger;

  constructor(databaseService: IPrisma, logger: ILogger) {
    this.databaseService = databaseService;
    this.logger = logger;
  }

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

  // Justification: Prisma query results are unknown until cast to expected shape
  private mapToUser(prismaUser: unknown): User {
    const user = prismaUser as {
      id: string;
      name: string | null;
      email: string | null;
      emailVerified: Date | null;
      image: string | null;
      createdAt?: Date;
      updatedAt?: Date;
      monitoringTargets?: Array<{
        id: string;
        name: string;
        address: string;
        ownerId: string;
        createdAt?: Date;
        updatedAt?: Date;
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
          createdAt?: Date;
          updatedAt?: Date;
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
          createdAt?: Date;
          updatedAt?: Date;
        }>;
      }>;
      pushSubscriptions?: Array<{
        id: string;
        endpoint: string;
        p256dh: string;
        auth: string;
        userId: string;
        createdAt?: Date;
        updatedAt?: Date;
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
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      emailVerified: user.emailVerified?.toISOString(),
      image: user.image ?? undefined,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: user.updatedAt?.toISOString() || new Date().toISOString(),
      monitoringTargets:
        user.monitoringTargets?.map(target => ({
          id: target.id,
          name: target.name,
          address: target.address,
          ownerId: target.ownerId,
          createdAt:
            target.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt:
            target.updatedAt?.toISOString() || new Date().toISOString(),
          speedTestResults:
            target.speedTestResults?.map(result => ({
              id: result.id.toString(),
              ping: result.ping ?? undefined,
              download: result.download ?? undefined,
              upload: undefined,
              status: result.status as "SUCCESS" | "FAILURE",
              error: result.error ?? undefined,
              createdAt: result.createdAt.toISOString(),
              timestamp: result.createdAt.toISOString(),
              targetId: result.targetId,
            })) || [],
          incidentEvents:
            target.incidentEvents?.map(event => ({
              id: event.id.toString(),
              timestamp: event.timestamp.toISOString(),
              type: event.type as "OUTAGE" | "ALERT",
              description: event.description,
              resolved: event.resolved,
              targetId: event.targetId,
              ruleId: event.ruleId?.toString(),
              createdAt:
                event.createdAt?.toISOString() || new Date().toISOString(),
              updatedAt:
                event.updatedAt?.toISOString() || new Date().toISOString(),
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
              id: rule.id.toString(),
              name: rule.name,
              metric: rule.metric as "ping" | "download",
              condition: rule.condition as "GREATER_THAN" | "LESS_THAN",
              threshold: rule.threshold,
              enabled: rule.enabled,
              targetId: rule.targetId,
              createdAt:
                rule.createdAt?.toISOString() || new Date().toISOString(),
              updatedAt:
                rule.updatedAt?.toISOString() || new Date().toISOString(),
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
          createdAt: sub.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: sub.updatedAt?.toISOString() || new Date().toISOString(),
        })) || [],
      notifications:
        user.notifications?.map(notif => ({
          id: notif.id.toString(),
          message: notif.message,
          sentAt: notif.sentAt.toISOString(),
          read: notif.read,
          userId: notif.userId,
        })) || [],
    };
  }
}
