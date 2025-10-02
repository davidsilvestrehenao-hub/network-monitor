// Enhanced error handling with generic context types
// Provides type-safe, contextual error handling across the application

// Base error interface with generic context
export interface TypedError<TContext = unknown> extends Error {
  readonly code: string;
  readonly context?: TContext;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly causedBy?: TypedError<unknown>;
  readonly retryable: boolean;
  readonly severity: ErrorSeverity;
}

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

// Domain-specific error contexts
export interface ValidationErrorContext {
  field: string;
  value: unknown;
  constraints: string[];
  attemptedValue?: unknown;
}

export interface DatabaseErrorContext {
  operation: "CREATE" | "READ" | "UPDATE" | "DELETE";
  table?: string;
  query?: string;
  parameters?: Record<string, unknown>;
  constraint?: string;
}

export interface NetworkErrorContext {
  url: string;
  method: string;
  statusCode?: number;
  headers?: Record<string, string>;
  requestId?: string;
  timeout?: number;
}

export interface AuthenticationErrorContext {
  userId?: string;
  sessionId?: string;
  provider?: string;
  attemptedAction?: string;
  ipAddress?: string;
}

export interface AuthorizationErrorContext {
  userId: string;
  resource: string;
  action: string;
  requiredPermissions: string[];
  userPermissions: string[];
}

export interface BusinessLogicErrorContext {
  operation: string;
  entityType: string;
  entityId?: string | number;
  businessRule: string;
  currentState?: Record<string, unknown>;
}

export interface ExternalServiceErrorContext {
  serviceName: string;
  endpoint: string;
  operation: string;
  statusCode?: number;
  serviceErrorCode?: string;
  serviceErrorMessage?: string;
}

export interface ConfigurationErrorContext {
  configKey: string;
  configValue?: unknown;
  expectedType?: string;
  validationRule?: string;
  source?: string;
}

export interface ResourceErrorContext {
  resourceType: string;
  resourceId?: string;
  operation: string;
  currentUsage?: number;
  limit?: number;
  unit?: string;
}

// Base typed error class
export class BaseTypedError<TContext = unknown>
  extends Error
  implements TypedError<TContext>
{
  public readonly code: string;
  public readonly context?: TContext;
  public readonly timestamp: Date;
  public readonly correlationId?: string;
  public causedBy?: TypedError<unknown>;
  public readonly retryable: boolean;
  public readonly severity: ErrorSeverity;

  constructor(
    message: string,
    code: string,
    context?: TContext,
    options: {
      correlationId?: string;
      causedBy?: TypedError<unknown>;
      retryable?: boolean;
      severity?: ErrorSeverity;
    } = {}
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.context = context;
    this.timestamp = new Date();
    this.correlationId = options.correlationId || crypto.randomUUID();
    this.causedBy = options.causedBy;
    this.retryable = options.retryable ?? false;
    this.severity = options.severity ?? "medium";

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // Serialization for logging and API responses
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      correlationId: this.correlationId,
      causedBy:
        this.causedBy &&
        "toJSON" in this.causedBy &&
        typeof this.causedBy.toJSON === "function"
          ? this.causedBy.toJSON()
          : this.causedBy,
      retryable: this.retryable,
      severity: this.severity,
      stack: this.stack,
    };
  }

  // Create a new error with additional context
  withContext<TNewContext>(
    newContext: TNewContext
  ): BaseTypedError<TNewContext> {
    return new BaseTypedError(this.message, this.code, newContext, {
      correlationId: this.correlationId,
      causedBy: this,
      retryable: this.retryable,
      severity: this.severity,
    });
  }

  // Create a new error as a cause of this one
  causedByError(cause: TypedError<unknown>): this {
    this.causedBy = cause;
    return this;
  }
}

// Specific error classes with typed contexts
export class ValidationError extends BaseTypedError<ValidationErrorContext> {
  constructor(
    message: string,
    context: ValidationErrorContext,
    options?: { correlationId?: string; causedBy?: TypedError<unknown> }
  ) {
    super(message, "VALIDATION_ERROR", context, {
      ...options,
      retryable: false,
      severity: "medium",
    });
  }

  static fieldRequired(field: string, correlationId?: string): ValidationError {
    return new ValidationError(
      `Field '${field}' is required`,
      {
        field,
        value: undefined,
        constraints: ["required"],
      },
      { correlationId }
    );
  }

  static fieldInvalid(
    field: string,
    value: unknown,
    constraints: string[],
    correlationId?: string
  ): ValidationError {
    return new ValidationError(
      `Field '${field}' is invalid: ${constraints.join(", ")}`,
      {
        field,
        value,
        constraints,
      },
      { correlationId }
    );
  }
}

export class DatabaseError extends BaseTypedError<DatabaseErrorContext> {
  constructor(
    message: string,
    context: DatabaseErrorContext,
    options?: {
      correlationId?: string;
      causedBy?: TypedError<unknown>;
      retryable?: boolean;
    }
  ) {
    super(message, "DATABASE_ERROR", context, {
      ...options,
      retryable: options?.retryable ?? true,
      severity: "high",
    });
  }

  static connectionFailed(correlationId?: string): DatabaseError {
    return new DatabaseError(
      "Database connection failed",
      { operation: "READ" },
      { correlationId, retryable: true }
    );
  }

  static constraintViolation(
    constraint: string,
    operation: DatabaseErrorContext["operation"],
    table?: string,
    correlationId?: string
  ): DatabaseError {
    return new DatabaseError(
      `Database constraint violation: ${constraint}`,
      { operation, table, constraint },
      { correlationId, retryable: false }
    );
  }

  static queryTimeout(
    query: string,
    timeout: number,
    correlationId?: string
  ): DatabaseError {
    return new DatabaseError(
      `Database query timeout after ${timeout}ms`,
      { operation: "READ", query },
      { correlationId, retryable: true }
    );
  }
}

export class NetworkError extends BaseTypedError<NetworkErrorContext> {
  constructor(
    message: string,
    context: NetworkErrorContext,
    options?: {
      correlationId?: string;
      causedBy?: TypedError<unknown>;
      retryable?: boolean;
    }
  ) {
    super(message, "NETWORK_ERROR", context, {
      ...options,
      retryable: options?.retryable ?? true,
      severity: "medium",
    });
  }

  static requestTimeout(
    url: string,
    method: string,
    timeout: number,
    correlationId?: string
  ): NetworkError {
    return new NetworkError(
      `Request timeout after ${timeout}ms`,
      { url, method, timeout },
      { correlationId, retryable: true }
    );
  }

  static httpError(
    url: string,
    method: string,
    statusCode: number,
    correlationId?: string
  ): NetworkError {
    const retryable = statusCode >= 500 || statusCode === 429;
    return new NetworkError(
      `HTTP ${statusCode} error`,
      { url, method, statusCode },
      { correlationId, retryable }
    );
  }
}

export class AuthenticationError extends BaseTypedError<AuthenticationErrorContext> {
  constructor(
    message: string,
    context: AuthenticationErrorContext,
    options?: { correlationId?: string; causedBy?: TypedError<unknown> }
  ) {
    super(message, "AUTHENTICATION_ERROR", context, {
      ...options,
      retryable: false,
      severity: "high",
    });
  }

  static invalidCredentials(correlationId?: string): AuthenticationError {
    return new AuthenticationError(
      "Invalid credentials provided",
      { attemptedAction: "login" },
      { correlationId }
    );
  }

  static sessionExpired(
    sessionId: string,
    correlationId?: string
  ): AuthenticationError {
    return new AuthenticationError(
      "Session has expired",
      { sessionId, attemptedAction: "access_protected_resource" },
      { correlationId }
    );
  }
}

export class AuthorizationError extends BaseTypedError<AuthorizationErrorContext> {
  constructor(
    message: string,
    context: AuthorizationErrorContext,
    options?: { correlationId?: string; causedBy?: TypedError<unknown> }
  ) {
    super(message, "AUTHORIZATION_ERROR", context, {
      ...options,
      retryable: false,
      severity: "medium",
    });
  }

  static insufficientPermissions(
    userId: string,
    resource: string,
    action: string,
    requiredPermissions: string[],
    userPermissions: string[],
    correlationId?: string
  ): AuthorizationError {
    return new AuthorizationError(
      `Insufficient permissions to ${action} ${resource}`,
      {
        userId,
        resource,
        action,
        requiredPermissions,
        userPermissions,
      },
      { correlationId }
    );
  }
}

export class BusinessLogicError extends BaseTypedError<BusinessLogicErrorContext> {
  constructor(
    message: string,
    context: BusinessLogicErrorContext,
    options?: { correlationId?: string; causedBy?: TypedError<unknown> }
  ) {
    super(message, "BUSINESS_LOGIC_ERROR", context, {
      ...options,
      retryable: false,
      severity: "medium",
    });
  }

  static ruleViolation(
    operation: string,
    entityType: string,
    businessRule: string,
    entityId?: string | number,
    correlationId?: string
  ): BusinessLogicError {
    return new BusinessLogicError(
      `Business rule violation: ${businessRule}`,
      {
        operation,
        entityType,
        entityId,
        businessRule,
      },
      { correlationId }
    );
  }
}

export class ExternalServiceError extends BaseTypedError<ExternalServiceErrorContext> {
  constructor(
    message: string,
    context: ExternalServiceErrorContext,
    options?: {
      correlationId?: string;
      causedBy?: TypedError<unknown>;
      retryable?: boolean;
    }
  ) {
    super(message, "EXTERNAL_SERVICE_ERROR", context, {
      ...options,
      retryable: options?.retryable ?? true,
      severity: "medium",
    });
  }

  static serviceUnavailable(
    serviceName: string,
    endpoint: string,
    correlationId?: string
  ): ExternalServiceError {
    return new ExternalServiceError(
      `External service ${serviceName} is unavailable`,
      { serviceName, endpoint, operation: "request" },
      { correlationId, retryable: true }
    );
  }
}

export class ConfigurationError extends BaseTypedError<ConfigurationErrorContext> {
  constructor(
    message: string,
    context: ConfigurationErrorContext,
    options?: { correlationId?: string; causedBy?: TypedError<unknown> }
  ) {
    super(message, "CONFIGURATION_ERROR", context, {
      ...options,
      retryable: false,
      severity: "critical",
    });
  }

  static missingConfig(
    configKey: string,
    correlationId?: string
  ): ConfigurationError {
    return new ConfigurationError(
      `Missing required configuration: ${configKey}`,
      { configKey },
      { correlationId }
    );
  }

  static invalidConfig(
    configKey: string,
    configValue: unknown,
    expectedType: string,
    correlationId?: string
  ): ConfigurationError {
    return new ConfigurationError(
      `Invalid configuration for ${configKey}: expected ${expectedType}`,
      { configKey, configValue, expectedType },
      { correlationId }
    );
  }
}

export class ResourceError extends BaseTypedError<ResourceErrorContext> {
  constructor(
    message: string,
    context: ResourceErrorContext,
    options?: {
      correlationId?: string;
      causedBy?: TypedError<unknown>;
      retryable?: boolean;
    }
  ) {
    super(message, "RESOURCE_ERROR", context, {
      ...options,
      retryable: options?.retryable ?? true,
      severity: "medium",
    });
  }

  static limitExceeded(
    resourceType: string,
    currentUsage: number,
    limit: number,
    unit = "items",
    correlationId?: string
  ): ResourceError {
    return new ResourceError(
      `Resource limit exceeded for ${resourceType}: ${currentUsage}/${limit} ${unit}`,
      {
        resourceType,
        operation: "allocate",
        currentUsage,
        limit,
        unit,
      },
      { correlationId, retryable: false }
    );
  }

  static notFound(
    resourceType: string,
    resourceId: string,
    correlationId?: string
  ): ResourceError {
    return new ResourceError(
      `${resourceType} with ID ${resourceId} not found`,
      {
        resourceType,
        resourceId,
        operation: "read",
      },
      { correlationId, retryable: false }
    );
  }
}

// Error handler interface
export interface ErrorHandler<TContext = unknown> {
  canHandle(error: TypedError<TContext>): boolean;
  handle(error: TypedError<TContext>): Promise<void> | void;
}

// Error handler registry
export class ErrorHandlerRegistry {
  private handlers: Map<string, ErrorHandler<unknown>[]> = new Map();

  register<TContext>(errorCode: string, handler: ErrorHandler<TContext>): void {
    if (!this.handlers.has(errorCode)) {
      this.handlers.set(errorCode, []);
    }
    this.handlers.get(errorCode)!.push(handler as ErrorHandler<unknown>);
  }

  async handle<TContext>(error: TypedError<TContext>): Promise<void> {
    const handlers = this.handlers.get(error.code) || [];

    for (const handler of handlers) {
      if (handler.canHandle(error)) {
        await handler.handle(error);
      }
    }
  }

  getHandlers(errorCode: string): ErrorHandler<unknown>[] {
    return this.handlers.get(errorCode) || [];
  }
}

// Error aggregator for collecting multiple errors
export class ErrorAggregator {
  private errors: TypedError<unknown>[] = [];

  add<TContext>(error: TypedError<TContext>): void {
    this.errors.push(error);
  }

  addAll<TContext>(errors: TypedError<TContext>[]): void {
    this.errors.push(...errors);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  getErrors(): TypedError<unknown>[] {
    return [...this.errors];
  }

  getErrorsByCode(code: string): TypedError<unknown>[] {
    return this.errors.filter(error => error.code === code);
  }

  getErrorsBySeverity(severity: ErrorSeverity): TypedError<unknown>[] {
    return this.errors.filter(error => error.severity === severity);
  }

  clear(): void {
    this.errors = [];
  }

  throwIfAny(): void {
    if (this.hasErrors()) {
      const firstError = this.errors[0];
      const aggregateError = new Error(
        `Multiple errors occurred. First: ${firstError.message}`
      );
      (aggregateError as Error & { errors: TypedError<unknown>[] }).errors =
        this.errors;
      (aggregateError as Error & { cause: TypedError<unknown> }).cause =
        firstError;
      throw aggregateError;
    }
  }
}

// Type guards for error types
export function isTypedError<TContext = unknown>(
  error: unknown
): error is TypedError<TContext> {
  return (
    error instanceof Error &&
    "code" in error &&
    "timestamp" in error &&
    "retryable" in error &&
    "severity" in error
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return isTypedError(error) && error.code === "VALIDATION_ERROR";
}

export function isDatabaseError(error: unknown): error is DatabaseError {
  return isTypedError(error) && error.code === "DATABASE_ERROR";
}

export function isNetworkError(error: unknown): error is NetworkError {
  return isTypedError(error) && error.code === "NETWORK_ERROR";
}

export function isAuthenticationError(
  error: unknown
): error is AuthenticationError {
  return isTypedError(error) && error.code === "AUTHENTICATION_ERROR";
}

export function isAuthorizationError(
  error: unknown
): error is AuthorizationError {
  return isTypedError(error) && error.code === "AUTHORIZATION_ERROR";
}

export function isBusinessLogicError(
  error: unknown
): error is BusinessLogicError {
  return isTypedError(error) && error.code === "BUSINESS_LOGIC_ERROR";
}

export function isExternalServiceError(
  error: unknown
): error is ExternalServiceError {
  return isTypedError(error) && error.code === "EXTERNAL_SERVICE_ERROR";
}

export function isConfigurationError(
  error: unknown
): error is ConfigurationError {
  return isTypedError(error) && error.code === "CONFIGURATION_ERROR";
}

export function isResourceError(error: unknown): error is ResourceError {
  return isTypedError(error) && error.code === "RESOURCE_ERROR";
}

// Error transformation utilities
export function transformError<TFromContext, TToContext>(
  error: BaseTypedError<TFromContext>,
  transformer: (context: TFromContext) => TToContext
): BaseTypedError<TToContext> {
  return error.withContext(transformer(error.context!));
}

export function enrichError<TContext>(
  error: BaseTypedError<TContext>,
  additionalContext: Partial<TContext>
): BaseTypedError<TContext> {
  const enrichedContext = {
    ...error.context,
    ...additionalContext,
  } as TContext;
  return error.withContext(enrichedContext);
}

// Error retry utilities
export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: TypedError<unknown> | null = null;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (!isTypedError(error)) {
        throw error;
      }

      lastError = error;

      // Check if error is retryable
      if (!error.retryable) {
        throw error;
      }

      // Check if error code is in retryable list
      if (
        options.retryableErrors &&
        !options.retryableErrors.includes(error.code)
      ) {
        throw error;
      }

      // Don't retry on last attempt
      if (attempt === options.maxAttempts) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        options.baseDelay * Math.pow(options.backoffMultiplier, attempt - 1),
        options.maxDelay
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
