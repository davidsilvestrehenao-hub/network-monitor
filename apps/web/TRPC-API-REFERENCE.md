# tRPC API Reference

Complete API reference for all tRPC procedures. All routes follow the loosely coupled architecture with Container, EventBus, and Repository patterns.

## Table of Contents

- [Health Check](#health-check)
- [Targets](#targets)
- [Speed Tests](#speed-tests)
- [Alert Rules](#alert-rules)
- [Incidents](#incidents)
- [Notifications](#notifications)
- [Push Subscriptions](#push-subscriptions)
- [Users](#users)
- [Legacy Compatibility](#legacy-compatibility)

---

## Health Check

### `hello`

Simple health check endpoint.

**Type:** Query  
**Input:** `{ name?: string }` (optional)  
**Output:** `string`

**Example:**

```typescript
const greeting = await trpc.hello.query({ name: "World" });
// Returns: "Hello, World!"
```

---

## Targets

All target management operations via MonitorService.

### `targets.getAll`

Get all targets for the current user.

**Type:** Query  
**Input:** None  
**Output:** `Target[]`

**Example:**

```typescript
const targets = await trpc.targets.getAll.query();
```

### `targets.getById`

Get a specific target by ID.

**Type:** Query  
**Input:** `{ id: string }`  
**Output:** `Target`  
**Throws:** `NOT_FOUND` if target doesn't exist

**Example:**

```typescript
const target = await trpc.targets.getById.query({ id: "target-123" });
```

### `targets.create`

Create a new monitoring target.

**Type:** Mutation  
**Input:**

```typescript
{
  name: string;        // Min length: 1
  address: string;     // Must be valid URL
}
```

**Output:** `Target`

**Example:**

```typescript
const newTarget = await trpc.targets.create.mutate({
  name: "Google DNS",
  address: "https://8.8.8.8"
});
```

### `targets.update`

Update an existing target.

**Type:** Mutation  
**Input:**

```typescript
{
  id: string;
  name?: string;       // Min length: 1
  address?: string;    // Must be valid URL
}
```

**Output:** `Target`

**Example:**

```typescript
const updated = await trpc.targets.update.mutate({
  id: "target-123",
  name: "Updated Name"
});
```

### `targets.delete`

Delete a target and all associated data.

**Type:** Mutation  
**Input:** `{ id: string }`  
**Output:** `void`

**Example:**

```typescript
await trpc.targets.delete.mutate({ id: "target-123" });
```

### `targets.startMonitoring`

Start automated monitoring for a target.

**Type:** Mutation  
**Input:**

```typescript
{
  targetId: string;
  intervalMs: number;  // Min: 1000, Max: 300000 (5 minutes)
}
```

**Output:** `{ success: boolean }`

**Example:**

```typescript
await trpc.targets.startMonitoring.mutate({
  targetId: "target-123",
  intervalMs: 30000  // 30 seconds
});
```

### `targets.stopMonitoring`

Stop automated monitoring for a target.

**Type:** Mutation  
**Input:** `{ targetId: string }`  
**Output:** `{ success: boolean }`

**Example:**

```typescript
await trpc.targets.stopMonitoring.mutate({ targetId: "target-123" });
```

### `targets.getActiveTargets`

Get list of targets currently being monitored.

**Type:** Query  
**Input:** None  
**Output:** `string[]` (array of target IDs)

**Example:**

```typescript
const activeTargets = await trpc.targets.getActiveTargets.query();
// Returns: ["target-123", "target-456"]
```

---

## Speed Tests

Speed test result operations via SpeedTestResultRepository.

### `speedTests.getByTargetId`

Get speed test results for a specific target.

**Type:** Query  
**Input:**

```typescript
{
  targetId: string;
  limit?: number;      // Optional limit
}
```

**Output:** `SpeedTestResult[]`

**Example:**

```typescript
const results = await trpc.speedTests.getByTargetId.query({
  targetId: "target-123",
  limit: 50
});
```

### `speedTests.getLatest`

Get the most recent speed test result for a target.

**Type:** Query  
**Input:** `{ targetId: string }`  
**Output:** `SpeedTestResult | null`

**Example:**

```typescript
const latest = await trpc.speedTests.getLatest.query({
  targetId: "target-123"
});
```

### `speedTests.runTest`

Run a speed test immediately.

**Type:** Mutation  
**Input:**

```typescript
{
  targetId: string;
  target: string;      // Must be valid URL
  timeout?: number;    // Optional timeout in ms
}
```

**Output:** `SpeedTestResult`

**Example:**

```typescript
const result = await trpc.speedTests.runTest.mutate({
  targetId: "target-123",
  target: "https://8.8.8.8"
});
```

---

## Alert Rules

Alert rule management via AlertRuleRepository.

### `alertRules.getByTargetId`

Get all alert rules for a target.

**Type:** Query  
**Input:** `{ targetId: string }`  
**Output:** `AlertRule[]`

**Example:**

```typescript
const rules = await trpc.alertRules.getByTargetId.query({
  targetId: "target-123"
});
```

### `alertRules.getById`

Get a specific alert rule.

**Type:** Query  
**Input:** `{ id: number }`  
**Output:** `AlertRule | null`

**Example:**

```typescript
const rule = await trpc.alertRules.getById.query({ id: 1 });
```

### `alertRules.create`

Create a new alert rule.

**Type:** Mutation  
**Input:**

```typescript
{
  name: string;                               // Min length: 1
  targetId: string;
  metric: "ping" | "download";
  condition: "GREATER_THAN" | "LESS_THAN";
  threshold: number;                          // Must be positive
  enabled?: boolean;                          // Default: true
}
```

**Output:** `AlertRule`

**Example:**

```typescript
const rule = await trpc.alertRules.create.mutate({
  name: "High Latency Alert",
  targetId: "target-123",
  metric: "ping",
  condition: "GREATER_THAN",
  threshold: 100  // 100ms
});
```

### `alertRules.update`

Update an existing alert rule.

**Type:** Mutation  
**Input:**

```typescript
{
  id: number;
  name?: string;
  metric?: "ping" | "download";
  condition?: "GREATER_THAN" | "LESS_THAN";
  threshold?: number;
  enabled?: boolean;
}
```

**Output:** `AlertRule`

**Example:**

```typescript
const updated = await trpc.alertRules.update.mutate({
  id: 1,
  threshold: 150
});
```

### `alertRules.delete`

Delete an alert rule.

**Type:** Mutation  
**Input:** `{ id: number }`  
**Output:** `void`

**Example:**

```typescript
await trpc.alertRules.delete.mutate({ id: 1 });
```

### `alertRules.toggleEnabled`

Enable or disable an alert rule.

**Type:** Mutation  
**Input:**

```typescript
{
  id: number;
  enabled: boolean;
}
```

**Output:** `AlertRule`

**Example:**

```typescript
const rule = await trpc.alertRules.toggleEnabled.mutate({
  id: 1,
  enabled: false
});
```

---

## Incidents

Incident event management via IncidentEventRepository.

### `incidents.getByTargetId`

Get incident events for a specific target.

**Type:** Query  
**Input:**

```typescript
{
  targetId: string;
  limit?: number;
}
```

**Output:** `IncidentEvent[]`

**Example:**

```typescript
const incidents = await trpc.incidents.getByTargetId.query({
  targetId: "target-123",
  limit: 20
});
```

### `incidents.getUnresolved`

Get all unresolved incidents across all targets.

**Type:** Query  
**Input:** None  
**Output:** `IncidentEvent[]`

**Example:**

```typescript
const unresolved = await trpc.incidents.getUnresolved.query();
```

### `incidents.getUnresolvedByTargetId`

Get unresolved incidents for a specific target.

**Type:** Query  
**Input:** `{ targetId: string }`  
**Output:** `IncidentEvent[]`

**Example:**

```typescript
const incidents = await trpc.incidents.getUnresolvedByTargetId.query({
  targetId: "target-123"
});
```

### `incidents.resolve`

Mark an incident as resolved.

**Type:** Mutation  
**Input:** `{ id: number }`  
**Output:** `IncidentEvent`

**Example:**

```typescript
const resolved = await trpc.incidents.resolve.mutate({ id: 1 });
```

### `incidents.resolveByTargetId`

Mark all incidents for a target as resolved.

**Type:** Mutation  
**Input:** `{ targetId: string }`  
**Output:** `number` (count of resolved incidents)

**Example:**

```typescript
const count = await trpc.incidents.resolveByTargetId.mutate({
  targetId: "target-123"
});
```

---

## Notifications

In-app notification management via NotificationRepository.

### `notifications.getByUserId`

Get notifications for a user.

**Type:** Query  
**Input:**

```typescript
{
  userId?: string;     // Optional, defaults to current user
  limit?: number;
}
```

**Output:** `Notification[]`

**Example:**

```typescript
const notifications = await trpc.notifications.getByUserId.query({
  limit: 50
});
```

### `notifications.getUnread`

Get unread notifications for the current user.

**Type:** Query  
**Input:** None  
**Output:** `Notification[]`

**Example:**

```typescript
const unread = await trpc.notifications.getUnread.query();
```

### `notifications.markAsRead`

Mark a notification as read.

**Type:** Mutation  
**Input:** `{ id: number }`  
**Output:** `Notification`

**Example:**

```typescript
const notification = await trpc.notifications.markAsRead.mutate({ id: 1 });
```

### `notifications.markAllAsRead`

Mark all notifications as read for the current user.

**Type:** Mutation  
**Input:** None  
**Output:** `number` (count of marked notifications)

**Example:**

```typescript
const count = await trpc.notifications.markAllAsRead.mutate();
```

### `notifications.delete`

Delete a notification.

**Type:** Mutation  
**Input:** `{ id: number }`  
**Output:** `void`

**Example:**

```typescript
await trpc.notifications.delete.mutate({ id: 1 });
```

---

## Push Subscriptions

Web push notification subscription management via PushSubscriptionRepository.

### `pushSubscriptions.getByUserId`

Get push subscriptions for the current user.

**Type:** Query  
**Input:** None  
**Output:** `PushSubscription[]`

**Example:**

```typescript
const subscriptions = await trpc.pushSubscriptions.getByUserId.query();
```

### `pushSubscriptions.create`

Register a new push subscription.

**Type:** Mutation  
**Input:**

```typescript
{
  endpoint: string;    // Must be valid URL
  p256dh: string;
  auth: string;
}
```

**Output:** `PushSubscription`

**Example:**

```typescript
const subscription = await trpc.pushSubscriptions.create.mutate({
  endpoint: "https://fcm.googleapis.com/...",
  p256dh: "...",
  auth: "..."
});
```

### `pushSubscriptions.delete`

Delete a push subscription by ID.

**Type:** Mutation  
**Input:** `{ id: string }`  
**Output:** `void`

**Example:**

```typescript
await trpc.pushSubscriptions.delete.mutate({ id: "sub-123" });
```

### `pushSubscriptions.deleteByEndpoint`

Delete a push subscription by endpoint.

**Type:** Mutation  
**Input:** `{ endpoint: string }`  
**Output:** `void`

**Example:**

```typescript
await trpc.pushSubscriptions.deleteByEndpoint.mutate({
  endpoint: "https://fcm.googleapis.com/..."
});
```

---

## Users

User management via UserRepository.

### `users.getCurrent`

Get the current authenticated user.

**Type:** Query  
**Input:** None  
**Output:** `User | null`

**Example:**

```typescript
const currentUser = await trpc.users.getCurrent.query();
```

### `users.getById`

Get a user by ID.

**Type:** Query  
**Input:** `{ id: string }`  
**Output:** `User | null`

**Example:**

```typescript
const user = await trpc.users.getById.query({ id: "user-123" });
```

### `users.update`

Update the current user's profile.

**Type:** Mutation  
**Input:**

```typescript
{
  name?: string;
  email?: string;      // Must be valid email
  image?: string;      // Must be valid URL
}
```

**Output:** `User`

**Example:**

```typescript
const updated = await trpc.users.update.mutate({
  name: "New Name"
});
```

---

## Legacy Compatibility

Deprecated endpoints maintained for backward compatibility. Use nested routers above instead.

### `getAllTargets` ⚠️ Deprecated

Use `targets.getAll` instead.

### `createTarget` ⚠️ Deprecated

Use `targets.create` instead.

---

## Frontend Usage Examples

### SolidJS with createResource

```typescript
import { createResource } from "solid-js";
import { trpc } from "~/lib/trpc";

function TargetsPage() {
  // Query with automatic refetch
  const [targets, { refetch }] = createResource(() =>
    trpc.targets.getAll.query()
  );

  // Mutation
  const handleCreate = async (name: string, address: string) => {
    await trpc.targets.create.mutate({ name, address });
    refetch();
  };

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <For each={targets()}>
        {target => <div>{target.name}</div>}
      </For>
    </Suspense>
  );
}
```

### Error Handling

```typescript
try {
  const target = await trpc.targets.getById.query({ id: "invalid" });
} catch (error) {
  if (error.data?.code === "NOT_FOUND") {
    console.error("Target not found");
  }
}
```

### Using Logger

```typescript
import { useLogger } from "~/lib/frontend/container";

function MyComponent() {
  const logger = useLogger();

  const handleAction = async () => {
    try {
      await trpc.targets.create.mutate({ name: "Test", address: "https://test.com" });
      logger.info("Target created successfully");
    } catch (error) {
      logger.error("Failed to create target", { error });
    }
  };
}
```

---

## Architecture Notes

### Loose Coupling

All endpoints follow the loosely coupled architecture:

1. **Router** → Calls service or repository
2. **Service** → Contains business logic, calls repositories
3. **Repository** → Handles database operations, maps to domain types
4. **EventBus** → Services communicate via events (not direct calls)

### Type Safety

All endpoints are fully type-safe:

- Input validation with Zod schemas
- Automatic TypeScript inference
- End-to-end type safety from DB to UI

### Authentication

Authentication is currently mocked with `getUserId()`. When implementing real auth:

1. Replace `getUserId()` with actual session handling
2. Add authentication middleware to protected procedures
3. Extract user ID from session context

---

## Testing

### Testing Procedures

```typescript
import { appRouter } from "~/server/trpc/router";

// Create a test context
const ctx = {
  services: { monitor: mockMonitorService },
  repositories: { target: mockTargetRepository }
};

// Create a caller
const caller = appRouter.createCaller(ctx);

// Test procedures
const targets = await caller.targets.getAll();
expect(targets).toHaveLength(2);
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `NOT_FOUND` | Resource not found |
| `BAD_REQUEST` | Invalid input data |
| `UNAUTHORIZED` | Not authenticated |
| `FORBIDDEN` | Not authorized |
| `INTERNAL_SERVER_ERROR` | Server error |

---

## Rate Limiting

Rate limiting is not currently implemented but should be added for:

- Alert rule creation (prevent abuse)
- Speed test execution (prevent excessive testing)
- Notification creation (prevent spam)

---

## Next Steps

- [ ] Implement real authentication
- [ ] Add rate limiting
- [ ] Add request logging
- [ ] Add performance monitoring
- [ ] Create OpenAPI documentation
- [ ] Add API versioning
