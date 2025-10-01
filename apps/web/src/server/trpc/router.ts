import { z } from "zod";
import { t, getUserId } from "./trpc";
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

  // =================================================================
  // LEGACY COMPATIBILITY (deprecated, use nested routers above)
  // =================================================================
  getAllTargets: t.procedure.query(({ ctx }) => {
    const userId = getUserId();
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
      const ownerId = getUserId();
      return ctx.services.monitor?.createTarget({ ...input, ownerId });
    }),
});

export type AppRouter = typeof appRouter;
