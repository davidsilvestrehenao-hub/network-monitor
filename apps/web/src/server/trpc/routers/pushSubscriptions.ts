import { z } from "zod";
import { t } from "../trpc";

// Helper to get userId from context (TODO: Replace with real auth)
const getUserId = () => "clerk-user-id-placeholder";

export const pushSubscriptionsRouter = t.router({
  getByUserId: t.procedure.query(({ ctx }) => {
    const userId = getUserId();
    return ctx.repositories.pushSubscription?.findByUserId(userId);
  }),

  create: t.procedure
    .input(
      z.object({
        endpoint: z.string().url(),
        p256dh: z.string(),
        auth: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      const userId = getUserId();
      return ctx.repositories.pushSubscription?.create({
        ...input,
        userId,
      });
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.repositories.pushSubscription?.delete(input.id);
    }),

  deleteByEndpoint: t.procedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.repositories.pushSubscription?.deleteByEndpoint(
        input.endpoint
      );
    }),
});
