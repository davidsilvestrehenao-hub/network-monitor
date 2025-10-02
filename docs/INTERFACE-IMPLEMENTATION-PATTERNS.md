# Interface Implementation Patterns

## Overview

This document outlines the mandatory interface implementation patterns that ensure consistency, polymorphism, and type safety across the Network Monitor application. All interfaces must follow these patterns to maintain architectural integrity.

## Core Principles

### 1. **Type Safety Hierarchy**

**Prefer proper interfaces, use generics when necessary, and only use `any` or `unknown` when absolutely required with clear justification.**

This hierarchy ensures maximum type safety while maintaining necessary flexibility:

- **Best**: Proper interfaces with explicit contracts
- **Good**: Generics for type flexibility with constraints
- **Acceptable**: `unknown` with type guards for runtime safety
- **Last Resort**: `any` only when absolutely necessary with clear justification

### 2. **Interface Polymorphism**

All interfaces must extend their appropriate base interfaces to ensure consistent contracts and enable polymorphism.

### 3. **Generic Type Parameters**

Use generics to ensure compile-time safety and prevent runtime errors while maintaining flexibility.

### 4. **Consistency**

Standard CRUD operations are guaranteed across all implementations through base interfaces.

### 5. **Interface Placement Strategy**

Interfaces must be placed based on **usage patterns**, not implementation location. Service interfaces are **contracts** that define public APIs and must remain accessible to all consumers.

## Type Safety Hierarchy Examples

### ✅ **Best: Proper Interfaces**

```typescript
// Define explicit contracts
interface UserData {
  id: string;
  name: string;
  email: string;
}

interface UserRepository {
  findById(id: string): Promise<UserData | null>;
  create(data: Omit<UserData, 'id'>): Promise<UserData>;
}
```

### ✅ **Good: Generics with Constraints**

```typescript
// Flexible but type-safe
interface Repository<T extends { id: string }, CreateDto> {
  findById(id: string): Promise<T | null>;
  create(data: CreateDto): Promise<T>;
}

// Usage with constraints
function processEntity<T extends { id: string; name: string }>(entity: T): T {
  return { ...entity, processed: true };
}
```

### ⚠️ **Acceptable: unknown with Type Guards**

```typescript
// Runtime type checking with safety
function handleApiResponse(response: unknown): UserData | null {
  // Justification: Using unknown for external API response, then type guarding
  if (
    typeof response === 'object' &&
    response !== null &&
    'id' in response &&
    'name' in response &&
    typeof (response as { id: unknown }).id === 'string'
  ) {
    return response as UserData;
  }
  return null;
}
```

### ❌ **Last Resort: any (Must Be Justified)**

```typescript
// Only when absolutely necessary
class TestHelper {
  // Justification: Using any type to access private methods for testing purposes
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  accessPrivateMethod(service: any, methodName: string): any {
    return service[methodName];
  }
}
```

## Base Interface Hierarchy

### Repository Interfaces

#### Base Interface: `IRepository<T, CreateDto, UpdateDto>`

```typescript
export interface IRepository<T, CreateDto, UpdateDto> {
  // Basic CRUD operations
  findById(id: string | number): Promise<T | null>;
  getAll(limit?: number, offset?: number): Promise<T[]>;
  create(data: CreateDto): Promise<T>;
  update(id: string | number, data: UpdateDto): Promise<T>;
  delete(id: string | number): Promise<void>;
  count(): Promise<number>;
}
```

#### Specialized Interface: `IUserOwnedRepository<T, CreateDto, UpdateDto>`

```typescript
export interface IUserOwnedRepository<T, CreateDto, UpdateDto>
  extends IRepository<T, CreateDto, UpdateDto> {
  // User-specific operations
  findByUserId(userId: string): Promise<T[]>;
}
```

### Service Interfaces

#### Base Interface: `IService<T, CreateDto, UpdateDto>`

```typescript
export interface IService<T, CreateDto, UpdateDto> {
  // Basic CRUD operations
  getById(id: string | number): Promise<T | null>;
  getAll(limit?: number, offset?: number): Promise<T[]>;
  create(data: CreateDto): Promise<T>;
  update(id: string | number, data: UpdateDto): Promise<T>;
  delete(id: string | number): Promise<void>;
}
```

#### Specialized Interfaces

```typescript
// User-owned resources
export interface IUserOwnedService<T, CreateDto, UpdateDto>
  extends IService<T, CreateDto, UpdateDto> {
  getByUserId(userId: string): Promise<T[]>;
}

// Observable services (event-driven)
export interface IObservableService {
  on<T = unknown>(event: string, handler: (data?: T) => void): void;
  off<T = unknown>(event: string, handler: (data?: T) => void): void;
  emit<T = unknown>(event: string, data?: T): void;
}

// Background services
export interface IBackgroundService {
  start(): Promise<void>;
  stop(): Promise<void>;
}
```

### API Client Interfaces

#### Base Interface: `IAPIClient`

```typescript
export interface IAPIClient {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  isConnected(): boolean;

  // Request/Response handling
  request<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  get<T>(endpoint: string, options?: RequestOptions): Promise<T>;
  post<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T>;
  put<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(endpoint: string, data?: unknown, options?: RequestOptions): Promise<T>;
  delete<T>(endpoint: string, options?: RequestOptions): Promise<T>;

  // Error handling
  setErrorHandler(handler: (error: APIError) => void | Promise<void>): void;
  setRetryPolicy(policy: RetryPolicy): void;

  // Authentication
  setAuthToken(token: string): void;
  clearAuthToken(): void;
  isAuthenticated(): boolean;
}
```

## Implementation Patterns

### Repository Implementation

```typescript
// ✅ Correct: Repository extends base interface
export interface ITargetRepository
  extends IRepository<Target, CreateTargetData, UpdateTargetData> {
  // Domain-specific query methods
  findByUserId(userId: string): Promise<Target[]>;
  findByIdWithRelations(id: string): Promise<Target | null>;
  
  // Domain-specific command methods
  updateStatus(id: string, status: string): Promise<Target>;
}

// ❌ Incorrect: Repository without base interface
export interface ITargetRepository {
  findById(id: string): Promise<Target | null>;
  // ... missing base CRUD methods
}
```

### Service Implementation

```typescript
// ✅ Correct: Service extends multiple base interfaces
export interface IMonitorService
  extends IUserOwnedService<Target, CreateTargetData, UpdateTargetData>,
    IObservableService,
    IBackgroundService {
  // Domain-specific methods
  startMonitoring(targetId: string, intervalMs: number): void;
  stopMonitoring(targetId: string): void;
  getActiveTargets(): string[];
}

// ❌ Incorrect: Service without base interfaces
export interface IMonitorService {
  startMonitoring(targetId: string, intervalMs: number): void;
  // ... missing base CRUD and service methods
}
```

### Concrete Implementation

```typescript
// ✅ Correct: Concrete service implements all methods
export class MonitorService implements IMonitorService {
  constructor(
    private targetRepository: ITargetRepository,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  // Base IService methods
  async getById(id: string | number): Promise<Target | null> {
    return this.targetRepository.findById(typeof id === "string" ? id : id.toString());
  }

  async getAll(limit?: number, offset?: number): Promise<Target[]> {
    return this.targetRepository.getAll(limit, offset);
  }

  async create(data: CreateTargetData): Promise<Target> {
    const target = await this.targetRepository.create(data);
    this.eventBus.emit("TARGET_CREATED", target);
    return target;
  }

  async update(id: string | number, data: UpdateTargetData): Promise<Target> {
    const target = await this.targetRepository.update(typeof id === "string" ? id : id.toString(), data);
    this.eventBus.emit("TARGET_UPDATED", target);
    return target;
  }

  async delete(id: string | number): Promise<void> {
    await this.targetRepository.delete(typeof id === "string" ? id : id.toString());
    this.eventBus.emit("TARGET_DELETED", { id });
  }

  // IUserOwnedService methods
  async getByUserId(userId: string): Promise<Target[]> {
    return this.targetRepository.findByUserId(userId);
  }

  // IObservableService methods
  on<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.on(event, handler);
  }

  off<T = unknown>(event: string, handler: (data?: T) => void): void {
    this.eventBus.off(event, handler);
  }

  emit<T = unknown>(event: string, data?: T): void {
    this.eventBus.emit(event, data);
  }

  // IBackgroundService methods
  async start(): Promise<void> {
    this.logger.info("MonitorService: Starting background monitoring");
    // Start background tasks
  }

  async stop(): Promise<void> {
    this.logger.info("MonitorService: Stopping background monitoring");
    // Stop background tasks
  }

  // Domain-specific methods
  startMonitoring(targetId: string, intervalMs: number): void {
    // Implementation
  }

  stopMonitoring(targetId: string): void {
    // Implementation
  }
}
```

## Current Implementation Status

### ✅ Implemented Repository Interfaces

- `IIncidentEventRepository` - Extends `IRepository<IncidentEvent, CreateIncidentEventData, UpdateIncidentEventData>`
- `IAlertRuleRepository` - Extends `IRepository<AlertRule, CreateAlertRuleData, UpdateAlertRuleData>`
- `INotificationRepository` - Extends `IRepository<Notification, CreateNotificationData, UpdateNotificationData>`
- `ISpeedTestResultRepository` - Extends `IRepository<SpeedTestResult, CreateSpeedTestResultData, UpdateSpeedTestResultData>`
- `IPushSubscriptionRepository` - Extends `IRepository<PushSubscription, CreatePushSubscriptionData, UpdatePushSubscriptionData>`
- `IUserRepository` - Extends `IRepository<User, CreateUserData, UpdateUserData>`
- `IMonitoringTargetRepository` - Extends `IRepository<MonitoringTarget, CreateMonitoringTargetData, UpdateMonitoringTargetData>`
- `ITargetRepository` - Extends `IUserOwnedRepository<Target, CreateTargetData, UpdateTargetData>`

### ✅ Implemented Service Interfaces

- `INotificationService` - Extends `IService<Notification, CreateNotificationData, UpdateNotificationData>`
- `IAlertingService` - Extends `IService<AlertRule, CreateAlertRuleData, UpdateAlertRuleData>` + `IObservableService`
- `ISpeedTestService` - Extends `IBackgroundService`
- `IAuthService` - Extends `IService<User, CreateUserData, UpdateUserData>`
- `IMonitorService` - Extends `IUserOwnedService<Target, CreateTargetData, UpdateTargetData>` + `IObservableService` + `IBackgroundService`

### ✅ Implemented API Client Interfaces

- `IAPIClient` (Frontend) - Extends `IAPIClient` (Base)

### ✅ Implemented Concrete Classes

- `AlertingService` - Implements all base and domain-specific methods
- `NotificationService` - Implements all base and domain-specific methods
- `AuthService` - Implements all base and domain-specific methods
- `MockAlerting` - Implements all base and domain-specific methods
- `MockNotification` - Implements all base and domain-specific methods
- `MockAuth` - Implements all base and domain-specific methods
- `APIClient` (Frontend) - Implements all base and domain-specific methods

## Validation Checklist

When creating or modifying interfaces, ensure:

- [ ] Interface extends appropriate base interface
- [ ] Generic type parameters are properly defined
- [ ] All base interface methods are implemented in concrete classes
- [ ] Domain-specific methods are clearly separated
- [ ] Event emission is included where appropriate
- [ ] Error handling and logging are implemented
- [ ] Type safety is maintained throughout
- [ ] Mock implementations are provided for testing

## Benefits

### 1. **Consistency**

- Standard CRUD operations across all entities
- Uniform method signatures and behavior
- Predictable interface contracts

### 2. **Polymorphism**

- Services can be used interchangeably through base interfaces
- Dependency injection works seamlessly
- Easy to swap implementations

### 3. **Type Safety**

- Compile-time checking of interface compliance
- Generic type parameters prevent runtime errors
- IntelliSense support for all methods

### 4. **Maintainability**

- Changes to base interfaces automatically propagate
- Common patterns implemented once
- Easy to add new functionality

### 5. **Testability**

- Mock implementations follow same patterns
- Easy to create test doubles
- Consistent testing interfaces

## Migration Guide

When updating existing interfaces to follow these patterns:

1. **Identify Base Interface**: Determine which base interface the interface should extend
2. **Add Extension**: Update interface declaration to extend base interface
3. **Remove Duplicates**: Remove methods that are already defined in base interface
4. **Update Implementations**: Add missing base interface methods to concrete classes
5. **Test Changes**: Ensure all TypeScript checks pass
6. **Update Tests**: Modify tests to work with new interface structure

## Interface Placement Guidelines

### **CRITICAL: Service Interfaces Are Contracts**

One of the most common mistakes is moving service interfaces to individual packages based on where they're implemented. **This is incorrect.**

Service interfaces like `IAlertingService`, `IMonitorService`, `IAuthService` are **contracts** that define public APIs. They must remain in the shared package because they are used by:

1. **Dependency Injection Container** - for service registration and resolution
2. **Applications** (web, API, microservices) - for type-safe service access
3. **Infrastructure Package** - for service management and mocking
4. **Other Packages** - for cross-package communication

### **Interface Placement Decision Matrix**

| Interface Type | Location | Reasoning |
|---|---|---|
| **Service Interfaces** (`IAlertingService`) | `@network-monitor/shared` | Used by DI container, apps, infrastructure |
| **Repository Interfaces** (`ITargetRepository`) | `@network-monitor/shared` | Used by database, services, apps |
| **Domain Entities** (`User`, `Target`) | `@network-monitor/shared` | Used across multiple domains |
| **Base Interfaces** (`IRepository`, `IService`) | `@network-monitor/shared` | Foundation contracts for all implementations |
| **Configuration Interfaces** (`ISpeedTestConfigService`) | `@network-monitor/shared` | Used by multiple packages |
| **Implementation Helpers** (rare) | Individual packages | Only if truly internal and never cross boundaries |

### **How to Verify Interface Placement**

Before moving any interface, run this analysis:

```bash
# Check usage across the codebase
grep -r "IInterfaceName" packages/ apps/

# If found in multiple packages → MUST stay in shared
# If found only in one package → Verify it's truly internal
```

**Example Analysis:**

```bash
$ grep -r "IAlertingService" packages/ apps/
packages/infrastructure/src/container/container.ts
packages/infrastructure/src/container/types.ts
apps/web/src/routes/api/trpc/[...trpc].ts
apps/api/src/main.ts
apps/alerting-service/src/main.ts
# → Used in 5+ locations across packages → MUST stay shared
```

### **Common Anti-Patterns to Avoid**

❌ **Wrong Logic:**

- "AlertingService is implemented in the alerting package"
- "Therefore IAlertingService should be in the alerting package"

✅ **Correct Logic:**

- "IAlertingService is used by the DI container for service resolution"
- "It's used by applications for type-safe service access"
- "It's used by infrastructure for mocking and testing"
- "Therefore IAlertingService must remain in the shared package"

### **The Contract vs Implementation Distinction**

```typescript
// ✅ SHARED: Contract - defines what the service does
interface IAlertingService {
  createAlert(data: AlertData): Promise<Alert>;
  processSpeedTestResult(result: SpeedTestResult): Promise<void>;
}

// ✅ PACKAGE-SPECIFIC: Implementation - defines how it's done
class AlertingService implements IAlertingService {
  // Implementation details specific to this package
}
```

### **Refactoring Checklist**

When considering interface placement changes:

1. **Analyze Usage**: Run `grep -r "InterfaceName" packages/ apps/`
2. **Identify Consumers**: List all packages that import the interface
3. **Verify Necessity**: Ensure the interface truly needs to move
4. **Update Imports**: Change all import statements if moving
5. **Test Thoroughly**: Ensure TypeScript compilation and tests pass
6. **Document Decision**: Record the reasoning for future reference

## Examples

See the following files for complete implementation examples:

- `packages/shared/src/interfaces/IIncidentEventRepository.ts`
- `packages/shared/src/interfaces/IAlertingService.ts`
- `packages/alerting/src/AlertingService.ts`
- `packages/infrastructure/src/mocks/MockAlerting.ts`

Remember: **Interface polymorphism is mandatory**. All interfaces must extend their appropriate base interfaces to ensure consistency and maintainability across the application.

**Critical Lesson**: Always analyze **usage patterns**, not **naming conventions** or **implementation location**, when determining interface placement.
