import { type APIEvent } from "@solidjs/start/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "~/server/trpc/router";
import {
  initializeContainer,
  getAppContext,
} from "@network-monitor/infrastructure";

// Container initialization state
let containerInitialized = false;
let initializationPromise: Promise<void> | null = null;

// Lazy container initialization to avoid top-level await
async function ensureContainerInitialized(): Promise<void> {
  if (containerInitialized) {
    return;
  }

  if (initializationPromise) {
    await initializationPromise;
    return;
  }

  initializationPromise = initializeContainer().then(() => {
    containerInitialized = true;
    initializationPromise = null;
  });

  await initializationPromise;
}

const handler = (event: APIEvent) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: event.request,
    router: appRouter,
    createContext: async () => {
      // Ensure container is initialized before getting context
      await ensureContainerInitialized();
      const appContext = await getAppContext();
      return appContext;
    },
  });

export const GET = handler;
export const POST = handler;
