import { z } from "zod";
import { t } from "./trpc";
import {
  targetsRouter,
  speedTestsRouter,
  alertRulesRouter,
  incidentsRouter,
  notificationsRouter,
  pushSubscriptionsRouter,
  usersRouter,
} from "./routers";

export const appRouter = t.router({
  // =================================================================
  // HEALTH CHECK
  // =================================================================
  hello: t.procedure
    .input(z.object({ name: z.string().optional() }).optional())
    .query(({ input }) => {
      const name = input?.name ?? "world";
      return `Hello, ${name}!`;
    }),

  // =================================================================
  // DOMAIN ROUTERS
  // =================================================================
  targets: targetsRouter,
  speedTests: speedTestsRouter,
  alertRules: alertRulesRouter,
  incidents: incidentsRouter,
  notifications: notificationsRouter,
  pushSubscriptions: pushSubscriptionsRouter,
  users: usersRouter,
  speedTestConfig: t.router({
    listUrls: t.procedure.query(({ ctx }) => {
      // Read from DI-configured SpeedTestConfigService
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const servicesAny: any = ctx.services;
      const configService = servicesAny?.speedTestConfigService;
      return configService?.getAllUrls?.() ?? [];
    }),
    getPreference: t.procedure.query(async ({ ctx }) => {
      const userId = ctx.userId || "clerk-user-id-placeholder";
      return (
        (await ctx.repositories.userSpeedTestPreference?.getByUserId(userId)) ||
        null
      );
    }),
    setPreference: t.procedure
      .input(
        z.object({
          speedTestUrlId: z.string().min(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const userId = ctx.userId || "clerk-user-id-placeholder";
        // Optionally validate against known URLs here (when config service is available)
        return await ctx.repositories.userSpeedTestPreference?.upsert(
          userId,
          input.speedTestUrlId
        );
      }),
  }),

  // =================================================================
  // LEGACY COMPATIBILITY (deprecated, use nested routers above)
  // =================================================================
  getAllTargets: t.procedure.query(({ ctx }) => {
    const userId = ctx.userId || "clerk-user-id-placeholder";
    return ctx.services.monitor?.getTargets(userId);
  }),

  createTarget: t.procedure
    .input(
      z.object({
        name: z.string(),
        address: z.string().url(),
      })
    )
    .mutation(({ ctx, input }) => {
      const ownerId = ctx.userId || "clerk-user-id-placeholder";
      return ctx.services.monitor?.createTarget({ ...input, ownerId });
    }),
});

export type AppRouter = typeof appRouter;
