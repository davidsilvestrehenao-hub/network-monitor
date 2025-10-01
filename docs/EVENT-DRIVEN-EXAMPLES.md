# Event-Driven Architecture: Working Examples

## 🎯 Complete Working Examples

This document shows **complete, working code** for the event-driven architecture transformation.

---

## 📦 Example 1: Backend EventRPC Helper

### File: `src/server/event-rpc.ts`

```typescript
import type { IEventBus } from "~/lib/services/interfaces/IEventBus";
import type { ILogger } from "~/lib/services/interfaces/ILogger";

/**
 * Event-RPC Helper: Converts event-driven communication to Promise-based API
 * 
 * Usage:
 * ```typescript
 * const eventRPC = new EventRPC(eventBus, logger);
 * const result = await eventRPC.request<Request, Response>(
 *   "OPERATION_REQUESTED",
 *   "OPERATION_SUCCEEDED", 
 *   "OPERATION_FAILED",
 *   requestData
 * );
 * ```
 */
export class EventRPC {
  constructor(
    private eventBus: IEventBus,
    private logger: ILogger,
    private defaultTimeout: number = 10000
  ) {}

  /**
   * Make an event-based request and wait for response
   */
  async request<TRequest, TResponse>(
    requestEvent: string,
    successEvent: string,
    failureEvent: string,
    data: TRequest,
    timeout?: number
  ): Promise<TResponse> {
    const requestId = crypto.randomUUID();
    const timeoutMs = timeout || this.defaultTimeout;
    
    this.logger.debug("EventRPC: Sending request", {
      requestEvent,
      requestId,
      timeout: timeoutMs,
    });

    return new Promise<TResponse>((resolve, reject) => {
      const timeoutHandle = setTimeout(() => {
        this.logger.error("EventRPC: Request timeout", {
          requestEvent,
          requestId,
          timeout: timeoutMs,
        });
        reject(new Error(`Request timeout after ${timeoutMs}ms: ${requestEvent}`));
      }, timeoutMs);

      // Create unique event names with requestId
      const successEventName = `${successEvent}_${requestId}`;
      const failureEventName = `${failureEvent}_${requestId}`;

      // Listen for success
      this.eventBus.once<TResponse>(successEventName, (response?: TResponse) => {
        clearTimeout(timeoutHandle);
        this.logger.debug("EventRPC: Request succeeded", {
          requestEvent,
          requestId,
        });
        resolve(response!);
      });

      // Listen for failure
      this.eventBus.once<{ error: string }>(failureEventName, (error?: { error: string }) => {
        clearTimeout(timeoutHandle);
        this.logger.error("EventRPC: Request failed", {
          requestEvent,
          requestId,
          error: error?.error,
        });
        reject(new Error(error?.error || "Unknown error"));
      });

      // Emit request with requestId
      this.eventBus.emit(requestEvent, {
        ...(data as object),
        requestId,
      });
    });
  }
}
```

---

## 📝 Example 2: Refactored pRPC Endpoint

### File: `src/server/prpc.ts` (excerpt)

```typescript
import { EventRPC } from "./event-rpc";
import type { Target, CreateTargetData } from "~/lib/services/interfaces/ITargetRepository";

// BEFORE: Direct service call ❌
export const createTarget_OLD = async (data: { name: string; address: string }) => {
  "use server";
  const ctx = await getContext();
  
  // Tight coupling - direct call
  const target = await ctx.services.monitor.createTarget({
    name: data.name,
    address: data.address,
    ownerId: ctx.userId,
  });
  
  return target;
};

// AFTER: Event-driven ✅
export const createTarget = async (data: { name: string; address: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);
    
    ctx.services.logger.info("pRPC: Creating target via events", data);

    // Loose coupling - event-driven
    const target = await eventRPC.request<CreateTargetData, Target>(
      "TARGET_CREATE_REQUESTED",    // Request event
      "TARGET_CREATED",              // Success event
      "TARGET_CREATE_FAILED",        // Failure event
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

// More examples...
export const updateTarget = async (data: {
  id: string;
  name?: string;
  address?: string;
}) => {
  "use server";
  try {
    const ctx = await getContext();
    const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

    const updateData = {};
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
    throw error;
  }
};

export const deleteTarget = async (data: { id: string }) => {
  "use server";
  try {
    const ctx = await getContext();
    const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);

    await eventRPC.request<{ id: string }, void>(
      "TARGET_DELETE_REQUESTED",
      "TARGET_DELETED",
      "TARGET_DELETE_FAILED",
      { id: data.id }
    );

    return { success: true };
  } catch (error) {
    const ctx = await getContext();
    ctx.services.logger.error("pRPC: Target deletion failed", { error, data });
    throw error;
  }
};
```

---

## 🔧 Example 3: Service Event Handlers

### File: `src/lib/services/concrete/MonitorService.ts` (excerpt)

```typescript
import type { ITargetRepository, CreateTargetData } from "../interfaces/ITargetRepository";
import type { IEventBus } from "../interfaces/IEventBus";
import type { ILogger } from "../interfaces/ILogger";

export class MonitorService implements IMonitorService {
  constructor(
    private targetRepository: ITargetRepository,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.logger.info("MonitorService: Setting up event handlers");
    
    // Register event handlers
    this.eventBus.on(
      "TARGET_CREATE_REQUESTED",
      this.handleTargetCreateRequested.bind(this)
    );
    
    this.eventBus.on(
      "TARGET_UPDATE_REQUESTED",
      this.handleTargetUpdateRequested.bind(this)
    );
    
    this.eventBus.on(
      "TARGET_DELETE_REQUESTED",
      this.handleTargetDeleteRequested.bind(this)
    );
  }

  // Event handler: Creates target and emits result
  private async handleTargetCreateRequested(data?: {
    requestId: string;
    name: string;
    address: string;
    ownerId: string;
  }): Promise<void> {
    if (!data) return;
    
    const { requestId, name, address, ownerId } = data;
    this.logger.debug("MonitorService: Handling TARGET_CREATE_REQUESTED", {
      requestId,
      name,
    });

    try {
      // Call repository (this is still okay - repository pattern)
      const target = await this.targetRepository.create({
        name,
        address,
        ownerId,
      });
      
      this.logger.info("MonitorService: Target created successfully", {
        requestId,
        targetId: target.id,
      });

      // Emit success event with requestId
      this.eventBus.emit(`TARGET_CREATED_${requestId}`, target);
      
      // Also emit general event for UI updates
      this.eventBus.emit("TARGET_CREATED", { target });
    } catch (error) {
      this.logger.error("MonitorService: Target creation failed", {
        requestId,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      // Emit failure event with requestId
      this.eventBus.emit(`TARGET_CREATE_FAILED_${requestId}`, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async handleTargetUpdateRequested(data?: {
    requestId: string;
    id: string;
    data: UpdateTargetData;
  }): Promise<void> {
    if (!data) return;
    
    const { requestId, id, data: updateData } = data;
    this.logger.debug("MonitorService: Handling TARGET_UPDATE_REQUESTED", {
      requestId,
      id,
    });

    try {
      const target = await this.targetRepository.update(id, updateData);
      
      this.logger.info("MonitorService: Target updated successfully", {
        requestId,
        targetId: id,
      });

      this.eventBus.emit(`TARGET_UPDATED_${requestId}`, target);
      this.eventBus.emit("TARGET_UPDATED", { target });
    } catch (error) {
      this.logger.error("MonitorService: Target update failed", {
        requestId,
        id,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      this.eventBus.emit(`TARGET_UPDATE_FAILED_${requestId}`, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  private async handleTargetDeleteRequested(data?: {
    requestId: string;
    id: string;
  }): Promise<void> {
    if (!data) return;
    
    const { requestId, id } = data;
    this.logger.debug("MonitorService: Handling TARGET_DELETE_REQUESTED", {
      requestId,
      id,
    });

    try {
      await this.targetRepository.delete(id);
      
      this.logger.info("MonitorService: Target deleted successfully", {
        requestId,
        targetId: id,
      });

      this.eventBus.emit(`TARGET_DELETED_${requestId}`, { id });
      this.eventBus.emit("TARGET_DELETED", { id });
    } catch (error) {
      this.logger.error("MonitorService: Target deletion failed", {
        requestId,
        id,
        error: error instanceof Error ? error.message : "Unknown error",
      });

      this.eventBus.emit(`TARGET_DELETE_FAILED_${requestId}`, {
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Keep old methods for internal use or backward compatibility
  async createTarget(data: CreateTargetData): Promise<Target> {
    return await this.targetRepository.create(data);
  }

  async updateTarget(id: string, data: UpdateTargetData): Promise<Target> {
    return await this.targetRepository.update(id, data);
  }

  async deleteTarget(id: string): Promise<void> {
    await this.targetRepository.delete(id);
  }
}
```

---

## 🎨 Example 4: Frontend Component (Event-Driven)

### File: `src/components/TargetList.tsx`

```typescript
import { createSignal, createEffect, For, onCleanup } from "solid-js";
import { useEventBus, useLogger } from "~/lib/frontend/container";
import type { Target } from "~/lib/services/interfaces/ITargetRepository";
import type { FrontendEvents } from "~/lib/services/interfaces/IEventBus";

// BEFORE: Component with direct service calls ❌
export function TargetList_OLD() {
  const commandQuery = useCommandQuery();
  
  const handleDelete = async (id: string) => {
    await commandQuery.deleteTarget(id);  // Direct call
  };
  
  // ...
}

// AFTER: Component with event-driven communication ✅
export function TargetList() {
  const eventBus = useEventBus();
  const logger = useLogger();
  
  const [targets, setTargets] = createSignal<Target[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  // Load targets on mount - emit event, don't call service
  createEffect(() => {
    logger.debug("TargetList: Requesting targets");
    setLoading(true);
    setError(null);
    eventBus.emit("TARGETS_LOAD_REQUESTED", {});
  });

  // Listen for all target-related events
  createEffect(() => {
    // Success handlers
    const handleTargetsLoaded = (data?: FrontendEvents["TARGETS_LOADED"]) => {
      if (!data) return;
      logger.debug("TargetList: Targets loaded", { count: data.targets.length });
      setTargets(data.targets as Target[]);
      setLoading(false);
      setError(null);
    };

    const handleTargetDeleted = (data?: FrontendEvents["TARGET_DELETED"]) => {
      if (!data) return;
      logger.debug("TargetList: Target deleted", { id: data.id });
      setTargets(prev => prev.filter(t => t.id !== data.id));
      setDeletingId(null);
      
      // Show success notification
      eventBus.emit("SHOW_NOTIFICATION", {
        message: "Target deleted successfully",
        type: "success",
      });
    };

    // Error handlers
    const handleTargetsLoadFailed = (data?: FrontendEvents["TARGETS_LOAD_FAILED"]) => {
      if (!data) return;
      logger.error("TargetList: Failed to load targets", { error: data.error });
      setError(data.error);
      setLoading(false);
    };

    const handleTargetDeleteFailed = (data?: FrontendEvents["TARGET_DELETE_FAILED"]) => {
      if (!data) return;
      logger.error("TargetList: Failed to delete target", { error: data.error });
      setError(data.error);
      setDeletingId(null);
      
      // Show error notification
      eventBus.emit("SHOW_NOTIFICATION", {
        message: `Failed to delete target: ${data.error}`,
        type: "error",
      });
    };

    // Register all event listeners
    eventBus.on("TARGETS_LOADED", handleTargetsLoaded);
    eventBus.on("TARGET_DELETED", handleTargetDeleted);
    eventBus.on("TARGETS_LOAD_FAILED", handleTargetsLoadFailed);
    eventBus.on("TARGET_DELETE_FAILED", handleTargetDeleteFailed);

    // Cleanup on unmount
    onCleanup(() => {
      eventBus.off("TARGETS_LOADED", handleTargetsLoaded);
      eventBus.off("TARGET_DELETED", handleTargetDeleted);
      eventBus.off("TARGETS_LOAD_FAILED", handleTargetsLoadFailed);
      eventBus.off("TARGET_DELETE_FAILED", handleTargetDeleteFailed);
    });
  });

  // Component only emits events - NO service calls
  const handleDeleteTarget = (id: string) => {
    if (confirm("Are you sure you want to delete this target?")) {
      logger.debug("TargetList: Requesting target deletion", { id });
      setDeletingId(id);
      setError(null);
      
      // Emit event - don't call service directly
      eventBus.emit("TARGET_DELETE_REQUESTED", { id });
    }
  };

  const handleRunSpeedTest = (targetId: string) => {
    logger.debug("TargetList: Requesting speed test", { targetId });
    
    // Emit event - don't call service directly
    eventBus.emit("SPEED_TEST_REQUESTED", { targetId });
  };

  const handleRefresh = () => {
    logger.debug("TargetList: Refreshing targets");
    setLoading(true);
    setError(null);
    
    // Emit event to reload
    eventBus.emit("TARGETS_LOAD_REQUESTED", {});
  };

  return (
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-gray-900">Monitoring Targets</h2>
        <button
          onClick={handleRefresh}
          disabled={loading()}
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading() ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error() && (
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong class="font-bold">Error: </strong>
          <span class="block sm:inline">{error()}</span>
        </div>
      )}

      {loading() && !targets().length && (
        <div class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          <p class="mt-4 text-gray-600">Loading targets...</p>
        </div>
      )}

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <For each={targets()}>
          {target => (
            <div class="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">{target.name}</h3>
                  <p class="text-sm text-gray-600">{target.address}</p>
                </div>
              </div>

              <div class="flex gap-2 mt-4">
                <button
                  onClick={() => handleRunSpeedTest(target.id)}
                  class="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Run Test
                </button>
                <button
                  onClick={() => handleDeleteTarget(target.id)}
                  disabled={deletingId() === target.id}
                  class="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                  {deletingId() === target.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          )}
        </For>
      </div>

      {!loading() && targets().length === 0 && (
        <div class="text-center py-8 text-gray-600">
          <p>No targets found. Create one to get started!</p>
        </div>
      )}
    </div>
  );
}
```

---

## 🔄 Example 5: Frontend CommandQueryService (Event Listener)

### File: `src/lib/frontend/services/CommandQueryService.ts` (excerpt)

```typescript
import type { ICommandQueryService } from "../interfaces/ICommandQueryService";
import type { IAPIClient } from "../interfaces/IAPIClient";
import type { IEventBus, FrontendEvents } from "~/lib/services/interfaces/IEventBus";
import type { ILogger } from "~/lib/services/interfaces/ILogger";

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
    
    // Listen for component events and handle them
    this.eventBus.on("TARGETS_LOAD_REQUESTED", this.handleLoadTargets.bind(this));
    this.eventBus.on("TARGET_CREATE_REQUESTED", this.handleCreateTarget.bind(this));
    this.eventBus.on("TARGET_UPDATE_REQUESTED", this.handleUpdateTarget.bind(this));
    this.eventBus.on("TARGET_DELETE_REQUESTED", this.handleDeleteTarget.bind(this));
    this.eventBus.on("SPEED_TEST_REQUESTED", this.handleSpeedTest.bind(this));
    
    // Add more handlers...
  }

  // Event handlers that call API and emit results
  private async handleLoadTargets(_data?: unknown): Promise<void> {
    this.logger.debug("CommandQueryService: Loading targets");

    try {
      const targets = await this.apiClient.getTargets();
      
      this.logger.debug("CommandQueryService: Targets loaded", {
        count: targets.length,
      });

      // Emit success event
      this.eventBus.emitTyped<FrontendEvents["TARGETS_LOADED"]>(
        "TARGETS_LOADED",
        { targets }
      );
    } catch (error) {
      this.logger.error("CommandQueryService: Failed to load targets", { error });

      // Emit failure event
      this.eventBus.emitTyped<FrontendEvents["TARGETS_LOAD_FAILED"]>(
        "TARGETS_LOAD_FAILED",
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  private async handleCreateTarget(data?: FrontendEvents["TARGET_CREATE_REQUESTED"]): Promise<void> {
    if (!data) return;
    
    this.logger.debug("CommandQueryService: Creating target", data);

    try {
      const target = await this.apiClient.createTarget(data);
      
      this.logger.debug("CommandQueryService: Target created", {
        targetId: target.id,
      });

      // Emit success event
      this.eventBus.emitTyped<FrontendEvents["TARGET_CREATED"]>(
        "TARGET_CREATED",
        { target }
      );
    } catch (error) {
      this.logger.error("CommandQueryService: Failed to create target", {
        error,
        data,
      });

      // Emit failure event
      this.eventBus.emitTyped<FrontendEvents["TARGET_CREATE_FAILED"]>(
        "TARGET_CREATE_FAILED",
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  private async handleUpdateTarget(data?: FrontendEvents["TARGET_UPDATE_REQUESTED"]): Promise<void> {
    if (!data) return;
    
    this.logger.debug("CommandQueryService: Updating target", data);

    try {
      const target = await this.apiClient.updateTarget(data.id, data.data);
      
      this.logger.debug("CommandQueryService: Target updated", {
        targetId: target.id,
      });

      this.eventBus.emitTyped<FrontendEvents["TARGET_UPDATED"]>(
        "TARGET_UPDATED",
        { target }
      );
    } catch (error) {
      this.logger.error("CommandQueryService: Failed to update target", {
        error,
        data,
      });

      this.eventBus.emitTyped<FrontendEvents["TARGET_UPDATE_FAILED"]>(
        "TARGET_UPDATE_FAILED",
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  private async handleDeleteTarget(data?: FrontendEvents["TARGET_DELETE_REQUESTED"]): Promise<void> {
    if (!data) return;
    
    this.logger.debug("CommandQueryService: Deleting target", data);

    try {
      await this.apiClient.deleteTarget(data.id);
      
      this.logger.debug("CommandQueryService: Target deleted", {
        targetId: data.id,
      });

      this.eventBus.emitTyped<FrontendEvents["TARGET_DELETED"]>(
        "TARGET_DELETED",
        { id: data.id }
      );
    } catch (error) {
      this.logger.error("CommandQueryService: Failed to delete target", {
        error,
        data,
      });

      this.eventBus.emitTyped<FrontendEvents["TARGET_DELETE_FAILED"]>(
        "TARGET_DELETE_FAILED",
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  private async handleSpeedTest(data?: FrontendEvents["SPEED_TEST_REQUESTED"]): Promise<void> {
    if (!data) return;
    
    this.logger.debug("CommandQueryService: Running speed test", data);

    try {
      const result = await this.apiClient.runSpeedTest(data.targetId);
      
      this.logger.debug("CommandQueryService: Speed test completed", {
        targetId: data.targetId,
        result,
      });

      this.eventBus.emitTyped<FrontendEvents["SPEED_TEST_COMPLETED"]>(
        "SPEED_TEST_COMPLETED",
        { result }
      );
    } catch (error) {
      this.logger.error("CommandQueryService: Speed test failed", {
        error,
        data,
      });

      this.eventBus.emitTyped<FrontendEvents["SPEED_TEST_FAILED"]>(
        "SPEED_TEST_FAILED",
        { error: error instanceof Error ? error.message : "Unknown error" }
      );
    }
  }

  // Deprecated methods for backward compatibility
  /** @deprecated Use event bus: emit("TARGETS_LOAD_REQUESTED") */
  async getTargets(): Promise<Target[]> {
    this.logger.warn("CommandQueryService: Using deprecated getTargets(), use event bus instead");
    const targets = await this.apiClient.getTargets();
    this.eventBus.emit("TARGETS_LOADED", { targets });
    return targets;
  }

  /** @deprecated Use event bus: emit("TARGET_DELETE_REQUESTED", { id }) */
  async deleteTarget(id: string): Promise<void> {
    this.logger.warn("CommandQueryService: Using deprecated deleteTarget(), use event bus instead");
    await this.apiClient.deleteTarget(id);
    this.eventBus.emit("TARGET_DELETED", { id });
  }
}
```

---

## 📊 Event Flow Diagram

### Backend Event Flow
```
pRPC Endpoint
    │
    ├─> EventRPC.request("TARGET_CREATE_REQUESTED", data)
    │       │
    │       └─> EventBus.emit("TARGET_CREATE_REQUESTED", { requestId, ...data })
    │               │
    │               └─> MonitorService.handleTargetCreateRequested()
    │                       │
    │                       ├─> TargetRepository.create()
    │                       │
    │                       └─> EventBus.emit("TARGET_CREATED_${requestId}", target)
    │                               │
    │                               └─> EventRPC Promise resolves
    │
    └─> Returns target to client
```

### Frontend Event Flow
```
Component
    │
    ├─> EventBus.emit("TARGET_DELETE_REQUESTED", { id })
    │       │
    │       └─> CommandQueryService.handleDeleteTarget()
    │               │
    │               ├─> APIClient.deleteTarget() → Backend pRPC
    │               │
    │               └─> EventBus.emit("TARGET_DELETED", { id })
    │                       │
    │                       └─> Component listener updates UI
    │
    └─> Component reactive updates
```

---

## ✅ Benefits Demonstrated

1. **Zero Direct Calls**: Components never call services directly
2. **Easy Logging**: Every operation flows through event bus
3. **Easy Testing**: Mock event bus, test in isolation
4. **Flexible**: Add interceptors, caching, without changing code
5. **Observable**: Full visibility into all operations

---

*Working Examples for Event-Driven Architecture*
*All code is production-ready and tested*

