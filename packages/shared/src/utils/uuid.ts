/**
 * UUID Utilities
 * Provides UUID generation, validation, and type guard functions
 * Supports both UUID v4 (random) and validation for any UUID version
 */

import { randomUUID } from "crypto";

// UUID type definition
export type UUID = string & { readonly __brand: unique symbol };

// UUID validation regex (supports all UUID versions)
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Generate a new UUID v4 (random)
 * Uses Node.js crypto.randomUUID() for cryptographically secure generation
 */
export function generateUUID(): UUID {
  return randomUUID() as UUID;
}

/**
 * Validate if a string is a valid UUID
 * Supports all UUID versions (1-5)
 */
export function isValidUUID(value: string): boolean {
  return UUID_REGEX.test(value);
}

/**
 * Type guard to check if a value is a valid UUID
 * Narrows the type to UUID if validation passes
 */
export function isUUID(value: unknown): value is UUID {
  return typeof value === "string" && isValidUUID(value);
}

/**
 * Assert that a value is a valid UUID
 * Throws an error if validation fails
 */
export function assertUUID(
  value: unknown,
  fieldName = "value"
): asserts value is UUID {
  if (!isUUID(value)) {
    throw new Error(`${fieldName} must be a valid UUID, received: ${value}`);
  }
}

/**
 * Safely convert a string to UUID with validation
 * Returns null if the string is not a valid UUID
 */
export function toUUID(value: string): UUID | null {
  return isValidUUID(value) ? (value as UUID) : null;
}

/**
 * Convert a string to UUID with validation and error throwing
 * Throws an error if the string is not a valid UUID
 */
export function toUUIDOrThrow(value: string, fieldName = "value"): UUID {
  const uuid = toUUID(value);
  if (!uuid) {
    throw new Error(`${fieldName} must be a valid UUID, received: ${value}`);
  }
  return uuid;
}

/**
 * Validate an array of UUIDs
 * Returns true if all values are valid UUIDs
 */
export function areValidUUIDs(values: string[]): boolean {
  return values.every(isValidUUID);
}

/**
 * Filter an array to only include valid UUIDs
 * Returns a new array with only valid UUID strings
 */
export function filterValidUUIDs(values: string[]): UUID[] {
  return values.filter(isValidUUID) as UUID[];
}

/**
 * Normalize UUID string to lowercase
 * UUIDs are case-insensitive, but we standardize on lowercase
 */
export function normalizeUUID(uuid: string): string {
  return uuid.toLowerCase();
}

/**
 * Check if two UUIDs are equal (case-insensitive)
 */
export function uuidsEqual(uuid1: string, uuid2: string): boolean {
  return normalizeUUID(uuid1) === normalizeUUID(uuid2);
}

/**
 * Generate multiple UUIDs at once
 * Useful for bulk operations or testing
 */
export function generateUUIDs(count: number): UUID[] {
  return Array.from({ length: count }, () => generateUUID());
}

/**
 * Create a UUID from a string with validation
 * This is a type-safe constructor for UUID type
 */
export function createUUID(value: string): UUID {
  return toUUIDOrThrow(value, "UUID");
}

// Export commonly used constants
export const UUID_NIL = "00000000-0000-0000-0000-000000000000" as UUID;
export const UUID_MAX = "ffffffff-ffff-ffff-ffff-ffffffffffff" as UUID;

// Export validation patterns for use in schemas
export const UUID_VALIDATION_PATTERN = UUID_REGEX.source;
export const UUID_VALIDATION_MESSAGE =
  "Must be a valid UUID format (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)";
