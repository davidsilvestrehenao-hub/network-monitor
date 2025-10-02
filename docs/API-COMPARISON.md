# API Comparison: REST vs GraphQL vs tRPC

This document compares the three API protocols supported by the Network Monitor and explains when to use each.

## Quick Comparison

| Feature | REST | GraphQL | tRPC |
|---------|------|---------|------|
| **Protocol** | HTTP/JSON | HTTP/JSON | HTTP/JSON |
| **Learning Curve** | ⭐ Easy | ⭐⭐⭐ Medium | ⭐⭐ Easy (if you know TS) |
| **Type Safety** | ❌ Manual | ⭐⭐ Codegen | ⭐⭐⭐ Automatic |
| **Client Support** | ✅ Any language | ✅ Any language | ❌ TypeScript only |
| **Browser Support** | ✅ Full | ✅ Full | ✅ Full |
| **Over-fetching** | ❌ Common | ✅ Prevents | ✅ Prevents |
| **Documentation** | OpenAPI/Swagger | Built-in introspection | TypeScript types |
| **Real-time** | ❌ Polling/SSE | ✅ Subscriptions | ⭐ Limited |
| **Caching** | ✅ HTTP caching | ⭐⭐ Smart caching | ⭐ Simple |
| **Versioning** | URL/Header | ⭐⭐ Field-level | ⭐ Type evolution |
| **Development Speed** | ⭐⭐ Medium | ⭐⭐ Medium | ⭐⭐⭐ Fast |

## Architecture in This Project

### All Three Share the Same Core

```text
apps/api/                     # REST + GraphQL
   └── src/
       ├── rest/routes.ts     ──┐
       └── graphql/            │
           ├── schema.ts       ├──→ Services (DI Container)
           └── resolvers.ts  ──┘

apps/web/                     # tRPC
   └── src/server/trpc/
       └── router.ts          ───→ Services (DI Container)

packages/                     # ✅ SHARED LAYER
   ├── monitor/
   │   └── MonitorService     ←── All APIs call this!
   ├── alerting/
   │   └── AlertingService    ←── All APIs call this!
   └── notification/
       └── NotificationService ←── All APIs call this!
```

## Detailed Comparison

### 1. REST API

**Deployed in:** `apps/api/`

**Example - Create Target:**

```bash
curl -X POST http://localhost:3000/api/targets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer abc123" \
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

**Pros:**

- ✅ Universal - works with any HTTP client
- ✅ Simple to understand
- ✅ Good HTTP caching
- ✅ Established conventions
- ✅ Easy debugging (curl, Postman)

**Cons:**

- ❌ Over-fetching (returns all fields)
- ❌ Under-fetching (need multiple requests)
- ❌ No type safety
- ❌ Manual client code

**Best For:**

- Public APIs
- Mobile apps (iOS, Android, Flutter)
- Webhooks
- Third-party integrations
- Simple CRUD

---

### 2. GraphQL API

**Deployed in:** `apps/api/`

**Example - Create Target:**

```graphql
mutation CreateTarget($input: CreateTargetInput!) {
  createTarget(input: $input) {
    id
    name
    # Only request fields you need!
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
      "name": "Google DNS"
    }
  }
}
```

**Example - Complex Query (Single Request):**

```graphql
query Dashboard {
  targets {
    id
    name
    status
    alertRules {
      name
      enabled
      threshold
    }
    speedTestResults(limit: 10) {
      ping
      download
      createdAt
    }
  }
  unresolvedIncidents {
    description
    timestamp
  }
}
```

**Pros:**

- ✅ No over-fetching (request exact fields)
- ✅ No under-fetching (combine queries)
- ✅ Strong typing with introspection
- ✅ Built-in documentation (Playground)
- ✅ Real-time subscriptions
- ✅ Versioning without breaking changes

**Cons:**

- ❌ More complex than REST
- ❌ Requires GraphQL client library
- ❌ Harder to cache
- ❌ Steep learning curve

**Best For:**

- Mobile apps (bandwidth-efficient)
- Complex data requirements
- Real-time applications
- Rapidly evolving APIs
- Multiple client types

---

### 3. tRPC API

**Deployed in:** `apps/web/`

**Example - Create Target:**

```typescript
// Frontend code (TypeScript)
const newTarget = await trpc.targets.create.mutate({
  name: "Google DNS",
  address: "https://8.8.8.8"
});

// ✅ Fully typed - IDE autocomplete works!
console.log(newTarget.id);        // TypeScript knows this exists
console.log(newTarget.name);      // TypeScript knows this exists
console.log(newTarget.invalid);   // ❌ TypeScript error!
```

**Pros:**

- ✅ **Best type safety** (end-to-end)
- ✅ **Fastest development** (no codegen)
- ✅ **Automatic IntelliSense** in IDE
- ✅ **Compile-time errors** (catch bugs early)
- ✅ **Refactor-friendly** (rename propagates)
- ✅ **Simple** (feels like calling functions)

**Cons:**

- ❌ **TypeScript only** (no Python, Go, Swift clients)
- ❌ **Monorepo recommended**
- ❌ **Not for public APIs**
- ❌ **Limited real-time support**

**Best For:**

- TypeScript monorepos
- Full-stack TypeScript apps
- Internal tools
- Admin dashboards
- Rapid prototyping

---

## Real-World Usage Examples

### Scenario 1: Mobile App (iOS + Android)

**Problem:** Need to support Swift (iOS) and Kotlin (Android)

**Solution:** Use **REST** or **GraphQL**

```swift
// iOS (Swift) - Can use REST or GraphQL
let response = try await URLSession.shared.data(from: 
  URL(string: "http://api.example.com/api/targets")!
)
```

```kotlin
// Android (Kotlin) - Can use REST or GraphQL
val response = client.get("http://api.example.com/api/targets")
```

**Deployment:**

```bash
# Deploy REST/GraphQL API server
docker run -p 3001:3000 network-monitor-api
```

---

### Scenario 2: TypeScript Web App

**Problem:** Want fastest development with full type safety

**Solution:** Use **tRPC**

```typescript
// Frontend - Feels like calling local functions
const targets = await trpc.targets.getAll.query();
//    ^? Target[] - TypeScript infers this!

await trpc.targets.create.mutate({
  name: "Test",
  address: "https://test.com"
  // ✅ TypeScript validates this at compile time
});
```

**Deployment:**

```bash
# Deploy full-stack web app
docker run network-monitor-web
```

---

### Scenario 3: Mixed Clients

**Problem:** Web app (TypeScript) + Mobile apps (Swift/Kotlin) + Webhooks

**Solution:** Deploy **both** `apps/api` and `apps/web`

```bash
# API server for mobile/webhooks (REST + GraphQL)
docker run -p 3001:3000 network-monitor-api

# Web app for browsers (tRPC)
docker run -p 3000:3000 network-monitor-web
```

**Both share the same database and services!**

---

## Feature Comparison

### Creating a Target

#### REST

```bash
POST /api/targets
{
  "name": "Google",
  "address": "https://google.com"
}

# Status: 201 Created
# Returns: Full target object
```

#### GraphQL

```graphql
mutation {
  createTarget(input: {
    name: "Google"
    address: "https://google.com"
  }) {
    id        # ✅ Request only what you need
    name
  }
}
```

#### tRPC

```typescript
const target = await trpc.targets.create.mutate({
  name: "Google",
  address: "https://google.com"
});
// ✅ Full TypeScript inference
```

---

### Getting Multiple Resources

#### REST (Multiple Requests)

```bash
# ❌ Need 3 requests for complete data
GET /api/targets/abc123
GET /api/targets/abc123/alert-rules
GET /api/targets/abc123/speed-tests
```

#### GraphQL (Single Request)

```graphql
# ✅ One request gets everything
query {
  target(id: "abc123") {
    id
    name
    alertRules {
      name
      threshold
    }
    speedTestResults(limit: 10) {
      ping
      download
    }
  }
}
```

#### tRPC (Multiple Requests, but typed)

```typescript
// ❌ Still multiple requests
const target = await trpc.targets.getById.query({ id: "abc123" });
const rules = await trpc.alertRules.getByTargetId.query({ targetId: "abc123" });

// ✅ But fully typed and simple
```

---

## Real-Time Updates

### REST

```typescript
// ❌ Polling required
setInterval(async () => {
  const targets = await fetch("/api/targets");
  // Update UI
}, 5000);
```

### GraphQL

```graphql
# ✅ Native subscriptions
subscription {
  targetUpdated(targetId: "abc123") {
    id
    name
    speedTestResults {
      ping
    }
  }
}
```

### tRPC

```typescript
// ⭐ Limited - uses WebSockets
trpc.targets.onUpdate.subscribe(undefined, {
  onData: (target) => {
    console.log("Updated:", target);
  }
});
```

---

## Development Experience

### Adding a New Feature: "Pause Monitoring"

#### Step 1: Add to Service (Once)

```typescript
// packages/monitor/src/services/MonitorService.ts
async pauseMonitoring(targetId: string): Promise<void> {
  this.logger.info("Pausing monitoring", { targetId });
  this.activeIntervals.get(targetId)?.pause();
  this.eventBus.emit("MONITORING_PAUSED", { targetId });
}
```

#### Step 2: Expose via REST

```typescript
// apps/api/src/rest/routes.ts
if (action === "pause") {
  await monitorService.pauseMonitoring(id);
  return json({ success: true });
}
```

#### Step 3: Expose via GraphQL

```graphql
# apps/api/src/graphql/schema.ts
type Mutation {
  pauseMonitoring(targetId: String!): MonitoringStatus!
}

# apps/api/src/graphql/resolvers.ts
pauseMonitoring: async (_parent, args, ctx) => {
  await ctx.services.monitor.pauseMonitoring(args.targetId);
  return { success: true, targetId: args.targetId };
}
```

#### Step 4: Expose via tRPC

```typescript
// apps/web/src/server/trpc/routers/targets.ts
pauseMonitoring: t.procedure
  .input(z.object({ targetId: z.string() }))
  .mutation(({ ctx, input }) => {
    return ctx.services.monitor?.pauseMonitoring(input.targetId);
  })
```

**Time Investment:**

- Service implementation: ~30 minutes
- REST exposure: ~5 minutes
- GraphQL exposure: ~10 minutes
- tRPC exposure: ~5 minutes

**Total:** ~50 minutes for all three protocols!

---

## Performance Benchmarks

Based on typical usage:

### Payload Size

```text
REST GET /api/targets/abc123:
  Request: 150 bytes
  Response: 2.5 KB (all fields)

GraphQL query { target(id: "abc123") { id name } }:
  Request: 180 bytes
  Response: 150 bytes (only requested fields)
  
tRPC targets.getById({ id: "abc123" }):
  Request: 160 bytes
  Response: 2.5 KB (all fields)
```

**Winner:** GraphQL for bandwidth efficiency

### Request Count

```text
Scenario: Get target + rules + results

REST:
  3 requests (target, rules, results)
  Total latency: 30ms

GraphQL:
  1 request (nested query)
  Total latency: 15ms
  
tRPC:
  3 requests (separate procedures)
  Total latency: 24ms
```

**Winner:** GraphQL for complex queries

### Development Speed

```text
Adding new endpoint:

REST:
  - Define route ✍️
  - Write handler ✍️✍️
  - Update OpenAPI docs ✍️
  - Generate client code ✍️✍️
  Time: ~30 minutes

GraphQL:
  - Add to schema ✍️
  - Write resolver ✍️✍️
  - Generate types ✍️
  Time: ~20 minutes
  
tRPC:
  - Add procedure ✍️
  - Types auto-generate ✅
  Time: ~5 minutes
```

**Winner:** tRPC for development speed

---

## Recommendations

### Use REST When

1. ✅ Building a **public API**
2. ✅ Need **universal client support**
3. ✅ Have **simple data structures**
4. ✅ Want **familiar conventions**
5. ✅ Need **HTTP caching**

**Example:** API for third-party integrations

---

### Use GraphQL When

1. ✅ Clients have **different data needs**
2. ✅ Building a **mobile app** (save bandwidth)
3. ✅ Need **real-time subscriptions**
4. ✅ Want to **avoid versioning hell**
5. ✅ Have **complex, nested data**

**Example:** Mobile app with complex UI

---

### Use tRPC When

1. ✅ **Full TypeScript stack**
2. ✅ Want **fastest development**
3. ✅ Building **internal tools**
4. ✅ Need **end-to-end type safety**
5. ✅ Working in a **monorepo**

**Example:** Web admin dashboard

---

## Which Should You Deploy?

### Deployment Decision Tree

```text
┌─ What clients do you have?
│
├─ TypeScript web app only?
│  └─ Deploy apps/web/ (tRPC only)
│
├─ Mobile apps (iOS/Android)?
│  └─ Deploy apps/api/ (REST + GraphQL)
│
├─ Both web + mobile?
│  └─ Deploy both:
│     - apps/api/ for mobile
│     - apps/web/ for web users
│
└─ Public API for third parties?
   └─ Deploy apps/api/ (REST + GraphQL)
```

### Cost Comparison

**Single Deployment (tRPC only):**

```bash
docker run network-monitor-web
# Cost: ~$10/month (single container)
```

**Dual Deployment (All protocols):**

```bash
docker run network-monitor-api  # REST + GraphQL
docker run network-monitor-web  # tRPC + Frontend
# Cost: ~$20/month (two containers)
# Database: Shared (same PostgreSQL)
```

---

## Migration Paths

### Path 1: Start Simple → Scale

```text
Week 1: Deploy apps/web/ (tRPC only)
Week 4: Mobile app needed → Add apps/api/ (REST)
Week 8: Complex queries → Enable GraphQL on apps/api/
```

### Path 2: API-First

```text
Week 1: Deploy apps/api/ (REST + GraphQL)
Week 2: Build mobile app (consume REST)
Week 4: Add web frontend → Add apps/web/ (tRPC)
```

### Path 3: All-In

```text
Week 1: Deploy both apps/api/ and apps/web/
        - Use apps/api/ for mobile
        - Use apps/web/ for browser
```

**All paths work because the service layer is shared!**

---

## Client Examples

### REST Client (Python)

```python
import requests

# Create target
response = requests.post(
    "http://localhost:3000/api/targets",
    json={
        "name": "Google DNS",
        "address": "https://8.8.8.8"
    },
    headers={"Authorization": "Bearer user-123"}
)

target = response.json()
print(f"Created target: {target['id']}")
```

### GraphQL Client (JavaScript)

```javascript
const response = await fetch("http://localhost:3000/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer user-123"
  },
  body: JSON.stringify({
    query: `
      mutation CreateTarget($input: CreateTargetInput!) {
        createTarget(input: $input) {
          id
          name
        }
      }
    `,
    variables: {
      input: {
        name: "Google DNS",
        address: "https://8.8.8.8"
      }
    }
  })
});

const { data } = await response.json();
console.log("Created target:", data.createTarget.id);
```

### tRPC Client (TypeScript)

```typescript
import { trpc } from "~/lib/trpc";

// ✅ Full type safety - no manual types!
const newTarget = await trpc.targets.create.mutate({
  name: "Google DNS",
  address: "https://8.8.8.8"
});

console.log("Created target:", newTarget.id);
//                             ^? string (TypeScript infers this!)
```

---

## Conclusion

### The Golden Rule

**All three APIs are just thin wrappers around the same service layer.**

```typescript
// The ONLY implementation of business logic:
class MonitorService {
  async createTarget(data: CreateTargetData): Promise<Target> {
    // ✅ ONE place for business logic
    // ✅ Called by REST, GraphQL, and tRPC
    // ✅ Easy to test
    // ✅ Easy to maintain
  }
}
```

### Choose Based on Your Clients

- **TypeScript web app?** → Use `apps/web/` (tRPC)
- **Mobile apps?** → Use `apps/api/` (REST or GraphQL)
- **Both?** → Deploy both! They share the same services.
- **Public API?** → Use `apps/api/` (REST)
- **Complex queries?** → Use `apps/api/` (GraphQL)

### The Magic

**You can change your mind later with minimal effort!**

Need to add GraphQL after starting with REST? Just add resolvers - the services are already there.

Need to support mobile after building a web app? Deploy `apps/api/` - the services are already there.

**DRY architecture FTW!** 🎉
