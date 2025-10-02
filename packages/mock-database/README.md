# Mock Database Package

This package provides an in-memory database implementation that mimics Prisma's API for testing and development purposes.

## Overview

The mock database package provides a fully functional in-memory database that:

- **Stores Data in Arrays**: All data is stored in memory using arrays for each table
- **Implements Prisma API**: Provides the same interface as Prisma Client
- **Supports Querying**: Real querying with where clauses, ordering, and pagination
- **Auto-generates IDs**: Handles both UUID and auto-increment ID generation
- **Seeds Test Data**: Comes with realistic test data pre-loaded

## Core Component

- `MockPrisma` - In-memory database that implements `IPrismaService`

## Usage

```typescript
import { MockPrisma } from '@network-monitor/mock-database';

// Create mock database instance
const mockDb = new MockPrisma();
await mockDb.connect();

// Get the client (works like real Prisma)
const client = mockDb.getClient();

// Use exactly like Prisma
const users = await client.user.findMany();
const target = await client.monitoringTarget.create({
  data: {
    name: "Test Target",
    address: "https://example.com",
    ownerId: "user-1"
  }
});
```

## Features

- **Full Prisma API**: Supports findMany, findUnique, create, update, delete, etc.
- **Query Support**: Where clauses, ordering, pagination, and counting
- **Transactions**: Basic transaction support
- **Realistic Data**: Pre-seeded with test users, targets, and speed test URLs
- **Type Safety**: Full TypeScript support with proper Prisma-compatible types
- **Test Helpers**: Methods to clear data, reseed, and inspect current state

## Supported Operations

All standard Prisma operations are supported:

- `findUnique()` - Find single record by unique field
- `findMany()` - Find multiple records with filtering and pagination
- `findFirst()` - Find first matching record
- `create()` - Create new record
- `createMany()` - Create multiple records
- `update()` - Update existing record
- `updateMany()` - Update multiple records
- `delete()` - Delete record
- `deleteMany()` - Delete multiple records
- `count()` - Count records
- `upsert()` - Create or update record

## Test Helpers

```typescript
// Clear all data
mockDb.clearAllData();

// Reseed with initial test data
mockDb.reseedData();

// Get current data state
const data = mockDb.getData();
console.log('Current users:', data.users);
```

## Pre-seeded Data

The mock database comes with:
- Test user (`user-1`)
- Test monitoring target (`target-1`)
- Speed test URLs from CacheFly provider
