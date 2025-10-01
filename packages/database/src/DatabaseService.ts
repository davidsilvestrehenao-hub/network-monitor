import { PrismaClient } from "@prisma/client";
import type { IDatabaseService } from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class DatabaseService implements IDatabaseService {
  private client: PrismaClient;
  private connected = false;
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
    this.client = new PrismaClient({
      log: [
        { level: "error", emit: "stdout" },
        { level: "info", emit: "stdout" },
        { level: "warn", emit: "stdout" },
      ],
    });
  }

  getClient(): PrismaClient {
    return this.client;
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      await this.client.$connect();
      this.connected = true;
      this.logger.info("Database connected successfully");
    } catch (error) {
      this.logger.error("Failed to connect to database", { error });
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await this.client.$disconnect();
      this.connected = false;
      this.logger.info("Database disconnected successfully");
    } catch (error) {
      this.logger.error("Failed to disconnect from database", { error });
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }
}
