/**
 * Unified Repository Interface System
 * Combines standardized patterns with advanced querying and strong typing
 * Provides comprehensive CRUD operations with audit trails, soft delete, and flexible querying
 */

import type {
  IBaseEntity,
  IUserOwnedEntity,
  ISoftDeletableEntity,
  EntityStatus,
} from "./IBaseEntity";
import type {
  IBaseCreateDTO,
  IBaseUpdateDTO,
  IUserOwnedCreateDTO,
  IBaseQueryDTO,
  IUserOwnedQueryDTO,
  ISoftDeleteDTO,
  IRestoreDTO,
  IBulkCreateDTO,
  IBulkUpdateDTO,
  IBulkDeleteDTO,
  IPaginatedResponseDTO,
} from "./IBaseDTO";

// ============================================================================
// QUERY BUILDER TYPES - Strong typing for flexible queries
// ============================================================================

// Legacy query options - kept for backward compatibility during migration
export interface WhereOptions {
  [key: string]: unknown;
}

export interface OrderByOptions {
  [key: string]: "asc" | "desc";
}

export interface FindManyOptions {
  where?: WhereOptions;
  orderBy?: OrderByOptions | OrderByOptions[];
  take?: number; // Default: 100, Hard Max: 1000
  skip?: number;
}

export interface FindUniqueOptions {
  where: WhereOptions;
}

// Advanced query builder types with strong typing
export interface QueryOptions<T> {
  where?: WhereClause<T>;
  orderBy?: OrderByClause<T>;
  limit?: number; // Default: 100, Hard Max: 1000
  offset?: number;
  include?: IncludeClause<T>;
  select?: SelectClause<T>;
}

export type WhereClause<T> = {
  [K in keyof T]?: T[K] | WhereOperator<T[K]>;
};

export interface WhereOperator<TValue> {
  equals?: TValue;
  not?: TValue;
  in?: TValue[];
  notIn?: TValue[];
  lt?: TValue extends number | Date ? TValue : never;
  lte?: TValue extends number | Date ? TValue : never;
  gt?: TValue extends number | Date ? TValue : never;
  gte?: TValue extends number | Date ? TValue : never;
  contains?: TValue extends string ? string : never;
  startsWith?: TValue extends string ? string : never;
  endsWith?: TValue extends string ? string : never;
  isNull?: boolean;
  isNotNull?: boolean;
}

export type OrderByClause<T> = {
  [K in keyof T]?: "asc" | "desc";
};

export type IncludeClause<T> = {
  [K in keyof T]?: boolean;
};

export type SelectClause<T> = {
  [K in keyof T]?: boolean;
};

// Query result types
export interface QueryResult<T> {
  data: T[];
  total: number;
  hasMore: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginationOptions {
  page: number;
  pageSize: number; // Can override default (100), but capped at max (1000)
}

export interface SortOptions<T> {
  field: keyof T;
  direction: "asc" | "desc";
}

// ============================================================================
// CORE REPOSITORY INTERFACE - Single Standardized Solution
// ============================================================================

// The ONE repository interface - combines all features into a single solution
export interface IRepository<
  TEntity extends IBaseEntity,
  TCreateDTO extends IBaseCreateDTO,
  TUpdateDTO extends IBaseUpdateDTO,
  TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
> {
  // ============================================================================
  // BASIC CRUD OPERATIONS
  // ============================================================================

  // Core CRUD operations (Prisma-aligned)
  findUnique(where: FindUniqueOptions): Promise<TEntity | null>;
  findFirst(options?: FindManyOptions): Promise<TEntity | null>;
  findMany(options?: FindManyOptions): Promise<TEntity[]>;
  create(data: TCreateDTO): Promise<TEntity>;
  update(where: FindUniqueOptions, data: TUpdateDTO): Promise<TEntity>;
  delete(where: FindUniqueOptions): Promise<TEntity>;
  count(where?: WhereOptions): Promise<number>;

  // ============================================================================
  // ENHANCED QUERYING (Beyond basic Prisma)
  // ============================================================================

  // Type-safe enhanced querying
  findManyTyped(options?: QueryOptions<TEntity>): Promise<QueryResult<TEntity>>;
  findFirstTyped(where: WhereClause<TEntity>): Promise<TEntity | null>;
  findUniqueTyped<K extends keyof TEntity>(
    field: K,
    value: TEntity[K]
  ): Promise<TEntity | null>;
  findWhere(where: WhereClause<TEntity>): Promise<TEntity[]>;
  exists(where: WhereClause<TEntity>): Promise<boolean>;
  countWhere(where?: WhereClause<TEntity>): Promise<number>;

  // Standardized query methods
  findByQuery(query: TQueryDTO): Promise<TEntity[]>;
  findPaginated(query: TQueryDTO): Promise<IPaginatedResponseDTO<TEntity>>;

  // ============================================================================
  // AUDIT TRAIL OPERATIONS
  // ============================================================================

  findByCreatedBy(
    createdBy: string,
    options?: QueryOptions<TEntity>
  ): Promise<TEntity[]>;
  findByUpdatedBy(
    updatedBy: string,
    options?: QueryOptions<TEntity>
  ): Promise<TEntity[]>;
  findByDateRange(
    startDate: Date,
    endDate: Date,
    dateField?: "createdAt" | "updatedAt",
    options?: QueryOptions<TEntity>
  ): Promise<TEntity[]>;

  // ============================================================================
  // PRISMA BULK OPERATIONS
  // ============================================================================

  // Prisma-aligned bulk operations
  createMany(data: {
    data: TCreateDTO[];
    skipDuplicates?: boolean;
  }): Promise<{ count: number }>;
  updateMany(where: WhereOptions, data: TUpdateDTO): Promise<{ count: number }>;
  deleteMany(where?: WhereOptions): Promise<{ count: number }>;

  // Enhanced bulk operations with standardized DTOs
  createBulk(dto: IBulkCreateDTO<TCreateDTO>): Promise<TEntity[]>;
  updateBulk(dto: IBulkUpdateDTO<TUpdateDTO>): Promise<TEntity[]>;
  deleteBulk(dto: IBulkDeleteDTO): Promise<void>;

  // ============================================================================
  // PRISMA AGGREGATION
  // ============================================================================

  aggregate(args: {
    where?: WhereOptions;
    _count?: boolean | { [K in keyof TEntity]?: boolean };
    _sum?: { [K in keyof TEntity]?: boolean };
    _avg?: { [K in keyof TEntity]?: boolean };
    _min?: { [K in keyof TEntity]?: boolean };
    _max?: { [K in keyof TEntity]?: boolean };
  }): Promise<{
    _count: number | { [K in keyof TEntity]?: number };
    _sum: { [K in keyof TEntity]?: number };
    _avg: { [K in keyof TEntity]?: number };
    _min: { [K in keyof TEntity]?: unknown };
    _max: { [K in keyof TEntity]?: unknown };
  }>;

  groupBy<K extends keyof TEntity>(args: {
    by: K[];
    where?: WhereOptions;
    having?: WhereOptions;
    _count?: boolean | { [Field in keyof TEntity]?: boolean };
    _sum?: { [Field in keyof TEntity]?: boolean };
    _avg?: { [Field in keyof TEntity]?: boolean };
    _min?: { [Field in keyof TEntity]?: boolean };
    _max?: { [Field in keyof TEntity]?: boolean };
    orderBy?: OrderByOptions | OrderByOptions[];
    take?: number;
    skip?: number;
  }): Promise<
    Array<
      {
        [Field in K]: TEntity[Field];
      } & {
        _count?: number | { [Field in keyof TEntity]?: number };
        _sum?: { [Field in keyof TEntity]?: number };
        _avg?: { [Field in keyof TEntity]?: number };
        _min?: { [Field in keyof TEntity]?: unknown };
        _max?: { [Field in keyof TEntity]?: unknown };
      }
    >
  >;

  // Enhanced pagination (beyond Prisma)
  paginate(
    options: PaginationOptions,
    where?: WhereClause<TEntity>
  ): Promise<QueryResult<TEntity>>;

  findSorted(
    sort: SortOptions<TEntity>[],
    where?: WhereClause<TEntity>
  ): Promise<TEntity[]>;

  // ============================================================================
  // ADVANCED QUERY OPERATIONS (from original IAdvancedRepository)
  // ============================================================================

  // Conditional operations with advanced typing
  findManyAdvanced(
    options?: AdvancedQueryOptions<TEntity>
  ): Promise<QueryResult<TEntity>>;
  findFirstAdvanced(where: WhereClause<TEntity>): Promise<TEntity | null>;
  findUniqueAdvanced<K extends keyof TEntity>(
    field: K,
    value: TEntity[K]
  ): Promise<TEntity | null>;

  // Batch operations with advanced options
  createManyAdvanced(data: TCreateDTO[]): Promise<TEntity[]>;
  updateManyAdvanced(
    where: WhereClause<TEntity>,
    data: Partial<TUpdateDTO>
  ): Promise<number>;
  deleteManyAdvanced(where: WhereClause<TEntity>): Promise<number>;

  // ============================================================================
  // UPSERT OPERATIONS (Prisma-aligned)
  // ============================================================================

  upsert(args: {
    where: FindUniqueOptions["where"];
    update: TUpdateDTO;
    create: TCreateDTO;
  }): Promise<TEntity>;

  // ============================================================================
  // METADATA OPERATIONS (Optional - for entities with metadata)
  // ============================================================================

  updateMetadata?(
    id: string,
    metadata: Record<string, unknown>
  ): Promise<TEntity>;
  findByMetadata?(key: string, value: unknown): Promise<TEntity[]>;

  // ============================================================================
  // TAG OPERATIONS (Optional - for taggable entities)
  // ============================================================================

  findByTags?(tags: string[]): Promise<TEntity[]>;
  addTags?(id: string, tags: string[]): Promise<TEntity>;
  removeTags?(id: string, tags: string[]): Promise<TEntity>;

  // ============================================================================
  // STATUS OPERATIONS (Optional - for entities with status)
  // ============================================================================

  findByStatus?(status: EntityStatus | EntityStatus[]): Promise<TEntity[]>;

  // ============================================================================
  // PAGINATION UTILITIES
  // ============================================================================

  // Pagination helper methods (implemented by base repository)
  validatePageSize(pageSize?: number): number; // Enforces: min=1, max=1000, default=100
  getMaxPageSize(): number; // Returns 1000 (hard limit)
  getDefaultPageSize(): number; // Returns 100 (default)
}

// Soft-deletable repository interface - extends the core repository
export interface ISoftDeletableRepository<
  TEntity extends IBaseEntity & ISoftDeletableEntity,
  TCreateDTO extends IBaseCreateDTO,
  TUpdateDTO extends IBaseUpdateDTO,
  TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
> extends IRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO> {
  // ============================================================================
  // SOFT DELETE OPERATIONS
  // ============================================================================

  softDelete(id: string, dto?: ISoftDeleteDTO): Promise<void>;
  restore(id: string, dto?: IRestoreDTO): Promise<TEntity>;

  // Soft delete queries
  findDeleted(options?: QueryOptions<TEntity>): Promise<TEntity[]>;
  findActive(options?: QueryOptions<TEntity>): Promise<TEntity[]>;
  findDeletedByDateRange(startDate: Date, endDate: Date): Promise<TEntity[]>;

  // Cleanup operations
  permanentlyDelete(id: string): Promise<void>;
  cleanupDeleted(olderThan: Date): Promise<number>;
}

// User-owned repository interface - extends the core repository
export interface IUserOwnedRepository<
  TEntity extends IBaseEntity & IUserOwnedEntity,
  TCreateDTO extends IUserOwnedCreateDTO,
  TUpdateDTO extends IBaseUpdateDTO,
  TQueryDTO extends IUserOwnedQueryDTO = IUserOwnedQueryDTO,
> extends IRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO> {
  // ============================================================================
  // USER-SPECIFIC OPERATIONS
  // ============================================================================

  findByUserId(
    userId: string,
    options?: QueryOptions<TEntity>
  ): Promise<TEntity[]>;
  findByUserIdPaginated(
    userId: string,
    query: TQueryDTO
  ): Promise<IPaginatedResponseDTO<TEntity>>;
  countByUserId(userId: string): Promise<number>;

  // User-specific advanced operations
  findManyByUserId(
    userId: string,
    options?: QueryOptions<TEntity>
  ): Promise<QueryResult<TEntity>>;
  findWhereByUserId(
    userId: string,
    where: WhereClause<TEntity>
  ): Promise<TEntity[]>;
  existsByUserId(userId: string, where: WhereClause<TEntity>): Promise<boolean>;
  countByUserIdWhere(
    userId: string,
    where?: WhereClause<TEntity>
  ): Promise<number>;

  // User-specific batch operations
  createManyForUser(userId: string, data: TCreateDTO[]): Promise<TEntity[]>;
  updateManyByUserId(
    userId: string,
    where: WhereClause<TEntity>,
    data: Partial<TUpdateDTO>
  ): Promise<number>;
  deleteManyByUserId(
    userId: string,
    where: WhereClause<TEntity>
  ): Promise<number>;

  // User-specific pagination
  paginateByUserId(
    userId: string,
    options: PaginationOptions,
    where?: WhereClause<TEntity>
  ): Promise<QueryResult<TEntity>>;

  // User data management
  deleteAllByUserId(userId: string): Promise<void>;
  transferOwnership(fromUserId: string, toUserId: string): Promise<number>;
}

// Combined interface for entities that are both user-owned and soft-deletable
export interface IUserOwnedSoftDeletableRepository<
  TEntity extends IBaseEntity & IUserOwnedEntity & ISoftDeletableEntity,
  TCreateDTO extends IUserOwnedCreateDTO,
  TUpdateDTO extends IBaseUpdateDTO,
  TQueryDTO extends IUserOwnedQueryDTO = IUserOwnedQueryDTO,
> extends ISoftDeletableRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO>,
    IUserOwnedRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO> {
  // ============================================================================
  // COMBINED USER + SOFT DELETE OPERATIONS
  // ============================================================================

  softDeleteAllByUserId(userId: string, dto?: ISoftDeleteDTO): Promise<void>;
  restoreAllByUserId(userId: string, dto?: IRestoreDTO): Promise<TEntity[]>;
  findActiveByUserId(
    userId: string,
    options?: QueryOptions<TEntity>
  ): Promise<TEntity[]>;
  findDeletedByUserId(
    userId: string,
    options?: QueryOptions<TEntity>
  ): Promise<TEntity[]>;
}

// ============================================================================
// SPECIALIZED REPOSITORY INTERFACES
// ============================================================================

// Query builder interface for fluent API
export interface QueryBuilder<T> {
  where(clause: WhereClause<T>): QueryBuilder<T>;
  orderBy(field: keyof T, direction: "asc" | "desc"): QueryBuilder<T>;
  limit(count: number): QueryBuilder<T>;
  offset(count: number): QueryBuilder<T>;
  include<K extends keyof T>(field: K): QueryBuilder<T>;
  select<K extends keyof T>(...fields: K[]): QueryBuilder<T>;

  // Execution methods
  findMany(): Promise<QueryResult<T>>;
  findFirst(): Promise<T | null>;
  count(): Promise<number>;
  exists(): Promise<boolean>;
}

// Repository with query builder - extends the core repository
export interface IQueryableRepository<
  TEntity extends IBaseEntity,
  TCreateDTO extends IBaseCreateDTO,
  TUpdateDTO extends IBaseUpdateDTO,
  TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
> extends IRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO> {
  query(): QueryBuilder<TEntity>;
}

// Repository with caching - extends the core repository
export interface ICachedRepository<
  TEntity extends IBaseEntity,
  TCreateDTO extends IBaseCreateDTO,
  TUpdateDTO extends IBaseUpdateDTO,
  TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
> extends IRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO> {
  // ============================================================================
  // CACHED OPERATIONS
  // ============================================================================

  findByIdCached(id: string, ttl?: number): Promise<TEntity | null>;
  findManyCached(
    options: QueryOptions<TEntity>,
    ttl?: number
  ): Promise<QueryResult<TEntity>>;

  // Cache management
  invalidateCache(pattern?: string): Promise<void>;
  clearCache(): Promise<void>;
  getCacheStats(): Promise<CacheStats>;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  memoryUsage: number;
}

// Repository with full-text search - extends the core repository
export interface ISearchableRepository<
  TEntity extends IBaseEntity,
  TCreateDTO extends IBaseCreateDTO,
  TUpdateDTO extends IBaseUpdateDTO,
  TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
> extends IRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO> {
  // ============================================================================
  // SEARCH OPERATIONS
  // ============================================================================

  search(
    query: string,
    options?: SearchOptions<TEntity>
  ): Promise<SearchResult<TEntity>>;
  searchByField<K extends keyof TEntity>(
    field: K,
    query: string,
    options?: SearchOptions<TEntity>
  ): Promise<SearchResult<TEntity>>;

  // Index management
  rebuildSearchIndex(): Promise<void>;
  getSearchStats(): Promise<SearchStats>;
}

export interface SearchOptions<T> {
  fields?: (keyof T)[];
  fuzzy?: boolean;
  maxDistance?: number;
  boost?: Partial<Record<keyof T, number>>;
  filters?: WhereClause<T>;
  limit?: number;
  offset?: number;
}

export interface SearchResult<T> extends QueryResult<T> {
  scores: number[];
  highlights: Partial<Record<keyof T, string>>[];
  facets?: Record<string, FacetResult>;
}

export interface FacetResult {
  values: Array<{ value: string; count: number }>;
  total: number;
}

export interface SearchStats {
  indexSize: number;
  documentCount: number;
  lastIndexed: Date;
  averageQueryTime: number;
}

// Repository with audit trail - extends the core repository
export interface IAuditableRepository<
  TEntity extends IBaseEntity,
  TCreateDTO extends IBaseCreateDTO,
  TUpdateDTO extends IBaseUpdateDTO,
  TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
> extends IRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO> {
  // ============================================================================
  // AUDIT OPERATIONS
  // ============================================================================

  getAuditTrail(entityId: string): Promise<AuditEntry[]>;
  getAuditTrailByUser(userId: string): Promise<AuditEntry[]>;
  getAuditTrailByDateRange(from: Date, to: Date): Promise<AuditEntry[]>;
}

export interface AuditEntry {
  id: string;
  entityId: string;
  entityType: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  userId?: string;
  timestamp: Date;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// FACTORY AND CONFIGURATION INTERFACES
// ============================================================================

// Repository factory interface for creating standardized repositories
export interface IRepositoryFactory {
  // Core repository creation
  create<
    TEntity extends IBaseEntity,
    TCreateDTO extends IBaseCreateDTO,
    TUpdateDTO extends IBaseUpdateDTO,
    TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
  >(
    entityName: string,
    config?: IRepositoryConfig
  ): IRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO>;

  // Specialized repository creation
  createSoftDeletable<
    TEntity extends IBaseEntity & ISoftDeletableEntity,
    TCreateDTO extends IBaseCreateDTO,
    TUpdateDTO extends IBaseUpdateDTO,
    TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
  >(
    entityName: string,
    config?: IRepositoryConfig
  ): ISoftDeletableRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO>;

  createUserOwned<
    TEntity extends IBaseEntity & IUserOwnedEntity,
    TCreateDTO extends IUserOwnedCreateDTO,
    TUpdateDTO extends IBaseUpdateDTO,
    TQueryDTO extends IUserOwnedQueryDTO = IUserOwnedQueryDTO,
  >(
    entityName: string,
    config?: IRepositoryConfig
  ): IUserOwnedRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO>;

  createUserOwnedSoftDeletable<
    TEntity extends IBaseEntity & IUserOwnedEntity & ISoftDeletableEntity,
    TCreateDTO extends IUserOwnedCreateDTO,
    TUpdateDTO extends IBaseUpdateDTO,
    TQueryDTO extends IUserOwnedQueryDTO = IUserOwnedQueryDTO,
  >(
    entityName: string,
    config?: IRepositoryConfig
  ): IUserOwnedSoftDeletableRepository<
    TEntity,
    TCreateDTO,
    TUpdateDTO,
    TQueryDTO
  >;

  // Feature-enhanced repositories
  createCached<
    TEntity extends IBaseEntity,
    TCreateDTO extends IBaseCreateDTO,
    TUpdateDTO extends IBaseUpdateDTO,
    TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
  >(
    entityName: string,
    config?: IRepositoryConfig & CacheConfig
  ): ICachedRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO>;

  createSearchable<
    TEntity extends IBaseEntity,
    TCreateDTO extends IBaseCreateDTO,
    TUpdateDTO extends IBaseUpdateDTO,
    TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
  >(
    entityName: string,
    config?: IRepositoryConfig & SearchConfig
  ): ISearchableRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO>;

  createQueryable<
    TEntity extends IBaseEntity,
    TCreateDTO extends IBaseCreateDTO,
    TUpdateDTO extends IBaseUpdateDTO,
    TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
  >(
    entityName: string,
    config?: IRepositoryConfig
  ): IQueryableRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO>;

  createAuditable<
    TEntity extends IBaseEntity,
    TCreateDTO extends IBaseCreateDTO,
    TUpdateDTO extends IBaseUpdateDTO,
    TQueryDTO extends IBaseQueryDTO = IBaseQueryDTO,
  >(
    entityName: string,
    config?: IRepositoryConfig
  ): IAuditableRepository<TEntity, TCreateDTO, TUpdateDTO, TQueryDTO>;
}

// Repository configuration interface
export interface IRepositoryConfig {
  enableAuditTrail: boolean;
  enableSoftDelete: boolean;
  enableVersioning: boolean;
  enableTagging: boolean;

  // Pagination configuration
  defaultPageSize: number; // Default: 100 (can be overridden in API calls)
  maxPageSize: number; // Hard limit: 1000 (cannot be exceeded)

  // Bulk operations configuration
  enableBulkOperations: boolean;
  bulkOperationBatchSize: number; // Default: 100

  // Database configuration
  tableName?: string;
  primaryKey?: string;
  timestamps?: boolean;
  validation?: boolean;
}

export interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  strategy: "lru" | "lfu" | "fifo";
}

export interface SearchConfig {
  searchFields: string[];
  indexName?: string;
  fuzzySearch?: boolean;
  maxResults?: number;
}

// Default repository configuration
export const DEFAULT_REPOSITORY_CONFIG: IRepositoryConfig = {
  enableAuditTrail: true,
  enableSoftDelete: true,
  enableVersioning: true,
  enableTagging: true,

  // Pagination: Default 100, Hard Max 1000
  defaultPageSize: 100,
  maxPageSize: 1000,

  // Bulk operations defaults
  enableBulkOperations: true,
  bulkOperationBatchSize: 100,

  // Database defaults
  timestamps: true,
  validation: true,
};

// Pagination constants
export const PAGINATION_LIMITS = {
  DEFAULT_PAGE_SIZE: 100,
  MAX_PAGE_SIZE: 1000,
  MIN_PAGE_SIZE: 1,
} as const;

// Pagination helper functions
export interface PaginationHelpers {
  validatePageSize(pageSize: number): number; // Enforces min 1, max 1000, default 100
  calculateOffset(page: number, pageSize: number): number;
  calculateTotalPages(totalCount: number, pageSize: number): number;
}

// ============================================================================
// TYPE HELPERS AND UTILITIES
// ============================================================================

// Type-safe field selectors
export type FieldSelector<T> = {
  [K in keyof T]: boolean;
};

// Relation loading options
export type RelationOptions<T> = {
  [K in keyof T]?: boolean;
};

// Advanced query options with relations
export interface AdvancedQueryOptions<T> extends QueryOptions<T> {
  relations?: RelationOptions<T>;
  cache?: boolean;
  cacheTTL?: number;
  timeout?: number;
}
