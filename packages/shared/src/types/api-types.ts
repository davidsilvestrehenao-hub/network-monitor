/**
 * Shared types for API-related functionality
 * These types are used for API context, requests, and responses
 */

// GraphQL context types
export interface GraphQLContextRequest {
  request: Request;
}

export interface APIContextRequest {
  request: Request;
}

// HTTP request types
export interface RequestWithBody<T = unknown> {
  body: T;
  headers: Record<string, string>;
  method: string;
  url: string;
}

// API response types moved to api-response-types.ts

export interface PaginatedResponse<T = unknown> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Error types (extends base APIError from interfaces)
export interface APIErrorDetails {
  code: string;
  message: string;
  // Justification: API error details can be any shape from external services
  // Using unknown ensures type safety while allowing flexibility for various error formats
  details?: unknown;
  timestamp: string;
}

// Authentication types
export interface AuthContext {
  user?: {
    id: string;
    email?: string;
    name?: string;
  };
  session?: {
    id: string;
    expires: Date;
  };
}

// Request metadata types
export interface RequestMetadata {
  userAgent?: string;
  ip?: string;
  timestamp: string;
  requestId: string;
}
