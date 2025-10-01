import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { t } from "../trpc";

export const targetsRouter = t.router({
  getAll: t.procedure.query(({ ctx }) => {
    const userId = ctx.userId || "clerk-user-id-placeholder";
    return ctx.services.monitor?.getTargets(userId);
  }),

  getById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const target = await ctx.services.monitor?.getTarget(input.id);
      if (!target) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Target with ID '${input.id}' not found`,
        });
      }
      return target;
    }),

  create: t.procedure
    .input(
      z.object({
        name: z.string().min(1),
        address: z.string().url(),
      })
    )
    .mutation(({ ctx, input }) => {
      const ownerId = ctx.userId || "clerk-user-id-placeholder";
      return ctx.services.monitor?.createTarget({ ...input, ownerId });
    }),

  update: t.procedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        address: z.string().url().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.services.monitor?.updateTarget(id, data);
    }),

  delete: t.procedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.services.monitor?.deleteTarget(input.id);
    }),

  // Monitoring operations
  startMonitoring: t.procedure
    .input(
      z.object({
        targetId: z.string(),
        intervalMs: z.number().min(1000).max(300000),
      })
    )
    .mutation(({ ctx, input }) => {
      ctx.services.monitor?.startMonitoring(input.targetId, input.intervalMs);
      return { success: true };
    }),

  stopMonitoring: t.procedure
    .input(z.object({ targetId: z.string() }))
    .mutation(({ ctx, input }) => {
      ctx.services.monitor?.stopMonitoring(input.targetId);
      return { success: true };
    }),

  getActiveTargets: t.procedure.query(({ ctx }) => {
    return ctx.services.monitor?.getActiveTargets() || [];
  }),
});
