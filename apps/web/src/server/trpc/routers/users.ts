import { z } from "zod";
import { t } from "../trpc";

// Helper to get userId from context (TODO: Replace with real auth)
const getUserId = () => "clerk-user-id-placeholder";

export const usersRouter = t.router({
  getCurrent: t.procedure.query(({ ctx }) => {
    const userId = getUserId();
    return ctx.repositories.user?.findById(userId);
  }),

  getById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.repositories.user?.findById(input.id);
    }),

  update: t.procedure
    .input(
      z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        image: z.string().url().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const userId = getUserId();
      return ctx.repositories.user?.update(userId, input);
    }),
});
