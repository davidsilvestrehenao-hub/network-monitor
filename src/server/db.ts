import type { PrismaClient } from "@prisma/client";

/**
 * Get Prisma client from the DI container
 * This ensures we use a single Prisma instance across the application
 */
export async function getPrisma(): Promise<PrismaClient> {
  // Dynamic import to avoid circular dependencies
  const { getAppContext } = await import("~/lib/container/container");
  const ctx = await getAppContext();

  if (!ctx.services.database) {
    throw new Error("Database service not available in context");
  }

  return ctx.services.database.getClient();
}

/**
 * Legacy export for compatibility with Auth.js
 * @deprecated Use getPrisma() for new code
 */
let cachedPrisma: PrismaClient | null = null;

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!cachedPrisma) {
      throw new Error(
        "Prisma client not initialized. Use getPrisma() for async access or await initialization."
      );
    }
    return cachedPrisma[prop as keyof PrismaClient];
  },
});

// Initialize on first import (for Auth.js compatibility)
getPrisma()
  .then(client => {
    cachedPrisma = client;
  })
  .catch(err => {
    console.error("Failed to initialize Prisma client:", err);
  });
