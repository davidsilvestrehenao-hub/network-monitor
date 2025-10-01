# 🔌 API Documentation

## **Overview**

Network Monitor uses **tRPC** for end-to-end type-safe API communication. All API calls are fully type-safe from frontend to backend with automatic TypeScript inference.

---

## 🏗️ **Architecture**

### **tRPC with Containers & EventBus**

All API endpoints follow a loosely coupled architecture:

```text
Frontend (SolidJS)
    ↓
tRPC Client (~/lib/trpc.ts)
    ↓
tRPC Router (router.ts)
    ↓
Service (MonitorService)
    ↓
Repository (TargetRepository)
    ↓
Prisma Client
    ↓
Database
```text

**Key Principles:**

- Type-safe end-to-end with automatic inference
- Services injected via DI Container
- Services communicate via EventBus (loose coupling)
- Repositories abstract all database operations
- Input validation with Zod schemas

---

## 📚 **Complete API Reference**

For the complete, detailed API reference with all 34 endpoints, see:

**[Complete tRPC API Reference](../apps/web/TRPC-API-REFERENCE.md)**

### Quick Index

- **Targets** - 8 endpoints for target CRUD & monitoring
- **Speed Tests** - 3 endpoints for running tests
- **Alert Rules** - 6 endpoints for alert management
- **Incidents** - 5 endpoints for incident tracking
- **Notifications** - 5 endpoints for notifications
- **Push Subscriptions** - 4 endpoints for push setup
- **Users** - 3 endpoints for user management

---

## 🚀 **Quick Examples**

### **Frontend Usage with SolidJS**

```typescript
import { createResource } from "solid-js";
import { trpc } from "~/lib/trpc";

function TargetsPage() {
  // Query with automatic refetch
  const [targets, { refetch }] = createResource(() =>
    trpc.targets.getAll.query()
  );

  // Mutation
  const handleCreate = async () => {
    await trpc.targets.create.mutate({
      name: "Google DNS",
      address: "https://8.8.8.8"
    });
    refetch();
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <For each={targets()}>
        {target => <TargetCard target={target} />}
      </For>
    </Suspense>
  );
}
```text

### **Error Handling**

```typescript
import { useLogger } from "~/lib/frontend/container";

function MyComponent() {
  const logger = useLogger();

  const handleAction = async () => {
    try {
      await trpc.targets.create.mutate({ 
        name: "Test", 
        address: "https://test.com" 
      });
      logger.info("Target created successfully");
    } catch (error) {
      logger.error("Failed to create target", { error });
      // Handle error in UI
    }
  };
}
```text

---

## 📖 **Key API Endpoints**

### **Targets**

```typescript
// Get all targets
const targets = await trpc.targets.getAll.query();

// Create target
const target = await trpc.targets.create.mutate({
  name: "Google",
  address: "https://google.com"
});

// Start monitoring
await trpc.targets.startMonitoring.mutate({
  targetId: target.id,
  intervalMs: 30000  // 30 seconds
});
```text

### **Speed Tests**

```typescript
// Run immediate test
const result = await trpc.speedTests.runTest.mutate({
  targetId: "target-123",
  target: "https://google.com"
});

// Get results
const results = await trpc.speedTests.getByTargetId.query({
  targetId: "target-123",
  limit: 50
});
```text

### **Alert Rules**

```typescript
// Create alert rule
const rule = await trpc.alertRules.create.mutate({
  name: "High Latency Alert",
  targetId: "target-123",
  metric: "ping",
  condition: "GREATER_THAN",
  threshold: 100  // 100ms
});

// Toggle enabled
await trpc.alertRules.toggleEnabled.mutate({
  id: rule.id,
  enabled: false
});
```text

### **Notifications**

```typescript
// Get unread notifications
const unread = await trpc.notifications.getUnread.query();

// Mark as read
await trpc.notifications.markAsRead.mutate({ id: 1 });

// Mark all as read
await trpc.notifications.markAllAsRead.mutate();
```text

---

## 🔐 **Authentication**

Authentication is currently mocked with a placeholder user ID. When implementing real auth:

```typescript
// Will be replaced with:
// - Session-based auth via Auth.js
// - JWT tokens
// - OAuth providers
```text

---

## 🧪 **Testing API Endpoints**

### **Browser DevTools**

Open browser console and test directly:

```typescript
// In browser console
const { trpc } = await import('~/lib/trpc');

// Test endpoints
const targets = await trpc.targets.getAll.query();
console.log(targets);
```text

### **Automated Testing**

```typescript
import { appRouter } from "~/server/trpc/router";

// Create test context
const ctx = {
  services: { monitor: mockMonitorService },
  repositories: { target: mockTargetRepository }
};

// Create caller
const caller = appRouter.createCaller(ctx);

// Test procedures
const targets = await caller.targets.getAll();
expect(targets).toHaveLength(2);
```text

---

## 📊 **API Response Formats**

### **Success Response**

tRPC returns the data directly:

```typescript
const target = await trpc.targets.getById.query({ id: "123" });
// target = { id: "123", name: "Google", address: "https://google.com", ... }
```text

### **Error Response**

Errors are thrown as TRPCError:

```typescript
try {
  await trpc.targets.getById.query({ id: "invalid" });
} catch (error) {
  console.log(error.data.code);  // "NOT_FOUND"
  console.log(error.message);    // "Target with ID 'invalid' not found"
}
```text

---

## 🔄 **Real-Time Updates**

The system uses **EventBus** for real-time communication between services:

```typescript
import { useEventBus } from "~/lib/frontend/container";

function MyComponent() {
  const eventBus = useEventBus();

  createEffect(() => {
    // Listen for backend events
    eventBus.on("TARGET_CREATED", (data) => {
      console.log("New target created:", data.target);
    });

    eventBus.on("SPEED_TEST_COMPLETED", (data) => {
      console.log("Speed test completed:", data.result);
    });
  });
}
```text

---

## 📝 **Input Validation**

All inputs are validated with Zod schemas:

```typescript
// Automatic validation
await trpc.targets.create.mutate({
  name: "",  // ❌ Error: String must contain at least 1 character
  address: "not-a-url"  // ❌ Error: Invalid url
});

await trpc.targets.create.mutate({
  name: "Valid Name",  // ✅
  address: "https://valid.com"  // ✅
});
```text

---

## 🎯 **Best Practices**

### **1. Use createResource for Queries**

```typescript
import { createResource, Suspense } from "solid-js";

const [data, { refetch }] = createResource(() =>
  trpc.targets.getAll.query()
);
```text

### **2. Use Logger Instead of Console**

```typescript
import { useLogger } from "~/lib/frontend/container";

const logger = useLogger();
logger.error("API error", { error });  // ✅ Good
console.error("API error", error);     // ❌ Avoid
```text

### **3. Handle Errors Gracefully**

```typescript
try {
  await trpc.targets.create.mutate(data);
} catch (error) {
  if (error.data?.code === "BAD_REQUEST") {
    // Show validation error to user
  } else {
    // Show generic error
  }
}
```text

### **4. Use Optimistic Updates**

```typescript
const handleDelete = async (id: string) => {
  // Optimistically remove from UI
  setTargets(prev => prev.filter(t => t.id !== id));
  
  try {
    await trpc.targets.delete.mutate({ id });
  } catch (error) {
    // Rollback on error
    refetch();
  }
};
```text

---

## 🔗 **Related Documentation**

- [tRPC API Reference](../apps/web/TRPC-API-REFERENCE.md) - Complete endpoint documentation
- [tRPC Architecture](../apps/web/TRPC-ARCHITECTURE.md) - Architecture patterns
- [tRPC Router README](../apps/web/src/server/trpc/README.md) - Router structure
- [Official tRPC Docs](https://trpc.io/docs) - tRPC documentation

---

## 💡 **Migration from pRPC**

This project has been migrated from pRPC to tRPC. See:

- [Migration Guide](../MIGRATION-PRPC-TO-TRPC.md)

---

**For complete API reference with all endpoints, input types, and examples, see:**  
**→ [apps/web/TRPC-API-REFERENCE.md](../apps/web/TRPC-API-REFERENCE.md)**
