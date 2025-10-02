// Generic API response types for consistent API communication
// Provides type-safe, standardized response formats across all API endpoints

// Base API response interface
export interface APIResponse<TData = unknown> {
  success: boolean;
  data: TData;
  message?: string;
  errors?: APIError[];
  metadata: ResponseMetadata;
}

// Response metadata for tracking and debugging
export interface ResponseMetadata {
  timestamp: string;
  requestId: string;
  version: string;
  duration?: number;
  source?: string;
  correlationId?: string;
}

// API error interface with context
export interface APIError {
  code: string;
  message: string;
  field?: string;
  context?: Record<string, unknown>;
  stack?: string; // Only in development
}

// Success response helper
export interface SuccessResponse<TData> extends APIResponse<TData> {
  success: true;
  data: TData;
  errors?: never;
}

// Error response helper
export interface ErrorResponse extends APIResponse<null> {
  success: false;
  data: null;
  errors: APIError[];
}

// Paginated response for list endpoints
export interface PaginatedResponse<TData> extends SuccessResponse<TData[]> {
  pagination: PaginationMetadata;
}

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage?: number;
  prevPage?: number;
}

// Collection response for non-paginated lists
export interface CollectionResponse<TData> extends SuccessResponse<TData[]> {
  count: number;
  filters?: Record<string, unknown>;
  sort?: SortMetadata[];
}

export interface SortMetadata {
  field: string;
  direction: "asc" | "desc";
}

// Single item response
export interface ItemResponse<TData> extends SuccessResponse<TData> {
  // Additional metadata specific to single items
  version?: string;
  lastModified?: string;
  etag?: string;
}

// Creation response with location
export interface CreatedResponse<TData> extends ItemResponse<TData> {
  location?: string;
  resourceId: string | number;
}

// Update response with change tracking
export interface UpdatedResponse<TData> extends ItemResponse<TData> {
  changes?: ChangeMetadata[];
  previousVersion?: string;
}

export interface ChangeMetadata {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

// Deletion response
export interface DeletedResponse extends SuccessResponse<null> {
  data: null;
  deletedId: string | number;
  deletedAt: string;
}

// Batch operation response
export interface BatchResponse<TData>
  extends SuccessResponse<BatchResult<TData>> {
  // Batch-specific metadata
}

export interface BatchResult<TData> {
  successful: TData[];
  failed: BatchError[];
  total: number;
  successCount: number;
  failureCount: number;
}

export interface BatchError {
  index: number;
  item: unknown;
  errors: APIError[];
}

// Validation response
export interface ValidationResponse extends ErrorResponse {
  validationErrors: ValidationError[];
}

export interface ValidationError extends APIError {
  field: string;
  value: unknown;
  constraints: string[];
}

// Health check response
export interface HealthResponse extends SuccessResponse<HealthData> {
  // Health-specific metadata
}

export interface HealthData {
  status: "healthy" | "degraded" | "unhealthy";
  checks: HealthCheck[];
  uptime: number;
  version: string;
  environment: string;
}

export interface HealthCheck {
  name: string;
  status: "pass" | "fail" | "warn";
  duration: number;
  output?: string;
  details?: Record<string, unknown>;
}

// File upload response
export interface FileUploadResponse extends CreatedResponse<FileMetadata> {
  // File-specific metadata
}

export interface FileMetadata {
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  checksum: string;
}

// Search response with facets and highlighting
export interface SearchResponse<TData> extends PaginatedResponse<TData> {
  query: string;
  facets?: SearchFacet[];
  suggestions?: string[];
  highlights?: Record<string, string[]>;
  searchTime: number;
}

export interface SearchFacet {
  field: string;
  values: Array<{
    value: string;
    count: number;
    selected?: boolean;
  }>;
}

// Async operation response
export interface AsyncResponse extends SuccessResponse<AsyncOperationData> {
  // Async-specific metadata
}

export interface AsyncOperationData {
  operationId: string;
  status: "pending" | "running" | "completed" | "failed";
  progress?: number;
  estimatedCompletion?: string;
  resultUrl?: string;
  statusUrl: string;
}

// Streaming response metadata
export interface StreamingResponse<TData> extends SuccessResponse<TData> {
  streamId: string;
  chunkIndex: number;
  isLastChunk: boolean;
  totalChunks?: number;
}

// Cache response metadata
export interface CachedResponse<TData> extends APIResponse<TData> {
  cache: CacheMetadata;
}

export interface CacheMetadata {
  hit: boolean;
  ttl?: number;
  age?: number;
  key?: string;
  tags?: string[];
}

// Rate limiting response metadata
export interface RateLimitedResponse<TData> extends APIResponse<TData> {
  rateLimit: RateLimitMetadata;
}

export interface RateLimitMetadata {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

// Response builder for creating consistent responses
export class ResponseBuilder {
  static success<TData>(
    data: TData,
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): SuccessResponse<TData> {
    return {
      success: true,
      data,
      message,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        version: "1.0.0",
        ...metadata,
      },
    };
  }

  static error(
    errors: APIError[],
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): ErrorResponse {
    return {
      success: false,
      data: null,
      message,
      errors,
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        version: "1.0.0",
        ...metadata,
      },
    };
  }

  static paginated<TData>(
    data: TData[],
    pagination: PaginationMetadata,
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): PaginatedResponse<TData> {
    return {
      ...this.success(data, message, metadata),
      pagination,
    };
  }

  static collection<TData>(
    data: TData[],
    count?: number,
    filters?: Record<string, unknown>,
    sort?: SortMetadata[],
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): CollectionResponse<TData> {
    return {
      ...this.success(data, message, metadata),
      count: count ?? data.length,
      filters,
      sort,
    };
  }

  static created<TData>(
    data: TData,
    resourceId: string | number,
    location?: string,
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): CreatedResponse<TData> {
    return {
      ...this.success(data, message, metadata),
      resourceId,
      location,
      version: "1",
      lastModified: new Date().toISOString(),
    };
  }

  static updated<TData>(
    data: TData,
    changes?: ChangeMetadata[],
    previousVersion?: string,
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): UpdatedResponse<TData> {
    return {
      ...this.success(data, message, metadata),
      changes,
      previousVersion,
      version: String(Date.now()),
      lastModified: new Date().toISOString(),
    };
  }

  static deleted(
    deletedId: string | number,
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): DeletedResponse {
    return {
      ...this.success(null, message, metadata),
      deletedId,
      deletedAt: new Date().toISOString(),
    };
  }

  static batch<TData>(
    result: BatchResult<TData>,
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): BatchResponse<TData> {
    return this.success(result, message, metadata);
  }

  static validation(
    validationErrors: ValidationError[],
    message = "Validation failed",
    metadata?: Partial<ResponseMetadata>
  ): ValidationResponse {
    const apiErrors: APIError[] = validationErrors.map(ve => ({
      code: "VALIDATION_ERROR",
      message: ve.message,
      field: ve.field,
      context: { value: ve.value, constraints: ve.constraints },
    }));

    return {
      ...this.error(apiErrors, message, metadata),
      validationErrors,
    };
  }

  static health(
    data: HealthData,
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): HealthResponse {
    return this.success(data, message, metadata);
  }

  static fileUpload(
    fileMetadata: FileMetadata,
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): FileUploadResponse {
    return {
      ...this.created(
        fileMetadata,
        fileMetadata.filename,
        fileMetadata.url,
        message,
        metadata
      ),
    };
  }

  static search<TData>(
    data: TData[],
    pagination: PaginationMetadata,
    query: string,
    searchTime: number,
    facets?: SearchFacet[],
    suggestions?: string[],
    highlights?: Record<string, string[]>,
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): SearchResponse<TData> {
    return {
      ...this.paginated(data, pagination, message, metadata),
      query,
      facets,
      suggestions,
      highlights,
      searchTime,
    };
  }

  static async(
    operationData: AsyncOperationData,
    message?: string,
    metadata?: Partial<ResponseMetadata>
  ): AsyncResponse {
    return this.success(operationData, message, metadata);
  }
}

// Type guards for response types
export function isSuccessResponse<TData>(
  response: APIResponse<TData>
): response is SuccessResponse<TData> {
  return response.success === true;
}

export function isErrorResponse(
  response: APIResponse<unknown>
): response is ErrorResponse {
  return response.success === false;
}

export function isPaginatedResponse<TData>(
  response: APIResponse<TData[] | TData>
): response is PaginatedResponse<TData> {
  return isSuccessResponse(response) && "pagination" in response;
}

export function isCollectionResponse<TData>(
  response: APIResponse<TData[] | TData>
): response is CollectionResponse<TData> {
  return (
    isSuccessResponse(response) &&
    "count" in response &&
    !("pagination" in response)
  );
}

export function isValidationResponse(
  response: APIResponse<unknown>
): response is ValidationResponse {
  return isErrorResponse(response) && "validationErrors" in response;
}

// Response transformation utilities
export type ResponseTransformer<TFrom, TTo> = (data: TFrom) => TTo;

export function transformResponse<TFrom, TTo>(
  response: SuccessResponse<TFrom>,
  transformer: ResponseTransformer<TFrom, TTo>
): SuccessResponse<TTo> {
  return {
    ...response,
    data: transformer(response.data),
  };
}

export function transformPaginatedResponse<TFrom, TTo>(
  response: PaginatedResponse<TFrom>,
  transformer: ResponseTransformer<TFrom, TTo>
): PaginatedResponse<TTo> {
  return {
    ...response,
    data: response.data.map(transformer),
  };
}

export function transformCollectionResponse<TFrom, TTo>(
  response: CollectionResponse<TFrom>,
  transformer: ResponseTransformer<TFrom, TTo>
): CollectionResponse<TTo> {
  return {
    ...response,
    data: response.data.map(transformer),
  };
}
