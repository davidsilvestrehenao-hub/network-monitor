import type {
  IUserRepository,
  CreateUserData,
  UpdateUserData,
} from "@network-monitor/shared";
import { EntityStatus } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

// Import the standardized types that the repository interface expects
import type { User } from "@network-monitor/shared";

export class MockUserRepository implements IUserRepository {
  private users: User[] = [];
  private logger?: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger;
    this.seedUsers();
  }

  private seedUsers(): void {
    const now = new Date();
    this.users = [
      {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        emailVerified: new Date("2024-01-01"),
        image: "https://example.com/avatar1.jpg",
        createdAt: now,
        updatedAt: now,
        status: EntityStatus.ACTIVE,
        deletedAt: null,
        isActive: true,
        version: 1,
      },
      {
        id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
        emailVerified: new Date("2024-01-02"),
        image: "https://example.com/avatar2.jpg",
        createdAt: now,
        updatedAt: now,
        status: EntityStatus.ACTIVE,
        deletedAt: null,
        isActive: true,
        version: 1,
      },
      {
        id: "anonymous",
        name: "Anonymous User",
        email: undefined,
        emailVerified: undefined,
        image: undefined,
        createdAt: now,
        updatedAt: now,
        status: EntityStatus.ACTIVE,
        deletedAt: null,
        isActive: true,
        version: 1,
      },
    ];
  }

  async findById(id: string): Promise<User | null> {
    this.logger?.debug("MockUserRepository: Finding user by ID", { id });
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger?.debug("MockUserRepository: Finding user by email", { email });
    return this.users.find(user => user.email === email) || null;
  }

  async getAll(limit = 100, offset = 0): Promise<User[]> {
    this.logger?.debug("MockUserRepository: Getting all users", {
      limit,
      offset,
    });
    return this.users.slice(offset, offset + limit);
  }

  async count(): Promise<number> {
    this.logger?.debug("MockUserRepository: Counting users");
    return this.users.length;
  }

  async create(data: CreateUserData): Promise<User> {
    this.logger?.debug("MockUserRepository: Creating user", { data });

    const now = new Date();
    const user: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      emailVerified: data.emailVerified ?? null,
      image: data.image,
      createdAt: now,
      updatedAt: now,
      status: EntityStatus.ACTIVE,
      deletedAt: null,
      isActive: true,
      version: 1,
    };

    this.users.push(user);
    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    this.logger?.debug("MockUserRepository: Updating user", { id, data });

    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }

    const user = this.users[userIndex];
    const convertedData: UpdateUserData = {
      ...data,
      emailVerified:
        data.emailVerified === undefined ? undefined : data.emailVerified,
    };
    this.users[userIndex] = {
      ...user,
      ...convertedData,
      updatedAt: new Date(),
    };

    return this.users[userIndex];
  }

  async delete(id: string): Promise<void> {
    this.logger?.debug("MockUserRepository: Deleting user", { id });

    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) {
      throw new Error(`User with ID ${id} not found`);
    }

    this.users.splice(userIndex, 1);
  }

  // Helper method for testing
  setSeedData(users: User[]): void {
    this.users = users;
  }

  // Helper method to get all users for testing
  getAllUsers(): User[] {
    return [...this.users];
  }
}
