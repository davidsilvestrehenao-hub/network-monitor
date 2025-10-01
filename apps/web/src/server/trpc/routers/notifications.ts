import { z } from "zod";
import { t } from "../trpc";

export const notificationsRouter = t.router({
  getByUserId: t.procedure
    .input(
      z.object({
        userId: z.string().optional(),
        limit: z.number().optional(),
      })
    )
    .query(({ ctx, input }) => {
      const userId = input.userId || ctx.userId || "clerk-user-id-placeholder";
      return ctx.repositories.notification?.findByUserId(userId, input.limit);
    }),

  getUnread: t.procedure.query(({ ctx }) => {
    const userId = ctx.userId || "clerk-user-id-placeholder";
    return ctx.repositories.notification?.getUnreadByUserId(userId);
  }),

  markAsRead: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.repositories.notification?.markAsRead(input.id);
    }),

  markAllAsRead: t.procedure.mutation(({ ctx }) => {
    const userId = ctx.userId || "clerk-user-id-placeholder";
    return ctx.repositories.notification?.markAllAsReadByUserId(userId);
  }),

  delete: t.procedure
    .input(z.object({ id: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.repositories.notification?.delete(input.id);
    }),
});
