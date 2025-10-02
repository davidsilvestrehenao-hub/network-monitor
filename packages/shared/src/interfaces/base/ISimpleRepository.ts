/**
 * Simple Repository Interface
 * A practical, lightweight repository interface that matches our domain types
 * and actual usage patterns without complex type constraints
 */

// Simple base repository interface for CRUD operations
export interface ISimpleRepository<TEntity, TCreateData, TUpdateData> {
  // Query methods
  findById(id: string | number): Promise<TEntity | null>;
  getAll(limit?: number, offset?: number): Promise<TEntity[]>;
  count(): Promise<number>;

  // Command methods
  create(data: TCreateData): Promise<TEntity>;
  update(id: string | number, data: TUpdateData): Promise<TEntity>;
  delete(id: string | number): Promise<void>;
}

// User-owned repository interface for entities that belong to users
export interface IUserOwnedSimpleRepository<TEntity, TCreateData, TUpdateData>
  extends ISimpleRepository<TEntity, TCreateData, TUpdateData> {
  // User-specific query methods
  findByUserId(userId: string): Promise<TEntity[]>;
  findByUserIdWithPagination(
    userId: string,
    limit?: number,
    offset?: number
  ): Promise<TEntity[]>;
  countByUserId(userId: string): Promise<number>;

  // User-specific command methods
  deleteByUserId(userId: string): Promise<void>;
}
