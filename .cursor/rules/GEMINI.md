# Gemini Code Assist Rules & Guidelines

This document provides specific guidelines for Gemini Code Assist when reviewing and working with the PWA Connection Monitor project.

## 🎯 **Project Overview for Gemini**

### **Application Context**

- **Type**: Progressive Web App (PWA) for internet connection monitoring
- **Architecture**: Monorepo with Turborepo, Bun runtime, SolidStart frontend
- **Domain**: Network monitoring with real-time dashboards, historical charts, and push notifications
- **Key Entities**: MonitoringTarget, SpeedTestResult, AlertRule, IncidentEvent

### **Critical Success Factors**

- **Perfect Loose Coupling**: Backend services must be completely decoupled
- **Zero Quality Issues**: Zero ESLint warnings/errors, perfect formatting
- **Type Safety**: Comprehensive TypeScript usage with minimal justified `any` types
- **12-Factor Compliance**: Environment-based configuration, stateless services

## 🔍 **Code Review Focus Areas**

### **1. Architecture Compliance (CRITICAL)**

When reviewing code, ensure:

- **Router → Service → Repository Pattern**: Never skip layers
  - tRPC procedures only call Services
  - Services only call Repositories
  - Repositories only use Prisma client

- **Dependency Injection**: All services resolved from DI container
  - No manual instantiation of service classes
  - Program to interfaces, not concrete implementations

- **Event-Driven Communication**: Services communicate via events
  - No direct service-to-service calls
  - Use `IEventBus` for inter-service communication

### **2. Code Quality Standards (ZERO TOLERANCE)**

Check for:

- **Prettier Formatting**: All code perfectly formatted
- **ESLint Compliance**: Zero warnings or errors
- **TypeScript Safety**: No `any` types without clear justification
- **ESLint Disable Justification**: Every disable comment has clear explanation

### **3. Interface Polymorphism (MANDATORY)**

Verify:

- **Repository Interfaces**: Must extend base `IRepository` interface
- **Service Interfaces**: Must extend base `IService` interface
- **API Client Interfaces**: Must extend base `IAPIClient` interface
- **Concrete Implementations**: Must implement all base and domain-specific methods

## 🚨 **Common Issues to Flag**

### **Architecture Violations**

```typescript
// ❌ FLAG: Direct Prisma usage in service
class MonitorService {
  async getTarget(id: string) {
    return await prisma.monitoringTarget.findUnique({ where: { id } });
  }
}

// ❌ FLAG: Direct service call
class AlertingService {
  constructor(private monitorService: MonitorService) {}
  
  async checkAlerts() {
    const targets = await this.monitorService.getTargets(); // Direct call
  }
}

// ❌ FLAG: Raw Prisma model returned
async findById(id: string): Promise<PrismaTarget | null> {
  return await this.databaseService.getClient().monitoringTarget.findUnique({...});
}
```

### **Quality Issues**

```typescript
// ❌ FLAG: Unjustified any type
const result: any = await someOperation();

// ❌ FLAG: Unjustified eslint-disable
// eslint-disable-next-line
const data = process.env.SECRET;

// ❌ FLAG: Missing interface extension
export interface ITargetRepository {
  findById(id: string): Promise<Target | null>;
  // Missing base CRUD methods
}
```

### **12-Factor Violations**

```typescript
// ❌ FLAG: Configuration in code
const config = {
  database: {
    production: "postgresql://prod-server/db",
    development: "sqlite:./dev.db",
  },
};

// ❌ FLAG: File-based logging
logger.addTransport(new FileTransport({ filename: "app.log" }));

// ❌ FLAG: In-memory state
class MonitorService {
  private cache = new Map(); // Won't work with multiple instances
}
```

## ✅ **Correct Patterns to Encourage**

### **Proper Architecture**

```typescript
// ✅ GOOD: Router → Service → Repository
export const appRouter = t.router({
  getTargetById: t.procedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return monitorService.getTarget(input.id);
    }),
});

// ✅ GOOD: Service with DI
export class MonitorService implements IMonitorService {
  constructor(
    private targetRepository: ITargetRepository,
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  async getTarget(id: string) {
    return this.targetRepository.findById(id);
  }
}

// ✅ GOOD: Repository with domain mapping
async findById(id: string): Promise<Target | null> {
  const prismaTarget = await this.databaseService
    .getClient()
    .monitoringTarget.findUnique({ where: { id } });
  
  return prismaTarget ? this.mapToTarget(prismaTarget) : null;
}
```

### **Proper Interface Design**

```typescript
// ✅ GOOD: Repository extends base interface
export interface ITargetRepository
  extends IRepository<Target, CreateTargetData, UpdateTargetData> {
  findByUserId(userId: string): Promise<Target[]>;
  updateStatus(id: string, status: string): Promise<Target>;
}

// ✅ GOOD: Service extends base interface
export interface IMonitorService
  extends IUserOwnedService<Target, CreateTargetData, UpdateTargetData>,
    IObservableService,
    IBackgroundService {
  startMonitoring(targetId: string, intervalMs: number): void;
  stopMonitoring(targetId: string): void;
}
```

### **Proper Quality Standards**

```typescript
// ✅ GOOD: Justified any type
// Justification: Dynamic service loading requires any type for runtime instantiation
const ServiceClass = serviceConfig[TYPES.IMonitorService] as any;

// ✅ GOOD: Justified eslint-disable
// Justification: Console usage required for CLI tool output
// eslint-disable-next-line no-console
console.log("Service started successfully");

// ✅ GOOD: Proper error handling
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  this.logger.error("Operation failed", { error, context });
  throw new DomainError("Operation failed", error);
}
```

## 🎨 **Frontend Review Guidelines**

### **SolidJS Patterns**

```typescript
// ✅ GOOD: Proper reactivity
const Greeting = () => {
  const [greeting] = createResource(() => trpc.hello.query({ name: "tRPC" }));

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <p>{greeting()}</p>
    </Suspense>
  );
};

// ✅ GOOD: Proper error boundaries
<ErrorBoundary fallback={<ErrorFallback />}>
  <ComponentThatMightFail />
</ErrorBoundary>
```

### **tRPC Integration**

```typescript
// ✅ GOOD: Type-safe API calls
const [targets] = createResource(() => trpc.getTargets.query());

// ✅ GOOD: Proper error handling
const createTarget = async (data: CreateTargetData) => {
  try {
    return await trpc.createTarget.mutate(data);
  } catch (error) {
    if (error instanceof TRPCClientError) {
      // Handle tRPC errors
    }
    throw error;
  }
};
```

## 🗄️ **Database Review Guidelines**

### **Repository Pattern**

```typescript
// ✅ GOOD: Proper domain mapping
private mapToTarget(prismaTarget: PrismaTarget): Target {
  return {
    id: prismaTarget.id,
    name: prismaTarget.name,
    address: prismaTarget.address,
    speedTestResults: prismaTarget.speedTestResults?.map(this.mapToSpeedTestResult) || [],
    alertRules: prismaTarget.alertRules?.map(this.mapToAlertRule) || [],
  };
}

// ✅ GOOD: Transaction handling
async createTargetWithRules(data: CreateTargetData, rules: AlertRuleData[]): Promise<Target> {
  return await this.databaseService.getClient().$transaction(async (tx) => {
    const target = await tx.monitoringTarget.create({ data });
    await tx.alertRule.createMany({
      data: rules.map(rule => ({ ...rule, targetId: target.id }))
    });
    return this.mapToTarget(target);
  });
}
```

## 🧪 **Testing Review Guidelines**

### **Mock Patterns**

```typescript
// ✅ GOOD: Mock factory pattern
export function createMockTargetRepository(): jest.Mocked<ITargetRepository> {
  return {
    findById: jest.fn(),
    findByUserId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    getAll: jest.fn(),
  };
}

// ✅ GOOD: Test data builder
export class TargetBuilder {
  private target: Partial<Target> = {};

  withId(id: string): TargetBuilder {
    this.target.id = id;
    return this;
  }

  build(): Target {
    return {
      id: "target-123",
      name: "Test Target",
      address: "https://test.com",
      speedTestResults: [],
      alertRules: [],
      ...this.target,
    };
  }
}
```

## 🚀 **Deployment Review Guidelines**

### **12-Factor Compliance**

```typescript
// ✅ GOOD: Environment-based configuration
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is required");
}

// ✅ GOOD: Structured logging to stdout
logger.info("Target created", {
  targetId: "target-123",
  userId: "user-456",
  timestamp: new Date().toISOString(),
});

// ✅ GOOD: Stateless service
class MonitorService {
  async getTarget(id: string) {
    return this.repository.findById(id); // From database, not memory
  }
}
```

## 📋 **Review Checklist for Gemini**

### **Architecture Review**

- [ ] Router → Service → Repository pattern followed
- [ ] Dependency injection used correctly
- [ ] Event-driven communication implemented
- [ ] Prisma client isolated to repository layer
- [ ] Domain types returned, not Prisma models

### **Quality Review**

- [ ] Code properly formatted with Prettier
- [ ] Zero ESLint warnings/errors
- [ ] TypeScript types properly defined
- [ ] ESLint disable comments justified
- [ ] Interfaces extend base interfaces

### **12-Factor Review**

- [ ] Configuration from environment variables
- [ ] Logs stream to stdout/stderr
- [ ] Services are stateless
- [ ] Same backing services in dev/prod
- [ ] Port binding from environment

### **Domain Review**

- [ ] Network monitoring context understood
- [ ] PWA features properly implemented
- [ ] Real-time monitoring capabilities
- [ ] Alert system properly designed
- [ ] User data properly isolated

## 🎯 **Gemini-Specific Guidelines**

### **When to Suggest Changes**

- Architecture violations (skip layers, direct calls)
- Quality issues (formatting, linting, types)
- 12-Factor violations (config, logging, state)
- Interface polymorphism issues
- Missing error handling

### **When to Approve**

- Proper layer separation
- Clean, formatted code
- Comprehensive error handling
- Proper TypeScript usage
- 12-Factor compliance
- Domain-appropriate implementation

### **Priority Order**

1. **Architecture compliance** (most critical)
2. **Code quality** (zero tolerance)
3. **12-Factor compliance** (production readiness)
4. **Domain appropriateness** (business value)
5. **Performance considerations** (scalability)

Remember: **This is a production-ready PWA with enterprise-grade architecture. Every review should maintain the highest standards of code quality and architectural integrity.**
