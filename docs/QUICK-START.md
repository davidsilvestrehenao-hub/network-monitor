# 🚀 Quick Start Guide

Get up and running with Network Monitor in **under 5 minutes**!

---

## 📋 **Prerequisites**

Before you begin, ensure you have:

- **Bun** v1.2.22 or higher ([Install Bun](https://bun.sh))
- **Node.js** v20+ (for tooling compatibility)
- **Git** (for cloning the repository)
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### **Optional for Production:**

- **PostgreSQL** 15+ (for production database)
- **Redis** 7+ (for distributed EventBus in microservices)

---

## ⚡ **Quick Setup (5 Minutes)**

### **Step 1: Clone the Repository**

```bash
git clone https://github.com/your-org/network-monitor.git
cd network-monitor
```text

### **Step 2: Install Dependencies**

```bash
bun install
```text

This installs all dependencies for all packages in the Turborepo monorepo.

### **Step 3: Setup Database**

```bash
# Generate Prisma client
bun run db:generate

# Push schema to database (creates tables)
bun run db:push

# Seed database with test data (optional)
bun run db:seed
```text

### **Step 4: Start Development Server**

```bash
bun run dev
```text

This starts:

- **Frontend** at `http://localhost:3000`
- **API server** with hot reload
- **All Turborepo packages** in watch mode

### **Step 5: Open in Browser**

Navigate to:

```text
http://localhost:3000
```text

You should see the Network Monitor dashboard! 🎉

---

## 📦 **What Just Happened?**

When you ran `bun run dev`, Turborepo:

1. **Built all packages** in dependency order:

   ```text
   shared → infrastructure → database → services → apps
   ```

2. **Started the frontend** (SolidStart) with hot module reload

3. **Initialized the DI container** with all services

4. **Connected to the database** (SQLite in dev mode)

5. **Started monitoring** the event bus for requests

---

## 🎯 **First Steps in the App**

### **1. Create Your First Target**

1. Click **"Add Target"** button
2. Enter:
   - **Name**: "Google"
   - **Address**: "<https://google.com>"
3. Click **"Save"**

### **2. Run a Speed Test**

1. Click **"Run Test"** on your target card
2. Wait 5-10 seconds for results
3. View ping and download speed

### **3. Create an Alert Rule**

1. Click **"Alerts"** tab
2. Click **"Create Alert Rule"**
3. Configure:
   - **Target**: Select your target
   - **Metric**: Ping
   - **Condition**: Greater Than
   - **Threshold**: 100
4. Click **"Save"**

### **4. Enable Push Notifications**

1. Click **"Settings"** tab
2. Click **"Enable Notifications"**
3. Allow browser permission prompt
4. You'll now receive alerts!

---

## 🛠️ **Development Workflow**

### **Running Specific Apps**

```bash
# Frontend only
bun run dev:web

# API only
bun run dev:api

# Specific package
bunx turbo run dev --filter=@network-monitor/monitor
```text

### **Building for Production**

```bash
# Build all packages
bun run build

# Build specific package
bunx turbo run build --filter=@network-monitor/web
```text

### **Database Management**

```bash
# Create a new migration
bun run db:migrate

# Reset database (WARNING: Deletes all data!)
bunx turbo run db:push --filter=@network-monitor/database -- --force-reset

# Open Prisma Studio (Database GUI)
cd packages/database
bunx prisma studio
```text

### **Code Quality**

```bash
# Lint all packages
bun run lint

# Type check all packages
bun run type-check

# Run tests
bun run test
```text

---

## 📁 **Project Structure**

Understanding where things are:

```text
network-monitor/
│
├── apps/
│   ├── web/                    # 🌐 SolidStart frontend
│   │   ├── src/
│   │   │   ├── routes/         # Pages (file-based routing)
│   │   │   ├── server/trpc/    # tRPC API routers
│   │   │   └── lib/            # Frontend utilities
│   │   └── tsconfig.json       # TypeScript configuration
│   │
│   └── api/                    # 🚀 Monolith entry point
│       └── src/main.ts         # Initialize all services
│
├── packages/
│   ├── shared/                 # 📦 Common types & interfaces
│   │   └── src/
│   │       ├── interfaces/     # Service interfaces
│   │       └── types/          # Domain types
│   │
│   ├── infrastructure/         # 🏗️ Core infrastructure
│   │   └── src/
│   │       ├── event-bus/      # EventBus implementation
│   │       ├── event-rpc/      # Request/response over events
│   │       ├── logger/         # Logging service
│   │       ├── container/      # DI container
│   │       └── mocks/          # Mock implementations
│   │
│   ├── database/               # 🗄️ Prisma & repositories
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Database schema (source of truth)
│   │   │   └── seed.ts         # Seed data
│   │   └── src/
│   │       ├── DatabaseService.ts
│   │       └── repositories/   # Repository implementations
│   │
│   └── [service-packages]/     # Business logic services
│       ├── monitor/            # Monitoring service
│       ├── alerting/           # Alerting service
│       ├── notification/       # Notification service
│       ├── speed-test/         # Speed test service
│       └── auth/               # Authentication service
│
├── docs/                       # 📚 Documentation
│   ├── ARCHITECTURE.md         # Architecture overview
│   ├── REQUIREMENTS.md         # Business requirements
│   ├── QUICK-START.md          # This file!
│   ├── DEPLOYMENT.md           # Deployment guide
│   └── ...
│
├── turbo.json                  # Turborepo configuration
├── package.json                # Root package.json
└── service-config.json         # DI service configuration
```text

---

## 🔧 **Common Tasks**

### **Add a New Service**

1. Create new package:

   ```bash
   mkdir -p packages/my-service/src
   cd packages/my-service
   bun init -y
   ```

2. Update `package.json`:

   ```json
   {
     "name": "@network-monitor/my-service",
     "dependencies": {
       "@network-monitor/shared": "workspace:*",
       "@network-monitor/infrastructure": "workspace:*"
     }
   }
   ```

3. Create service interface in `packages/shared/src/interfaces/IMyService.ts`

4. Implement service in `packages/my-service/src/MyService.ts`

5. Register service in `service-config.json`

### **Add a New Frontend Route**

1. Create file in `apps/web/src/routes/`:

   ```typescript
   // apps/web/src/routes/my-page.tsx
   export default function MyPage() {
     return <div>My New Page</div>;
   }
   ```

2. Navigate to `http://localhost:3000/my-page`

That's it! SolidStart uses file-based routing.

### **Add a New tRPC Procedure**

1. Add procedure to appropriate router in `apps/web/src/server/trpc/routers/`:

   ```typescript
   // apps/web/src/server/trpc/routers/myDomain.ts
   export const myDomainRouter = t.router({
     myProcedure: t.procedure
       .input(z.object({ input: z.string() }))
       .query(({ input }) => {
         return { result: input.toUpperCase() };
       }),
   });
   ```

2. Add to main router and call from frontend:

   ```typescript
   import { trpc } from '~/lib/trpc';
   
   const result = await trpc.myDomain.myProcedure.query({ input: "hello" });
   console.log(result.result); // "HELLO"
   ```

### **Add a New Event**

1. Define event in `packages/shared/src/types/events.ts`:

   ```typescript
   export interface FrontendEvents {
     // ... existing events
     MY_EVENT: { data: string };
   }
   ```

2. Emit event:

   ```typescript
   eventBus.emitTyped('MY_EVENT', { data: 'hello' });
   ```

3. Listen to event:

   ```typescript
   eventBus.onTyped('MY_EVENT', (data) => {
     console.log(data.data); // "hello"
   });
   ```

---

## 🐛 **Troubleshooting**

### **Problem: `bun install` fails**

**Solution:**

```bash
# Clear bun cache
rm -rf node_modules bun.lockb
bun install
```text

### **Problem: Database errors**

**Solution:**

```bash
# Regenerate Prisma client
bun run db:generate

# Reset database
cd packages/database
bunx prisma db push --force-reset
```text

### **Problem: TypeScript errors in editor**

**Solution:**

```bash
# Rebuild all packages
bun run build

# Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```text

### **Problem: Port 3000 already in use**

**Solution:**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 bun run dev
```text

### **Problem: "Cannot find module" errors**

**Solution:**

```bash
# Install dependencies
bun install

# Build all packages
bun run build

# Clear Turborepo cache
bunx turbo run build --force
```text

---

## 📖 **Next Steps**

Now that you're up and running, explore:

1. **[Architecture Guide](ARCHITECTURE.md)** - Understand the system design
2. **[Business Requirements](REQUIREMENTS.md)** - See what features exist
3. **[Deployment Guide](DEPLOYMENT.md)** - Deploy to production
4. **[AI Agents](../AGENTS.md)** - Learn about AI agent roles

---

## 🎓 **Learning Resources**

### **Technologies Used**

| Technology | Documentation | Why We Use It |
|-----------|---------------|---------------|
| **Bun** | [bun.sh](https://bun.sh) | Fast runtime & package manager |
| **SolidJS** | [solidjs.com](https://solidjs.com) | Reactive UI framework |
| **SolidStart** | [start.solidjs.com](https://start.solidjs.com) | Full-stack meta-framework |
| **Prisma** | [prisma.io](https://prisma.io) | Type-safe database ORM |
| **tRPC** | [trpc.io](https://trpc.io) | End-to-end type-safe API |
| **Turborepo** | [turbo.build](https://turbo.build) | Monorepo build system |
| **Tailwind CSS** | [tailwindcss.com](https://tailwindcss.com) | Utility-first CSS |

### **Architecture Concepts**

- **Event-Driven Architecture**: [Martin Fowler](https://martinfowler.com/articles/201701-event-driven.html)
- **Dependency Injection**: [Wikipedia](https://en.wikipedia.org/wiki/Dependency_injection)
- **Repository Pattern**: [Microsoft Docs](https://docs.microsoft.com/en-us/dotnet/architecture/microservices/microservice-ddd-cqrs-patterns/infrastructure-persistence-layer-design)

---

## 💡 **Pro Tips**

### **Faster Development**

```bash
# Only watch specific packages
bunx turbo run dev --filter=@network-monitor/web --filter=@network-monitor/monitor

# Skip type checking during dev (faster)
TSC_COMPILE_ON_ERROR=true bun run dev

# Use Turborepo cache
# (Turborepo automatically caches builds)
```text

### **Debugging**

```bash
# Enable debug logging
DEBUG=* bun run dev

# Enable Prisma query logging
DATABASE_URL="file:./dev.db?connection_limit=1&socket_timeout=60&pool_timeout=60&prisma_query_log=true" bun run dev
```text

### **VS Code Setup**

Install these extensions:

- **Prisma** - Syntax highlighting for schema.prisma
- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes
- **ESLint** - Linting in editor
- **TypeScript Error Translator** - Better error messages

Add to `.vscode/settings.json`:

```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```text

---

## 🤝 **Getting Help**

- **Documentation**: Check [docs/](./docs/)
- **Architecture Questions**: Read [ARCHITECTURE.md](ARCHITECTURE.md)
- **Feature Questions**: Read [REQUIREMENTS.md](REQUIREMENTS.md)
- **Deployment Questions**: Read [DEPLOYMENT.md](DEPLOYMENT.md)

---

## ✅ **Checklist**

Before starting development, ensure:

- [ ] Bun v1.2.22+ installed
- [ ] Dependencies installed (`bun install`)
- [ ] Database setup (`bun run db:generate && bun run db:push`)
- [ ] Dev server running (`bun run dev`)
- [ ] App accessible at `http://localhost:3000`
- [ ] No console errors in browser
- [ ] Can create a monitoring target
- [ ] Can run a speed test
- [ ] Architecture docs read

---

**You're all set!** 🎉 Happy coding!
