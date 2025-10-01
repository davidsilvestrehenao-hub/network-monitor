import { type APIEvent } from "@solidjs/start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/trpc/router";
import {
  initializeContainer,
  getAppContext,
} from "@network-monitor/infrastructure";

// Initialize the DI container when the server starts.
// This will read service-config.json and set up all services.
await initializeContainer();

const handler = (event: APIEvent) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: event.request,
    router: appRouter,
    createContext: async () => {
      // getAppContext resolves all services from the container.
      const appContext = await getAppContext();
      return appContext;
    },
  });

export const GET = handler;
export const POST = handler;
