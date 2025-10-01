# Gemini Project Guidelines: PWA Connection Monitor

This document contains the core architectural and development guidelines for this project. Adhering to these rules is mandatory for all code generation and modification tasks.

## 1. Core Architecture & Technology

- **Vision**: An installable PWA for monitoring internet connections, built with an emphasis on **perfect loose coupling**.
- **Runtime**: **Bun**. All commands must use `bun` (e.g., `bun install`, `bun run dev`, `bun test`). Do not use `npm`, `pnpm`, `yarn`, or `node`.
- **Framework**: SolidStart with SolidJS.
- **Styling**: **Tailwind CSS** only. Do not write custom CSS files.
- **API**: tRPC for end-to-end type-safety.
- **Database**: Prisma ORM. The schema at `prisma/schema.prisma` is the single source of truth.

## 2. Key Architectural Patterns

### A. Layering: Router → Service → Repository

This is the **most critical pattern** in the codebase. The layers must not be skipped.

1. **Routers (`src/server/trpc/routers/`)**: Handle API requests. They **must only** call methods on Services.
2. **Services (`src/lib/services/`)**: Contain all business logic. They orchestrate operations by calling Repositories.
3. **Repositories (`src/lib/services/`)**: Abstract all database access. They are the **only** layer allowed to use the Prisma client.

```typescript
// ✅ Correct Flow: Router -> Service -> Repository

// Router
const target = await ctx.services.monitor.createTarget({ ... });

// Service
async createTarget(data) {
  return await this.targetRepository.create(data);
}

// ❌ ANTI-PATTERN: Router must NOT call a repository directly.
const target = await ctx.services.targetRepository.create(data);
```

### B. Dependency Injection (DI)

- **Never manually instantiate classes** (services, repositories, etc.).
- All services must be resolved from the custom DI container (`src/lib/container/flexible-container.ts`).
- Always program to interfaces (e.g., `ITargetRepository`), not concrete implementations.

### C. Event-Driven Communication

- Services **must never** call other services directly.
- All inter-service communication is asynchronous and must be done via the `IEventBus`.

### D. Repository Pattern

- The Prisma client **must never** leave the repository layer.
- Repository methods must return application-specific domain types, **not** raw Prisma models. This mapping is a key responsibility of the repository.
- Every repository must have a mock implementation for testing.

## 3. Frontend Development (`src/routes`, `src/components`)

- **Framework**: Use SolidJS primitives (`createSignal`, `createEffect`).
- **Data Flow**: Use the `ICommandQueryService` for all data operations (reads and writes).
- **Communication**: Use the `IEventBus` for component-to-component communication.
- **DI**: Access all services via the frontend DI container and associated hooks (`useLogger`, `useCommandQuery`, etc.).

## 4. Quality & Testing

- **Zero Tolerance**: There is a zero-tolerance policy for linting and type errors.
- **Mandatory Checks**: Before committing, always run `bun run format`, `bun run lint:check`, and `bun run type-check`.
- **No `any`**: Do not use the `any` type without a clear, justified comment explaining why it is necessary.
- **Testing**: Follow the testing strategies outlined in `90-testing-strategies.mdc`. All services and repositories require unit tests with mock implementations.

---
*This file is a summary of the detailed rules located in the `.cursor/rules/` directory. For more specific guidance on topics like API design, testing, or deployment, refer to the relevant file in that directory.*
