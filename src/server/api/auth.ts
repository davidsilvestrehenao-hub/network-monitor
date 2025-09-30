import { getAppContext } from "~/lib/container/container";
import type {
  User,
  UpdateUserData,
} from "~/lib/services/interfaces/IUserRepository";
import type {
  LoginCredentials,
  RegisterData,
  AuthResult,
} from "~/lib/services/concrete/AuthService";

// Authentication endpoints
export async function login(
  credentials: LoginCredentials
): Promise<AuthResult> {
  const ctx = await getAppContext();
  if (!ctx.services.auth) {
    throw new Error("Auth service not available");
  }
  const session = await ctx.services.auth.signIn(
    credentials.email,
    credentials.password || ""
  );
  if (!session) {
    throw new Error("Login failed");
  }
  return {
    user: session.user,
    sessionToken: "mock-session-token", // TODO: Implement proper session token
    expiresAt: session.expires,
  };
}

export async function register(data: RegisterData): Promise<AuthResult> {
  const ctx = await getAppContext();
  if (!ctx.services.auth) {
    throw new Error("Auth service not available");
  }
  const session = await ctx.services.auth.signUp(
    data.email,
    data.password || "",
    data.name
  );
  if (!session) {
    throw new Error("Registration failed");
  }
  return {
    user: session.user,
    sessionToken: "mock-session-token", // TODO: Implement proper session token
    expiresAt: session.expires,
  };
}

export async function logout(_sessionToken: string): Promise<void> {
  const ctx = await getAppContext();
  if (!ctx.services.auth) {
    throw new Error("Auth service not available");
  }
  await ctx.services.auth.signOut();
}

export async function validateSession(
  _sessionToken: string
): Promise<User | null> {
  const ctx = await getAppContext();
  if (!ctx.services.auth) {
    throw new Error("Auth service not available");
  }
  return await ctx.services.auth.getCurrentUser();
}

export async function refreshSession(
  _sessionToken: string
): Promise<AuthResult | null> {
  const ctx = await getAppContext();
  if (!ctx.services.auth) {
    throw new Error("Auth service not available");
  }
  const user = await ctx.services.auth.getCurrentUser();
  if (!user) {
    return null;
  }
  return {
    user,
    sessionToken: "mock-refreshed-token",
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };
}

// User management endpoints
export async function updateProfile(
  _userId: string,
  _data: UpdateUserData
): Promise<User> {
  const ctx = await getAppContext();
  if (!ctx.services.auth) {
    throw new Error("Auth service not available");
  }
  // TODO: Implement profile update through user repository
  throw new Error("Profile update not implemented");
}

export async function deleteAccount(_userId: string): Promise<void> {
  const ctx = await getAppContext();
  if (!ctx.services.auth) {
    throw new Error("Auth service not available");
  }
  // TODO: Implement account deletion
  throw new Error("Account deletion not implemented");
}

export async function getActiveSessions(): Promise<
  Array<{ sessionToken: string; userId: string; expiresAt: Date }>
> {
  const ctx = await getAppContext();
  if (!ctx.services.auth) {
    throw new Error("Auth service not available");
  }
  // TODO: Implement active sessions tracking
  return [];
}
