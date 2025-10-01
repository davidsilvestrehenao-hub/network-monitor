import { z } from "zod";
import { t } from "../trpc";

// Helper to get userId from context (TODO: Replace with real auth)
const getUserId = () => "clerk-user-id-placeholder";

export const notificationsRouter = t.router({
  getByUserId: t.procedure
    .input(
      z.object({
        userId: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(({ ctx, input }) => {
      const userId = input.userId || getUserId();
      return ctx.repositories.notification?.findByUserId(userId, input.limit);
    }),

  getUnread: t.procedure.query(({ ctx }) => {
    const userId = getUserId();
    return ctx.repositories.notification?.getUnreadByUserId(userId);
  }),

  markAsRead: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.repositories.notification?.markAsRead(input.id);
    }),

  markAllAsRead: t.procedure.mutation(({ ctx }) => {
    const userId = getUserId();
    return ctx.repositories.notification?.markAllAsReadByUserId(userId);
  }),

  delete: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.repositories.notification?.delete(input.id);
    }),
});
