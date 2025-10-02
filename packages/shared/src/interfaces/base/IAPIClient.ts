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
  post<T, TData = unknown>(
    endpoint: string,
    data?: TData,
    options?: RequestOptions
  ): Promise<T>;
  put<T, TData = unknown>(
    endpoint: string,
    data?: TData,
    options?: RequestOptions
  ): Promise<T>;
  patch<T, TData = unknown>(
    endpoint: string,
    data?: TData,
    options?: RequestOptions
  ): Promise<T>;
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T>;

  // Error handling
  setErrorHandler<TResponse = unknown, TRequest = unknown>(
    handler: (error: APIError<TResponse, TRequest>) => void | Promise<void>
  ): void;
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
export interface APIError<TResponse = unknown, TRequest = unknown>
  extends Error {
  status?: number;
  statusText?: string;
  response?: TResponse;
  request?: TRequest;
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

// Enhanced API client interfaces with typed responses
import type {
  APIResponse,
  SuccessResponse,
  ErrorResponse,
  PaginatedResponse,
  CollectionResponse,
  ItemResponse,
  CreatedResponse,
  UpdatedResponse,
  DeletedResponse,
  BatchResponse,
  ValidationResponse,
  PaginationMetadata,
} from "../../types/api-response-types";

// Base API client for CRUD operations with typed responses
export interface ICRUDAPIClient<
  T,
  TCreate,
  TUpdate,
  TQuery = Record<string, unknown>,
> {
  // Basic CRUD operations with typed responses
  getById(id: string): Promise<ItemResponse<T> | ErrorResponse>;
  getAll(
    query?: TQuery,
    limit?: number,
    offset?: number
  ): Promise<PaginatedResponse<T> | CollectionResponse<T> | ErrorResponse>;
  create(
    data: TCreate
  ): Promise<CreatedResponse<T> | ValidationResponse | ErrorResponse>;
  update(
    id: string,
    data: TUpdate
  ): Promise<UpdatedResponse<T> | ValidationResponse | ErrorResponse>;
  delete(id: string): Promise<DeletedResponse | ErrorResponse>;

  // Utility operations
  count(query?: TQuery): Promise<SuccessResponse<number> | ErrorResponse>;
  exists(id: string): Promise<SuccessResponse<boolean> | ErrorResponse>;

  // Batch operations
  createMany(
    data: TCreate[]
  ): Promise<BatchResponse<T> | ValidationResponse | ErrorResponse>;
  updateMany(
    ids: string[],
    data: Partial<TUpdate>
  ): Promise<BatchResponse<T> | ValidationResponse | ErrorResponse>;
  deleteMany(ids: string[]): Promise<BatchResponse<null> | ErrorResponse>;
}

// Base API client for user-owned resources
export interface IUserOwnedAPIClient<
  T,
  TCreate,
  TUpdate,
  TQuery = Record<string, unknown>,
> extends ICRUDAPIClient<T, TCreate, TUpdate, TQuery> {
  // User-specific operations with typed responses
  getByUserId(
    userId: string,
    query?: TQuery,
    pagination?: PaginationMetadata
  ): Promise<PaginatedResponse<T> | CollectionResponse<T> | ErrorResponse>;
  countByUserId(
    userId: string,
    query?: TQuery
  ): Promise<SuccessResponse<number> | ErrorResponse>;
  deleteByUserId(userId: string): Promise<BatchResponse<null> | ErrorResponse>;
}

// Advanced API client with search and filtering
export interface IAdvancedAPIClient<
  T,
  TCreate,
  TUpdate,
  TQuery = Record<string, unknown>,
> extends ICRUDAPIClient<T, TCreate, TUpdate, TQuery> {
  // Search operations
  search(
    query: string,
    options?: SearchOptions<T>
  ): Promise<PaginatedResponse<T> | ErrorResponse>;

  // Advanced filtering
  filter(
    filters: FilterOptions<T>,
    pagination?: PaginationMetadata
  ): Promise<PaginatedResponse<T> | ErrorResponse>;

  // Aggregation
  aggregate<K extends keyof T>(
    field: K,
    operation: "count" | "sum" | "avg" | "min" | "max",
    filters?: FilterOptions<T>
  ): Promise<SuccessResponse<number> | ErrorResponse>;
}

export interface SearchOptions<T> {
  fields?: (keyof T)[];
  fuzzy?: boolean;
  pagination?: PaginationMetadata;
  filters?: FilterOptions<T>;
  sort?: SortOptions<T>[];
}

export type FilterOptions<T> = {
  [K in keyof T]?: T[K] | FilterOperator<T[K]>;
};

export interface FilterOperator<TValue> {
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
}

export interface SortOptions<T> {
  field: keyof T;
  direction: "asc" | "desc";
}

// Real-time API client with subscriptions
export interface IRealtimeAPIClient<T> extends IAPIClient {
  // Subscription operations
  subscribe(
    channel: string,
    callback: (data: T) => void
  ): Promise<SuccessResponse<string> | ErrorResponse>; // Returns subscription ID

  unsubscribe(
    subscriptionId: string
  ): Promise<SuccessResponse<null> | ErrorResponse>;

  // Real-time events
  onConnect(callback: () => void): void;
  onDisconnect(callback: () => void): void;
  onError(callback: (error: APIError) => void): void;

  // Connection management
  isConnected(): boolean;
  reconnect(): Promise<void>;
}
