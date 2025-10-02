import type { PrismaClient } from "@prisma/client";

export interface IPrisma {
  getClient(): PrismaClient;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
}

// Legacy aliases for backward compatibility
export interface IPrismaService extends IPrisma {}
export interface IDatabaseService extends IPrisma {}
