import { z } from "zod";
import { t } from "../trpc";
import { UUIDSchema } from "@network-monitor/shared";

export const alertRulesRouter = t.router({
  getAll: t.procedure.query(({ ctx }) => {
    return ctx.repositories.alertRule?.getAll();
  }),

  getByTargetId: t.procedure
    .input(z.object({ targetId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.repositories.alertRule?.findByTargetId(input.targetId);
    }),

  getById: t.procedure
    .input(z.object({ id: UUIDSchema }))
    .query(({ ctx, input }) => {
      return ctx.repositories.alertRule?.findById(input.id);
    }),

  create: t.procedure
    .input(
      z.object({
        name: z.string().min(1),
        targetId: z.string(),
        metric: z.enum(["ping", "download"]),
        condition: z.enum(["GREATER_THAN", "LESS_THAN"]),
        threshold: z.number().positive(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.repositories.alertRule?.create(input);
    }),

  update: t.procedure
    .input(
      z.object({
        id: UUIDSchema,
        name: z.string().min(1).optional(),
        metric: z.enum(["ping", "download"]).optional(),
        condition: z.enum(["GREATER_THAN", "LESS_THAN"]).optional(),
        threshold: z.number().positive().optional(),
        enabled: z.boolean().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      const { id, ...data } = input;
      return ctx.repositories.alertRule?.update(id, data);
    }),

  delete: t.procedure
    .input(z.object({ id: UUIDSchema }))
    .mutation(({ ctx, input }) => {
      return ctx.repositories.alertRule?.delete(input.id);
    }),

  toggleEnabled: t.procedure
    .input(
      z.object({
        id: UUIDSchema,
        enabled: z.boolean(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.repositories.alertRule?.toggleEnabled(input.id, input.enabled);
    }),
});
