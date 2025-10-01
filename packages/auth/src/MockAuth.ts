import type { IAuthService, AuthSession } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";
import type { User } from "@network-monitor/shared";

export class MockAuth implements IAuthService {
  private currentSession: AuthSession | null = null;
  private mockUsers: Map<string, User> = new Map();
  private logger?: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger;
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

  // Base IService interface methods
  async getById(id: string | number): Promise<User | null> {
    this.logger?.debug("MockAuth: Getting user by ID", { id });
    const userId = typeof id === "string" ? id : id.toString();

    for (const user of this.mockUsers.values()) {
      if (user.id === userId) {
        return user;
      }
    }

    return null;
  }

  async getAll(limit?: number, offset?: number): Promise<User[]> {
    this.logger?.debug("MockAuth: Getting all users", { limit, offset });

    const users = Array.from(this.mockUsers.values());
    const start = offset || 0;
    const end = limit ? start + limit : users.length;
    return users.slice(start, end);
  }

  async create(data: {
    name?: string;
    email: string;
    password?: string;
  }): Promise<User> {
    this.logger?.debug("MockAuth: Creating user", { data });

    const user: User = {
      id: `mock-user-${Date.now()}`,
      name: data.name || "Mock User",
      email: data.email,
      emailVerified: new Date(),
      image: null,
      monitoringTargets: [],
      pushSubscriptions: [],
      notifications: [],
    };

    this.mockUsers.set(data.email, user);
    return user;
  }

  async update(
    id: string | number,
    data: { name?: string; email?: string }
  ): Promise<User> {
    this.logger?.debug("MockAuth: Updating user", { id, data });

    const userId = typeof id === "string" ? id : id.toString();
    const user = await this.getById(id);

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const updatedUser: User = {
      ...user,
      name: data.name || user.name,
      email: data.email || user.email,
    };

    if (data.email && data.email !== user.email) {
      this.mockUsers.delete(user.email || "");
      this.mockUsers.set(data.email, updatedUser);
    } else {
      this.mockUsers.set(user.email || "", updatedUser);
    }

    return updatedUser;
  }

  async delete(id: string | number): Promise<void> {
    this.logger?.debug("MockAuth: Deleting user", { id });

    const userId = typeof id === "string" ? id : id.toString();
    const user = await this.getById(id);

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    if (user.email) {
      this.mockUsers.delete(user.email);
    }
  }
}
