import { z } from "zod";
import { t } from "../trpc";

export const speedTestsRouter = t.router({
  getByTargetId: t.procedure
    .input(
      z.object({
        targetId: z.string(),
        limit: z.number().optional(),
      })
    )
    .query(({ ctx, input }) => {
      return ctx.repositories.speedTestResult?.findByTargetId(
        input.targetId,
        input.limit
      );
    }),

  getLatest: t.procedure
    .input(z.object({ targetId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.repositories.speedTestResult?.findLatestByTargetId(
        input.targetId
      );
    }),

  runTest: t.procedure
    .input(
      z.object({
        targetId: z.string(),
        target: z.string().url(),
        timeout: z.number().optional(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.services.monitor?.runSpeedTest(input);
    }),
});
