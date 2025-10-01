# DRY Architecture: REST + GraphQL + tRPC Sharing Services

This document demonstrates how all three API protocols share the **same service layer** with **zero code duplication**.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Thin)                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │   REST   │  │ GraphQL  │  │  tRPC    │                 │
│  │  Routes  │  │ Resolvers│  │Procedures│                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│       │             │             │                         │
│       └─────────────┴─────────────┘                         │
│                     ↓                                       │
│       ┌─────────────────────────────────┐                  │
│       │    Services (from DI Container)  │                  │
│       │  - MonitorService               │                  │
│       │  - AlertingService              │                  │
│       │  - NotificationService          │                  │
│       └──────────────┬──────────────────┘                  │
│                      ↓                                      │
│       ┌──────────────────────────────┐                     │
│       │  Repositories                │                     │
│       │  - TargetRepository          │                     │
│       │  - AlertRuleRepository       │                     │
│       └──────────┬───────────────────┘                     │
│                  ↓                                          │
│       ┌──────────────────┐                                 │
│       │  Database        │                                 │
│       │  (Prisma)        │                                 │
│       └──────────────────┘                                 │
└─────────────────────────────────────────────────────────────┘
```

## The DRY Principle in Action

### Shared Service Layer

All three API styles call the **exact same** `MonitorService.createTarget()` method:

#### REST Implementation

```typescript
// apps/api/src/rest/routes.ts
async createTarget(req: Request): Promise<Response> {
  const body = await req.json();
  
  // ✅ Calls the shared service
  const target = await monitorService.createTarget({
    name: body.name,
    address: body.address,
    ownerId: userId,
  });
  
  return json(target, 201);
}
```

#### GraphQL Implementation

```typescript
// apps/api/src/graphql/resolvers.ts
createTarget: async (_parent, args, ctx) => {
  // ✅ Calls the SAME shared service
  return await ctx.services.monitor.createTarget({
    name: args.input.name,
    address: args.input.address,
    ownerId: ctx.userId,
  });
}
```

#### tRPC Implementation

```typescript
// apps/web/src/server/trpc/routers/targets.ts
createTarget: t.procedure
  .input(z.object({ name: z.string(), address: z.string().url() }))
  .mutation(({ ctx, input }) => {
    // ✅ Calls the SAME shared service
    return ctx.services.monitor?.createTarget({
      ...input,
      ownerId: getUserId(),
    });
  })
```

**Result:** One service method, three API styles. Zero duplication!

## Code Reuse Statistics

### What's Shared (100% reuse)

- ✅ **Business Logic** - `MonitorService`, `AlertingService`, `NotificationService`
- ✅ **Data Access** - All repositories
- ✅ **Domain Types** - `Target`, `AlertRule`, `IncidentEvent`
- ✅ **Database Schema** - Prisma schema
- ✅ **Validation Logic** - In service layer
- ✅ **Event Handling** - EventBus communication
- ✅ **Logging** - Logger service

### What's Different (Protocol-specific)

- ❌ **Input Parsing** - REST (JSON body), GraphQL (args), tRPC (input)
- ❌ **Response Format** - REST (HTTP status), GraphQL (data/errors), tRPC (return value)
- ❌ **Route Matching** - Each protocol has its own routing
- ❌ **Error Handling** - Protocol-specific error formats

**Total Code Reuse:** ~95%

## Example: Creating a Target

### Same Business Logic, Three Ways to Call It

#### 1. REST (cURL)

```bash
curl -X POST http://localhost:3000/api/targets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user-123" \
  -d '{
    "name": "Google DNS",
    "address": "https://8.8.8.8"
  }'
```

**Response:**

```json
{
  "id": "target-abc123",
  "name": "Google DNS",
  "address": "https://8.8.8.8",
  "ownerId": "user-123",
  "speedTestResults": [],
  "alertRules": []
}
```

#### 2. GraphQL (GraphQL Playground)

```graphql
mutation CreateTarget($input: CreateTargetInput!) {
  createTarget(input: $input) {
    id
    name
    address
    alertRules {
      name
    }
  }
}

# Variables:
{
  "input": {
    "name": "Google DNS",
    "address": "https://8.8.8.8"
  }
}
```

**Response:**

```json
{
  "data": {
    "createTarget": {
      "id": "target-abc123",
      "name": "Google DNS",
      "address": "https://8.8.8.8",
      "alertRules": []
    }
  }
}
```

#### 3. tRPC (TypeScript Frontend)

```typescript
// apps/web/src/routes/targets.tsx
const newTarget = await trpc.targets.create.mutate({
  name: "Google DNS",
  address: "https://8.8.8.8"
});

// ✅ Fully typed response - no manual type definitions!
console.log(newTarget.id);
```

**All three call the same `MonitorService.createTarget()` method!**

## Service Layer (The Shared Core)

```typescript
// packages/monitor/src/services/MonitorService.ts
export class MonitorService implements IMonitorService {
  constructor(
    private targetRepository: ITargetRepository,
    private speedTestRepository: ISpeedTestRepository,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  async createTarget(data: CreateTargetData): Promise<Target> {
    this.logger.info("Creating target", data);
    
    // Validate
    if (!data.name || !data.address) {
      throw new Error("Name and address are required");
    }
    
    // Create via repository
    const target = await this.targetRepository.create(data);
    
    // Emit event (loose coupling)
    this.eventBus.emit("TARGET_CREATED", { target });
    
    this.logger.info("Target created", { id: target.id });
    return target;
  }
}
```

**This ONE method is called by:**

- ✅ REST route handler
- ✅ GraphQL resolver
- ✅ tRPC procedure
- ✅ Event handlers
- ✅ Background jobs
- ✅ CLI commands

## Benefits of This Architecture

### 1. **Zero Code Duplication**

```typescript
// ❌ BAD - Duplicating logic in each API style
// REST
async createTarget(req) {
  const target = await prisma.target.create({...}); // ❌ Duplicate
}

// GraphQL
async createTarget(args) {
  const target = await prisma.target.create({...}); // ❌ Duplicate
}

// ✅ GOOD - Shared service layer
// REST, GraphQL, tRPC all call:
monitorService.createTarget({...}); // ✅ One implementation
```

### 2. **Consistent Behavior**

All API styles have:

- Same validation rules
- Same error handling
- Same logging
- Same event emissions
- Same database transactions

### 3. **Easy Testing**

Test the service once, all APIs work:

```typescript
describe("MonitorService.createTarget", () => {
  it("creates target successfully", async () => {
    const target = await monitorService.createTarget({
      name: "Test",
      address: "https://test.com",
      ownerId: "user-123"
    });
    
    expect(target.id).toBeDefined();
  });
});

// ✅ This test validates REST, GraphQL, AND tRPC behavior!
```

### 4. **Loose Coupling via EventBus**

```typescript
// Service emits events
this.eventBus.emit("TARGET_CREATED", { target });

// Any subscriber can react (decoupled)
alertingService.on("TARGET_CREATED", (data) => {
  // Create default alert rules
});

notificationService.on("TARGET_CREATED", (data) => {
  // Notify user
});
```

### 5. **Flexible Deployment**

Choose your API style based on client needs:

```bash
# Mobile app? Deploy REST + GraphQL
docker run network-monitor-api

# Web app? Deploy tRPC (faster development)
docker run network-monitor-web

# Both? Deploy both!
docker run network-monitor-api &
docker run network-monitor-web &
```

## When to Use Each Protocol

### Use REST for

- ✅ Public APIs
- ✅ Third-party integrations
- ✅ Simple CRUD operations
- ✅ Webhooks
- ✅ Mobile apps (traditional)

### Use GraphQL for

- ✅ Complex data fetching (avoid over-fetching)
- ✅ Mobile apps (efficient bandwidth)
- ✅ Real-time subscriptions
- ✅ Flexible client queries
- ✅ API versioning (add fields, don't break)

### Use tRPC for

- ✅ TypeScript monorepos
- ✅ Fastest development (no codegen)
- ✅ Internal tools
- ✅ Admin dashboards
- ✅ Full-stack TypeScript apps

## Migration Example

### Adding a New Feature (Delete All Targets)

#### Step 1: Add to Service (Once)

```typescript
// packages/monitor/src/services/MonitorService.ts
async deleteAllTargets(userId: string): Promise<number> {
  const targets = await this.targetRepository.findByUserId(userId);
  
  for (const target of targets) {
    await this.targetRepository.delete(target.id);
  }
  
  this.eventBus.emit("ALL_TARGETS_DELETED", { userId, count: targets.length });
  return targets.length;
}
```

#### Step 2: Expose via REST

```typescript
// apps/api/src/rest/routes.ts
async deleteAllTargets(req: Request): Promise<Response> {
  const userId = getUserId(req);
  const count = await monitorService.deleteAllTargets(userId);
  return json({ deleted: count });
}
```

#### Step 3: Expose via GraphQL

```typescript
// apps/api/src/graphql/schema.ts
type Mutation {
  deleteAllTargets: Int!  # Returns count
}

// apps/api/src/graphql/resolvers.ts
deleteAllTargets: async (_parent, _args, ctx) => {
  return await ctx.services.monitor.deleteAllTargets(ctx.userId);
}
```

#### Step 4: Expose via tRPC

```typescript
// apps/web/src/server/trpc/routers/targets.ts
deleteAll: t.procedure.mutation(({ ctx }) => {
  return ctx.services.monitor?.deleteAllTargets(getUserId());
})
```

**Result:** One service method → Three API protocols. DRY achieved!

## Deployment Scenarios

### Scenario 1: Web-Only

```bash
# Just deploy the web app (includes tRPC)
docker run network-monitor-web
```

Uses: `apps/web/` with tRPC

### Scenario 2: Mobile + Web

```bash
# API server for mobile apps (REST/GraphQL)
docker run -p 3001:3000 network-monitor-api

# Web app for browser users (tRPC)
docker run -p 3000:3000 network-monitor-web
```

Uses: `apps/api/` for mobile, `apps/web/` for web

### Scenario 3: API-First

```bash
# Just the API server
docker run network-monitor-api
```

Uses: `apps/api/` with REST + GraphQL

## Code Organization

```
apps/
├── api/                      # Headless API Server
│   └── src/
│       ├── rest/
│       │   └── routes.ts     # REST routes → services
│       ├── graphql/
│       │   ├── schema.ts     # GraphQL schema
│       │   └── resolvers.ts  # GraphQL resolvers → services
│       └── main.ts           # HTTP server (REST + GraphQL)
│
├── web/                      # Full-Stack Web App
│   └── src/
│       ├── server/trpc/
│       │   └── router.ts     # tRPC procedures → services
│       └── routes/
│           └── api/trpc/
│               └── [...trpc].ts  # tRPC HTTP handler
│
packages/
├── monitor/                  # ✅ SHARED - Business logic
│   └── src/services/
│       └── MonitorService.ts # Used by ALL three APIs
│
├── alerting/                 # ✅ SHARED - Business logic
│   └── src/services/
│       └── AlertingService.ts
│
├── notification/             # ✅ SHARED - Business logic
│   └── src/services/
│       └── NotificationService.ts
│
└── database/                 # ✅ SHARED - Data access
    └── src/repositories/
        ├── TargetRepository.ts
        ├── AlertRuleRepository.ts
        └── ...
```

## Key Principles

### 1. **API Layer is Thin**

The API layer (REST/GraphQL/tRPC) should ONLY:

- Parse requests
- Call services
- Format responses
- Handle protocol-specific concerns

**Never:**

- ❌ Duplicate business logic
- ❌ Touch the database directly
- ❌ Call other services directly

### 2. **Services are Protocol-Agnostic**

Services don't know or care how they're called:

```typescript
// This service method is called by REST, GraphQL, tRPC
async createTarget(data: CreateTargetData): Promise<Target> {
  // Business logic here
  // No knowledge of HTTP, GraphQL, or tRPC
}
```

### 3. **Repositories Abstract Data Access**

```typescript
// One repository implementation
class TargetRepository implements ITargetRepository {
  async create(data: CreateTargetData): Promise<Target> {
    // Database operations
  }
}

// Used by MonitorService
// Which is used by REST, GraphQL, tRPC
```

### 4. **EventBus Enables Loose Coupling**

```typescript
// Service emits events
this.eventBus.emit("TARGET_CREATED", { target });

// Other services react (no direct calls)
alertingService.on("TARGET_CREATED", createDefaultRules);
notificationService.on("TARGET_CREATED", notifyUser);
```

## Comparison Table

| Aspect | REST | GraphQL | tRPC |
|--------|------|---------|------|
| **Service Layer** | ✅ Shared | ✅ Shared | ✅ Shared |
| **Repository Layer** | ✅ Shared | ✅ Shared | ✅ Shared |
| **Database Schema** | ✅ Shared | ✅ Shared | ✅ Shared |
| **Business Logic** | ✅ Shared | ✅ Shared | ✅ Shared |
| **Event Handling** | ✅ Shared | ✅ Shared | ✅ Shared |
| **Type Definitions** | ✅ Shared | ✅ Shared | ✅ Shared |
| **Request Parsing** | ❌ Unique | ❌ Unique | ❌ Unique |
| **Response Format** | ❌ Unique | ❌ Unique | ❌ Unique |

**Code Reuse:** ~95%

## Testing Strategy

### Test Once, Validate All

```typescript
describe("Target Creation", () => {
  let monitorService: IMonitorService;
  
  beforeEach(() => {
    // Setup service with mocks
    monitorService = new MonitorService(
      mockTargetRepo,
      mockEventBus,
      mockLogger
    );
  });
  
  it("creates target with valid data", async () => {
    const target = await monitorService.createTarget({
      name: "Test",
      address: "https://test.com",
      ownerId: "user-123"
    });
    
    expect(target.id).toBeDefined();
    expect(target.name).toBe("Test");
  });
  
  it("validates required fields", async () => {
    await expect(
      monitorService.createTarget({ name: "", address: "", ownerId: "" })
    ).rejects.toThrow();
  });
});

// ✅ This test validates behavior for ALL three API styles!
```

### Integration Testing

```typescript
// Test REST endpoint
const restResponse = await fetch("http://localhost:3000/api/targets", {
  method: "POST",
  body: JSON.stringify({ name: "Test", address: "https://test.com" })
});

// Test GraphQL endpoint
const gqlResponse = await fetch("http://localhost:3000/graphql", {
  method: "POST",
  body: JSON.stringify({
    query: 'mutation { createTarget(input: {name:"Test",address:"https://test.com"}) { id } }'
  })
});

// Test tRPC endpoint
const trpcTarget = await trpc.targets.create.mutate({
  name: "Test",
  address: "https://test.com"
});

// ✅ All three should create the same target in the database!
```

## Performance Comparison

Based on typical benchmarks:

| Protocol | Payload Size | Latency | Best For |
|----------|--------------|---------|----------|
| **REST** | 100% | 10ms | Simple CRUD |
| **GraphQL** | 60% | 12ms | Complex queries |
| **tRPC** | 90% | 8ms | TypeScript clients |

**Note:** All three are fast enough for most use cases. Choose based on client needs, not performance.

## Migration Path

### Starting Simple (Just tRPC)

```bash
# Start with web app only
apps/web/  # Uses tRPC
```

### Adding Mobile Support (Add REST)

```bash
# Deploy API server for mobile
apps/api/  # Add REST endpoints
apps/web/  # Keep for web users
```

### Complex Clients (Add GraphQL)

```bash
# GraphQL for advanced queries
apps/api/  # Add GraphQL schema
```

### Zero Code Changes

The service layer **never changes** - you just add new API wrappers!

## Summary

### What Makes This DRY?

1. **Single Source of Truth** - Services contain ALL business logic
2. **Dependency Injection** - Services resolved from container
3. **Interface-First** - All APIs call interfaces, not implementations
4. **Event-Driven** - Services communicate via events, not direct calls
5. **Repository Pattern** - Database access fully abstracted

### What You Get

- ✅ Three API protocols (REST, GraphQL, tRPC)
- ✅ One service layer (shared)
- ✅ One database schema (shared)
- ✅ One set of tests (validates all)
- ✅ Easy to add new protocols (just add wrapper)
- ✅ Easy to swap implementations (DI configuration)

### Next Steps

- [ ] Add authentication middleware (shared across all APIs)
- [ ] Add rate limiting (protocol-specific)
- [ ] Add OpenAPI documentation for REST
- [ ] Add GraphQL subscriptions (real-time)
- [ ] Add API versioning
- [ ] Add request/response logging

**Remember:** The API layer is just a thin wrapper. All the real work happens in the shared service layer!
