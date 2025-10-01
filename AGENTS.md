# Gemini Project Guidelines: PWA Connection Monitor

This document contains the core architectural and development guidelines for this project. Adhering to these rules is mandatory for all code generation and modification tasks.

## 1. Core Architecture & Technology

- **Vision**: An installable PWA for monitoring internet connections, built with an emphasis on **perfect loose coupling** for its backend services.
- **Monorepo**: The project is a Turborepo monorepo with apps in `apps/*` and shared logic in `packages/*`.
- **Runtime**: **Bun**. All commands must use `bun` (e.g., `bun install`, `bun run dev`, `bun test`).
- **Frontend**: SolidStart with SolidJS, located in `apps/web`.
- **Styling**: **Tailwind CSS** only.
- **API**: **tRPC** for end-to-end type-safety.
- **Database**: Prisma ORM. The schema at `packages/database/prisma/schema.prisma` is the single source of truth.

## 2. Key Architectural Patterns

### A. tRPC API Architecture

The API layer is built with tRPC and served by the `apps/web` application.

1. **tRPC Router (`apps/web/src/server/trpc/router.ts`)**: This is the main router where all API procedures are defined. For now, it contains a simple `hello` procedure.
2. **API Handler (`apps/web/src/routes/api/trpc/[...trpc].ts`)**: This SolidStart API route exposes the `appRouter` to the network, making it accessible to the client.
3. **Layering**: While the tRPC router itself is simple, it should call **Services** which contain business logic. These services then call **Repositories** for data access. This `Router → Service → Repository` pattern is the goal for all complex backend logic.

### B. Dependency Injection (DI)

- For backend services, the goal is to use a DI container (`packages/infrastructure/src/container/`).
- **Never manually instantiate service classes** in production logic; they should be resolved from the container.
- Always program to interfaces (e.g., `ITargetRepository`), not concrete implementations.

### C. Event-Driven Communication (Backend Services)

- The backend services (`packages/monitor`, `packages/alerting`, etc.) are designed to be loosely coupled.
- Services **should not** call other services directly. Communication should happen via an `IEventBus`.

### D. Repository Pattern

- The Prisma client **must never** leave the data access layer (e.g., `packages/database`).
- Repositories are responsible for all database interactions.
- Repository methods must return application-specific domain types, **not** raw Prisma models.

## 3. Frontend Development (`apps/web`)

- **Framework**: Use SolidJS primitives (`createSignal`, `createResource`, `<Suspense>`).
- **tRPC Client (`apps/web/src/lib/trpc.ts`)**: A pre-configured, type-safe tRPC client is available for all frontend components.
- **Data Fetching**: Use the `trpc` client to call API procedures. This is the primary method for frontend-backend communication.

    ```typescript
    import { createResource } from "solid-js";
    import { trpc } from "~/lib/trpc";

    const [greeting] = createResource(() => trpc.hello.query({ name: "tRPC" }));
    ```

## 4. Quality & Testing

- **Zero Tolerance**: There is a zero-tolerance policy for linting and type errors.
- **Mandatory Checks**: Before committing, always run `bun run format`, `bun run lint:check`, and `bun run type-check`.
- **No `any`**: Do not use the `any` type without a clear, justified comment explaining why it is necessary.
