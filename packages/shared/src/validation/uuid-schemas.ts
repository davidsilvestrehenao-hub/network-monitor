/**
 * UUID Validation Schemas
 * Provides Zod schemas for UUID validation in APIs and forms
 */

import { z } from "zod";

// Simple UUID validation function (inline to avoid import issues)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUUID = (value: string): boolean => UUID_REGEX.test(value);
const UUID_VALIDATION_MESSAGE = "Invalid UUID format";

/**
 * Base UUID schema for single UUID validation
 */
export const UUIDSchema = z
  .string()
  .refine(isValidUUID, {
    message: UUID_VALIDATION_MESSAGE,
  })
  .brand<"UUID">();

/**
 * Optional UUID schema (can be undefined)
 */
export const OptionalUUIDSchema = UUIDSchema.optional();

/**
 * Nullable UUID schema (can be null)
 */
export const NullableUUIDSchema = UUIDSchema.nullable();

/**
 * Array of UUIDs schema
 */
export const UUIDArraySchema = z.array(UUIDSchema);

/**
 * Non-empty array of UUIDs schema
 */
export const NonEmptyUUIDArraySchema = z.array(UUIDSchema).min(1, {
  message: "At least one UUID is required",
});

/**
 * UUID or array of UUIDs schema
 */
export const UUIDOrArraySchema = z.union([UUIDSchema, UUIDArraySchema]);

/**
 * Query parameter UUID schema (handles string conversion)
 */
export const QueryUUIDSchema = z
  .string()
  .transform(val => val.trim())
  .refine(isValidUUID, {
    message: UUID_VALIDATION_MESSAGE,
  })
  .brand<"UUID">();

/**
 * Form input UUID schema (with trimming and normalization)
 */
export const FormUUIDSchema = z
  .string()
  .trim()
  .min(1, "UUID is required")
  .refine(isValidUUID, {
    message: UUID_VALIDATION_MESSAGE,
  })
  .transform(val => val.toLowerCase())
  .brand<"UUID">();

/**
 * Bulk operation UUID schema (for arrays in request bodies)
 */
export const BulkUUIDSchema = z.object({
  ids: NonEmptyUUIDArraySchema,
});

/**
 * ID parameter schema for API routes
 */
export const IDParamSchema = z.object({
  id: UUIDSchema,
});

/**
 * Pagination with UUID cursor schema
 */
export const UUIDCursorSchema = z.object({
  cursor: OptionalUUIDSchema,
  limit: z.number().int().min(1).max(1000).default(100),
});

/**
 * Search with UUID filters schema
 */
export const UUIDFilterSchema = z.object({
  ids: UUIDArraySchema.optional(),
  excludeIds: UUIDArraySchema.optional(),
});

/**
 * Entity relationship schema (parent-child UUIDs)
 */
export const EntityRelationshipSchema = z.object({
  parentId: UUIDSchema,
  childId: UUIDSchema,
});

/**
 * Batch update schema with UUIDs
 */
export const BatchUpdateSchema = z.object({
  updates: z.array(
    z.object({
      id: UUIDSchema,
      data: z.record(z.unknown()), // Generic data object
    })
  ),
});

/**
 * User-owned entity schema (includes ownerId)
 */
export const UserOwnedEntitySchema = z.object({
  id: UUIDSchema,
  ownerId: UUIDSchema,
});

/**
 * Audit trail schema with UUIDs
 */
export const AuditTrailSchema = z.object({
  entityId: UUIDSchema,
  userId: OptionalUUIDSchema,
  action: z.enum(["CREATE", "UPDATE", "DELETE"]),
  timestamp: z.date(),
});

// Export type inference helpers
export type UUIDType = z.infer<typeof UUIDSchema>;
export type UUIDArrayType = z.infer<typeof UUIDArraySchema>;
export type IDParamType = z.infer<typeof IDParamSchema>;
export type BulkUUIDType = z.infer<typeof BulkUUIDSchema>;
export type UUIDCursorType = z.infer<typeof UUIDCursorSchema>;
export type UUIDFilterType = z.infer<typeof UUIDFilterSchema>;
export type EntityRelationshipType = z.infer<typeof EntityRelationshipSchema>;
export type BatchUpdateType = z.infer<typeof BatchUpdateSchema>;
export type UserOwnedEntityType = z.infer<typeof UserOwnedEntitySchema>;
export type AuditTrailType = z.infer<typeof AuditTrailSchema>;

// Export commonly used schemas for convenience
export {
  UUIDSchema as UUID,
  OptionalUUIDSchema as OptionalUUID,
  NullableUUIDSchema as NullableUUID,
  UUIDArraySchema as UUIDArray,
  QueryUUIDSchema as QueryUUID,
  FormUUIDSchema as FormUUID,
  IDParamSchema as IDParam,
};
