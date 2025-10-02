import type { IPrismaService, ILogger } from "@network-monitor/shared";
import { randomUUID } from "crypto";

// Internal Prisma-compatible types (with Date objects for internal storage)
interface PrismaUser {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaMonitoringTarget {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaSpeedTestResult {
  id: number;
  ping: number | null;
  download: number | null;
  upload: number | null;
  status: string;
  error: string | null;
  targetId: string;
  createdAt: Date;
}

interface PrismaAlertRule {
  id: number;
  name: string;
  metric: string;
  condition: string;
  threshold: number;
  enabled: boolean;
  targetId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaIncidentEvent {
  id: number;
  timestamp: Date;
  type: string;
  description: string;
  resolved: boolean;
  targetId: string;
  ruleId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaPushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaNotification {
  id: number;
  message: string;
  sentAt: Date;
  read: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PrismaSpeedTestUrl {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  provider: string;
  region: string | null;
  enabled: boolean;
  priority: number;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Internal Prisma-style operation arguments (not exposed)
interface PrismaFindManyArgs {
  where?: Record<string, unknown>;
  orderBy?: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[];
  take?: number;
  skip?: number;
  include?: Record<string, boolean | object>;
}

interface PrismaFindUniqueArgs {
  where: Record<string, unknown>;
  include?: Record<string, boolean | object>;
}

interface PrismaCreateArgs {
  data: Record<string, unknown>;
  include?: Record<string, boolean | object>;
}

interface PrismaUpdateArgs {
  where: Record<string, unknown>;
  data: Record<string, unknown>;
  include?: Record<string, boolean | object>;
}

interface PrismaDeleteArgs {
  where: Record<string, unknown>;
}

interface PrismaUpsertArgs {
  where: Record<string, unknown>;
  create: Record<string, unknown>;
  update: Record<string, unknown>;
  include?: Record<string, boolean | object>;
}

// Internal table operations (Prisma-style, not exposed)
interface TableOperations<T> {
  findUnique(args: PrismaFindUniqueArgs): Promise<T | null>;
  findMany(args?: PrismaFindManyArgs): Promise<T[]>;
  findFirst(args?: PrismaFindManyArgs): Promise<T | null>;
  create(args: PrismaCreateArgs): Promise<T>;
  createMany(args: {
    data: Record<string, unknown>[];
  }): Promise<{ count: number }>;
  update(args: PrismaUpdateArgs): Promise<T>;
  updateMany(args: {
    where?: Record<string, unknown>;
    data: Record<string, unknown>;
  }): Promise<{ count: number }>;
  delete(args: PrismaDeleteArgs): Promise<T>;
  deleteMany(args?: {
    where?: Record<string, unknown>;
  }): Promise<{ count: number }>;
  count(args?: { where?: Record<string, unknown> }): Promise<number>;
  upsert?(args: PrismaUpsertArgs): Promise<T>;
}

// Mock Prisma client interface that matches the real Prisma client
export interface MockPrismaClient {
  $connect(): Promise<void>;
  $disconnect(): Promise<void>;
  $transaction<T>(fn: (client: MockPrismaClient) => Promise<T>): Promise<T>;

  user: TableOperations<PrismaUser>;
  monitoringTarget: TableOperations<PrismaMonitoringTarget>;
  speedTestResult: TableOperations<PrismaSpeedTestResult>;
  alertRule: TableOperations<PrismaAlertRule>;
  incidentEvent: TableOperations<PrismaIncidentEvent>;
  pushSubscription: TableOperations<PrismaPushSubscription>;
  notification: TableOperations<PrismaNotification>;
  speedTestUrl: TableOperations<PrismaSpeedTestUrl>;
}

export class MockPrisma implements IPrismaService {
  private connected = false;
  private logger?: ILogger;

  // In-memory data storage
  private data = {
    users: [] as PrismaUser[],
    monitoringTargets: [] as PrismaMonitoringTarget[],
    speedTestResults: [] as PrismaSpeedTestResult[],
    alertRules: [] as PrismaAlertRule[],
    incidentEvents: [] as PrismaIncidentEvent[],
    pushSubscriptions: [] as PrismaPushSubscription[],
    notifications: [] as PrismaNotification[],
    speedTestUrls: [] as PrismaSpeedTestUrl[],
  };

  // Auto-increment counters for integer IDs
  private counters = {
    speedTestResult: 1,
    alertRule: 1,
    incidentEvent: 1,
    notification: 1,
  };

  constructor(logger?: ILogger) {
    this.logger = logger;
    this.seedInitialData();
  }

  private seedInitialData(): void {
    // Seed with some initial test data
    const now = new Date();

    // Create test user
    const testUser: PrismaUser = {
      id: "user-1",
      name: "Test User",
      email: "test@example.com",
      emailVerified: now,
      image: null,
      createdAt: now,
      updatedAt: now,
    };
    this.data.users.push(testUser);

    // Create test monitoring target
    const testTarget: PrismaMonitoringTarget = {
      id: "target-1",
      name: "Google DNS",
      address: "https://8.8.8.8",
      ownerId: testUser.id,
      createdAt: now,
      updatedAt: now,
    };
    this.data.monitoringTargets.push(testTarget);

    // Create test speed test URLs
    const speedTestUrls: PrismaSpeedTestUrl[] = [
      {
        id: "url-1",
        name: "CacheFly 10MB",
        url: "http://cachefly.cachefly.net/10mb.test",
        sizeBytes: 10 * 1024 * 1024,
        provider: "CacheFly",
        region: "Global CDN",
        enabled: true,
        priority: 1,
        description: "Small test file for quick speed tests",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "url-2",
        name: "CacheFly 100MB",
        url: "http://cachefly.cachefly.net/100mb.test",
        sizeBytes: 100 * 1024 * 1024,
        provider: "CacheFly",
        region: "Global CDN",
        enabled: true,
        priority: 2,
        description: "Standard test file for accurate speed measurements",
        createdAt: now,
        updatedAt: now,
      },
    ];
    this.data.speedTestUrls.push(...speedTestUrls);

    this.logger?.debug("MockPrisma: Seeded initial test data");
  }

  // Justification: Mock service returns mock client which requires any type for Prisma compatibility
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getClient(): any {
    return this.createMockClient();
  }

  private createMockClient(): MockPrismaClient {
    return {
      $connect: async () => {
        this.connected = true;
      },
      $disconnect: async () => {
        this.connected = false;
      },
      $transaction: async <T>(
        fn: (client: MockPrismaClient) => Promise<T>
      ): Promise<T> => {
        // For simplicity, just execute the function with the same client
        // In a real implementation, you might want to implement transaction isolation
        return await fn(this.createMockClient());
      },

      user: this.createTableOperations<PrismaUser>("users", "id"),
      monitoringTarget: this.createTableOperations<PrismaMonitoringTarget>(
        "monitoringTargets",
        "id"
      ),
      speedTestResult: this.createTableOperations<PrismaSpeedTestResult>(
        "speedTestResults",
        "id",
        "speedTestResult"
      ),
      alertRule: this.createTableOperations<PrismaAlertRule>(
        "alertRules",
        "id",
        "alertRule"
      ),
      incidentEvent: this.createTableOperations<PrismaIncidentEvent>(
        "incidentEvents",
        "id",
        "incidentEvent"
      ),
      pushSubscription: this.createTableOperations<PrismaPushSubscription>(
        "pushSubscriptions",
        "id"
      ),
      notification: this.createTableOperations<PrismaNotification>(
        "notifications",
        "id",
        "notification"
      ),
      speedTestUrl: this.createTableOperations<PrismaSpeedTestUrl>(
        "speedTestUrls",
        "id"
      ),
    };
  }

  // Justification: Dynamic field access on generic type requires any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private createTableOperations<T extends Record<string, any>>(
    tableName: keyof typeof this.data,
    idField: keyof T,
    counterKey?: keyof typeof this.counters
  ): TableOperations<T> {
    // Justification: Type assertion needed for generic table access in mock database
    const table = this.data[tableName] as unknown as T[];

    return {
      findUnique: async (args: PrismaFindUniqueArgs): Promise<T | null> => {
        const item = table.find(item => this.matchesWhere(item, args.where));
        return item ? { ...item } : null;
      },

      findMany: async (args: PrismaFindManyArgs = {}): Promise<T[]> => {
        let results = table.filter(
          item => !args.where || this.matchesWhere(item, args.where)
        );

        // Apply ordering
        if (args.orderBy) {
          results = this.applyOrderBy(results, args.orderBy);
        }

        // Apply pagination
        if (args.skip) {
          results = results.slice(args.skip);
        }
        if (args.take) {
          results = results.slice(0, args.take);
        }

        return results.map(item => ({ ...item }));
      },

      findFirst: async (args: PrismaFindManyArgs = {}): Promise<T | null> => {
        const results = await this.createTableOperations<T>(
          tableName,
          idField,
          counterKey
        ).findMany({
          ...args,
          take: 1,
        });
        return results[0] || null;
      },

      create: async (args: PrismaCreateArgs): Promise<T> => {
        const now = new Date();
        // Justification: Type assertion needed for generic object creation in mock database
        const newItem = {
          ...args.data,
          createdAt: now,
          updatedAt: now,
        } as unknown as T;

        // Generate ID if not provided
        if (!newItem[idField]) {
          if (counterKey && typeof this.counters[counterKey] === "number") {
            // Justification: Type assertion needed for auto-increment ID assignment
            newItem[idField] = this.counters[counterKey]++ as T[keyof T];
          } else {
            // Justification: Type assertion needed for UUID assignment
            newItem[idField] = randomUUID() as T[keyof T];
          }
        }

        table.push(newItem);
        this.logger?.debug(
          `MockPrisma: Created ${tableName} with ID ${newItem[idField]}`
        );
        return { ...newItem };
      },

      createMany: async (args: {
        data: Record<string, unknown>[];
      }): Promise<{ count: number }> => {
        let count = 0;
        for (const data of args.data) {
          await this.createTableOperations<T>(
            tableName,
            idField,
            counterKey
          ).create({ data });
          count++;
        }
        return { count };
      },

      update: async (args: PrismaUpdateArgs): Promise<T> => {
        const index = table.findIndex(item =>
          this.matchesWhere(item, args.where)
        );
        if (index === -1) {
          throw new Error(`Record not found in ${tableName}`);
        }

        // Justification: Type assertion needed for generic object update in mock database
        const updatedItem = {
          ...table[index],
          ...args.data,
          updatedAt: new Date(),
        } as unknown as T;

        table[index] = updatedItem;
        this.logger?.debug(
          `MockPrisma: Updated ${tableName} with ID ${updatedItem[idField]}`
        );
        return { ...updatedItem };
      },

      updateMany: async (args: {
        where?: Record<string, unknown>;
        data: Record<string, unknown>;
      }): Promise<{ count: number }> => {
        let count = 0;
        for (let i = 0; i < table.length; i++) {
          if (!args.where || this.matchesWhere(table[i], args.where)) {
            // Justification: Type assertion needed for generic object update in mock database
            table[i] = {
              ...table[i],
              ...args.data,
              updatedAt: new Date(),
            } as unknown as T;
            count++;
          }
        }
        return { count };
      },

      delete: async (args: PrismaDeleteArgs): Promise<T> => {
        const index = table.findIndex(item =>
          this.matchesWhere(item, args.where)
        );
        if (index === -1) {
          throw new Error(`Record not found in ${tableName}`);
        }

        const deletedItem = table.splice(index, 1)[0];
        this.logger?.debug(
          `MockPrisma: Deleted ${tableName} with ID ${deletedItem[idField]}`
        );
        return { ...deletedItem };
      },

      deleteMany: async (
        args: { where?: Record<string, unknown> } = {}
      ): Promise<{ count: number }> => {
        const initialLength = table.length;
        if (args.where) {
          for (let i = table.length - 1; i >= 0; i--) {
            if (this.matchesWhere(table[i], args.where)) {
              table.splice(i, 1);
            }
          }
        } else {
          table.length = 0; // Clear all
        }
        const count = initialLength - table.length;
        return { count };
      },

      count: async (
        args: { where?: Record<string, unknown> } = {}
      ): Promise<number> => {
        if (!args.where) {
          return table.length;
        }
        return table.filter(item => this.matchesWhere(item, args.where!))
          .length;
      },

      upsert: async (args: PrismaUpsertArgs): Promise<T> => {
        const existing = table.find(item =>
          this.matchesWhere(item, args.where)
        );
        if (existing) {
          return await this.createTableOperations<T>(
            tableName,
            idField,
            counterKey
          ).update({
            where: args.where,
            data: args.update,
            include: args.include,
          });
        } else {
          return await this.createTableOperations<T>(
            tableName,
            idField,
            counterKey
          ).create({
            data: args.create,
            include: args.include,
          });
        }
      },
    };
  }
  // Justification: Dynamic field access on generic type requires any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private matchesWhere(
    item: Record<string, any>,
    where: Record<string, unknown>
  ): boolean {
    for (const [key, value] of Object.entries(where)) {
      if (item[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private applyOrderBy<T>(
    items: T[],
    orderBy: Record<string, "asc" | "desc"> | Record<string, "asc" | "desc">[]
  ): T[] {
    const orderClauses = Array.isArray(orderBy) ? orderBy : [orderBy];

    return items.sort((a, b) => {
      for (const clause of orderClauses) {
        for (const [field, direction] of Object.entries(clause)) {
          // Justification: Dynamic field access on generic type requires any
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const aVal = (a as any)[field];
          // Justification: Dynamic field access on generic type requires any
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const bVal = (b as any)[field];

          if (aVal < bVal) return direction === "asc" ? -1 : 1;
          if (aVal > bVal) return direction === "asc" ? 1 : -1;
        }
      }
      return 0;
    });
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    this.connected = true;
    this.logger?.info("Mock database connected successfully");
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    this.connected = false;
    this.logger?.info("Mock database disconnected successfully");
  }

  isConnected(): boolean {
    return this.connected;
  }

  // Helper methods for testing
  clearAllData(): void {
    this.data.users.length = 0;
    this.data.monitoringTargets.length = 0;
    this.data.speedTestResults.length = 0;
    this.data.alertRules.length = 0;
    this.data.incidentEvents.length = 0;
    this.data.pushSubscriptions.length = 0;
    this.data.notifications.length = 0;
    this.data.speedTestUrls.length = 0;

    // Reset counters
    this.counters.speedTestResult = 1;
    this.counters.alertRule = 1;
    this.counters.incidentEvent = 1;
    this.counters.notification = 1;

    this.logger?.debug("MockPrisma: Cleared all data");
  }

  reseedData(): void {
    this.clearAllData();
    this.seedInitialData();
  }

  getData() {
    return {
      users: [...this.data.users],
      monitoringTargets: [...this.data.monitoringTargets],
      speedTestResults: [...this.data.speedTestResults],
      alertRules: [...this.data.alertRules],
      incidentEvents: [...this.data.incidentEvents],
      pushSubscriptions: [...this.data.pushSubscriptions],
      notifications: [...this.data.notifications],
      speedTestUrls: [...this.data.speedTestUrls],
    };
  }
}
