// Base repository interface that all repositories should extend
// This ensures consistency and polymorphism across all data access layers

export interface IRepository<T, CreateDto, UpdateDto> {
  // Basic CRUD operations
  findById(id: string | number): Promise<T | null>;
  getAll(limit?: number, offset?: number): Promise<T[]>;
  create(data: CreateDto): Promise<T>;
  update(id: string | number, data: UpdateDto): Promise<T>;
  delete(id: string | number): Promise<void>;
  count(): Promise<number>;
}

export interface IUserOwnedRepository<T, CreateDto, UpdateDto>
  extends IRepository<T, CreateDto, UpdateDto> {
  // User-specific operations
  findByUserId(userId: string): Promise<T[]>;
}
