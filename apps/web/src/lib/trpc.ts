import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "~/server/trpc/router";

// We can add loggerLink here for debugging if needed
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/api/trpc", // Use relative URL for portability
    }),
  ],
});
