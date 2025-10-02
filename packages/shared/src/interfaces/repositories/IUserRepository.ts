// Import domain types
import type {
  User,
  UserSpeedTestPreference,
} from "../../types/standardized-domain-types";

// Re-export for backward compatibility
export type { User };

export interface CreateUserData {
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  emailVerified?: Date;
  image?: string;
}

export interface IUserSpeedTestPreferenceRepository {
  getByUserId(userId: string): Promise<UserSpeedTestPreference | null>;
  upsert(
    userId: string,
    speedTestUrlId: string
  ): Promise<UserSpeedTestPreference>;
}

// Repository interface
export interface IUserRepository
  extends ISimpleRepository<User, CreateUserData, UpdateUserData> {
  // Domain-specific query methods
  findByEmail(email: string): Promise<User | null>;
}

// Import base repository interface
import type { ISimpleRepository } from "../base/ISimpleRepository";
