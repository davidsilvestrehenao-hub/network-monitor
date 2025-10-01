import { getAppContext, type AppContext } from "~/lib/container/container";

/**
 * Extended context with authenticated user information
 */
export type AuthContext = AppContext & {
  userId: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    image?: string;
  };
};

/**
 * Get authenticated context with user information
 *
 * This replaces hardcoded "mock-user" strings throughout the codebase
 * and provides a centralized place to implement real authentication.
 *
 * @throws Error if no active session or user not authenticated
 */
export async function getAuthContext(): Promise<AuthContext> {
  const ctx = await getAppContext();

  if (!ctx.services.auth) {
    throw new Error("Auth service not available");
  }

  // Get current session
  const session = await ctx.services.auth.getSession();

  if (!session) {
    throw new Error("Unauthorized - no active session");
  }

  return {
    ...ctx,
    userId: session.user.id,
    user: {
      id: session.user.id,
      name: session.user.name ?? undefined,
      email: session.user.email ?? undefined,
      image: session.user.image ?? undefined,
    },
  };
}

/**
 * Get context with mock user for development/testing
 *
 * @deprecated Use getAuthContext() in production code
 */
export async function getMockAuthContext(): Promise<AuthContext> {
  const ctx = await getAppContext();

  return {
    ...ctx,
    userId: "mock-user",
    user: {
      id: "mock-user",
      name: "Mock User",
      email: "mock@example.com",
    },
  };
}

/**
 * Get context with optional authentication
 * Falls back to mock user if no session exists
 *
 * Use this during transition period or for endpoints that work with/without auth
 */
export async function getOptionalAuthContext(): Promise<AuthContext> {
  try {
    return await getAuthContext();
  } catch {
    return await getMockAuthContext();
  }
}
