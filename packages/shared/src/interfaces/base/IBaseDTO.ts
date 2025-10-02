/**
 * Base DTO interfaces for standardized Create, Update, and Query operations
 * Provides consistent patterns across all domain entities
 */

import type { EntityStatus } from "./IBaseEntity";

// Base create DTO - excludes auto-generated fields
export interface IBaseCreateDTO {
  /** Optional description for the entity */
  description?: string | null;
  /** Optional tags for categorization */
  tags?: string[];
  /** Optional metadata */
  metadata?: Record<string, unknown>;
  /** User creating the entity (set by system, not user input) */
  createdBy?: string;
}

// Base update DTO - all fields optional except ID
export interface IBaseUpdateDTO {
  /** Optional description update */
  description?: string | null;
  /** Optional tags update */
  tags?: string[];
  /** Optional metadata update */
  metadata?: Record<string, unknown>;
  /** User updating the entity (set by system, not user input) */
  updatedBy?: string;
  /** Version for optimistic locking */
  version?: number;
}

// User-owned create DTO
export interface IUserOwnedCreateDTO extends IBaseCreateDTO {
  /** ID of the user who will own this entity */
  ownerId: string;
}

// Status-aware create DTO
export interface IStatusCreateDTO extends IBaseCreateDTO {
  /** Initial status (defaults to ACTIVE if not provided) */
  status?: EntityStatus;
}

// Status-aware update DTO
export interface IStatusUpdateDTO extends IBaseUpdateDTO {
  /** Status update */
  status?: EntityStatus;
}

// Soft delete DTO
export interface ISoftDeleteDTO {
  /** User performing the soft delete */
  deletedBy?: string;
  /** Reason for deletion */
  deleteReason?: string;
}

// Restore from soft delete DTO
export interface IRestoreDTO {
  /** User performing the restore */
  restoredBy?: string;
  /** Reason for restoration */
  restoreReason?: string;
}

// Query/Filter DTOs
export interface IBaseQueryDTO {
  /** Filter by ID(s) - UUID format */
  id?: string | string[];
  /** Filter by creation date range */
  createdAfter?: Date;
  createdBefore?: Date;
  /** Filter by update date range */
  updatedAfter?: Date;
  updatedBefore?: Date;
  /** Filter by creator */
  createdBy?: string;
  /** Filter by last updater */
  updatedBy?: string;
  /** Include soft-deleted entities */
  includeDeleted?: boolean;
  /** Filter by tags */
  tags?: string[];
  /** Filter by status */
  status?: EntityStatus | EntityStatus[];
  /** Search in description */
  descriptionContains?: string;
  /** Pagination - Default: 100, Hard Max: 1000 */
  limit?: number;
  offset?: number;
  /** Sorting */
  orderBy?: string;
  sortDirection?: "asc" | "desc";
}

// User-owned query DTO
export interface IUserOwnedQueryDTO extends IBaseQueryDTO {
  /** Filter by owner ID */
  ownerId?: string | string[];
}

// Bulk operation DTOs
export interface IBulkCreateDTO<T extends IBaseCreateDTO> {
  /** Array of entities to create */
  entities: T[];
  /** Batch size for processing */
  batchSize?: number;
  /** Continue on error or fail fast */
  continueOnError?: boolean;
}

export interface IBulkUpdateDTO<T extends IBaseUpdateDTO> {
  /** Array of updates with IDs - UUID format */
  updates: Array<{ id: string } & T>;
  /** Batch size for processing */
  batchSize?: number;
  /** Continue on error or fail fast */
  continueOnError?: boolean;
}

export interface IBulkDeleteDTO {
  /** Array of IDs to delete */
  ids: (string | number)[];
  /** Whether to soft delete or hard delete */
  soft?: boolean;
  /** User performing the deletion */
  deletedBy?: string;
  /** Reason for bulk deletion */
  deleteReason?: string;
}

// Response DTOs
export interface ICreateResponseDTO<T> {
  /** Created entity */
  entity: T;
  /** Success indicator */
  success: boolean;
  /** Any warnings during creation */
  warnings?: string[];
}

export interface IUpdateResponseDTO<T> {
  /** Updated entity */
  entity: T;
  /** Success indicator */
  success: boolean;
  /** Any warnings during update */
  warnings?: string[];
  /** Whether the entity was actually modified */
  modified: boolean;
}

export interface IBulkResponseDTO<T> {
  /** Successfully processed entities */
  successful: T[];
  /** Failed operations with errors */
  failed: Array<{
    input: unknown;
    error: string;
  }>;
  /** Total processed count */
  totalProcessed: number;
  /** Success count */
  successCount: number;
  /** Failure count */
  failureCount: number;
}

// Pagination response DTO
export interface IPaginatedResponseDTO<T> {
  /** Array of entities */
  data: T[];
  /** Total count (without pagination) */
  total: number;
  /** Current page number (1-based) */
  page: number;
  /** Items per page */
  limit: number;
  /** Total pages */
  totalPages: number;
  /** Whether there's a next page */
  hasNext: boolean;
  /** Whether there's a previous page */
  hasPrev: boolean;
}
