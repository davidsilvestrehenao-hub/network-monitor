# Quality Fix Plan - Turborepo Structure Issues

## 🚨 **Current Issues**

The Turborepo migration has some structural issues that need fixing:

### **Problem 1: Wrong Import Structure**

The `packages/infrastructure` package is trying to import services from paths that don't exist:
```typescript
import { MonitorService } from "../services/concrete/MonitorService";
```

But `MonitorService` is now in `packages/monitor` package!

### **Problem 2: Container Config Location**

The DI container configuration (`service-config.ts`) is in the infrastructure package, but it's trying to import services from other packages. This creates circular dependencies.

---

## ✅ **Solution: Simplified Package Structure**

### **What Each Package Should Contain:**

#### **`packages/shared`**
- ✅ Interfaces (IMonitorService, ILogger, etc.)
- ✅ Types (Target, SpeedTestResult, etc.)
- ✅ NO implementations

#### **`packages/infrastructure`**
- ✅ EventBus implementation
- ✅ EventRPC helper
- ✅ Logger implementation
- ✅ Container base class
- ❌ NO service-specific imports
- ❌ NO container configuration (that goes in apps)

#### **`packages/database`**
- ✅ Prisma schema
- ✅ Repository implementations
- ✅ DatabaseService
- ✅ Depends on: @network-monitor/shared only

#### **`packages/monitor`**
- ✅ MonitorService implementation
- ✅ Depends on: shared, infrastructure, database

#### **`packages/alerting`**
- ✅ AlertingService implementation  
- ✅ Depends on: shared, infrastructure, database

#### **`packages/notification`**
- ✅ NotificationService implementation
- ✅ Depends on: shared, infrastructure, database

#### **`apps/api` (Monolith)**
- ✅ Container configuration (imports all services)
- ✅ Entry point that wires everything together
- ✅ Depends on: ALL packages

---

## 🎯 **Action Items**

### **1. Clean Up Infrastructure Package**

Remove `service-config.ts` and `service-config.browser.ts` from infrastructure.
These should ONLY exist in the apps that need them.

### **2. Move Container Config to Apps**

Create `apps/api/src/container-config.ts` that imports all services and configures the DI container.

### **3. Fix Package Exports**

Each package should only export what it implements, not try to re-export services from other packages.

---

## 📊 **Correct Dependency Graph**

```
packages/shared (no dependencies)
    ↓
packages/infrastructure (depends on shared)
    ↓
packages/database (depends on shared)
    ↓
packages/monitor (depends on shared, infrastructure, database)
packages/alerting (depends on shared, infrastructure, database)
packages/notification (depends on shared, infrastructure, database)
    ↓
apps/api (depends on ALL packages, configures DI container)
apps/monitor-service (depends on shared, infrastructure, database, monitor)
apps/alerting-service (depends on shared, infrastructure, database, alerting)
apps/notification-service (depends on shared, infrastructure, database, notification)
```

---

## 🔄 **Next Steps**

1. Remove bad imports from infrastructure package
2. Create proper container config in apps
3. Rebuild and verify all packages build successfully
4. Run type checking
5. Fix any remaining errors
6. Commit quality-compliant code

---

*This is a structural fix - the event-driven architecture is perfect, we just need to organize the packages correctly!*
