/**
 * Base entity interface that all domain entities should extend
 * Provides standard properties for identification, auditing, and metadata
 */

// Standard audit fields for tracking entity lifecycle
export interface AuditFields {
  /** When the entity was created */
  createdAt: Date;
  /** When the entity was last updated */
  updatedAt: Date;
  /** User ID who created the entity */
  createdBy?: string | null;
  /** User ID who last updated the entity */
  updatedBy?: string | null;
}

// Soft delete fields (separate from base audit fields)
export interface SoftDeleteFields {
  /** When the entity was soft deleted (null if not deleted) */
  deletedAt: Date | null;
  /** Whether the entity is currently active (not soft deleted) */
  isActive: boolean;
}

// Metadata fields for additional entity information
export interface MetadataFields {
  /** Additional metadata as key-value pairs */
  metadata?: Record<string, unknown>;
  /** Entity description or notes */
  description?: string | null;
}

// Base entity interface with required fields
export interface IBaseEntity extends AuditFields {
  /** Unique identifier (UUID format) */
  id: string;
}

// Extended base entity with optional metadata
export interface IExtendedEntity extends IBaseEntity, MetadataFields {}

// User-owned entity interface
export interface IUserOwnedEntity extends IBaseEntity {
  /** ID of the user who owns this entity */
  ownerId: string;
}

// Soft-deletable entity interface
export interface ISoftDeletableEntity extends IBaseEntity, SoftDeleteFields {}

// Versioned entity interface for optimistic locking
export interface IVersionedEntity extends IBaseEntity {
  /** Version number for optimistic locking (required) */
  version: number;
}

// Taggable entity interface
export interface ITaggableEntity extends IBaseEntity {
  /** Tags for categorization and filtering (required) */
  tags: string[];
}

// Full-featured entity with all standard properties
export interface IFullEntity
  extends IBaseEntity,
    MetadataFields,
    SoftDeleteFields {
  /** User who owns this entity (for user-owned entities) */
  ownerId?: string;
  /** Version number for optimistic locking */
  version: number;
  /** Tags for categorization and filtering */
  tags: string[];
}

// Entity status enumeration
export enum EntityStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  ARCHIVED = "ARCHIVED",
  DELETED = "DELETED",
}

// Entity with status tracking
export interface IStatusEntity extends IBaseEntity {
  /** Current status of the entity */
  status: EntityStatus;
}
