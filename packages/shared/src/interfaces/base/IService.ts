// Base service interface that all services should extend
// This ensures consistency and polymorphism across all business logic layers

export interface IService<T, CreateDto, UpdateDto> {
  // Basic CRUD operations
  getById(id: string): Promise<T | null>;
  getAll(limit?: number, offset?: number): Promise<T[]>;
  create(data: CreateDto): Promise<T>;
  update(id: string, data: UpdateDto): Promise<T>;
  delete(id: string): Promise<void>;
}

export interface IUserOwnedService<T, CreateDto, UpdateDto>
  extends IService<T, CreateDto, UpdateDto> {
  // User-specific operations
  getByUserId(userId: string): Promise<T[]>;
}

export interface IObservableService {
  // Event handling
  on<T = unknown>(event: string, handler: (data?: T) => void): void;
  off<T = unknown>(event: string, handler: (data?: T) => void): void;
  emit<T = unknown>(event: string, data?: T): void;
}

export interface IBackgroundService {
  // Background task management
  start(): Promise<void>;
  stop(): Promise<void>;
}
