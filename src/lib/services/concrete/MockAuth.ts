import type { IAuthService, AuthSession } from "../interfaces/IAuthService";
import type { ILogger } from "../interfaces/ILogger";
import type { User } from "../interfaces/IUserRepository";

export class MockAuth implements IAuthService {
  private currentSession: AuthSession | null = null;
  private mockUsers: Map<string, User> = new Map();

  constructor(private logger?: ILogger) {
    this.logger?.debug("MockAuth: Initialized");
    this.seedMockUsers();
  }

  private seedMockUsers(): void {
    // Create a default mock user
    const mockUser: User = {
      id: "mock-user-123",
      name: "Mock User",
      email: "mock@example.com",
      emailVerified: new Date(),
      image: null,
      monitoringTargets: [],
      pushSubscriptions: [],
      notifications: [],
    };

    if (mockUser.email) {
      this.mockUsers.set(mockUser.email, mockUser);
    }
    this.logger?.debug("MockAuth: Seeded mock users");
  }

  async getSession(): Promise<AuthSession | null> {
    this.logger?.debug("MockAuth: Getting session");
    return this.currentSession;
  }

  async signIn(email: string, _password: string): Promise<AuthSession | null> {
    this.logger?.debug("MockAuth: Signing in", { email });

    const user = this.mockUsers.get(email);
    if (!user) {
      this.logger?.warn("MockAuth: User not found", { email });
      return null;
    }

    // Mock authentication - always succeeds
    const session: AuthSession = {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    this.currentSession = session;
    this.logger?.info("MockAuth: User signed in successfully", {
      email,
      userId: user.id,
    });

    return session;
  }

  async signUp(
    email: string,
    password: string,
    name?: string
  ): Promise<AuthSession | null> {
    this.logger?.debug("MockAuth: Signing up", { email, name });

    // Check if user already exists
    if (this.mockUsers.has(email)) {
      this.logger?.warn("MockAuth: User already exists", { email });
      return null;
    }

    // Create new user
    const user: User = {
      id: `mock-user-${Date.now()}`,
      name: name || "Mock User",
      email,
      emailVerified: new Date(),
      image: null,
      monitoringTargets: [],
      pushSubscriptions: [],
      notifications: [],
    };

    this.mockUsers.set(email, user);

    // Auto-sign in after registration
    const session: AuthSession = {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    this.currentSession = session;
    this.logger?.info("MockAuth: User signed up and signed in successfully", {
      email,
      userId: user.id,
    });

    return session;
  }

  async signOut(): Promise<void> {
    this.logger?.debug("MockAuth: Signing out");
    this.currentSession = null;
    this.logger?.info("MockAuth: User signed out successfully");
  }

  async getCurrentUser(): Promise<User | null> {
    this.logger?.debug("MockAuth: Getting current user");
    return this.currentSession?.user || null;
  }

  async isAuthenticated(): Promise<boolean> {
    this.logger?.debug("MockAuth: Checking authentication status");

    if (!this.currentSession) {
      return false;
    }

    // Check if session is expired
    if (this.currentSession.expires < new Date()) {
      this.logger?.debug("MockAuth: Session expired");
      this.currentSession = null;
      return false;
    }

    return true;
  }

  // Mock-specific methods for testing
  getMockUsers(): Map<string, User> {
    return new Map(this.mockUsers);
  }

  addMockUser(user: User): void {
    if (user.email) {
      this.mockUsers.set(user.email, user);
    }
  }

  clearMockUsers(): void {
    this.mockUsers.clear();
    this.seedMockUsers(); // Re-seed with default user
  }

  setMockSession(session: AuthSession | null): void {
    this.currentSession = session;
  }

  getMockSession(): AuthSession | null {
    return this.currentSession;
  }
}
