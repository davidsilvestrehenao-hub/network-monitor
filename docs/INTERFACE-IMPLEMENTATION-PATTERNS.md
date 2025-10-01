# Interface Implementation Patterns

## Overview

This document outlines the mandatory interface implementation patterns that ensure consistency, polymorphism, and type safety across the Network Monitor application. All interfaces must follow these patterns to maintain architectural integrity.

## Core Principles

### 1. **Interface Polymorphism**

All interfaces must extend their appropriate base interfaces to ensure consistent contracts and enable polymorphism.

### 2. **Type Safety**

Use generic type parameters to ensure compile-time safety and prevent runtime errors.

### 3. **Consistency**

Standard CRUD operations are guaranteed across all implementations through base interfaces.

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

## Examples

See the following files for complete implementation examples:

- `packages/shared/src/interfaces/IIncidentEventRepository.ts`
- `packages/shared/src/interfaces/IAlertingService.ts`
- `packages/alerting/src/AlertingService.ts`
- `packages/infrastructure/src/mocks/MockAlerting.ts`

Remember: **Interface polymorphism is mandatory**. All interfaces must extend their appropriate base interfaces to ensure consistency and maintainability across the application.
