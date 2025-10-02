# AI Agents Rules & Guidelines

This document consolidates the essential rules and guidelines for AI agents working on the PWA Connection Monitor project.

## 🎯 **Core Architecture & Technologies**

### **Project Overview**

- **Vision**: PWA for monitoring internet connections with perfect loose coupling for backend services
- **Monorepo**: Turborepo with apps in `apps/*` and shared logic in `packages/*`
- **Runtime**: **Bun** (all commands must use `bun`)
- **Frontend**: SolidStart with SolidJS in `apps/web`
- **Styling**: **Tailwind CSS** only
- **API**: **tRPC** for end-to-end type-safety
- **Database**: Prisma ORM with schema at `packages/database/prisma/schema.prisma`

### **Critical Architectural Patterns**

#### **Router → Service → Repository Pattern**

**NEVER skip layers. This is the most critical pattern.**

1. **Router (tRPC Procedure)**: Entry point in `apps/web/src/server/trpc/router.ts`
   - Only job: parse input and call appropriate Service method
2. **Service**: Business logic in `packages/*/src/services/`
   - Orchestrate operations by calling Repositories
3. **Repository**: Database access in `packages/database/src/repositories/`
   - **ONLY** place where Prisma client is used
   - Must return domain types, not raw Prisma models

#### **Dependency Injection (DI)**

- Use DI container from `packages/infrastructure`
- **Never manually instantiate service classes**
- Always program to interfaces (e.g., `ITargetRepository`)

#### **Event-Driven Communication**

- Backend services must be loosely coupled
- Services **should not** call other services directly
- Communication via `IEventBus`

## 🚨 **Quality Standards - ZERO TOLERANCE**

### **Mandatory Quality Checks**

1. **Prettier Formatting**: All code must be perfectly formatted
2. **ESLint Compliance**: Zero warnings or errors allowed
3. **TypeScript Safety**: No `any` types without proper justification
4. **ESLint Disable Justification**: All `eslint-disable` comments must have clear justifications
5. **Interface Polymorphism**: All interfaces must extend their appropriate base interfaces

### **Before Every Commit**

```bash
bun run format
bun run format:check
bun run lint:check
bun run type-check
# All must pass with ZERO errors/warnings
```

### **ESLint Disable Justification Standards**

- **Mandatory Justification**: Every `eslint-disable` comment must be preceded by a clear explanation
- **Format**: `// Justification: [Clear explanation of why the disable is necessary]`
- **Positioning**: Place disable comments on the exact line being suppressed

## 🔄 **CI/CD Workflow - MANDATORY**

### **Pull Request Process**

**CRITICAL**: All changes must go through Pull Requests. Direct commits to main are blocked.

1. **Always work on feature branches**
   - Use: `./scripts/new-feature.sh <name>`
   - Follow branch naming: `<type>/<description>`

2. **Before suggesting "commit and push"**
   - Remind user to run: `./scripts/ci-check.sh`
   - Help fix any issues found

3. **Creating Pull Requests**
   - Use: `gh pr create --fill`
   - PR titles must follow semantic commit format: `<type>: <Description>`
   - Valid types: feat, fix, docs, style, refactor, perf, test, build, ci, chore

4. **Required to Pass**
   - ✅ Code formatting (Prettier)
   - ✅ Linting (ESLint)
   - ✅ Type checking (TypeScript)
   - ✅ Build verification
   - ✅ PR title validation
   - ✅ Branch name validation
   - ✅ No merge conflicts
   - ✅ No secrets leaked

5. **Never Suggest**
   - ❌ Committing directly to main
   - ❌ Using `--no-verify` or `--force`
   - ❌ Disabling CI checks
   - ❌ Bypassing branch protection

## 🎨 **Frontend Development Patterns**

### **Core Principles**

- **Framework**: SolidJS and SolidStart with reactivity using `createSignal`, `createEffect`, `<Suspense>`
- **Styling**: **Tailwind CSS** utility classes only (no custom CSS files)
- **Data Flow**: All backend data via tRPC client at `apps/web/src/lib/trpc.ts`

### **Data Fetching Pattern**

```typescript
// ✅ Good: Using createResource with tRPC client
import { createResource, Suspense } from "solid-js";
import { trpc } from "~/lib/trpc";

const Greeting = () => {
  const [greeting] = createResource(() => trpc.hello.query({ name: "tRPC" }));

  return (
    <Suspense fallback={<p>Loading...</p>}>
      <p>{greeting()}</p>
    </Suspense>
  );
};
```

### **Component Architecture**

- **Charts**: Use `Chart.js` via `solid-chartjs` library
- **Type Safety**: Never use `any` types, always provide proper TypeScript interfaces
- **Error Handling**: Use Solid's `<ErrorBoundary>` component

## 🗄️ **Database & API Patterns**

### **Database Schema**

- **Single Source of Truth**: `packages/database/prisma/schema.prisma`
- **Repository Pattern**: All database access through repositories
- **Domain Mapping**: Prisma models mapped to domain types
- **Type Safety**: Full TypeScript type safety

### **tRPC API Design**

- **Type Safety First**: End-to-end type safety between backend and frontend
- **Input Validation**: Always validate inputs with Zod
- **Error Handling**: Use `TRPCError` class for structured errors

```typescript
// ✅ Good: Procedure with strong input validation
createUser: t.procedure
  .input(
    z.object({
      name: z.string().min(3),
      email: z.string().email(),
    }),
  )
  .mutation(({ input }) => {
    return userService.create(input);
  });
```

## 🧪 **Testing Requirements**

### **Testing Philosophy**

- **Comprehensive testing strategy** ensuring reliability and maintainability
- **Testing Pyramid**: Unit Tests (Many) → Integration Tests (Some) → E2E Tests (Few)

### **Test Coverage Targets**

- **Unit Tests**: 90%+ line coverage
- **Integration Tests**: 80%+ branch coverage
- **E2E Tests**: 100% critical user paths

### **Mock Strategies**

- **Mock Factories**: Use factory pattern for creating mocks
- **Test Data Builders**: Use builder pattern for test data
- **Repository Testing**: All services must have mock implementations

## 🌍 **12-Factor App Compliance**

### **Critical Requirements**

- **Config (Factor III)**: Use environment variables for ALL configuration
- **Logs (Factor XI)**: Write all logs to stdout/stderr (NO file logging)
- **Dev/Prod Parity (Factor X)**: Use same backing services in all environments
- **Processes (Factor VI)**: Services must be stateless

### **Environment Variables Pattern**

```typescript
// ✅ GOOD - Read from environment
const databaseUrl = process.env.DATABASE_URL;
const port = parseInt(process.env.PORT || "3000", 10);

// ❌ BAD - Read from JSON config
import config from "./config/production.json";
const databaseUrl = config.database.url;
```

## 🚫 **Anti-Patterns to Avoid**

### **Code Quality Anti-Patterns**

- Using `any` types without proper justification
- Using `eslint-disable` without clear explanations
- Direct service instantiation instead of DI
- Direct database calls instead of repository pattern
- Direct service calls instead of event-driven communication

### **Architecture Anti-Patterns**

- Tight coupling between services
- Hardcoded service implementations
- Missing interface definitions
- Direct Prisma usage outside repositories
- Raw Prisma models returned from services

## ✅ **Best Practices Summary**

### **Code Quality**

- Write self-documenting code with clear variable names
- Use TypeScript interfaces for all data structures
- Implement proper error handling and logging
- Follow consistent naming conventions
- Justify all ESLint disable comments with clear explanations

### **Architecture**

- Use dependency injection for all service dependencies
- Communicate via events instead of direct calls
- Abstract database operations through repositories
- Separate commands from queries
- Keep Prisma client isolated to repository layer
- Map Prisma models to domain types in repositories

## 🎯 **Domain Context - Network Monitor**

### **Core Entities**

- **MonitoringTarget**: Internet endpoints to monitor
- **SpeedTestResult**: Performance measurements (ping, download)
- **AlertRule**: Threshold-based alerting configuration
- **IncidentEvent**: Alert and outage tracking

### **Key Features**

- **Continuous Monitoring**: 24/7 monitoring of internet connection quality
- **Multi-Target Support**: Monitor multiple endpoints simultaneously
- **Real-Time Alerts**: Instant notifications when connection issues occur
- **Historical Analysis**: Charts and trends for performance analysis
- **PWA Features**: Offline capability, installable, background sync

## 📋 **Agent Checklist**

### **Before Making Changes**

- [ ] Understand the component's responsibilities
- [ ] Follow Router → Service → Repository pattern
- [ ] Use dependency injection for all services
- [ ] Plan for proper error handling and logging
- [ ] Consider 12-Factor App compliance

### **While Writing Code**

- [ ] Use proper TypeScript interfaces (no `any` without justification)
- [ ] Follow naming conventions consistently
- [ ] Implement proper error handling
- [ ] Use event-driven communication for services
- [ ] Map Prisma models to domain types

### **Before Submitting**

- [ ] Run all quality checks (format, lint, type-check)
- [ ] Ensure zero ESLint warnings/errors
- [ ] Verify all interfaces extend base interfaces
- [ ] Test the functionality
- [ ] Follow PR workflow (never commit directly to main)

Remember: **Quality is not negotiable. Every line of code must meet these standards before being committed to the repository.**
