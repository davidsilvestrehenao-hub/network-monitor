/**
 * GraphQL Resolvers
 *
 * Thin GraphQL wrappers around the service layer.
 * All business logic is in services - resolvers just handle GraphQL concerns.
 *
 * Architecture:
 * GraphQL Resolver → Service (from DI) → Repository → Database
 */

import type { MicroserviceContext } from "@network-monitor/infrastructure";
import type {
  IMonitorService,
  IAlertingService,
  INotificationService,
} from "@network-monitor/shared";

/**
 * Context passed to all resolvers
 */
export interface GraphQLContext {
  userId: string;
  services: {
    monitor: IMonitorService | null;
    alerting: IAlertingService | null;
    notification: INotificationService | null;
  };
  logger: MicroserviceContext["logger"];
  eventBus: MicroserviceContext["eventBus"];
}

/**
 * Creates GraphQL resolvers that use services from the DI container
 */
export function createResolvers(context: MicroserviceContext) {
  return {
    Query: {
      /**
       * Health check
       */
      health: async () => {
        return {
          status: "healthy",
          timestamp: new Date().toISOString(),
          services: {
            monitor: !!context.services.monitor,
            alerting: !!context.services.alerting,
            notification: !!context.services.notification,
          },
          database: !!context.database,
        };
      },

      /**
       * Get all targets for the current user
       */
      targets: async (
        _parent: unknown,
        _args: unknown,
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.monitor) {
          throw new Error("Monitor service not available");
        }

        try {
          return await ctx.services.monitor.getTargets(ctx.userId);
        } catch (err) {
          ctx.logger.error("GraphQL: Get targets failed", { error: err });
          throw new Error("Failed to get targets");
        }
      },

      /**
       * Get a specific target by ID
       */
      target: async (
        _parent: unknown,
        args: { id: string },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.monitor) {
          throw new Error("Monitor service not available");
        }

        try {
          const target = await ctx.services.monitor.getTarget(args.id);
          if (!target) {
            throw new Error("Target not found");
          }
          return target;
        } catch (err) {
          ctx.logger.error("GraphQL: Get target failed", {
            error: err,
            id: args.id,
          });
          throw err;
        }
      },

      /**
       * Get active targets
       */
      activeTargets: async (
        _parent: unknown,
        _args: unknown,
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.monitor) {
          throw new Error("Monitor service not available");
        }

        try {
          const targetIds = ctx.services.monitor.getActiveTargets();
          return { targetIds };
        } catch (err) {
          ctx.logger.error("GraphQL: Get active targets failed", {
            error: err,
          });
          throw new Error("Failed to get active targets");
        }
      },

      /**
       * Get alert rules by target ID
       */
      alertRulesByTarget: async (
        _parent: unknown,
        args: { targetId: string },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.alerting) {
          throw new Error("Alerting service not available");
        }

        try {
          return await ctx.services.alerting.getAlertRulesByTargetId(
            args.targetId
          );
        } catch (err) {
          ctx.logger.error("GraphQL: Get alert rules failed", {
            error: err,
            targetId: args.targetId,
          });
          throw new Error("Failed to get alert rules");
        }
      },

      /**
       * Get incidents by target ID
       */
      incidentsByTarget: async (
        _parent: unknown,
        args: { targetId: string },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.alerting) {
          throw new Error("Alerting service not available");
        }

        try {
          return await ctx.services.alerting.getIncidentsByTargetId(
            args.targetId
          );
        } catch (err) {
          ctx.logger.error("GraphQL: Get incidents failed", {
            error: err,
            targetId: args.targetId,
          });
          throw new Error("Failed to get incidents");
        }
      },

      /**
       * Get unresolved incidents
       */
      unresolvedIncidents: async (
        _parent: unknown,
        _args: unknown,
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.alerting) {
          throw new Error("Alerting service not available");
        }

        try {
          return await ctx.services.alerting.getUnresolvedIncidents();
        } catch (err) {
          ctx.logger.error("GraphQL: Get unresolved incidents failed", {
            error: err,
          });
          throw new Error("Failed to get unresolved incidents");
        }
      },

      /**
       * Get notifications for a user
       */
      notifications: async (
        _parent: unknown,
        args: { userId?: string },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.notification) {
          throw new Error("Notification service not available");
        }

        try {
          const userId = args.userId || ctx.userId;
          return await ctx.services.notification.getNotifications(userId);
        } catch (err) {
          ctx.logger.error("GraphQL: Get notifications failed", {
            error: err,
          });
          throw new Error("Failed to get notifications");
        }
      },

      /**
       * Get unread notifications
       */
      unreadNotifications: async (
        _parent: unknown,
        _args: unknown,
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.notification) {
          throw new Error("Notification service not available");
        }

        try {
          const allNotifications =
            await ctx.services.notification.getNotifications(ctx.userId);
          return allNotifications.filter(n => !n.read);
        } catch (err) {
          ctx.logger.error("GraphQL: Get unread notifications failed", {
            error: err,
          });
          throw new Error("Failed to get unread notifications");
        }
      },

      /**
       * Get push subscriptions
       */
      pushSubscriptions: async (
        _parent: unknown,
        _args: unknown,
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.notification) {
          throw new Error("Notification service not available");
        }

        try {
          return await ctx.services.notification.getPushSubscriptions(
            ctx.userId
          );
        } catch (err) {
          ctx.logger.error("GraphQL: Get push subscriptions failed", {
            error: err,
          });
          throw new Error("Failed to get push subscriptions");
        }
      },

      /**
       * Get current user
       */
      currentUser: async (
        _parent: unknown,
        _args: unknown,
        ctx: GraphQLContext
      ) => {
        // TODO: Implement user service
        return {
          id: ctx.userId,
          name: "Mock User",
          email: "mock@example.com",
        };
      },
    },

    Mutation: {
      /**
       * Create a new target
       */
      createTarget: async (
        _parent: unknown,
        args: { input: { name: string; address: string } },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.monitor) {
          throw new Error("Monitor service not available");
        }

        try {
          return await ctx.services.monitor.createTarget({
            name: args.input.name,
            address: args.input.address,
            ownerId: ctx.userId,
          });
        } catch (err) {
          ctx.logger.error("GraphQL: Create target failed", { error: err });
          throw new Error("Failed to create target");
        }
      },

      /**
       * Update a target
       */
      updateTarget: async (
        _parent: unknown,
        args: { id: string; input: { name?: string; address?: string } },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.monitor) {
          throw new Error("Monitor service not available");
        }

        try {
          return await ctx.services.monitor.updateTarget(args.id, args.input);
        } catch (err) {
          ctx.logger.error("GraphQL: Update target failed", {
            error: err,
            id: args.id,
          });
          throw new Error("Failed to update target");
        }
      },

      /**
       * Delete a target
       */
      deleteTarget: async (
        _parent: unknown,
        args: { id: string },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.monitor) {
          throw new Error("Monitor service not available");
        }

        try {
          await ctx.services.monitor.deleteTarget(args.id);
          return true;
        } catch (err) {
          ctx.logger.error("GraphQL: Delete target failed", {
            error: err,
            id: args.id,
          });
          throw new Error("Failed to delete target");
        }
      },

      /**
       * Start monitoring a target
       */
      startMonitoring: async (
        _parent: unknown,
        args: { targetId: string; intervalMs: number },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.monitor) {
          throw new Error("Monitor service not available");
        }

        try {
          ctx.services.monitor.startMonitoring(args.targetId, args.intervalMs);
          return {
            success: true,
            targetId: args.targetId,
            intervalMs: args.intervalMs,
            message: "Monitoring started successfully",
          };
        } catch (err) {
          ctx.logger.error("GraphQL: Start monitoring failed", {
            error: err,
            targetId: args.targetId,
          });
          throw new Error("Failed to start monitoring");
        }
      },

      /**
       * Stop monitoring a target
       */
      stopMonitoring: async (
        _parent: unknown,
        args: { targetId: string },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.monitor) {
          throw new Error("Monitor service not available");
        }

        try {
          ctx.services.monitor.stopMonitoring(args.targetId);
          return {
            success: true,
            targetId: args.targetId,
            message: "Monitoring stopped successfully",
          };
        } catch (err) {
          ctx.logger.error("GraphQL: Stop monitoring failed", {
            error: err,
            targetId: args.targetId,
          });
          throw new Error("Failed to stop monitoring");
        }
      },

      /**
       * Run a speed test
       */
      runSpeedTest: async (
        _parent: unknown,
        args: { targetId: string },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.monitor) {
          throw new Error("Monitor service not available");
        }

        try {
          const target = await ctx.services.monitor.getTarget(args.targetId);
          if (!target) {
            throw new Error("Target not found");
          }

          // Emit event to request speed test
          ctx.eventBus.emit("SPEED_TEST_REQUESTED", {
            targetId: args.targetId,
          });

          return {
            success: true,
            targetId: args.targetId,
            message: "Speed test initiated",
          };
        } catch (err) {
          ctx.logger.error("GraphQL: Run speed test failed", {
            error: err,
            targetId: args.targetId,
          });
          throw new Error("Failed to run speed test");
        }
      },

      /**
       * Create an alert rule
       */
      createAlertRule: async (
        _parent: unknown,
        args: {
          input: {
            name: string;
            targetId: string;
            metric: string;
            condition: string;
            threshold: number;
            enabled?: boolean;
          };
        },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.alerting) {
          throw new Error("Alerting service not available");
        }

        try {
          // Validate metric and condition
          const validMetrics = ["ping", "download"] as const;
          const validConditions = ["GREATER_THAN", "LESS_THAN"] as const;

          if (
            !validMetrics.includes(
              args.input.metric as (typeof validMetrics)[number]
            )
          ) {
            throw new Error(
              `Invalid metric: ${args.input.metric}. Must be 'ping' or 'download'`
            );
          }

          if (
            !validConditions.includes(
              args.input.condition as (typeof validConditions)[number]
            )
          ) {
            throw new Error(
              `Invalid condition: ${args.input.condition}. Must be 'GREATER_THAN' or 'LESS_THAN'`
            );
          }

          return await ctx.services.alerting.createAlertRule({
            name: args.input.name,
            targetId: args.input.targetId,
            metric: args.input.metric as "ping" | "download",
            condition: args.input.condition as "GREATER_THAN" | "LESS_THAN",
            threshold: args.input.threshold,
            enabled: args.input.enabled ?? true,
          });
        } catch (err) {
          ctx.logger.error("GraphQL: Create alert rule failed", {
            error: err,
          });
          throw new Error("Failed to create alert rule");
        }
      },

      /**
       * Update an alert rule
       */
      updateAlertRule: async (
        _parent: unknown,
        args: {
          id: number;
          input: {
            name?: string;
            metric?: string;
            condition?: string;
            threshold?: number;
            enabled?: boolean;
          };
        },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.alerting) {
          throw new Error("Alerting service not available");
        }

        try {
          // Validate metric and condition if provided
          const updateData: {
            name?: string;
            metric?: "ping" | "download";
            condition?: "GREATER_THAN" | "LESS_THAN";
            threshold?: number;
            enabled?: boolean;
          } = {};

          if (args.input.name !== undefined) {
            updateData.name = args.input.name;
          }
          if (args.input.metric !== undefined) {
            const validMetrics = ["ping", "download"] as const;
            if (
              !validMetrics.includes(
                args.input.metric as (typeof validMetrics)[number]
              )
            ) {
              throw new Error(`Invalid metric: ${args.input.metric}`);
            }
            updateData.metric = args.input.metric as "ping" | "download";
          }
          if (args.input.condition !== undefined) {
            const validConditions = ["GREATER_THAN", "LESS_THAN"] as const;
            if (
              !validConditions.includes(
                args.input.condition as (typeof validConditions)[number]
              )
            ) {
              throw new Error(`Invalid condition: ${args.input.condition}`);
            }
            updateData.condition = args.input.condition as
              | "GREATER_THAN"
              | "LESS_THAN";
          }
          if (args.input.threshold !== undefined) {
            updateData.threshold = args.input.threshold;
          }
          if (args.input.enabled !== undefined) {
            updateData.enabled = args.input.enabled;
          }

          return await ctx.services.alerting.updateAlertRule(
            args.id.toString(),
            updateData
          );
        } catch (err) {
          ctx.logger.error("GraphQL: Update alert rule failed", {
            error: err,
            id: args.id,
          });
          throw new Error("Failed to update alert rule");
        }
      },

      /**
       * Delete an alert rule
       */
      deleteAlertRule: async (
        _parent: unknown,
        args: { id: number },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.alerting) {
          throw new Error("Alerting service not available");
        }

        try {
          await ctx.services.alerting.deleteAlertRule(args.id.toString());
          return true;
        } catch (err) {
          ctx.logger.error("GraphQL: Delete alert rule failed", {
            error: err,
            id: args.id,
          });
          throw new Error("Failed to delete alert rule");
        }
      },

      /**
       * Resolve an incident
       */
      resolveIncident: async (
        _parent: unknown,
        args: { id: number },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.alerting) {
          throw new Error("Alerting service not available");
        }

        try {
          return await ctx.services.alerting.resolveIncident(
            args.id.toString()
          );
        } catch (err) {
          ctx.logger.error("GraphQL: Resolve incident failed", {
            error: err,
            id: args.id,
          });
          throw new Error("Failed to resolve incident");
        }
      },

      /**
       * Resolve all incidents for a target
       */
      resolveAllIncidents: async (
        _parent: unknown,
        args: { targetId: string },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.alerting) {
          throw new Error("Alerting service not available");
        }

        try {
          // Get all unresolved incidents for the target
          const incidents = await ctx.services.alerting.getIncidentsByTargetId(
            args.targetId
          );
          const unresolvedIncidents = incidents.filter(i => !i.resolved);

          // Resolve each one
          let resolvedCount = 0;
          for (const incident of unresolvedIncidents) {
            await ctx.services.alerting.resolveIncident(incident.id);
            resolvedCount++;
          }

          return resolvedCount;
        } catch (err) {
          ctx.logger.error("GraphQL: Resolve all incidents failed", {
            error: err,
            targetId: args.targetId,
          });
          throw new Error("Failed to resolve all incidents");
        }
      },

      /**
       * Mark notification as read
       */
      markNotificationAsRead: async (
        _parent: unknown,
        args: { id: number },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.notification) {
          throw new Error("Notification service not available");
        }

        try {
          return await ctx.services.notification.markNotificationAsRead(
            args.id.toString()
          );
        } catch (err) {
          ctx.logger.error("GraphQL: Mark notification as read failed", {
            error: err,
            id: args.id,
          });
          throw new Error("Failed to mark notification as read");
        }
      },

      /**
       * Mark all notifications as read
       */
      markAllNotificationsAsRead: async (
        _parent: unknown,
        _args: unknown,
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.notification) {
          throw new Error("Notification service not available");
        }

        try {
          return await ctx.services.notification.markAllNotificationsAsRead(
            ctx.userId
          );
        } catch (err) {
          ctx.logger.error("GraphQL: Mark all notifications as read failed", {
            error: err,
          });
          throw new Error("Failed to mark all notifications as read");
        }
      },

      /**
       * Create a push subscription
       */
      createPushSubscription: async (
        _parent: unknown,
        args: {
          input: {
            endpoint: string;
            p256dh: string;
            auth: string;
          };
        },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.notification) {
          throw new Error("Notification service not available");
        }

        try {
          return await ctx.services.notification.createPushSubscription({
            userId: ctx.userId,
            endpoint: args.input.endpoint,
            p256dh: args.input.p256dh,
            auth: args.input.auth,
          });
        } catch (err) {
          ctx.logger.error("GraphQL: Create push subscription failed", {
            error: err,
          });
          throw new Error("Failed to create push subscription");
        }
      },

      /**
       * Delete a push subscription
       */
      deletePushSubscription: async (
        _parent: unknown,
        args: { id: string },
        ctx: GraphQLContext
      ) => {
        if (!ctx.services.notification) {
          throw new Error("Notification service not available");
        }

        try {
          await ctx.services.notification.deletePushSubscription(args.id);
          return true;
        } catch (err) {
          ctx.logger.error("GraphQL: Delete push subscription failed", {
            error: err,
            id: args.id,
          });
          throw new Error("Failed to delete push subscription");
        }
      },
    },

    Subscription: {
      /**
       * Subscribe to target updates
       * Real-time updates when targets change
       */
      targetUpdated: {
        subscribe: async (
          _parent: unknown,
          _args: { targetId?: string },
          _ctx: GraphQLContext
        ) => {
          // This would use EventBus to stream updates
          // Implementation depends on GraphQL subscription transport
          throw new Error("Subscriptions not yet implemented");
        },
      },

      /**
       * Subscribe to speed test completions
       */
      speedTestCompleted: {
        subscribe: async (
          _parent: unknown,
          _args: { targetId?: string },
          _ctx: GraphQLContext
        ) => {
          // Listen to SPEED_TEST_COMPLETED event
          throw new Error("Subscriptions not yet implemented");
        },
      },

      /**
       * Subscribe to new incidents
       */
      incidentCreated: {
        subscribe: async (
          _parent: unknown,
          _args: { targetId?: string },
          _ctx: GraphQLContext
        ) => {
          // Listen to INCIDENT_CREATED event
          throw new Error("Subscriptions not yet implemented");
        },
      },

      /**
       * Subscribe to new notifications
       */
      notificationReceived: {
        subscribe: async (
          _parent: unknown,
          _args: unknown,
          _ctx: GraphQLContext
        ) => {
          // Listen to NOTIFICATION_CREATED event
          throw new Error("Subscriptions not yet implemented");
        },
      },
    },
  };
}

/**
 * Helper to create GraphQL context from HTTP request
 */
export function createGraphQLContext(
  req: Request,
  context: MicroserviceContext
): GraphQLContext {
  // Extract user ID from Authorization header
  const authHeader = req.headers.get("Authorization");
  const userId = authHeader?.replace("Bearer ", "") || "mock-user-id";

  return {
    userId,
    services: {
      monitor: context.services.monitor as IMonitorService | null,
      alerting: context.services.alerting as IAlertingService | null,
      notification: context.services
        .notification as INotificationService | null,
    },
    logger: context.logger,
    eventBus: context.eventBus,
  };
}
