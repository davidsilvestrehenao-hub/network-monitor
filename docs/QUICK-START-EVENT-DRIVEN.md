# Quick Start: Event-Driven Architecture

## 🚀 Start Here

This guide shows you how to implement event-driven architecture in **30 minutes**.

---

## Step 1: Create EventRPC Helper (5 minutes)

Create `src/server/event-rpc.ts`:

```bash
# Copy from EVENT-DRIVEN-EXAMPLES.md or use this minimal version:
```

```typescript
import type { IEventBus } from "~/lib/services/interfaces/IEventBus";
import type { ILogger } from "~/lib/services/interfaces/ILogger";

export class EventRPC {
  constructor(
    private eventBus: IEventBus,
    private logger: ILogger,
    private defaultTimeout: number = 10000
  ) {}

  async request<TRequest, TResponse>(
    requestEvent: string,
    successEvent: string,
    failureEvent: string,
    data: TRequest,
    timeout?: number
  ): Promise<TResponse> {
    const requestId = crypto.randomUUID();
    const timeoutMs = timeout || this.defaultTimeout;

    return new Promise<TResponse>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        reject(new Error(`Timeout: ${requestEvent}`));
      }, timeoutMs);

      this.eventBus.once(`${successEvent}_${requestId}`, (response?: TResponse) => {
        clearTimeout(timeoutHandle);
        resolve(response!);
      });

      this.eventBus.once(`${failureEvent}_${requestId}`, (error?: { error: string }) => {
        clearTimeout(timeoutHandle);
        reject(new Error(error?.error || "Unknown error"));
      });

      this.eventBus.emit(requestEvent, { ...(data as object), requestId });
    });
  }
}
```

---

## Step 2: Refactor ONE pRPC Endpoint (5 minutes)

Pick `createTarget` as your first endpoint. In `src/server/prpc.ts`:

```typescript
import { EventRPC } from "./event-rpc";

// Refactor this endpoint
export const createTarget = async (data: { name: string; address: string }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

  // Replace direct call with event-driven call
  const target = await eventRPC.request(
    "TARGET_CREATE_REQUESTED",
    "TARGET_CREATED",
    "TARGET_CREATE_FAILED",
    {
      name: data.name,
      address: data.address,
      ownerId: ctx.userId,
    }
  );

  return target;
};
```

---

## Step 3: Update Service Event Handler (5 minutes)

In `src/lib/services/concrete/MonitorService.ts`:

```typescript
// Update this handler to respond with requestId
private async handleTargetCreateRequested(data?: {
  requestId?: string;  // Add requestId
  name: string;
  address: string;
  ownerId: string;
}): Promise<void> {
  if (!data) return;
  
  const { requestId, name, address, ownerId } = data;

  try {
    const target = await this.createTarget({ name, address, ownerId });
    
    // Emit with requestId if provided (for pRPC)
    if (requestId) {
      this.eventBus.emit(`TARGET_CREATED_${requestId}`, target);
    }
    
    // Also emit general event (for UI)
    this.eventBus.emit("TARGET_CREATED", { target });
  } catch (error) {
    if (requestId) {
      this.eventBus.emit(`TARGET_CREATE_FAILED_${requestId}`, {
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
```

---

## Step 4: Test the Change (5 minutes)

```bash
# Start the dev server
bun run dev

# Test creating a target
# It should work exactly the same but now uses events!
```

Test in your app - create a target. It should work identically but now flows through events.

---

## Step 5: Refactor ONE Frontend Component (10 minutes)

Pick `TargetList` component. In `src/components/TargetList.tsx`:

```typescript
import { useEventBus } from "~/lib/frontend/container";

export function TargetList() {
  const eventBus = useEventBus();
  const [targets, setTargets] = createSignal<Target[]>([]);

  // Load targets via event
  createEffect(() => {
    eventBus.emit("TARGETS_LOAD_REQUESTED", {});
  });

  // Listen for results
  createEffect(() => {
    const handleLoaded = (data: { targets: Target[] }) => {
      setTargets(data.targets);
    };
    
    const handleDeleted = (data: { id: string }) => {
      setTargets(prev => prev.filter(t => t.id !== data.id));
    };

    eventBus.on("TARGETS_LOADED", handleLoaded);
    eventBus.on("TARGET_DELETED", handleDeleted);

    return () => {
      eventBus.off("TARGETS_LOADED", handleLoaded);
      eventBus.off("TARGET_DELETED", handleDeleted);
    };
  });

  // Component only emits events
  const handleDelete = (id: string) => {
    eventBus.emit("TARGET_DELETE_REQUESTED", { id });
  };

  return (
    <button onClick={() => handleDelete(target.id)}>
      Delete
    </button>
  );
}
```

---

## Step 6: Update CommandQueryService (5 minutes)

In `src/lib/frontend/services/CommandQueryService.ts`:

```typescript
// Add event listener
constructor(...) {
  this.setupEventHandlers();
}

private setupEventHandlers(): void {
  this.eventBus.on("TARGETS_LOAD_REQUESTED", this.handleLoadTargets.bind(this));
  this.eventBus.on("TARGET_DELETE_REQUESTED", this.handleDeleteTarget.bind(this));
}

private async handleLoadTargets(): Promise<void> {
  try {
    const targets = await this.apiClient.getTargets();
    this.eventBus.emit("TARGETS_LOADED", { targets });
  } catch (error) {
    this.eventBus.emit("TARGETS_LOAD_FAILED", {
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

private async handleDeleteTarget(data?: { id: string }): Promise<void> {
  if (!data) return;
  
  try {
    await this.apiClient.deleteTarget(data.id);
    this.eventBus.emit("TARGET_DELETED", { id: data.id });
  } catch (error) {
    this.eventBus.emit("TARGET_DELETE_FAILED", {
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
```

---

## ✅ Done! You've Implemented Event-Driven Architecture

**What you accomplished:**
- ✅ Backend pRPC → EventBus → Service (loose coupling)
- ✅ Frontend Component → EventBus → CommandQuery (loose coupling)
- ✅ All communication flows through event bus
- ✅ Easy to add logging, metrics, caching

**Next Steps:**
1. Refactor remaining pRPC endpoints (repeat Step 2-3)
2. Refactor remaining components (repeat Step 5)
3. Add event flow logging
4. Add metrics/monitoring
5. Update tests

---

## 📊 Before & After Comparison

### Before: Direct Calls (Tight Coupling) ❌

```
pRPC ──────────────> MonitorService
                          │
Component ───────────────> CommandQueryService
```

### After: Event-Driven (Loose Coupling) ✅

```
pRPC ─────> EventBus ─────> MonitorService
               │                  │
               └─────── Result ───┘

Component ──> EventBus ─────> CommandQueryService
               │                  │
               └─────── Result ───┘
```

---

## 🔍 How to Verify It's Working

### 1. Check Logs

You should see event flow logs:

```
EventRPC: Sending request - TARGET_CREATE_REQUESTED
MonitorService: Handling TARGET_CREATE_REQUESTED
MonitorService: Target created successfully
EventRPC: Request succeeded
```

### 2. Add Event Logging

Temporarily add this to see all events:

```typescript
// In your app initialization
eventBus.on("*", (data) => {
  console.log("Event:", event, data);
});
```

### 3. Test Functionality

- Create a target → Should work
- Delete a target → Should work
- Update a target → Should work

Everything should work **exactly the same** but now uses events!

---

## 🎯 Benefits You Get

1. **Loose Coupling**: No direct service dependencies
2. **Easy Logging**: All operations visible in event bus
3. **Easy Testing**: Mock event bus, test in isolation
4. **Flexibility**: Add features without changing existing code
5. **Observability**: Full visibility into all operations

---

## 📚 Full Documentation

- [Complete Migration Plan](./EVENT-DRIVEN-MIGRATION-PLAN.md)
- [Working Code Examples](./EVENT-DRIVEN-EXAMPLES.md)
- [Architecture Analysis](./ARCHITECTURE-ANALYSIS.md)

---

*Quick Start Guide: Event-Driven Architecture*
*Time to implement: ~30 minutes*
*Difficulty: Medium*

