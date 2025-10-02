// Tests for enhanced error handling with generic context types
// Ensures proper error handling and type safety

import { describe, it, expect } from "vitest";
import {
  ValidationError,
  DatabaseError,
  NetworkError,
  AuthenticationError,
  AuthorizationError,
  BusinessLogicError,
  ResourceError,
  ErrorHandlerRegistry,
  ErrorAggregator,
  isTypedError,
  isValidationError,
  isDatabaseError,
  isNetworkError,
  transformError,
  enrichError,
  withRetry,
} from "../types/error-types";

describe("Enhanced Error Types", () => {
  describe("ValidationError", () => {
    it("should create validation error with context", () => {
      const error = new ValidationError("Field validation failed", {
        field: "email",
        value: "invalid-email",
        constraints: ["email", "required"],
      });

      expect(error.message).toBe("Field validation failed");
      expect(error.code).toBe("VALIDATION_ERROR");
      expect(error.context?.field).toBe("email");
      expect(error.context?.value).toBe("invalid-email");
      expect(error.context?.constraints).toEqual(["email", "required"]);
      expect(error.retryable).toBe(false);
      expect(error.severity).toBe("medium");
    });

    it("should create field required error", () => {
      const error = ValidationError.fieldRequired("username");

      expect(error.message).toBe("Field 'username' is required");
      expect(error.context?.field).toBe("username");
      expect(error.context?.constraints).toEqual(["required"]);
    });

    it("should create field invalid error", () => {
      const error = ValidationError.fieldInvalid("age", -5, [
        "positive",
        "integer",
      ]);

      expect(error.message).toBe("Field 'age' is invalid: positive, integer");
      expect(error.context?.field).toBe("age");
      expect(error.context?.value).toBe(-5);
      expect(error.context?.constraints).toEqual(["positive", "integer"]);
    });
  });

  describe("DatabaseError", () => {
    it("should create database error with context", () => {
      const error = new DatabaseError("Query failed", {
        operation: "CREATE",
        table: "users",
        query: "INSERT INTO users...",
      });

      expect(error.message).toBe("Query failed");
      expect(error.code).toBe("DATABASE_ERROR");
      expect(error.context?.operation).toBe("CREATE");
      expect(error.context?.table).toBe("users");
      expect(error.retryable).toBe(true);
      expect(error.severity).toBe("high");
    });

    it("should create connection failed error", () => {
      const error = DatabaseError.connectionFailed();

      expect(error.message).toBe("Database connection failed");
      expect(error.context?.operation).toBe("READ");
      expect(error.retryable).toBe(true);
    });

    it("should create constraint violation error", () => {
      const error = DatabaseError.constraintViolation(
        "unique_email",
        "CREATE",
        "users"
      );

      expect(error.message).toBe("Database constraint violation: unique_email");
      expect(error.context?.constraint).toBe("unique_email");
      expect(error.context?.operation).toBe("CREATE");
      expect(error.context?.table).toBe("users");
      expect(error.retryable).toBe(false);
    });
  });

  describe("NetworkError", () => {
    it("should create network error with context", () => {
      const error = new NetworkError("Request failed", {
        url: "https://api.example.com/users",
        method: "GET",
        statusCode: 500,
      });

      expect(error.message).toBe("Request failed");
      expect(error.code).toBe("NETWORK_ERROR");
      expect(error.context?.url).toBe("https://api.example.com/users");
      expect(error.context?.method).toBe("GET");
      expect(error.context?.statusCode).toBe(500);
      expect(error.retryable).toBe(true);
    });

    it("should create timeout error", () => {
      const error = NetworkError.requestTimeout(
        "https://api.example.com/slow",
        "POST",
        5000
      );

      expect(error.message).toBe("Request timeout after 5000ms");
      expect(error.context?.timeout).toBe(5000);
      expect(error.retryable).toBe(true);
    });

    it("should create HTTP error with correct retryability", () => {
      const serverError = NetworkError.httpError(
        "https://api.example.com",
        "GET",
        500
      );
      expect(serverError.retryable).toBe(true);

      const clientError = NetworkError.httpError(
        "https://api.example.com",
        "GET",
        400
      );
      expect(clientError.retryable).toBe(false);

      const rateLimitError = NetworkError.httpError(
        "https://api.example.com",
        "GET",
        429
      );
      expect(rateLimitError.retryable).toBe(true);
    });
  });

  describe("AuthenticationError", () => {
    it("should create authentication error", () => {
      const error = new AuthenticationError("Invalid token", {
        sessionId: "session-123",
        attemptedAction: "access_protected_resource",
      });

      expect(error.message).toBe("Invalid token");
      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.context?.sessionId).toBe("session-123");
      expect(error.retryable).toBe(false);
      expect(error.severity).toBe("high");
    });

    it("should create invalid credentials error", () => {
      const error = AuthenticationError.invalidCredentials();

      expect(error.message).toBe("Invalid credentials provided");
      expect(error.context?.attemptedAction).toBe("login");
    });

    it("should create session expired error", () => {
      const error = AuthenticationError.sessionExpired("session-123");

      expect(error.message).toBe("Session has expired");
      expect(error.context?.sessionId).toBe("session-123");
    });
  });

  describe("AuthorizationError", () => {
    it("should create authorization error", () => {
      const error = AuthorizationError.insufficientPermissions(
        "user-123",
        "admin-panel",
        "read",
        ["admin"],
        ["user"]
      );

      expect(error.message).toBe(
        "Insufficient permissions to read admin-panel"
      );
      expect(error.code).toBe("AUTHORIZATION_ERROR");
      expect(error.context?.userId).toBe("user-123");
      expect(error.context?.resource).toBe("admin-panel");
      expect(error.context?.action).toBe("read");
      expect(error.context?.requiredPermissions).toEqual(["admin"]);
      expect(error.context?.userPermissions).toEqual(["user"]);
      expect(error.retryable).toBe(false);
    });
  });

  describe("BusinessLogicError", () => {
    it("should create business logic error", () => {
      const error = BusinessLogicError.ruleViolation(
        "transfer",
        "Account",
        "Insufficient balance",
        "account-123"
      );

      expect(error.message).toBe(
        "Business rule violation: Insufficient balance"
      );
      expect(error.code).toBe("BUSINESS_LOGIC_ERROR");
      expect(error.context?.operation).toBe("transfer");
      expect(error.context?.entityType).toBe("Account");
      expect(error.context?.businessRule).toBe("Insufficient balance");
      expect(error.context?.entityId).toBe("account-123");
      expect(error.retryable).toBe(false);
    });
  });

  describe("ResourceError", () => {
    it("should create resource limit exceeded error", () => {
      const error = ResourceError.limitExceeded(
        "API_CALLS",
        1000,
        500,
        "requests/hour"
      );

      expect(error.message).toBe(
        "Resource limit exceeded for API_CALLS: 1000/500 requests/hour"
      );
      expect(error.context?.resourceType).toBe("API_CALLS");
      expect(error.context?.currentUsage).toBe(1000);
      expect(error.context?.limit).toBe(500);
      expect(error.context?.unit).toBe("requests/hour");
      expect(error.retryable).toBe(false);
    });

    it("should create resource not found error", () => {
      const error = ResourceError.notFound("User", "user-123");

      expect(error.message).toBe("User with ID user-123 not found");
      expect(error.context?.resourceType).toBe("User");
      expect(error.context?.resourceId).toBe("user-123");
      expect(error.retryable).toBe(false);
    });
  });

  describe("Error Serialization", () => {
    it("should serialize error to JSON", () => {
      const error = new ValidationError("Test error", {
        field: "email",
        value: "invalid",
        constraints: ["email"],
      });

      const json = error.toJSON();

      expect(json.name).toBe("ValidationError");
      expect(json.message).toBe("Test error");
      expect(json.code).toBe("VALIDATION_ERROR");
      expect(json.context).toEqual({
        field: "email",
        value: "invalid",
        constraints: ["email"],
      });
      expect(json.timestamp).toBeDefined();
      expect(json.correlationId).toBeDefined();
      expect(json.retryable).toBe(false);
      expect(json.severity).toBe("medium");
    });
  });

  describe("Error Chaining", () => {
    it("should chain errors with causedBy", () => {
      const rootError = DatabaseError.connectionFailed();
      const wrappedError = new NetworkError(
        "Service unavailable",
        {
          url: "https://api.example.com",
          method: "GET",
        },
        { causedBy: rootError }
      );

      expect(wrappedError.causedBy).toBe(rootError);
      expect(wrappedError.causedBy?.code).toBe("DATABASE_ERROR");
    });

    it("should create error with additional context", () => {
      const originalError = new ValidationError("Field invalid", {
        field: "email",
        value: "invalid",
        constraints: ["email"],
      });

      const enrichedError = originalError.withContext({
        field: "email",
        value: "invalid@domain",
        constraints: ["email", "domain"],
        attemptedValue: "invalid",
      });

      expect(enrichedError.context?.attemptedValue).toBe("invalid");
      expect(enrichedError.context?.constraints).toEqual(["email", "domain"]);
    });
  });

  describe("Type Guards", () => {
    it("should identify typed errors", () => {
      const typedError = new ValidationError("Test", {
        field: "test",
        value: "",
        constraints: [],
      });
      const regularError = new Error("Regular error");

      expect(isTypedError(typedError)).toBe(true);
      expect(isTypedError(regularError)).toBe(false);
    });

    it("should identify specific error types", () => {
      const validationError = new ValidationError("Test", {
        field: "test",
        value: "",
        constraints: [],
      });
      const databaseError = new DatabaseError("Test", { operation: "READ" });
      const networkError = new NetworkError("Test", { url: "", method: "GET" });

      expect(isValidationError(validationError)).toBe(true);
      expect(isValidationError(databaseError)).toBe(false);

      expect(isDatabaseError(databaseError)).toBe(true);
      expect(isDatabaseError(validationError)).toBe(false);

      expect(isNetworkError(networkError)).toBe(true);
      expect(isNetworkError(validationError)).toBe(false);
    });
  });

  describe("ErrorHandlerRegistry", () => {
    it("should register and handle errors", async () => {
      const registry = new ErrorHandlerRegistry();
      let handledError: ValidationError | null = null;

      registry.register("VALIDATION_ERROR", {
        canHandle: error => isValidationError(error),
        handle: async error => {
          handledError = error as ValidationError;
        },
      });

      const error = new ValidationError("Test", {
        field: "test",
        value: "",
        constraints: [],
      });
      await registry.handle(error);

      expect(handledError).toBe(error);
    });

    it("should handle multiple handlers for same error type", async () => {
      const registry = new ErrorHandlerRegistry();
      const handledErrors: ValidationError[] = [];

      registry.register("VALIDATION_ERROR", {
        canHandle: () => true,
        handle: async error => {
          handledErrors.push(error as ValidationError);
        },
      });

      registry.register("VALIDATION_ERROR", {
        canHandle: () => true,
        handle: async error => {
          handledErrors.push(error as ValidationError);
        },
      });

      const error = new ValidationError("Test", {
        field: "test",
        value: "",
        constraints: [],
      });
      await registry.handle(error);

      expect(handledErrors).toHaveLength(2);
      expect(handledErrors[0]).toBe(error);
      expect(handledErrors[1]).toBe(error);
    });
  });

  describe("ErrorAggregator", () => {
    it("should collect multiple errors", () => {
      const aggregator = new ErrorAggregator();
      const error1 = new ValidationError("Error 1", {
        field: "field1",
        value: "",
        constraints: [],
      });
      const error2 = new ValidationError("Error 2", {
        field: "field2",
        value: "",
        constraints: [],
      });

      aggregator.add(error1);
      aggregator.add(error2);

      expect(aggregator.hasErrors()).toBe(true);
      expect(aggregator.getErrors()).toHaveLength(2);
      expect(aggregator.getErrors()).toContain(error1);
      expect(aggregator.getErrors()).toContain(error2);
    });

    it("should filter errors by code", () => {
      const aggregator = new ErrorAggregator();
      const validationError = new ValidationError("Validation", {
        field: "test",
        value: "",
        constraints: [],
      });
      const databaseError = new DatabaseError("Database", {
        operation: "READ",
      });

      aggregator.add(validationError);
      aggregator.add(databaseError);

      const validationErrors = aggregator.getErrorsByCode("VALIDATION_ERROR");
      const databaseErrors = aggregator.getErrorsByCode("DATABASE_ERROR");

      expect(validationErrors).toHaveLength(1);
      expect(validationErrors[0]).toBe(validationError);
      expect(databaseErrors).toHaveLength(1);
      expect(databaseErrors[0]).toBe(databaseError);
    });

    it("should filter errors by severity", () => {
      const aggregator = new ErrorAggregator();
      const mediumError = new ValidationError("Medium", {
        field: "test",
        value: "",
        constraints: [],
      });
      const highError = new DatabaseError("High", { operation: "READ" });

      aggregator.add(mediumError);
      aggregator.add(highError);

      const mediumErrors = aggregator.getErrorsBySeverity("medium");
      const highErrors = aggregator.getErrorsBySeverity("high");

      expect(mediumErrors).toHaveLength(1);
      expect(mediumErrors[0]).toBe(mediumError);
      expect(highErrors).toHaveLength(1);
      expect(highErrors[0]).toBe(highError);
    });

    it("should throw aggregate error if any errors exist", () => {
      const aggregator = new ErrorAggregator();
      const error = new ValidationError("Test", {
        field: "test",
        value: "",
        constraints: [],
      });

      aggregator.add(error);

      expect(() => aggregator.throwIfAny()).toThrow();
    });

    it("should not throw if no errors", () => {
      const aggregator = new ErrorAggregator();

      expect(() => aggregator.throwIfAny()).not.toThrow();
    });
  });

  describe("Error Transformation", () => {
    it("should transform error context", () => {
      const originalError = new ValidationError("Field invalid", {
        field: "email",
        value: "invalid",
        constraints: ["email"],
      });

      const transformedError = transformError(originalError, context => ({
        ...context,
        transformedField: context.field.toUpperCase(),
      }));

      expect(transformedError.context?.transformedField).toBe("EMAIL");
      expect(transformedError.context?.field).toBe("email");
    });

    it("should enrich error context", () => {
      const originalError = new ValidationError("Field invalid", {
        field: "email",
        value: "invalid",
        constraints: ["email"],
      });

      const enrichedError = enrichError(originalError, {
        attemptedValue: "user@domain",
      });

      expect(enrichedError.context?.field).toBe("email");
      expect(enrichedError.context?.attemptedValue).toBe("user@domain");
    });
  });

  describe("Retry Utilities", () => {
    it("should retry retryable errors", async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        if (attempts < 3) {
          throw new NetworkError("Temporary failure", {
            url: "",
            method: "GET",
          });
        }
        return "success";
      };

      const result = await withRetry(operation, {
        maxAttempts: 3,
        baseDelay: 10,
        maxDelay: 100,
        backoffMultiplier: 2,
      });

      expect(result).toBe("success");
      expect(attempts).toBe(3);
    });

    it("should not retry non-retryable errors", async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        throw new ValidationError("Invalid input", {
          field: "test",
          value: "",
          constraints: [],
        });
      };

      await expect(
        withRetry(operation, {
          maxAttempts: 3,
          baseDelay: 10,
          maxDelay: 100,
          backoffMultiplier: 2,
        })
      ).rejects.toThrow("Invalid input");

      expect(attempts).toBe(1);
    });

    it("should respect retry error code filter", async () => {
      let attempts = 0;
      const operation = async () => {
        attempts++;
        throw new NetworkError("Network error", { url: "", method: "GET" });
      };

      await expect(
        withRetry(operation, {
          maxAttempts: 3,
          baseDelay: 10,
          maxDelay: 100,
          backoffMultiplier: 2,
          retryableErrors: ["DATABASE_ERROR"], // Only retry database errors
        })
      ).rejects.toThrow("Network error");

      expect(attempts).toBe(1);
    });
  });
});
