import { z } from "zod";
import { t } from "../trpc";
import { UUIDSchema } from "@network-monitor/shared";

export const incidentsRouter = t.router({
  getAll: t.procedure.query(({ ctx }) => {
    return ctx.repositories.incidentEvent?.getAll();
  }),

  getByTargetId: t.procedure
    .input(
      z.object({
        targetId: z.string(),
        limit: z.number().optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.repositories.incidentEvent?.findByTargetId(
        input.targetId,
        input.limit
      );
    }),

  getUnresolved: t.procedure.query(({ ctx }) => {
    return ctx.repositories.incidentEvent?.findUnresolved();
  }),

  getUnresolvedByTargetId: t.procedure
    .input(z.object({ targetId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.repositories.incidentEvent?.getUnresolvedByTargetId(
        input.targetId
      );
    }),

  resolve: t.procedure
    .input(z.object({ id: UUIDSchema }))
    .mutation(({ ctx, input }) => {
      return ctx.repositories.incidentEvent?.resolve(input.id);
    }),

  resolveByTargetId: t.procedure
    .input(z.object({ targetId: z.string() }))
    .mutation(({ ctx, input }) => {
      return ctx.repositories.incidentEvent?.resolveByTargetId(input.targetId);
    }),
});
