# Event-Driven Architecture Migration Plan

## 🎯 Goal
Transform the application from **direct service calls** to **true event-driven architecture** for both backend and frontend.

---

## 📋 Migration Strategy

### Phase 1: Backend Event-Driven Layer (pRPC → EventBus → Services)
### Phase 2: Frontend Event-Driven Pattern (Components → EventBus only)
### Phase 3: Cleanup & Testing

---

## 🔧 Phase 1: Backend Event-Driven Layer

### Current Architecture (Tight Coupling)

```typescript
// pRPC Endpoint - TIGHT COUPLING ❌
export const createTarget = async (data: { name: string; address: string }) => {
  const ctx = await getContext();
  
  // Direct service call - bypasses event bus
  const target = await ctx.services.monitor.createTarget({
    name: data.name,
    address: data.address,
    ownerId: ctx.userId,
  });
  
  return target;
};
```

### Target Architecture (Loose Coupling)

```typescript
// pRPC Endpoint - LOOSE COUPLING ✅
export const createTarget = async (data: { name: string; address: string }) => {
  const ctx = await getContext();
  
  // Create promise that waits for event response
  return new Promise<Target>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Request timeout"));
    }, 10000);
    
    const requestId = crypto.randomUUID();
    
    // Listen for success response
    ctx.services.eventBus.once(`TARGET_CREATED_${requestId}`, (target: Target) => {
      clearTimeout(timeout);
      resolve(target);
    });
    
    // Listen for error response
    ctx.services.eventBus.once(`TARGET_CREATE_FAILED_${requestId}`, (error: Error) => {
      clearTimeout(timeout);
      reject(error);
    });
    
    // Emit request event
    ctx.services.eventBus.emit("TARGET_CREATE_REQUESTED", {
      requestId,
      name: data.name,
      address: data.address,
      ownerId: ctx.userId,
    });
  });
};
```

### Implementation Steps

#### Step 1.1: Create Event Request/Response Helper

Create `src/server/event-rpc.ts`:

```typescript
import type { IEventBus } from "~/lib/services/interfaces/IEventBus";
import type { ILogger } from "~/lib/services/interfaces/ILogger";

/**
 * Event-RPC Helper: Converts event-driven communication to Promise-based API
 * 
 * This allows pRPC endpoints to use event bus while maintaining clean async/await syntax
 */
export class EventRPC {
  constructor(
    private eventBus: IEventBus,
    private logger: ILogger,
    private defaultTimeout: number = 10000
  ) {}

  /**
   * Make an event-based request and wait for response
   * 
   * @param requestEvent - Event to emit for request
   * @param successEvent - Event to listen for success
   * @param failureEvent - Event to listen for failure
   * @param data - Request data
   * @param timeout - Optional timeout override
   */
  async request<TRequest, TResponse>(
    requestEvent: string,
    successEvent: string,
    failureEvent: string,
    data: TRequest,
    timeout?: number
  ): Promise<TResponse> {
    return new Promise<TResponse>((resolve, reject) => {
      const requestId = crypto.randomUUID();
      const timeoutMs = timeout || this.defaultTimeout;
      
      const timeoutHandle = setTimeout(() => {
        this.cleanup(successEvent, failureEvent, requestId);
        const error = new Error(`Request timeout after ${timeoutMs}ms: ${requestEvent}`);
        this.logger.error("EventRPC: Request timeout", { requestEvent, requestId });
        reject(error);
      }, timeoutMs);

      // Listen for success
      const successHandler = (response: TResponse) => {
        clearTimeout(timeoutHandle);
        this.cleanup(successEvent, failureEvent, requestId);
        this.logger.debug("EventRPC: Request succeeded", { requestEvent, requestId });
        resolve(response);
      };

      // Listen for failure
      const failureHandler = (error: { error: string }) => {
        clearTimeout(timeoutHandle);
        this.cleanup(successEvent, failureEvent, requestId);
        this.logger.error("EventRPC: Request failed", { requestEvent, requestId, error });
        reject(new Error(error.error));
      };

      // Register event handlers with unique IDs
      this.eventBus.once(`${successEvent}_${requestId}`, successHandler);
      this.eventBus.once(`${failureEvent}_${requestId}`, failureHandler);

      // Emit request with requestId
      this.eventBus.emit(requestEvent, { ...data, requestId });
      this.logger.debug("EventRPC: Request sent", { requestEvent, requestId });
    });
  }

  private cleanup(successEvent: string, failureEvent: string, requestId: string): void {
    // Events are cleaned up automatically with .once(), but we log for debugging
    this.logger.debug("EventRPC: Cleaning up handlers", { successEvent, failureEvent, requestId });
  }
}

/**
 * Create EventRPC instance from context
 */
export function createEventRPC(eventBus: IEventBus, logger: ILogger): EventRPC {
  return new EventRPC(eventBus, logger);
}
```

#### Step 1.2: Update Backend Event Definitions

Update `src/lib/services/interfaces/IEventBus.ts`:

```typescript
// Add backend event definitions with request IDs
export interface BackendEvents {
  // Target events with request IDs
  TARGET_CREATE_REQUESTED: { 
    requestId: string;
    name: string; 
    address: string; 
    ownerId: string;
  };
  TARGET_CREATED: { requestId: string; target: Target };
  TARGET_CREATE_FAILED: { requestId: string; error: string };

  TARGET_UPDATE_REQUESTED: { 
    requestId: string;
    id: string; 
    data: UpdateTargetData;
  };
  TARGET_UPDATED: { requestId: string; target: Target };
  TARGET_UPDATE_FAILED: { requestId: string; error: string };

  TARGET_DELETE_REQUESTED: { 
    requestId: string;
    id: string;
  };
  TARGET_DELETED: { requestId: string; id: string };
  TARGET_DELETE_FAILED: { requestId: string; error: string };

  // Add more events for other operations...
}
```

#### Step 1.3: Update Service Event Handlers

Update `src/lib/services/concrete/MonitorService.ts`:

```typescript
private setupEventHandlers(): void {
  this.logger.info("MonitorService: Setting up event handlers");
  
  this.eventBus.on<BackendEvents["TARGET_CREATE_REQUESTED"]>(
    "TARGET_CREATE_REQUESTED",
    this.handleTargetCreateRequested.bind(this)
  );
  
  this.eventBus.on<BackendEvents["TARGET_UPDATE_REQUESTED"]>(
    "TARGET_UPDATE_REQUESTED",
    this.handleTargetUpdateRequested.bind(this)
  );
  
  this.eventBus.on<BackendEvents["TARGET_DELETE_REQUESTED"]>(
    "TARGET_DELETE_REQUESTED",
    this.handleTargetDeleteRequested.bind(this)
  );
  
  // Add more handlers...
}

private async handleTargetCreateRequested(data?: BackendEvents["TARGET_CREATE_REQUESTED"]): Promise<void> {
  if (!data) return;
  
  const { requestId, name, address, ownerId } = data;
  this.logger.debug("MonitorService: Handling TARGET_CREATE_REQUESTED", { requestId });

  try {
    const target = await this.createTarget({ name, address, ownerId });
    
    // Emit success event with requestId
    this.eventBus.emit(`TARGET_CREATED_${requestId}`, target);
  } catch (error) {
    // Emit failure event with requestId
    this.eventBus.emit(`TARGET_CREATE_FAILED_${requestId}`, {
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

// Update other handlers similarly...
```

#### Step 1.4: Refactor pRPC Endpoints

Update `src/server/prpc.ts`:

```typescript
import { createEventRPC } from "./event-rpc";
import type { ValidatedContext } from "./auth-context";

// Helper to get EventRPC instance
function getEventRPC(ctx: ValidatedContext): EventRPC {
  return createEventRPC(ctx.services.eventBus, ctx.services.logger);
}

// Refactor createTarget to use event-driven pattern
export const createTarget = async (data: { name: string; address: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    const eventRPC = getEventRPC(ctx);
    
    ctx.services.logger.info("pRPC: Creating target via events", data);

    // Use event-driven communication instead of direct call
    const target = await eventRPC.request<
      { name: string; address: string; ownerId: string },
      Target
    >(
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
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Target creation failed", { error, data });
    throw new Error(
      `Failed to create target: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// Refactor updateTarget similarly
export const updateTarget = async (data: {
  id: string;
  name?: string;
  address?: string;
}) => {
  "use server";
  try {
    const ctx = await getContext();
    const eventRPC = getEventRPC(ctx);

    ctx.services.logger.info("pRPC: Updating target via events", data);

    const updateData: UpdateTargetData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;

    const target = await eventRPC.request<
      { id: string; data: UpdateTargetData },
      Target
    >(
      "TARGET_UPDATE_REQUESTED",
      "TARGET_UPDATED",
      "TARGET_UPDATE_FAILED",
      { id: data.id, data: updateData }
    );

    return target;
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Target update failed", { error, data });
    throw new Error(
      `Failed to update target: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};

// Continue refactoring all endpoints...
```

---

## 🎨 Phase 2: Frontend Event-Driven Pattern

### Current Architecture (Tight Coupling)

```typescript
// Component - TIGHT COUPLING ❌
export function TargetList() {
  const commandQuery = useCommandQuery();
  
  const handleDeleteTarget = async (id: string) => {
    // Direct service call
    await commandQuery.deleteTarget(id);
  };
  
  return (
    <button onClick={() => handleDeleteTarget(target.id)}>
      Delete
    </button>
  );
}
```

### Target Architecture (Loose Coupling)

```typescript
// Component - LOOSE COUPLING ✅
export function TargetList() {
  const eventBus = useEventBus();
  const [targets, setTargets] = createSignal<Target[]>([]);
  
  // Component only emits events
  const handleDeleteTarget = (id: string) => {
    eventBus.emit("TARGET_DELETE_REQUESTED", { id });
  };
  
  // Component listens for results
  createEffect(() => {
    const handleDeleted = (data: { id: string }) => {
      setTargets(prev => prev.filter(t => t.id !== data.id));
    };
    
    const handleFailed = (data: { error: string }) => {
      // Show error notification
      eventBus.emit("SHOW_NOTIFICATION", {
        message: data.error,
        type: "error",
      });
    };
    
    eventBus.on("TARGET_DELETED", handleDeleted);
    eventBus.on("TARGET_DELETE_FAILED", handleFailed);
    
    return () => {
      eventBus.off("TARGET_DELETED", handleDeleted);
      eventBus.off("TARGET_DELETE_FAILED", handleFailed);
    };
  });
  
  return (
    <button onClick={() => handleDeleteTarget(target.id)}>
      Delete
    </button>
  );
}
```

### Implementation Steps

#### Step 2.1: Update Frontend Event Definitions

Update `src/lib/services/interfaces/IEventBus.ts`:

```typescript
export interface FrontendEvents {
  // Component → CommandQuery events
  TARGET_CREATE_REQUESTED: CreateTargetData;
  TARGET_UPDATE_REQUESTED: { id: string; data: UpdateTargetData };
  TARGET_DELETE_REQUESTED: { id: string };
  SPEED_TEST_REQUESTED: { targetId: string };
  MONITORING_START_REQUESTED: { targetId: string; intervalMs: number };
  MONITORING_STOP_REQUESTED: { targetId: string };
  
  // CommandQuery → Component events (success)
  TARGET_CREATED: { target: Target };
  TARGET_UPDATED: { target: Target };
  TARGET_DELETED: { id: string };
  TARGETS_LOADED: { targets: Target[] };
  SPEED_TEST_COMPLETED: { result: SpeedTestResult };
  MONITORING_STARTED: { targetId: string };
  MONITORING_STOPPED: { targetId: string };
  
  // CommandQuery → Component events (failure)
  TARGET_CREATE_FAILED: { error: string };
  TARGET_UPDATE_FAILED: { error: string };
  TARGET_DELETE_FAILED: { error: string };
  TARGETS_LOAD_FAILED: { error: string };
  SPEED_TEST_FAILED: { error: string };
  
  // UI events
  SHOW_NOTIFICATION: { message: string; type: "info" | "success" | "warning" | "error" };
  HIDE_NOTIFICATION: { id: string };
}
```

#### Step 2.2: Refactor CommandQueryService to Listen for Events

Update `src/lib/frontend/services/CommandQueryService.ts`:

```typescript
export class CommandQueryService implements ICommandQueryService {
  constructor(
    private apiClient: IAPIClient,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.logger.info("CommandQueryService: Setting up event handlers");
    
    // Listen for command events from components
    this.eventBus.on<FrontendEvents["TARGET_CREATE_REQUESTED"]>(
      "TARGET_CREATE_REQUESTED",
      this.handleCreateTargetRequest.bind(this)
    );
    
    this.eventBus.on<FrontendEvents["TARGET_UPDATE_REQUESTED"]>(
      "TARGET_UPDATE_REQUESTED",
      this.handleUpdateTargetRequest.bind(this)
    );
    
    this.eventBus.on<FrontendEvents["TARGET_DELETE_REQUESTED"]>(
      "TARGET_DELETE_REQUESTED",
      this.handleDeleteTargetRequest.bind(this)
    );
    
    // Add more handlers...
  }

  // Event handlers that call API and emit results
  private async handleCreateTargetRequest(data?: FrontendEvents["TARGET_CREATE_REQUESTED"]): Promise<void> {
    if (!data) return;
    
    this.logger.debug("CommandQueryService: Handling TARGET_CREATE_REQUESTED", data);

    try {
      const target = await this.apiClient.createTarget(data);
      
      // Emit success event
      this.eventBus.emitTyped<FrontendEvents["TARGET_CREATED"]>(
        "TARGET_CREATED",
        { target }
      );
    } catch (error) {
      // Emit failure event
      this.eventBus.emitTyped<FrontendEvents["TARGET_CREATE_FAILED"]>(
        "TARGET_CREATE_FAILED",
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  private async handleUpdateTargetRequest(data?: FrontendEvents["TARGET_UPDATE_REQUESTED"]): Promise<void> {
    if (!data) return;
    
    this.logger.debug("CommandQueryService: Handling TARGET_UPDATE_REQUESTED", data);

    try {
      const target = await this.apiClient.updateTarget(data.id, data.data);
      
      this.eventBus.emitTyped<FrontendEvents["TARGET_UPDATED"]>(
        "TARGET_UPDATED",
        { target }
      );
    } catch (error) {
      this.eventBus.emitTyped<FrontendEvents["TARGET_UPDATE_FAILED"]>(
        "TARGET_UPDATE_FAILED",
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  private async handleDeleteTargetRequest(data?: FrontendEvents["TARGET_DELETE_REQUESTED"]): Promise<void> {
    if (!data) return;
    
    this.logger.debug("CommandQueryService: Handling TARGET_DELETE_REQUESTED", data);

    try {
      await this.apiClient.deleteTarget(data.id);
      
      this.eventBus.emitTyped<FrontendEvents["TARGET_DELETED"]>(
        "TARGET_DELETED",
        { id: data.id }
      );
    } catch (error) {
      this.eventBus.emitTyped<FrontendEvents["TARGET_DELETE_FAILED"]>(
        "TARGET_DELETE_FAILED",
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  // Keep old methods for backward compatibility (deprecated)
  /** @deprecated Use event bus instead */
  async createTarget(data: CreateTargetData): Promise<Target> {
    this.logger.warn("CommandQueryService: Using deprecated direct call, emit TARGET_CREATE_REQUESTED event instead");
    this.eventBus.emit("TARGET_CREATE_REQUESTED", data);
    
    // Wait for response event
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error("Timeout")), 10000);
      
      this.eventBus.once("TARGET_CREATED", (result: { target: Target }) => {
        clearTimeout(timeout);
        resolve(result.target);
      });
      
      this.eventBus.once("TARGET_CREATE_FAILED", (result: { error: string }) => {
        clearTimeout(timeout);
        reject(new Error(result.error));
      });
    });
  }
  
  // Add deprecated methods for other operations...
}
```

#### Step 2.3: Refactor Components to Use Events Only

Update `src/components/TargetList.tsx`:

```typescript
import { createSignal, createEffect, For } from "solid-js";
import { useEventBus, useLogger } from "~/lib/frontend/container";
import type { Target } from "~/lib/services/interfaces/ITargetRepository";
import type { FrontendEvents } from "~/lib/services/interfaces/IEventBus";

export function TargetList() {
  const eventBus = useEventBus();
  const logger = useLogger();
  const [targets, setTargets] = createSignal<Target[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Load targets on mount by emitting event
  createEffect(() => {
    setLoading(true);
    setError(null);
    eventBus.emit("TARGETS_LOAD_REQUESTED", {});
  });

  // Listen for target events with proper cleanup
  createEffect(() => {
    const handleTargetsLoaded = (data: FrontendEvents["TARGETS_LOADED"]) => {
      logger.debug("TargetList: Targets loaded", { count: data.targets.length });
      setTargets(data.targets as Target[]);
      setLoading(false);
    };

    const handleTargetsLoadFailed = (data: FrontendEvents["TARGETS_LOAD_FAILED"]) => {
      logger.error("TargetList: Failed to load targets", { error: data.error });
      setError(data.error);
      setLoading(false);
    };

    const handleTargetDeleted = (data: FrontendEvents["TARGET_DELETED"]) => {
      logger.debug("TargetList: Target deleted", { id: data.id });
      setTargets(prev => prev.filter(t => t.id !== data.id));
    };

    const handleTargetDeleteFailed = (data: FrontendEvents["TARGET_DELETE_FAILED"]) => {
      logger.error("TargetList: Failed to delete target", { error: data.error });
      setError(data.error);
    };

    // Register event listeners
    eventBus.on("TARGETS_LOADED", handleTargetsLoaded);
    eventBus.on("TARGETS_LOAD_FAILED", handleTargetsLoadFailed);
    eventBus.on("TARGET_DELETED", handleTargetDeleted);
    eventBus.on("TARGET_DELETE_FAILED", handleTargetDeleteFailed);

    // Cleanup on unmount
    return () => {
      eventBus.off("TARGETS_LOADED", handleTargetsLoaded);
      eventBus.off("TARGETS_LOAD_FAILED", handleTargetsLoadFailed);
      eventBus.off("TARGET_DELETED", handleTargetDeleted);
      eventBus.off("TARGET_DELETE_FAILED", handleTargetDeleteFailed);
    };
  });

  // Component only emits events - NO direct service calls
  const handleDeleteTarget = (id: string) => {
    if (confirm("Are you sure you want to delete this target?")) {
      logger.debug("TargetList: Requesting target deletion", { id });
      eventBus.emit("TARGET_DELETE_REQUESTED", { id });
    }
  };

  const handleRunSpeedTest = (id: string) => {
    logger.debug("TargetList: Requesting speed test", { targetId: id });
    eventBus.emit("SPEED_TEST_REQUESTED", { targetId: id });
  };

  return (
    <div class="space-y-4">
      <h2 class="text-2xl font-bold text-gray-900">Monitoring Targets</h2>

      {loading() && (
        <div class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p class="mt-2 text-gray-600">Loading targets...</p>
        </div>
      )}

      {error() && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong class="font-bold">Error: </strong>
          <span class="block sm:inline">{error()}</span>
        </div>
      )}

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <For each={targets()}>
          {target => (
            <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              {/* Target card content */}
              <button 
                onClick={() => handleDeleteTarget(target.id)}
                class="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
              <button 
                onClick={() => handleRunSpeedTest(target.id)}
                class="text-blue-600 hover:text-blue-800"
              >
                Run Test
              </button>
            </div>
          )}
        </For>
      </div>
    </div>
  );
}
```

---

## 🧪 Phase 3: Testing & Validation

### Testing Strategy

1. **Unit Tests for EventRPC**
   ```typescript
   describe("EventRPC", () => {
     it("should handle successful request", async () => {
       const eventBus = new MockEventBus();
       const logger = new MockLogger();
       const eventRPC = new EventRPC(eventBus, logger);
       
       // Emit success response after request
       setTimeout(() => {
         eventBus.emit("TARGET_CREATED_test-id", { target: mockTarget });
       }, 100);
       
       const result = await eventRPC.request(
         "TARGET_CREATE_REQUESTED",
         "TARGET_CREATED",
         "TARGET_CREATE_FAILED",
         { requestId: "test-id", name: "Test" }
       );
       
       expect(result).toEqual({ target: mockTarget });
     });
   });
   ```

2. **Integration Tests**
   - Test full event flow: pRPC → Event → Service → Event → pRPC
   - Test frontend event flow: Component → Event → CommandQuery → Event → Component

3. **E2E Tests**
   - Test complete user workflows with event-driven architecture

---

## 📊 Migration Checklist

### Backend
- [ ] Create `EventRPC` helper class
- [ ] Add request IDs to all backend events
- [ ] Update service event handlers to use request IDs
- [ ] Refactor all pRPC endpoints to use EventRPC
- [ ] Add logging for event flow debugging
- [ ] Write unit tests for EventRPC
- [ ] Write integration tests for event flow

### Frontend
- [ ] Update frontend event definitions
- [ ] Make CommandQueryService listen for events
- [ ] Refactor components to emit events only
- [ ] Add event listeners in components
- [ ] Remove direct service calls from components
- [ ] Add loading/error states driven by events
- [ ] Write component tests with event mocking

### Testing
- [ ] All existing tests pass
- [ ] New event flow tests added
- [ ] E2E tests cover event-driven flows
- [ ] Performance tests show no regression

### Documentation
- [ ] Update architecture docs
- [ ] Update developer guides
- [ ] Add event catalog documentation
- [ ] Add migration guide for new developers

---

## 🎯 Benefits After Migration

### Loose Coupling: 10/10 ✅
- No direct service calls anywhere
- All communication through event bus
- Easy to add interceptors/middleware

### Observability: 10/10 ✅
- Every operation flows through event bus
- Easy to log all events
- Simple to add monitoring/metrics

### Testability: 10/10 ✅
- Mock event bus for isolated testing
- Test components without services
- Test services without API layer

### Flexibility: 10/10 ✅
- Add features without touching existing code
- Replace implementations easily
- Add caching/logging without changes

---

## ⚠️ Migration Risks & Mitigation

### Risk: Breaking Changes
**Mitigation:** Keep deprecated methods for backward compatibility during migration

### Risk: Performance Overhead
**Mitigation:** Event bus operations are fast; measure and optimize if needed

### Risk: Debugging Complexity
**Mitigation:** Add comprehensive logging for event flow

### Risk: Developer Learning Curve
**Mitigation:** Provide clear documentation and examples

---

## 📈 Success Metrics

- ✅ Zero direct service calls in pRPC endpoints
- ✅ Zero direct CommandQueryService calls in components
- ✅ All communication through event bus
- ✅ Event flow logging in place
- ✅ Test coverage maintained/improved
- ✅ No performance regression

---

*Migration Plan*
*Target: True Event-Driven Architecture*
*Status: Ready for Implementation*

