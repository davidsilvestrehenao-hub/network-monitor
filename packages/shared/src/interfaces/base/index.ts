/**
 * Base interfaces and types for standardized domain modeling
 * Export all base interfaces for consistent usage across the application
 */

// Base entity interfaces
export type {
  AuditFields,
  SoftDeleteFields,
  MetadataFields,
  IBaseEntity,
  IExtendedEntity,
  IUserOwnedEntity,
  ISoftDeletableEntity,
  IVersionedEntity,
  ITaggableEntity,
  IFullEntity,
  IStatusEntity,
} from "./IBaseEntity";

export { EntityStatus } from "./IBaseEntity";

// Base DTO interfaces
export type {
  IBaseCreateDTO,
  IBaseUpdateDTO,
  IUserOwnedCreateDTO,
  IStatusCreateDTO,
  IStatusUpdateDTO,
  ISoftDeleteDTO,
  IRestoreDTO,
  IBaseQueryDTO,
  IUserOwnedQueryDTO,
  IBulkCreateDTO,
  IBulkUpdateDTO,
  IBulkDeleteDTO,
  ICreateResponseDTO,
  IUpdateResponseDTO,
  IBulkResponseDTO,
  IPaginatedResponseDTO,
} from "./IBaseDTO";

// Unified Repository System - Single solution for all repository patterns
export type {
  // Core repository interface - THE standard for all repositories
  IRepository,

  // Specialized repository interfaces
  ISoftDeletableRepository,
  IUserOwnedRepository,
  IUserOwnedSoftDeletableRepository,
  IQueryableRepository,
  ICachedRepository,
  ISearchableRepository,
  IAuditableRepository,

  // Query builder and options - Strong typing for flexible queries
  QueryBuilder,
  QueryOptions,
  WhereClause,
  WhereOperator,
  OrderByClause,
  IncludeClause,
  SelectClause,
  QueryResult,
  PaginationOptions,
  SortOptions,

  // Legacy query options (temporary - for migration only)
  WhereOptions,
  OrderByOptions,
  FindManyOptions,
  FindUniqueOptions,

  // Search system
  SearchOptions,
  SearchResult,
  SearchStats,
  FacetResult,

  // Cache system
  CacheStats,

  // Audit system
  AuditEntry,

  // Factory and configuration
  IRepositoryFactory,
  IRepositoryConfig,
  CacheConfig,
  SearchConfig,

  // Configuration constants
  DEFAULT_REPOSITORY_CONFIG,
  PAGINATION_LIMITS,
  PaginationHelpers,

  // Type helpers
  FieldSelector,
  RelationOptions,
  AdvancedQueryOptions,
} from "./IRepository";

// Simple repository interfaces (practical, lightweight alternatives)
export type {
  ISimpleRepository,
  IUserOwnedSimpleRepository,
} from "./ISimpleRepository";

// Service interfaces
export type {
  IService,
  IUserOwnedService,
  IObservableService,
  IBackgroundService,
} from "./IService";

// Other base interfaces
export type { ILogger } from "./ILogger";
export type { IEventBus } from "./IEventBus";
export type { IAPIClient } from "./IAPIClient";
