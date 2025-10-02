import type {
  IAuthService,
  AuthSession,
  IEventBus,
} from "@network-monitor/shared";
import type {
  User,
  CreateUserData,
  UpdateUserData,
} from "@network-monitor/shared";

export class MockAuthService implements IAuthService {
  private users: User[] = [];
  private currentSession: AuthSession | null = null;
  private nextId = 1;
  private eventBus: IEventBus;

  constructor(eventBus: IEventBus) {
    this.eventBus = eventBus;
    this.seedData();
  }

  private seedData(): void {
    // Hardcoded test users
    const now = new Date().toISOString();
    this.users = [
      {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        emailVerified: new Date("2024-01-01").toISOString(),
        image: "https://example.com/avatar1.jpg",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
        emailVerified: new Date("2024-01-02").toISOString(),
        image: "https://example.com/avatar2.jpg",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "anonymous",
        name: "Anonymous User",
        email: undefined,
        emailVerified: undefined,
        image: undefined,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  // Base IService interface methods
  async getById(id: string | number): Promise<User | null> {
    const userId = typeof id === "string" ? id : id.toString();
    return this.users.find(u => u.id === userId) || null;
  }

  async getAll(limit?: number, offset?: number): Promise<User[]> {
    let result = [...this.users];
    if (offset) result = result.slice(offset);
    if (limit) result = result.slice(0, limit);
    return result;
  }

  async create(data: CreateUserData): Promise<User> {
    const user: User = {
      id: `user-${this.nextId++}`,
      name: data.name || undefined,
      email: data.email || undefined,
      emailVerified: data.emailVerified
        ? typeof data.emailVerified === "string"
          ? data.emailVerified
          : data.emailVerified.toISOString()
        : undefined,
      image: data.image || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(user);
    return user;
  }

  async update(id: string | number, data: UpdateUserData): Promise<User> {
    const userId = typeof id === "string" ? id : id.toString();
    const userIndex = this.users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      throw new Error(`User with id ${userId} not found`);
    }

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...data,
      emailVerified: data.emailVerified
        ? typeof data.emailVerified === "string"
          ? data.emailVerified
          : data.emailVerified.toISOString()
        : this.users[userIndex].emailVerified,
      updatedAt: new Date().toISOString(),
    };

    return this.users[userIndex];
  }

  async delete(id: string | number): Promise<void> {
    const userId = typeof id === "string" ? id : id.toString();
    const userIndex = this.users.findIndex(u => u.id === userId);

    if (userIndex !== -1) {
      this.users.splice(userIndex, 1);
    }
  }

  // IObservableService methods - delegate to event bus
  on<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.onDynamic(event, handler);
  }

  off<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.offDynamic(event, handler);
  }

  emit<T = unknown>(event: string, data?: T): void {
    this.eventBus.emitDynamic(event, data);
  }

  // IAuthService methods
  async getSession(): Promise<AuthSession | null> {
    return this.currentSession;
  }

  async signIn(email: string, _password: string): Promise<AuthSession | null> {
    const user = this.users.find(u => u.email === email);
    if (!user) {
      return null;
    }

    // Mock authentication - always succeeds for existing users
    this.currentSession = {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    return this.currentSession;
  }

  async signUp(
    email: string,
    _password: string,
    name?: string
  ): Promise<AuthSession | null> {
    // Check if user already exists
    if (this.users.find(u => u.email === email)) {
      return null; // User already exists
    }

    // Create new user
    const user = await this.create({
      email,
      name: name || undefined,
      emailVerified: new Date(),
    });

    // Create session
    this.currentSession = {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    return this.currentSession;
  }

  async signOut(): Promise<void> {
    this.currentSession = null;
  }

  async getCurrentUser(): Promise<User | null> {
    return this.currentSession?.user || null;
  }

  async isAuthenticated(): Promise<boolean> {
    return (
      this.currentSession !== null && this.currentSession.expires > new Date()
    );
  }
}
