# tRPC Architecture: Loosely Coupled with Container & EventBus

This document explains how the tRPC API layer integrates with our loosely coupled architecture using Dependency Injection and EventBus.

## Architecture Flow

```
Frontend (SolidJS)
    ↓
tRPC Client (~/lib/trpc.ts)
    ↓
tRPC Router (~/server/trpc/router.ts)
    ↓
Service (MonitorService)
    ↓
Repository (TargetRepository)
    ↓
Database (Prisma)
```

## Key Components

### 1. tRPC API Handler (`/api/trpc/[...trpc].ts`)

The API handler initializes the DI container and creates the AppContext:

```typescript
// Initialize the DI container when the server starts
await initializeContainer();

const handler = (event: APIEvent) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req: event.request,
    router: appRouter,
    createContext: async () => {
      // Resolve all services from the container
      const appContext = await getAppContext();
      return appContext;
    },
  });
```

**Key Points:**

- Container is initialized from `service-config.json`
- `AppContext` provides all services and repositories
- Services are injected via DI, not manually instantiated

### 2. tRPC Router (`~/server/trpc/router.ts`)

The router defines API procedures that call services:

```typescript
export const appRouter = t.router({
  // Query: Read operations
  getAllTargets: t.procedure.query(({ ctx }) => {
    const userId = "clerk-user-id-placeholder";
    return ctx.services.monitor?.getTargets(userId);
  }),

  // Mutation: Write operations
  createTarget: t.procedure
    .input(
      z.object({
        name: z.string(),
        address: z.string().url(),
      })
    )
    .mutation(({ ctx, input }) => {
      const ownerId = "clerk-user-id-placeholder";
      return ctx.services.monitor?.createTarget({ ...input, ownerId });
    }),
});
```

**Key Points:**

- Router calls services from `ctx.services`
- Services are resolved from the DI container
- Input validation with Zod
- Type-safe end-to-end

### 3. MonitorService (Business Logic)

The service contains business logic and uses repositories:

```typescript
export class MonitorService implements IMonitorService {
  constructor(
    private targetRepository: ITargetRepository,
    private speedTestRepository: ISpeedTestRepository,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {
    this.setupEventHandlers();
  }

  async createTarget(data: CreateTargetData): Promise<Target> {
    this.logger.info("MonitorService: Creating target", data);
    const target = await this.targetRepository.create(data);
    this.logger.info("MonitorService: Target created", { id: target.id });
    return target;
  }

  async getTargets(userId: string): Promise<Target[]> {
    this.logger.debug("MonitorService: Getting targets for user", { userId });
    return await this.targetRepository.findByUserId(userId);
  }
}
```

**Key Points:**

- All dependencies injected via constructor
- Uses EventBus for inter-service communication
- Calls repositories for data access
- Never touches Prisma directly

### 4. TargetRepository (Data Access)

The repository handles all database operations:

```typescript
export class TargetRepository implements ITargetRepository {
  private prisma: PrismaClient;

  constructor(databaseService: IDatabaseService) {
    this.prisma = databaseService.getClient();
  }

  private toDomainModel(target: PrismaTarget): Target {
    return {
      id: target.id,
      name: target.name,
      address: target.address,
      ownerId: target.ownerId,
    };
  }

  async findByUserId(userId: string): Promise<Target[]> {
    const targets = await this.prisma.monitoringTarget.findMany({
      where: { ownerId: userId },
    });
    return targets.map(this.toDomainModel.bind(this));
  }

  async create(data: CreateTargetData): Promise<Target> {
    const newTarget = await this.prisma.monitoringTarget.create({ data });
    return this.toDomainModel(newTarget);
  }
}
```

**Key Points:**

- Only layer that touches Prisma
- Maps Prisma models to domain types
- Returns domain types, never raw Prisma models
- Abstracts database implementation

## EventBus Integration

The MonitorService listens to events for loose coupling:

```typescript
private setupEventHandlers(): void {
  this.eventBus.on("TARGET_CREATE_REQUESTED", this.handleTargetCreateRequested.bind(this));
  this.eventBus.on("MONITORING_START_REQUESTED", this.handleMonitoringStartRequested.bind(this));
}

private async handleTargetCreateRequested(data?: {
  requestId?: string;
  name: string;
  address: string;
  ownerId: string;
}): Promise<void> {
  if (!data) return;

  try {
    const target = await this.createTarget({ ...data });
    
    // Emit success
    if (data.requestId) {
      this.eventBus.emit(`TARGET_CREATED_${data.requestId}`, target);
    }
    
    // Emit general event
    this.eventBus.emit("TARGET_CREATED", { target });
  } catch (error) {
    this.logger.error("MonitorService: Failed to create target", { error, data });
    
    if (data.requestId) {
      this.eventBus.emit(`TARGET_CREATE_FAILED_${data.requestId}`, { error });
    }
  }
}
```

**Key Points:**

- Services never call each other directly
- All inter-service communication via EventBus
- Supports both request-response (with `requestId`) and pub-sub patterns
- Enables true loose coupling

## Frontend Integration

The frontend uses the tRPC client for type-safe API calls:

```typescript
import { trpc } from "~/lib/trpc";

export default function TargetsPage() {
  const logger = useLogger();
  
  // Query with createResource
  const [targets, { refetch }] = createResource(() =>
    trpc.getAllTargets.query()
  );

  // Mutation
  const handleSubmit = async () => {
    try {
      await trpc.createTarget.mutate({
        name: name(),
        address: address()
      });
      refetch();
    } catch (error) {
      logger.error("Failed to create target", { error });
    }
  };
}
```

**Key Points:**

- Type-safe calls with full IntelliSense
- Automatic type inference from backend
- No manual type definitions needed
- Uses SolidJS `createResource` for reactive data

## Configuration

Services are configured in `service-config.json`:

```json
{
  "services": {
    "ITargetRepository": {
      "implementation": "TargetRepository",
      "package": "@network-monitor/database"
    },
    "IMonitorService": {
      "implementation": "MonitorService",
      "package": "@network-monitor/monitor",
      "dependencies": [
        "ITargetRepository",
        "ISpeedTestRepository",
        "IEventBus",
        "ILogger"
      ]
    }
  }
}
```

**Key Points:**

- JSON configuration for service implementations
- Automatic dependency resolution
- Can swap implementations without code changes
- Supports different configs per environment

## Benefits

1. **Loose Coupling**: Services don't depend on each other directly
2. **Type Safety**: End-to-end type safety from DB to UI
3. **Testability**: Easy to mock dependencies
4. **Maintainability**: Clear separation of concerns
5. **Scalability**: Can split into microservices easily
6. **Flexibility**: Swap implementations via configuration

## Testing

Each layer can be tested independently:

```typescript
// Test the repository with a mock database
const mockDb = createMockDatabaseService();
const repo = new TargetRepository(mockDb);

// Test the service with mock repositories
const mockRepo = createMockTargetRepository();
const mockEventBus = createMockEventBus();
const service = new MonitorService(mockRepo, mockEventBus, mockLogger);

// Test tRPC procedures with mock context
const caller = appRouter.createCaller({
  services: { monitor: mockMonitorService },
  repositories: { target: mockTargetRepository }
});
```

## Next Steps

- [ ] Add authentication context
- [ ] Implement real-time updates via EventBus
- [ ] Add mutation optimistic updates
- [ ] Create mock implementations for offline development
- [ ] Add E2E tests for complete flows
