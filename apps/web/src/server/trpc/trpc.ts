import { initTRPC } from "@trpc/server";
import type { AppContext } from "@network-monitor/infrastructure";

// Initialize tRPC with the AppContext type
export const t = initTRPC.context<AppContext>().create();

// Helper to get userId from context (TODO: Replace with real auth)
export const getUserId = () => "clerk-user-id-placeholder";
