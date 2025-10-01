# Turborepo + Event-Driven Implementation Plan

## 🎯 Goal

Transform the current SolidStart monolith into a **Turborepo monorepo** with **event-driven architecture**, enabling:
- Cheap hosting today (single container, $20/month)
- Easy scaling tomorrow (K8s microservices, minimal refactoring)
- 10/10 loose coupling score

---

## 📋 Current State

```
network-monitor/
├── src/
│   ├── lib/services/        # All services together
│   ├── server/             # pRPC + API
│   ├── components/         # SolidJS components
│   └── routes/             # SolidStart routes
├── prisma/
└── public/
```

**Issues:**
- ❌ pRPC calls services directly (tight coupling)
- ❌ Components call CommandQuery directly
- ❌ All code in single `src/` directory
- ❌ No package boundaries
- ⚠️ Hard to extract services for microservices

---

## 📦 Target State

```
network-monitor/
├── apps/
│   ├── web/                 # SolidStart frontend (monolith entry)
│   ├── api/                 # Backend monolith (all services)
│   ├── monitor-service/     # Standalone monitor (for K8s)
│   ├── alerting-service/    # Standalone alerting (for K8s)
│   └── notification-service/# Standalone notifications (for K8s)
│
├── packages/
│   ├── shared/              # @network-monitor/shared
│   │   ├── types/
│   │   └── interfaces/
│   │
│   ├── infrastructure/      # @network-monitor/infrastructure
│   │   ├── event-bus/
│   │   │   ├── EventBus.ts         # In-memory (monolith)
│   │   │   └── RabbitMQEventBus.ts # Distributed (K8s)
│   │   ├── event-rpc/
│   │   │   └── EventRPC.ts         # Request-response over events
│   │   └── container/
│   │
│   ├── database/            # @network-monitor/database
│   │   ├── prisma/
│   │   └── repositories/
│   │
│   ├── monitor/             # @network-monitor/monitor
│   │   ├── MonitorService.ts
│   │   ├── TargetRepository.ts
│   │   └── types.ts
│   │
│   ├── alerting/            # @network-monitor/alerting
│   │   ├── AlertingService.ts
│   │   ├── AlertRepository.ts
│   │   └── types.ts
│   │
│   └── notification/        # @network-monitor/notification
│       ├── NotificationService.ts
│       ├── NotificationRepository.ts
│       └── types.ts
│
├── turbo.json
└── package.json
```

**Benefits:**
- ✅ Clear package boundaries
- ✅ Event-driven communication
- ✅ Easy to extract services
- ✅ Import packages in monolith OR deploy independently

---

## 🚀 Implementation Phases

### Phase 1: Setup Turborepo (1 hour)

**1.1 Initialize Turborepo**
```bash
# Install Turborepo
bun add -D turbo

# Create turbo.json
cat > turbo.json << 'JSON'
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", ".vinxi/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "db:generate": {
      "cache": false
    }
  }
}
JSON
```

**1.2 Create Directory Structure**
```bash
# Create apps directory
mkdir -p apps/web apps/api

# Create packages directory
mkdir -p packages/{shared,infrastructure,database,monitor,alerting,notification}

# Create package directories
for pkg in shared infrastructure database monitor alerting notification; do
  mkdir -p packages/$pkg/src
  mkdir -p packages/$pkg/src/interfaces
done
```

---

### Phase 2: Create Package Structure (2 hours)

**2.1 Shared Package** (`@network-monitor/shared`)

Creates: `packages/shared/package.json`
```json
{
  "name": "@network-monitor/shared",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./types": "./src/types/index.ts",
    "./interfaces": "./src/interfaces/index.ts"
  }
}
```

Migrate:
- `src/lib/services/interfaces/*` → `packages/shared/src/interfaces/`
- `src/lib/types/*` → `packages/shared/src/types/`

**2.2 Infrastructure Package** (`@network-monitor/infrastructure`)

Creates: `packages/infrastructure/package.json`
```json
{
  "name": "@network-monitor/infrastructure",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@network-monitor/shared": "workspace:*"
  }
}
```

Migrate:
- `src/lib/services/concrete/EventBus.ts` → `packages/infrastructure/src/event-bus/`
- `src/lib/services/concrete/LoggerService.ts` → `packages/infrastructure/src/logger/`
- `src/lib/container/*` → `packages/infrastructure/src/container/`

**NEW:** Create `packages/infrastructure/src/event-rpc/EventRPC.ts`
```typescript
import type { IEventBus, ILogger } from '@network-monitor/shared';

export class EventRPC {
  constructor(
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  async request<TRequest, TResponse>(
    requestEvent: string,
    successEvent: string,
    failureEvent: string,
    data: TRequest,
    timeout = 10000
  ): Promise<TResponse> {
    const requestId = crypto.randomUUID();
    
    return new Promise<TResponse>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Request timeout: ${requestEvent}`));
      }, timeout);
      
      // Listen for success
      this.eventBus.once<TResponse>(
        `${successEvent}_${requestId}`,
        (response) => {
          clearTimeout(timer);
          this.logger.debug(`EventRPC: Success ${requestEvent}`, { requestId });
          resolve(response!);
        }
      );
      
      // Listen for failure
      this.eventBus.once<{ error: string }>(
        `${failureEvent}_${requestId}`,
        (error) => {
          clearTimeout(timer);
          this.logger.error(`EventRPC: Failed ${requestEvent}`, { requestId, error });
          reject(new Error(error?.error || 'Unknown error'));
        }
      );
      
      // Emit request
      this.logger.debug(`EventRPC: Request ${requestEvent}`, { requestId, data });
      this.eventBus.emit(requestEvent, { 
        ...(data as object), 
        requestId 
      });
    });
  }
}
```

**2.3 Database Package** (`@network-monitor/database`)

Creates: `packages/database/package.json`
```json
{
  "name": "@network-monitor/database",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@network-monitor/shared": "workspace:*",
    "@prisma/client": "^6.16.2",
    "prisma": "^6.16.2"
  }
}
```

Migrate:
- `prisma/` → `packages/database/prisma/`
- Repository interfaces stay in `shared`
- Repository implementations → `packages/database/src/repositories/`

---

### Phase 3: Service Packages (2 hours)

**3.1 Monitor Package** (`@network-monitor/monitor`)

Creates: `packages/monitor/package.json`
```json
{
  "name": "@network-monitor/monitor",
  "version": "0.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "dependencies": {
    "@network-monitor/shared": "workspace:*",
    "@network-monitor/infrastructure": "workspace:*",
    "@network-monitor/database": "workspace:*"
  }
}
```

Migrate:
- `src/lib/services/concrete/MonitorService.ts` → `packages/monitor/src/`
- `src/lib/services/concrete/TargetRepository.ts` → `packages/database/src/repositories/`
- Update imports to use workspace packages

**3.2 Alerting Package** (`@network-monitor/alerting`)

Migrate:
- `src/lib/services/concrete/AlertingService.ts` → `packages/alerting/src/`
- `src/lib/services/concrete/AlertRepository.ts` → `packages/database/src/repositories/`

**3.3 Notification Package** (`@network-monitor/notification`)

Migrate:
- `src/lib/services/concrete/NotificationService.ts` → `packages/notification/src/`
- `src/lib/services/concrete/NotificationRepository.ts` → `packages/database/src/repositories/`

---

### Phase 4: Refactor pRPC to Event-Driven (3 hours)

**4.1 Update pRPC to use EventRPC**

Before:
```typescript
// src/server/prpc.ts
export const createTarget = async (data: { name: string; address: string }) => {
  "use server";
  const ctx = await getContext();
  
  // Direct service call - TIGHT COUPLING
  const target = await ctx.services.monitor.createTarget({
    name: data.name,
    address: data.address,
    ownerId: ctx.userId,
  });
  
  return target;
};
```

After:
```typescript
// apps/api/src/prpc.ts
import { EventRPC } from '@network-monitor/infrastructure';

export const createTarget = async (data: { name: string; address: string }) => {
  "use server";
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);
  
  // Event-driven - LOOSE COUPLING
  const target = await eventRPC.request(
    'TARGET_CREATE_REQUESTED',
    'TARGET_CREATED',
    'TARGET_CREATE_FAILED',
    {
      name: data.name,
      address: data.address,
      ownerId: ctx.userId,
    }
  );
  
  return target;
};
```

**4.2 Update MonitorService to handle events**

```typescript
// packages/monitor/src/MonitorService.ts
export class MonitorService implements IMonitorService {
  constructor(
    private eventBus: IEventBus,
    private targetRepository: ITargetRepository,
    private logger: ILogger
  ) {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.eventBus.on(
      'TARGET_CREATE_REQUESTED',
      this.handleCreateRequest.bind(this)
    );
  }

  private async handleCreateRequest(data?: {
    requestId?: string;
    name: string;
    address: string;
    ownerId: string;
  }): Promise<void> {
    if (!data) return;

    try {
      this.logger.info('MonitorService: Creating target', data);
      
      const target = await this.targetRepository.create({
        name: data.name,
        address: data.address,
        ownerId: data.ownerId,
      });

      // Emit success with requestId for EventRPC
      if (data.requestId) {
        this.eventBus.emit(`TARGET_CREATED_${data.requestId}`, target);
      }
      
      // Emit general event for subscribers
      this.eventBus.emit('TARGET_CREATED', { target });
      
    } catch (error) {
      this.logger.error('MonitorService: Failed to create target', { error, data });
      
      if (data.requestId) {
        this.eventBus.emit(`TARGET_CREATE_FAILED_${data.requestId}`, {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }
  }
}
```

---

### Phase 5: Refactor Frontend (2 hours)

**5.1 Update CommandQueryService to use EventRPC**

Before:
```typescript
// Direct API calls
async createTarget(data: CreateTargetData): Promise<Target> {
  return await prpc.createTarget(data);
}
```

After:
```typescript
// Event-driven
async createTarget(data: CreateTargetData): Promise<Target> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Timeout')), 10000);
    
    this.eventBus.once('TARGET_CREATED', (target) => {
      clearTimeout(timeout);
      resolve(target);
    });
    
    this.eventBus.once('TARGET_CREATE_FAILED', (error) => {
      clearTimeout(timeout);
      reject(new Error(error.error));
    });
    
    this.eventBus.emit('TARGET_CREATE_REQUESTED', data);
  });
}
```

**5.2 Update Components to use Events**

Before:
```typescript
// Component directly calls service
const handleCreate = async () => {
  const target = await commandQuery.createTarget(formData);
  setTargets([...targets, target]);
};
```

After:
```typescript
// Component emits event, listens for response
const handleCreate = () => {
  eventBus.emit('TARGET_CREATE_REQUESTED', formData);
};

createEffect(() => {
  const handleCreated = (data: { target: Target }) => {
    setTargets([...targets(), data.target]);
  };
  
  eventBus.on('TARGET_CREATED', handleCreated);
  
  return () => eventBus.off('TARGET_CREATED', handleCreated);
});
```

---

### Phase 6: Create Application Entry Points (1 hour)

**6.1 Monolith API** (`apps/api/src/main.ts`)

```typescript
import { MonitorService } from '@network-monitor/monitor';
import { AlertingService } from '@network-monitor/alerting';
import { NotificationService } from '@network-monitor/notification';
import { EventBus, Container } from '@network-monitor/infrastructure';

async function startMonolith() {
  console.log('🚀 Starting Monolith...');
  
  // Use in-memory event bus
  const eventBus = new EventBus();
  const container = new Container();
  
  // Register all services in same process
  container.register('eventBus', eventBus);
  container.register('monitorService', new MonitorService(/* deps */));
  container.register('alertingService', new AlertingService(/* deps */));
  container.register('notificationService', new NotificationService(/* deps */));
  
  console.log('✅ All services running in same process');
  console.log('💰 Cost: $20/month');
}

startMonolith();
```

**6.2 Monitor Microservice** (`apps/monitor-service/src/main.ts`)

```typescript
import { MonitorService } from '@network-monitor/monitor';
import { RabbitMQEventBus, Container } from '@network-monitor/infrastructure';

async function startMonitorService() {
  console.log('🚀 Starting Monitor Service...');
  
  // Use distributed event bus
  const eventBus = new RabbitMQEventBus(process.env.RABBITMQ_URL!);
  const container = new Container();
  
  // Register ONLY monitor service
  container.register('eventBus', eventBus);
  container.register('monitorService', new MonitorService(/* deps */));
  
  console.log('✅ Monitor service running independently');
  console.log('🔌 Connected to RabbitMQ');
}

startMonitorService();
```

---

### Phase 7: Update Configs (1 hour)

**7.1 Root package.json**

```json
{
  "name": "network-monitor",
  "version": "0.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test"
  },
  "devDependencies": {
    "turbo": "latest",
    "@types/node": "^20.11.26",
    "typescript": "^5.6.2"
  }
}
```

**7.2 turbo.json**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".vinxi/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "db:generate": {
      "cache": false
    }
  }
}
```

---

## 📊 Testing Strategy

### Unit Tests
```bash
# Test individual packages
turbo run test --filter=@network-monitor/monitor
turbo run test --filter=@network-monitor/alerting
```

### Integration Tests
```bash
# Test event flow
turbo run test --filter=@network-monitor/infrastructure
```

### E2E Tests
```bash
# Test full monolith
cd apps/api && bun run dev
# Run E2E tests
```

---

## 🚀 Deployment

### Development (Monolith)
```bash
# Run everything together
turbo run dev

# Or specific apps
turbo run dev --filter=web
turbo run dev --filter=api
```

### Production (Monolith)
```bash
# Build monolith
turbo run build --filter=api

# Deploy single container
docker build -f apps/api/Dockerfile -t network-monitor .
```

### Production (Microservices)
```bash
# Build each service
turbo run build --filter=monitor-service
turbo run build --filter=alerting-service

# Deploy to K8s
kubectl apply -f k8s/
```

---

## ✅ Success Criteria

- [ ] All packages build successfully
- [ ] `turbo run dev` starts monolith
- [ ] All tests pass
- [ ] EventRPC working for request-response
- [ ] Services communicate via events only
- [ ] No direct service calls in pRPC
- [ ] Components use event-driven pattern
- [ ] Can deploy monolith to single container
- [ ] Can deploy services independently to K8s
- [ ] Architecture score: 10/10

---

## 📈 Migration Timeline

**Day 1 (4-6 hours):**
- ✅ Phase 1: Setup Turborepo
- ✅ Phase 2: Create packages
- ✅ Phase 3: Migrate services

**Day 2 (4-6 hours):**
- ✅ Phase 4: Refactor pRPC
- ✅ Phase 5: Refactor frontend
- ✅ Phase 6: Create entry points

**Day 3 (2-3 hours):**
- ✅ Phase 7: Update configs
- ✅ Testing and validation
- ✅ Documentation

**Total: 10-15 hours over 3 days**

---

## 🎯 Final Structure

```
network-monitor/
├── apps/
│   ├── web/                    # Frontend (SolidStart)
│   ├── api/                    # Backend monolith
│   ├── monitor-service/        # Microservice
│   ├── alerting-service/       # Microservice
│   └── notification-service/   # Microservice
│
├── packages/
│   ├── @network-monitor/shared
│   ├── @network-monitor/infrastructure
│   ├── @network-monitor/database
│   ├── @network-monitor/monitor
│   ├── @network-monitor/alerting
│   └── @network-monitor/notification
│
├── turbo.json
└── package.json
```

**Benefits Achieved:**
- ✅ 10/10 loose coupling
- ✅ Event-driven architecture
- ✅ Start cheap ($20/month)
- ✅ Scale easily (minimal refactoring)
- ✅ Clear package boundaries
- ✅ Easy to test
- ✅ Easy to deploy

---

**Ready to implement!** 🚀
