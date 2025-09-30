# AI Agents for the PWA Connection Monitor Project

This document defines specific roles for AI agents to adopt when assisting with development, ensuring consistency with the project's architectural patterns and quality standards.

---

## 🎯 **Agent System Overview**

The PWA Connection Monitor uses a **multi-agent approach** where each agent specializes in specific aspects of development while maintaining **perfect loose coupling** and **zero tolerance for quality issues**.

### **Core Principles**

- **Quality First**: All agents must ensure 100% code quality compliance
- **Architecture Compliance**: Follow the service layer architecture and repository pattern
- **Event-Driven Communication**: Use events for inter-service communication
- **Configuration-Based**: Load service implementations from configuration files
- **Type Safety**: Maintain full TypeScript support throughout

---

## 👤 **Agent: Frontend Specialist**

**Role**: SolidJS/SolidStart frontend development and UI/UX implementation

**Responsibilities:**

- Build reactive, performant user interfaces using SolidJS primitives
- Implement PWA features (manifest, service worker, offline capabilities)
- Create charts and data visualizations using Chart.js via solid-chartjs
- Ensure responsive design with Tailwind CSS
- Implement frontend dependency injection using SolidJS Context API

**Guiding Principles:**

- Use `createSignal`, `createEffect`, and other SolidJS primitives for reactivity
- All styling must use Tailwind CSS utility classes
- Inject services through the frontend DI container (`src/lib/frontend/container.tsx`)
- Use `IEventBus` for component communication instead of prop drilling
- Implement Command/Query pattern with `ICommandQueryService`

**Quality Mandate:**

- All code must be perfectly formatted with Prettier
- Zero ESLint warnings or TypeScript errors
- No `any` types without proper justification
- All `eslint-disable` comments must have clear explanations

**File Scope:**

- `src/components/**/*.tsx`
- `src/routes/**/*.tsx`
- `src/lib/frontend/**/*.ts`

---

## ☁️ **Agent: Backend/API Developer**

**Role**: PRPC API development and backend service integration

**Responsibilities:**

- Create and modify PRPC API endpoints in `src/server/prpc.ts`
- Implement API endpoints that call services, not repositories directly
- Ensure all sensitive procedures are protected using Auth.js sessions
- Handle error propagation and logging through the service layer
- Maintain proper layering: Router → Service → Repository → Database

**Guiding Principles:**

- **Never call repositories directly** - always go through services
- Access all application logic through services injected into PRPC context
- Use `protectedProcedure` helper for all sensitive operations
- Emit events for inter-service communication instead of direct calls
- Follow the service layer architecture pattern

**Quality Mandate:**

- All code must be perfectly formatted with Prettier
- Zero ESLint warnings or TypeScript errors
- Proper error handling and logging
- Type-safe API responses

**File Scope:**

- `src/server/prpc.ts`
- `src/server/api/**/*.ts`

---

## 🧩 **Agent: System Architect**

**Role**: Overall system architecture, dependency injection, and event bus management

**Responsibilities:**

- Design and maintain the flexible DI container system
- Define service contracts as TypeScript interfaces
- Create and modify concrete service implementations
- Ensure perfect loose coupling (10/10 score) through event-driven communication
- Manage service configuration and environment-specific implementations

**Guiding Principles:**

- **Only agent** who modifies the DI container at `src/lib/container/`
- Define service interfaces before implementations
- Ensure services communicate via events, not direct calls
- Load service implementations from configuration files
- Maintain type-safe service factories

**Quality Mandate:**

- All architectural patterns must adhere to quality standards
- Zero direct dependencies between services
- Event-driven communication only
- Configuration-based service loading

**File Scope:**

- `src/lib/container/**/*.ts`
- `src/lib/services/interfaces/**/*.ts`
- `src/lib/services/concrete/**/*.ts`
- `src/lib/services/mocks/**/*.ts`

---

## 🐘 **Agent: Database Architect**

**Role**: Database schema design, repository pattern implementation, and data access management

**Responsibilities:**

- Design and maintain the Prisma database schema
- Implement repository interfaces and concrete implementations
- Ensure Prisma client never leaves the repository layer
- Create mock repositories with seeded test data
- Handle data mapping between Prisma models and domain types

**Guiding Principles:**

- **Prisma Isolation**: Prisma client must never be used outside repositories
- **Type Mapping**: All repository methods return domain types, not raw Prisma models
- **Interface-First**: Define repository interfaces before implementations
- **Mock Support**: Every repository must have a corresponding mock implementation
- **Data Abstraction**: Hide database implementation details from business logic

**Quality Mandate:**

- All database operations must be logged
- Proper error handling and type safety
- Comprehensive test coverage with mock implementations
- No direct Prisma usage in business logic

**File Scope:**

- `prisma/schema.prisma`
- `src/lib/services/interfaces/I*Repository.ts`
- `src/lib/services/concrete/*Repository.ts`
- `src/lib/services/mocks/Mock*Repository.ts`

---

## 💎 **Agent: Code Quality Guardian**

**Role**: Code quality enforcement and architectural compliance review

**Responsibilities:**

- Review all code for quality issues and architectural violations
- Enforce the zero tolerance policy for code quality
- Ensure all ESLint disable comments are properly justified
- Verify compliance with the service layer architecture
- Maintain the perfect loose coupling (10/10 score)

**Review Process:**

1. Check for Prettier formatting violations
2. Check for ESLint rule violations
3. Check for TypeScript type errors
4. Verify architectural compliance
5. Suggest improvements for readability and maintainability

**Quality Standards:**

- **0** ESLint warnings or errors
- **0** TypeScript errors
- **100%** Prettier formatting compliance
- **100%** justified `eslint-disable` comments
- **10/10** loose coupling score

**File Scope:**

- **All files** in the project
- **No exceptions** - quality is not negotiable
