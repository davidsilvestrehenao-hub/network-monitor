// Base API client interface that all API clients should extend
// This ensures consistency and polymorphism across all API communication layers

export interface IAPIClient {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Request/Response handling
  request<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  get<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T>;
  put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T>;
  patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestOptions
  ): Promise<T>;
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T>;

  // Error handling
  setErrorHandler(handler: (error: APIError) => void | Promise<void>): void;
  setRetryPolicy(policy: RetryPolicy): void;

  // Authentication
  setAuthToken(token: string): void;
  clearAuthToken(): void;
  isAuthenticated(): boolean;
}

// Request options interface
export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  cache?: boolean;
  cacheTTL?: number;
}

// API error interface
export interface APIError extends Error {
  status?: number;
  statusText?: string;
  response?: unknown;
  request?: unknown;
  retryable?: boolean;
}

// Retry policy interface
export interface RetryPolicy {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableStatusCodes: number[];
  retryableErrors: string[];
}

// Base API client for CRUD operations
export interface ICRUDAPIClient<
  T,
  TCreate,
  TUpdate,
  TQuery = Record<string, unknown>,
> {
  // Basic CRUD operations
  getById(id: string): Promise<T | null>;
  getAll(query?: TQuery, limit?: number, offset?: number): Promise<T[]>;
  create(data: TCreate): Promise<T>;
  update(id: string, data: TUpdate): Promise<T>;
  delete(id: string): Promise<void>;

  // Utility operations
  count(query?: TQuery): Promise<number>;
  exists(id: string): Promise<boolean>;
}

// Base API client for user-owned resources
export interface IUserOwnedAPIClient<
  T,
  TCreate,
  TUpdate,
  TQuery = Record<string, unknown>,
> extends ICRUDAPIClient<T, TCreate, TUpdate, TQuery> {
  // User-specific operations
  getByUserId(
    userId: string,
    query?: TQuery,
    limit?: number,
    offset?: number
  ): Promise<T[]>;
  countByUserId(userId: string, query?: TQuery): Promise<number>;
  deleteByUserId(userId: string): Promise<number>;
}
