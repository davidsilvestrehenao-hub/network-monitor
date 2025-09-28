// tRPC router - placeholder file
// This project uses PRPC instead of tRPC, but this file is needed for compatibility

import { targetsRouter } from "./routers/targets";

export const appRouter = {
  targets: targetsRouter,
};

export type AppRouter = typeof appRouter;
