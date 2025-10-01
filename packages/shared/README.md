# @network-monitor/shared

Shared interfaces, types, and contracts used across all packages and applications.

## Overview

This package contains **zero implementation** - only TypeScript interfaces and types that define the contracts between services.

## Purpose

- ✅ **Single Source of Truth** - All interfaces defined in one place
- ✅ **Loose Coupling** - Services depend on interfaces, not implementations
- ✅ **Type Safety** - Full TypeScript support across the monorepo
- ✅ **Contract Testing** - Ensure implementations match interfaces
- ✅ **Documentation** - Interfaces serve as API documentation

## Exports

### Service Interfaces

```typescript
import type {
  IMonitorService,
  IAlertingService,
  INotificationService,
  IAuthService,
  ISpeedTestService,
  ISpeedTestConfigService,
  IMonitoringScheduler,
} from "@network-monitor/shared";
```

### Repository Interfaces

```typescript
import type {
  ITargetRepository,
  IMonitoringTargetRepository,
  ISpeedTestRepository,
  ISpeedTestResultRepository,
  IAlertRuleRepository,
  IIncidentEventRepository,
  INotificationRepository,
  IPushSubscriptionRepository,
  IUserRepository,
} from "@network-monitor/shared";
```

### Infrastructure Interfaces

```typescript
import type {
  ILogger,
  LogLevel,
  LogContext,
  IEventBus,
  IDatabaseService,
} from "@network-monitor/shared";
```

### Domain Types

```typescript
import type {
  // Targets
  Target,
  CreateTargetData,
  UpdateTargetData,
  MonitoringTarget,
  CreateMonitoringTargetData,
  UpdateMonitoringTargetData,
  
  // Speed Tests
  SpeedTestResult,
  CreateSpeedTestResultData,
  SpeedTestConfig,
  PingResult,
  SpeedResult,
  ComprehensiveSpeedTestResult,
  
  // Alerts
  AlertRule,
  CreateAlertRuleData,
  UpdateAlertRuleData,
  AlertRuleQuery,
  
  // Incidents
  IncidentEvent,
  CreateIncidentEventData,
  UpdateIncidentEventData,
  IncidentEventQuery,
  
  // Notifications
  Notification,
  CreateNotificationData,
  UpdateNotificationData,
  NotificationQuery,
  
  // Push Subscriptions
  PushSubscription,
  CreatePushSubscriptionData,
  UpdatePushSubscriptionData,
  
  // Users
  User,
  CreateUserData,
  UpdateUserData,
  AuthSession,
} from "@network-monitor/shared";
```

### Event Types

```typescript
import type {
  BackendEvents,    // Backend service events
  FrontendEvents,   // Frontend UI events
} from "@network-monitor/shared";
```

### Component Types

```typescript
import type {
  NotificationSettings,
  MonitoringSettings,
  AlertRuleFormData,
  TestNotificationFormData,
  ThemeValue,
} from "@network-monitor/shared";
```

## Directory Structure

```
src/
├── interfaces/           # Service and repository interfaces
│   ├── IMonitorService.ts
│   ├── IAlertingService.ts
│   ├── INotificationService.ts
│   ├── IAuthService.ts
│   ├── ILogger.ts
│   ├── IEventBus.ts
│   ├── IDatabaseService.ts
│   ├── I*Repository.ts
│   └── index.ts
├── types/               # Domain types and DTOs
│   ├── component-types.ts
│   ├── mock-types.ts
│   └── index.ts
└── index.ts            # Package exports
```

## Key Principles

### 1. Program to Interfaces

All services and repositories are accessed through interfaces:

```typescript
// ✅ Good: Depend on interface
class MonitorService {
  constructor(
    private targetRepository: ITargetRepository,  // Interface
    private logger: ILogger                       // Interface
  ) {}
}

// ❌ Bad: Depend on concrete class
class MonitorService {
  constructor(
    private targetRepository: TargetRepository,   // Concrete class
    private logger: LoggerService                 // Concrete class
  ) {}
}
```

### 2. Data Transfer Objects (DTOs)

All data structures are defined as types:

```typescript
// Domain model
export interface Target {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  speedTestResults: SpeedTestResult[];
  alertRules: AlertRule[];
}

// Create DTO
export interface CreateTargetData {
  name: string;
  address: string;
  ownerId: string;
}

// Update DTO
export interface UpdateTargetData {
  name?: string;
  address?: string;
}
```

### 3. Type-Safe Events

Events are defined with typed payloads:

```typescript
export interface BackendEvents {
  TARGET_CREATED: {
    id: string;
    name: string;
    address: string;
    ownerId: string;
  };
  SPEED_TEST_COMPLETED: {
    targetId: string;
    result: SpeedTestResult;
  };
  // ... more events
}

// Usage with type safety
eventBus.emitTyped<BackendEvents["TARGET_CREATED"]>("TARGET_CREATED", {
  id: target.id,
  name: target.name,
  address: target.address,
  ownerId: target.ownerId,
});
```

## No Runtime Code

⚠️ **Important**: This package contains **only types and interfaces** - no runtime code!

All `.ts` files compile to empty `.js` files. This package is purely for TypeScript type checking and IntelliSense.

## Usage

Import types and interfaces in any package:

```typescript
import type { IMonitorService, Target } from "@network-monitor/shared";

class MyClass {
  constructor(private monitorService: IMonitorService) {}
  
  async doSomething(): Promise<Target[]> {
    return await this.monitorService.getTargets("user-123");
  }
}
```

## Benefits

1. **Consistency**: Same types used everywhere
2. **Refactoring**: Change interface once, TypeScript finds all usages
3. **Documentation**: Interfaces document expected behavior
4. **Testing**: Mock implementations must match interfaces
5. **Loose Coupling**: Services depend on interfaces, not implementations

## Adding New Types

When adding new features:

1. Define the interface in `src/interfaces/IMyService.ts`
2. Define the domain types in `src/types/`
3. Export from `src/index.ts`
4. Implement the interface in the appropriate package

```typescript
// 1. Define interface
export interface IMyService {
  doSomething(id: string): Promise<MyData>;
}

// 2. Define types
export interface MyData {
  id: string;
  value: string;
}

// 3. Export
export * from "./interfaces/IMyService";
export * from "./types/my-types";

// 4. Implement (in another package)
class MyService implements IMyService {
  async doSomething(id: string): Promise<MyData> {
    // implementation
  }
}
```

## Building

```bash
# Build TypeScript (generates type definitions)
bun run build

# Type checking
bun run type-check

# Linting
bun run lint
```
