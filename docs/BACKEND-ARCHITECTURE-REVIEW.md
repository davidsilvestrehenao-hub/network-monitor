# Backend Architecture Review & Analysis

**Date:** October 1, 2025  
**Reviewer:** AI System Architect  
**Status:** 🟡 Good Foundation, Improvements Recommended

---

## 📊 **Executive Summary**

The backend architecture follows solid principles with **service layer**, **repository pattern**, and **dependency injection**. However, there are several areas that need attention to achieve the project's goal of **perfect loose coupling (10/10)**.

### **Current Score: 7/10**

**Strengths:**
- ✅ Service layer architecture in place
- ✅ Repository pattern implemented
- ✅ Dependency injection container
- ✅ Event-driven communication foundation

**Issues:**
- 🔴 Duplicate Prisma client instantiation
- 🟡 Inconsistent error handling
- 🟡 Mock user IDs hardcoded throughout
- 🟡 Unused event handlers
- 🟡 Type casting issues in event handlers

---

## 🔴 **Critical Issues**

### **Issue #1: Duplicate Prisma Client Instantiation (Critical)**

**Problem:**
You have **TWO separate Prisma client instances**:

1. **In DatabaseService** (`src/lib/services/concrete/DatabaseService.ts`)
2. **In server/db.ts** (`src/server/db.ts`)

```typescript
// DatabaseService.ts
export class DatabaseService implements IDatabaseService {
  private client: PrismaClient;
  
  constructor(private logger: ILogger) {
    this.client = new PrismaClient({ ... }); // Instance #1
  }
}

// server/db.ts
export const prisma = global.prisma || new PrismaClient({ ... }); // Instance #2
```

**Impact:**
- 🔴 Two separate connection pools
- 🔴 Potential connection exhaustion
- 🔴 Inconsistent transaction handling
- 🔴 Memory waste
- 🔴 Violates single responsibility principle

**Root Cause:**
The `server/db.ts` file was created for Auth.js integration but is not aligned with your DI architecture.

**Solution:**

```typescript
// server/db.ts - Export from container instead
import { getAppContext } from "~/lib/container/container";

let prismaInstance: PrismaClient | null = null;

export async function getPrisma(): Promise<PrismaClient> {
  if (!prismaInstance) {
    const ctx = await getAppContext();
    if (!ctx.services.database) {
      throw new Error("Database service not available");
    }
    prismaInstance = ctx.services.database.getClient();
  }
  return prismaInstance;
}

// For synchronous access (needed by Auth.js adapter)
export const prisma = await getPrisma();
```

**Benefits:**
- ✅ Single Prisma client instance
- ✅ Consistent with DI architecture
- ✅ Proper connection management
- ✅ Reduced memory footprint

---

### **Issue #2: Hardcoded Mock User IDs (High Priority)**

**Problem:**
"mock-user" string is hardcoded throughout the codebase:

```typescript
// prpc.ts - Line 34, 70, etc.
ownerId: "mock-user", // TODO: Get from session
const targets = await ctx.services.monitor.getTargets("mock-user");
```

**Impact:**
- 🔴 No actual authentication
- 🔴 Security risk in production
- 🔴 Can't test multi-user scenarios
- 🔴 Technical debt

**Locations:**
- `src/server/prpc.ts` (multiple locations)
- `src/lib/frontend/services/APIClient.ts` (line 38, 52, 63)
- `src/server/api/auth.ts` (lines 29, 49)

**Solution:**

```typescript
// Create auth context helper
export async function getAuthContext() {
  const ctx = await getAppContext();
  
  // Get current user from session (implement actual auth later)
  const session = await ctx.services.auth.getSession();
  if (!session) {
    throw new Error("Unauthorized - no active session");
  }
  
  return {
    ...ctx,
    userId: session.user.id,
    user: session.user,
  };
}

// Use in pRPC endpoints
export const createTarget = async (data: { name: string; address: string }) => {
  "use server";
  const ctx = await getAuthContext(); // Now has userId
  
  const target = await ctx.services.monitor.createTarget({
    name: data.name,
    address: data.address,
    ownerId: ctx.userId, // Use actual user ID
  });
  
  return target;
};
```

**Benefits:**
- ✅ Centralized auth logic
- ✅ Easy to implement real auth later
- ✅ Type-safe user context
- ✅ Testable with different users

---

### **Issue #3: Type Casting in Event Handlers (Medium Priority)**

**Problem:**
Event handlers use unsafe type casting:

```typescript
// MonitorService.ts - Lines 33-54
this.eventBus.on(
  "TARGET_CREATE_REQUESTED",
  this.handleTargetCreateRequested.bind(this) as (data?: unknown) => void
);
```

**Impact:**
- 🟡 Type safety compromised
- 🟡 Runtime errors possible
- 🟡 Hard to maintain
- 🟡 Violates TypeScript best practices

**Root Cause:**
The `IEventBus.on()` method signature expects `(data?: unknown) => void` but typed handlers expect specific types.

**Solution:**

```typescript
// Option 1: Fix EventBus interface
export interface IEventBus {
  emit(event: string, data?: unknown): void;
  emitTyped<T>(event: string, data: T): void;
  
  // Add typed version
  on<T = unknown>(event: string, handler: (data?: T) => void): void;
  onTyped<T>(event: string, handler: (data: T) => void): void;
  
  off<T = unknown>(event: string, handler: (data?: T) => void): void;
  once<T = unknown>(event: string, handler: (data?: T) => void): void;
  onceTyped<T>(event: string, handler: (data: T) => void): void;
  removeAllListeners(event?: string): void;
}

// Option 2: Wrapper method in services
private registerTypedHandler<T>(
  event: string,
  handler: (data: T) => void | Promise<void>
): void {
  this.eventBus.on(event, handler as (data?: unknown) => void);
}

// Usage
this.registerTypedHandler<BackendEvents["TARGET_CREATE_REQUESTED"]>(
  "TARGET_CREATE_REQUESTED",
  this.handleTargetCreateRequested.bind(this)
);
```

---

## 🟡 **Medium Priority Issues**

### **Issue #4: Unused Event Handlers**

**Problem:**
Services register event handlers but they're never used because pRPC endpoints call services directly:

```typescript
// MonitorService.ts sets up handlers
private setupEventHandlers(): void {
  this.eventBus.on("TARGET_CREATE_REQUESTED", ...); // Never triggered
}

// But prpc.ts calls directly
const target = await ctx.services.monitor.createTarget(data); // Direct call
```

**Impact:**
- 🟡 Dead code (handlers never executed)
- 🟡 Confusion about architecture
- 🟡 Maintenance burden
- 🟡 Not truly event-driven

**Decision Needed:**
Choose one of these approaches:

**Option A: Truly Event-Driven (Recommended for 10/10 score)**
```typescript
// pRPC emits events
export const createTarget = async (data: { name: string; address: string }) => {
  "use server";
  const ctx = await getContext();
  
  // Emit event and wait for result
  return new Promise((resolve, reject) => {
    ctx.services.eventBus.once("TARGET_CREATED", resolve);
    ctx.services.eventBus.once("TARGET_CREATE_FAILED", (err) => reject(err));
    ctx.services.eventBus.emitTyped("TARGET_CREATE_REQUESTED", data);
  });
};
```

**Option B: Direct Calls (Simpler, current approach)**
```typescript
// Remove event handlers from services
// Keep direct service calls in pRPC
export const createTarget = async (data: { name: string; address: string }) => {
  "use server";
  const ctx = await getContext();
  const target = await ctx.services.monitor.createTarget(data);
  return target;
};
```

**Recommendation:** Use **Option B** for now (remove unused handlers), plan **Option A** for future if you need true event-driven architecture with message queues, etc.

---

### **Issue #5: Inconsistent Error Handling**

**Problem:**
Error handling patterns vary across services:

```typescript
// Some services wrap errors
throw new Error(`Failed to create target: ${error.message}`);

// Others throw directly
throw error;

// Some log, some don't
this.logger.error("Failed", { error });
```

**Impact:**
- 🟡 Hard to debug
- 🟡 Inconsistent error messages
- 🟡 Some errors not logged

**Solution:**

```typescript
// Create error handler utility
export class ServiceError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly service: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = "ServiceError";
  }
}

// Use in services
async createTarget(data: CreateTargetData): Promise<Target> {
  try {
    const target = await this.targetRepository.create(data);
    this.eventBus.emitTyped("TARGET_CREATED", target);
    return target;
  } catch (error) {
    this.logger.error("Target creation failed", { error, data });
    throw new ServiceError(
      "Failed to create monitoring target",
      "TARGET_CREATE_FAILED",
      "MonitorService",
      error
    );
  }
}
```

---

### **Issue #6: Repository Redundancy**

**Problem:**
You have duplicate repository interfaces for the same entities:

```
ITargetRepository          vs  IMonitoringTargetRepository
ISpeedTestRepository       vs  ISpeedTestResultRepository
```

**Impact:**
- 🟡 Confusion about which to use
- 🟡 Duplicate code
- 🟡 Maintenance burden

**Analysis:**

Looking at the code:
- `ITargetRepository` - Full-featured, returns `Target` with relations
- `IMonitoringTargetRepository` - Simpler, returns Prisma types directly

**Recommendation:**
Consolidate to use `ITargetRepository` consistently (it's better designed) and deprecate `IMonitoringTargetRepository`.

---

## ✅ **Architectural Strengths**

### **1. Service Layer Architecture**

The service layer is properly implemented:

```typescript
// Router → Service → Repository → Database ✅
export const createTarget = async (data: { name: string; address: string }) => {
  const ctx = await getContext();
  const target = await ctx.services.monitor.createTarget(data); // Service
  return target;
};

class MonitorService {
  async createTarget(data) {
    return await this.targetRepository.create(data); // Repository
  }
}
```

**Why this is good:**
- Clear separation of concerns
- Business logic in services
- Data access in repositories
- Easy to test and mock

---

### **2. Repository Pattern**

Repositories properly abstract database access:

```typescript
export class TargetRepository implements ITargetRepository {
  constructor(
    private databaseService: IDatabaseService,
    private logger: ILogger
  ) {}

  async findById(id: string): Promise<Target | null> {
    const result = await this.databaseService
      .getClient()
      .monitoringTarget.findUnique({ where: { id } });
    
    return result ? this.mapToTarget(result) : null; // Type mapping ✅
  }
}
```

**Why this is good:**
- Prisma isolated to repositories
- Type mapping to domain models
- Testable with mock repositories
- Clean interface contracts

---

### **3. Dependency Injection**

Services are properly injected:

```typescript
const baseServiceConfig = {
  [TYPES.IMonitorService]: {
    factory: createServiceFactory<IMonitorService>(
      container => new MonitorService(
        container.get<ITargetRepository>(TYPES.ITargetRepository),
        // ... other dependencies
      )
    ),
    dependencies: [TYPES.ITargetRepository, /* ... */],
    singleton: true,
  },
};
```

**Why this is good:**
- Configuration-driven
- Easy to swap implementations
- Supports testing with mocks
- Clear dependency graph

---

### **4. Interface-Based Design**

All services use interfaces:

```typescript
export interface IMonitorService {
  createTarget(data: CreateTargetData): Promise<Target>;
  getTarget(id: string): Promise<Target | null>;
  // ...
}
```

**Why this is good:**
- Loose coupling
- Easy to mock for testing
- Clear contracts
- Supports multiple implementations

---

## 🎯 **Recommendations by Priority**

### **Phase 1: Critical Fixes (Week 1)**

1. **Fix Prisma Duplication**
   - Consolidate to single instance
   - Update Auth.js configuration
   - Remove `server/db.ts` or refactor it

2. **Implement Auth Context**
   - Create `getAuthContext()` helper
   - Replace all "mock-user" references
   - Add proper session handling

3. **Fix Type Casting**
   - Update `IEventBus` interface
   - Remove all `as (data?: unknown) => void` casts
   - Add type-safe event handler registration

### **Phase 2: Architecture Cleanup (Week 2)**

4. **Remove Unused Event Handlers**
   - Decide on event-driven vs direct call approach
   - Remove dead event handler code
   - Update documentation

5. **Standardize Error Handling**
   - Create `ServiceError` class
   - Update all services to use consistent pattern
   - Add error logging standards

6. **Consolidate Repositories**
   - Deprecate duplicate interfaces
   - Migrate to unified repository approach
   - Update all service dependencies

### **Phase 3: Enhancement (Week 3)**

7. **Add Request Context**
   - Implement request ID tracking
   - Add correlation IDs for logging
   - Improve observability

8. **Improve Testing**
   - Add service integration tests
   - Test repository implementations
   - Add end-to-end API tests

---

## 📊 **Service Organization Analysis**

### **Current Structure**

```
src/lib/services/
├── interfaces/     (20 files) ✅ Good
├── concrete/       (21 files) ✅ Good
└── mocks/         (15 files) ✅ Good
```

### **Service Categories**

**Core Services (3):**
- ✅ `ILogger` - Logging abstraction
- ✅ `IEventBus` - Event communication
- ✅ `IDatabaseService` - Prisma client wrapper

**Repositories (11):**
- ✅ `IUserRepository`
- ✅ `ITargetRepository` / ⚠️ `IMonitoringTargetRepository` (duplicate)
- ✅ `ISpeedTestRepository` / ⚠️ `ISpeedTestResultRepository` (duplicate)
- ✅ `IAlertRuleRepository`
- ✅ `IIncidentEventRepository`
- ✅ `IPushSubscriptionRepository`
- ✅ `INotificationRepository`

**Business Services (5):**
- ✅ `IMonitorService` - Target and monitoring management
- ✅ `ISpeedTestService` - Speed testing operations
- ✅ `ISpeedTestConfigService` - Test configuration
- ✅ `IAlertingService` - Alert rules and incidents
- ✅ `INotificationService` - Notifications and push
- ✅ `IAuthService` - Authentication

---

## 🔍 **Code Quality Analysis**

### **Service Implementation Quality**

**MonitorService: 8/10**
- ✅ Proper dependency injection
- ✅ Good logging
- ✅ Event emission
- ⚠️ Unused event handlers
- ⚠️ Type casting in event registration

**AlertingService: 9/10**
- ✅ Clean implementation
- ✅ Good separation of concerns
- ✅ Proper error handling

**NotificationService: 8/10**
- ✅ Good structure
- ✅ Multiple notification channels
- ⚠️ Push notification implementation incomplete

**DatabaseService: 7/10**
- ✅ Clean interface
- ✅ Connection management
- 🔴 Duplicate instance issue

---

## 🚫 **Anti-Patterns Found**

### **1. Direct Prisma Export**

```typescript
// server/db.ts
export const prisma = new PrismaClient(); // ❌ Bypasses DI
```

### **2. Type Casting**

```typescript
// Services
this.handler.bind(this) as (data?: unknown) => void; // ❌ Unsafe
```

### **3. Hardcoded Values**

```typescript
ownerId: "mock-user", // ❌ Should come from session
sessionToken: "mock-session-token", // ❌ Not a real token
```

### **4. Inconsistent Error Messages**

```typescript
throw new Error(`Failed to create target: ${error.message}`); // Format varies
```

---

## ✅ **Best Practices Checklist**

### **Currently Implemented**

- ✅ Service layer architecture
- ✅ Repository pattern
- ✅ Dependency injection
- ✅ Interface-based design
- ✅ Type safety (mostly)
- ✅ Logging
- ✅ Mock implementations

### **Needs Implementation**

- ⚠️ Single Prisma instance
- ⚠️ Proper authentication
- ⚠️ Type-safe event handlers
- ⚠️ Consistent error handling
- ⚠️ Request context tracking
- ⚠️ Comprehensive testing

---

## 🎯 **Path to 10/10 Architecture**

To achieve **perfect loose coupling (10/10)**:

### **Current Score Breakdown**

- **Service Layer:** 9/10 (nearly perfect)
- **Repository Pattern:** 9/10 (excellent implementation)
- **Dependency Injection:** 8/10 (good, but Prisma duplication)
- **Event-Driven:** 5/10 (foundation exists, not fully utilized)
- **Error Handling:** 7/10 (works, but inconsistent)
- **Type Safety:** 7/10 (good, but type casting issues)

**Overall: 7.5/10** → Target: **10/10**

### **Required Changes**

1. ✅ Fix Prisma duplication (+1.0)
2. ✅ Implement proper auth context (+0.5)
3. ✅ Fix type casting issues (+0.5)
4. ✅ Remove unused handlers (+0.3)
5. ✅ Standardize error handling (+0.2)

**Projected Score: 10/10** 🎉

---

## 📝 **Next Steps**

1. **Review this document** with the team
2. **Prioritize fixes** based on impact
3. **Create tickets** for each phase
4. **Implement incrementally** to avoid disruption
5. **Test thoroughly** after each change
6. **Update documentation** as changes are made

Remember: **The architecture is already solid. These improvements will make it exceptional.**

