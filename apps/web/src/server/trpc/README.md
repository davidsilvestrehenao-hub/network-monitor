# tRPC Router Structure

This directory contains the tRPC API implementation organized into modular, maintainable router files.

## Directory Structure

```
trpc/
├── router.ts              # Main router that composes all sub-routers
├── trpc.ts                # Shared tRPC instance and utilities
└── routers/
    ├── index.ts           # Barrel export for all routers
    ├── targets.ts         # Target CRUD and monitoring operations
    ├── speedTests.ts      # Speed test operations
    ├── alertRules.ts      # Alert rule management
    ├── incidents.ts       # Incident event management
    ├── notifications.ts   # Notification operations
    ├── pushSubscriptions.ts # Push subscription management
    └── users.ts           # User profile operations
```

## Architecture

### Main Router (`router.ts`)

The main router composes all domain-specific routers:

```typescript
export const appRouter = t.router({
  hello: ...,                          // Health check
  targets: targetsRouter,              // Target operations
  speedTests: speedTestsRouter,        // Speed test operations
  alertRules: alertRulesRouter,        // Alert rule operations
  incidents: incidentsRouter,          // Incident operations
  notifications: notificationsRouter,  // Notification operations
  pushSubscriptions: pushSubscriptionsRouter,
  users: usersRouter,
  // Legacy compatibility endpoints...
});
```

### Domain Routers

Each domain router is self-contained and focused on a single resource:

**`routers/targets.ts`** - Monitoring Target Operations
- `getAll` - Get all targets for user
- `getById` - Get specific target
- `create` - Create new target
- `update` - Update target
- `delete` - Delete target
- `startMonitoring` - Start automated monitoring
- `stopMonitoring` - Stop monitoring
- `getActiveTargets` - Get list of active monitors

**`routers/speedTests.ts`** - Speed Test Operations
- `getByTargetId` - Get results for target
- `getLatest` - Get latest result
- `runTest` - Run test immediately

**`routers/alertRules.ts`** - Alert Rule Management
- `getByTargetId` - Get rules for target
- `getById` - Get specific rule
- `create` - Create new rule
- `update` - Update rule
- `delete` - Delete rule
- `toggleEnabled` - Enable/disable rule

**`routers/incidents.ts`** - Incident Event Management
- `getByTargetId` - Get incidents for target
- `getUnresolved` - Get all unresolved
- `getUnresolvedByTargetId` - Get unresolved for target
- `resolve` - Resolve incident
- `resolveByTargetId` - Resolve all for target

**`routers/notifications.ts`** - Notification Operations
- `getByUserId` - Get user notifications
- `getUnread` - Get unread notifications
- `markAsRead` - Mark as read
- `markAllAsRead` - Mark all as read
- `delete` - Delete notification

**`routers/pushSubscriptions.ts`** - Push Subscription Management
- `getByUserId` - Get subscriptions
- `create` - Register subscription
- `delete` - Delete by ID
- `deleteByEndpoint` - Delete by endpoint

**`routers/users.ts`** - User Profile Operations
- `getCurrent` - Get current user
- `getById` - Get user by ID
- `update` - Update profile

## Shared Utilities (`trpc.ts`)

The `trpc.ts` file exports:

1. **`t`** - The tRPC instance with AppContext
2. **`getUserId()`** - Helper to get current user ID (TODO: Replace with real auth)

```typescript
import { t, getUserId } from "../trpc";

export const myRouter = t.router({
  myProcedure: t.procedure.query(({ ctx }) => {
    const userId = getUserId();
    // ... implementation
  }),
});
```

## Adding a New Router

To add a new domain router:

1. **Create the router file** in `routers/`:
   ```typescript
   // routers/myDomain.ts
   import { z } from "zod";
   import { t } from "../trpc";

   export const myDomainRouter = t.router({
     getAll: t.procedure.query(({ ctx }) => {
       return ctx.repositories.myDomain?.findAll();
     }),
     // ... more procedures
   });
   ```

2. **Export from `routers/index.ts`**:
   ```typescript
   export { myDomainRouter } from "./myDomain";
   ```

3. **Add to main router**:
   ```typescript
   import { myDomainRouter } from "./routers";

   export const appRouter = t.router({
     // ...
     myDomain: myDomainRouter,
   });
   ```

## Best Practices

### 1. Keep Routers Focused
Each router should handle operations for a single domain/resource.

### 2. Use Zod for Validation
Always validate inputs with Zod schemas:
```typescript
.input(z.object({
  name: z.string().min(1),
  email: z.string().email(),
}))
```

### 3. Proper Error Handling
Use TRPCError for structured errors:
```typescript
import { TRPCError } from "@trpc/server";

if (!resource) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Resource not found",
  });
}
```

### 4. Follow Naming Conventions
- **Queries**: `getAll`, `getById`, `getByUserId`, etc.
- **Mutations**: `create`, `update`, `delete`, `toggle...`, etc.

### 5. Document Complex Logic
Add comments for non-obvious business logic:
```typescript
// Monitoring intervals must be between 1 second and 5 minutes
intervalMs: z.number().min(1000).max(300000)
```

## Type Safety

All routers benefit from end-to-end type safety:

```typescript
// Frontend automatically gets types
const targets = await trpc.targets.getAll.query();
//    ^? Target[]

await trpc.targets.create.mutate({
  name: "Test",
  address: "https://example.com"
});
```

## Testing

Test individual routers in isolation:

```typescript
import { targetsRouter } from "../routers/targets";

const ctx = {
  services: { monitor: mockMonitorService },
  repositories: {}
};

const caller = targetsRouter.createCaller(ctx);
const result = await caller.getAll();
```

## Migration Guide

When refactoring routes:

1. Move procedures to appropriate domain router
2. Update imports in main router
3. Update frontend calls (if API structure changes)
4. Test thoroughly

## Related Documentation

- [tRPC API Reference](../../TRPC-API-REFERENCE.md) - Complete API documentation
- [tRPC Architecture](../../TRPC-ARCHITECTURE.md) - Architecture patterns
- [Official tRPC Docs](https://trpc.io/docs) - tRPC documentation

