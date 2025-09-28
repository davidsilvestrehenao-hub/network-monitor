import { IDatabaseService } from "../interfaces/IDatabaseService";
import { ILogger } from "../interfaces/ILogger";
import { MockPrismaClient } from "~/lib/types/mock-types";
import { PrismaClient } from "@prisma/client";

export class MockDatabase implements IDatabaseService {
  private connected = false;
  private mockClient: MockPrismaClient = {} as MockPrismaClient;

  constructor(private logger?: ILogger) {
    this.logger?.debug("MockDatabase: Initialized");
  }

  async connect(): Promise<void> {
    this.logger?.debug("MockDatabase: Connecting");
    this.connected = true;
  }

  async disconnect(): Promise<void> {
    this.logger?.debug("MockDatabase: Disconnecting");
    this.connected = false;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getClient(): PrismaClient {
    if (!this.connected) {
      throw new Error("Database not connected");
    }
    return this.mockClient as unknown as PrismaClient;
  }

  // Mock-specific methods for testing
  setMockClient(client: MockPrismaClient): void {
    this.mockClient = client;
  }

  getMockClient(): MockPrismaClient {
    return this.mockClient;
  }

  reset(): void {
    this.connected = false;
    this.mockClient = {} as MockPrismaClient;
  }
}
