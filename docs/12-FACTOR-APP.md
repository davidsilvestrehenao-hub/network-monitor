# 12-Factor App Compliance Guide

This document provides a comprehensive guide to the Network Monitor's compliance with the [12-Factor App methodology](https://12factor.net/), which defines best practices for building modern, scalable, cloud-native applications.

## 📊 Current Status: 8/12 ✅

| Factor | Status | Compliance |
|--------|--------|------------|
| I. Codebase | ✅ | 100% Compliant |
| II. Dependencies | ✅ | 100% Compliant |
| III. Config | ⚠️ | **Needs Improvement** |
| IV. Backing Services | ✅ | 100% Compliant |
| V. Build, Release, Run | ✅ | 100% Compliant |
| VI. Processes | ✅ | 100% Compliant |
| VII. Port Binding | ✅ | 100% Compliant |
| VIII. Concurrency | ✅ | 100% Compliant |
| IX. Disposability | ⚠️ | **Needs Improvement** |
| X. Dev/Prod Parity | ⚠️ | **Needs Improvement** |
| XI. Logs | ⚠️ | **Needs Improvement** |
| XII. Admin Processes | ✅ | 100% Compliant |

**Overall Score: 8/12 Fully Compliant, 4/12 Need Improvement**

## 🚀 Quick Reference

### Before Writing Code
- [ ] Configuration from environment variables (never hardcode)
- [ ] Services are stateless (no in-memory state)
- [ ] Logs stream to stdout/stderr (never to files)
- [ ] Backing services from environment (database, event bus)

### Before Committing
- [ ] No secrets in code or config files
- [ ] No hardcoded URLs or connection strings
- [ ] All logs use structured format (JSON)
- [ ] Tests pass with environment variables

### Before Deploying
- [ ] Environment variables documented
- [ ] Health check endpoint works
- [ ] Graceful shutdown tested
- [ ] Logs aggregation configured

---

## 📋 The 12 Factors

### I. Codebase ✅

**One codebase tracked in revision control, many deploys**

```bash
# ✅ Single repository, multiple deployments
git clone https://github.com/your-org/network-monitor.git

# Deploy to different environments
deploy to development
deploy to staging
deploy to production
```

**Current State:**
- ✅ Single Git repository with monorepo structure
- ✅ Turborepo for managing multiple apps and packages
- ✅ Clear separation of concerns (apps/, packages/)
- ✅ Same codebase deployed to development, staging, and production

### II. Dependencies ✅

**Explicitly declare and isolate dependencies**

```json
// ✅ GOOD - package.json
{
  "dependencies": {
    "solid-js": "^1.9.3",
    "@prisma/client": "^5.22.0"
  }
}
```

```bash
# ✅ Lock file committed
bun.lock

# ❌ BAD - Relying on system-wide packages
npm install -g some-package
```

**Current State:**
- ✅ Using Bun package manager with `package.json`
- ✅ Lock file (`bun.lock`) ensures consistent dependencies
- ✅ Workspace dependencies properly declared
- ✅ No system-level dependencies assumed

### III. Config ⚠️

**Store config in the environment**

```typescript
// ✅ GOOD - Environment variables
import { getEnvironment } from "@network-monitor/infrastructure";
const config = getEnvironment();
const dbUrl = config.databaseUrl;

// ❌ BAD - Hardcoded or JSON config
const dbUrl = "postgresql://localhost:5432/db";
const config = require("./config/production.json");
```

**Current State (Issues):**
- ❌ Configuration stored in JSON files (`configs/*.json`)
- ❌ Hard to override configs per deployment
- ⚠️ Some environment variables used, but not consistently
- ❌ JSON config files contain environment-specific settings

**Required Changes:**

**CRITICAL: Move from JSON configuration to environment variables**

```bash
# .env.example (to create)
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/network_monitor

# Application
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

# Services
MONITOR_SERVICE_ENABLED=true
ALERTING_SERVICE_ENABLED=true
NOTIFICATION_SERVICE_ENABLED=true

# Logging
LOG_LEVEL=info
LOG_FORMAT=json

# Event Bus
EVENT_BUS_TYPE=in-memory
RABBITMQ_URL=amqp://localhost:5672

# Auth
AUTH_SECRET=your-secret-key-here
AUTH_PROVIDERS=mock,github,google

# Monitoring
SPEED_TEST_INTERVAL=30000
ALERT_CHECK_INTERVAL=5000
```

### IV. Backing Services ✅

**Treat backing services as attached resources**

```typescript
// ✅ GOOD - Service from environment
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } },
});

// ❌ BAD - Hardcoded backing service
const prisma = new PrismaClient({
  datasources: { db: { url: "postgresql://prod-server/db" } },
});
```

**Current State:**
- ✅ Database abstracted through Prisma ORM
- ✅ Repository pattern isolates data access
- ✅ Event bus abstracted through interfaces
- ✅ Services can switch between implementations via DI

### V. Build, Release, Run ✅

**Strictly separate build and run stages**

```bash
# ✅ GOOD - Separate stages
bun run build              # Build stage
docker build -t app:v1     # Release stage
docker run app:v1          # Run stage

# ❌ BAD - Mixed stages
bun run build && bun run start
```

**Current State:**
- ✅ Separate build and run stages
- ✅ Docker support for containerized deployments
- ✅ TypeScript compilation produces artifacts
- ✅ No runtime compilation in production

### VI. Processes ✅

**Execute the app as one or more stateless processes**

```typescript
// ✅ GOOD - Stateless
class MonitorService {
  async getTarget(id: string) {
    return this.repository.findById(id); // From database
  }
}

// ❌ BAD - Stateful
class MonitorService {
  private targets = new Map(); // ❌ In-memory state
}
```

**Current State:**
- ✅ Services designed to be stateless
- ✅ State stored in database, not in-memory
- ✅ Event-driven architecture prevents tight coupling
- ✅ Can scale horizontally

### VII. Port Binding ✅

**Export services via port binding**

```typescript
// ✅ GOOD - Port from environment
const PORT = process.env.PORT || 3000;
Bun.serve({ port: PORT });

// ❌ BAD - Hardcoded port
Bun.serve({ port: 3000 });
```

**Current State:**
- ✅ Services bind to ports specified in environment
- ✅ Self-contained HTTP servers (Bun)
- ✅ No external web server required
- ✅ Port configuration via environment variables

### VIII. Concurrency ✅

**Scale out via the process model**

```bash
# ✅ GOOD - Scale with multiple processes
docker-compose up -d --scale monitor-service=3

# ❌ BAD - Single process with threads
node --max-old-space-size=8192 app.js
```

**Current State:**
- ✅ Multiple service types for different workloads
- ✅ Can scale each service independently
- ✅ Event-driven decoupling enables scaling
- ✅ Stateless design supports horizontal scaling

### IX. Disposability ⚠️

**Maximize robustness with fast startup and graceful shutdown**

```typescript
// ✅ GOOD - Graceful shutdown
process.on("SIGTERM", async () => {
  await server.close();
  await database.disconnect();
  process.exit(0);
});

// ❌ BAD - Abrupt shutdown
// No signal handlers
```

**Current State (Issues):**
- ⚠️ Startup time is reasonable but not optimized
- ⚠️ Graceful shutdown implemented but needs improvement
- ❌ No explicit signal handling for all edge cases
- ⚠️ Database connections may not close gracefully

**Required Changes:**

```typescript
// Graceful shutdown handler
async function gracefulShutdown(signal: string) {
  console.log(`Received ${signal}, starting graceful shutdown...`);

  // 1. Stop accepting new requests
  server.close();

  // 2. Complete in-flight requests (with timeout)
  await Promise.race([
    completeInFlightRequests(),
    timeout(30000), // 30 second timeout
  ]);

  // 3. Close database connections
  await database.disconnect();

  // 4. Close event bus connections
  await eventBus.disconnect();

  // 5. Exit cleanly
  console.log("Graceful shutdown complete");
  process.exit(0);
}

// Register signal handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

### X. Dev/prod Parity ⚠️

**Keep development, staging, and production as similar as possible**

```bash
# ✅ GOOD - Same database in all environments
# Development
DATABASE_URL=postgresql://localhost:5432/network_monitor_dev

# Production
DATABASE_URL=postgresql://prod-host:5432/network_monitor

# ❌ BAD - Different databases
# Development: SQLite
# Production: PostgreSQL
```

**Current State (Issues):**
- ❌ SQLite for development, PostgreSQL for production
- ⚠️ In-memory event bus for dev, RabbitMQ for prod
- ⚠️ Mock services in dev, real services in prod
- ❌ Significant differences in database behavior

**Required Changes:**

**CRITICAL: Improve dev/prod parity**

1. **Use PostgreSQL in development** (via Docker Compose)
2. **Optional RabbitMQ for development**
3. **Consistent environment variables**
4. **Same database schema and migrations**

```yaml
# docker-compose.dev.yml
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: network_monitor_dev
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  rabbitmq:
    image: rabbitmq:3-management-alpine
    ports:
      - "5672:5672"
      - "15672:15672"
    environment:
      RABBITMQ_DEFAULT_USER: dev
      RABBITMQ_DEFAULT_PASS: dev

volumes:
  postgres_dev_data:
```

### XI. Logs ⚠️

**Treat logs as event streams**

```typescript
// ✅ GOOD - Stream to stdout
logger.info("Event occurred", { userId, action });

// ❌ BAD - Write to files
fs.appendFile("app.log", message);
winston.transports.File({ filename: "error.log" });
```

**Current State (Issues):**
- ⚠️ Some logging to console (good)
- ❌ Some logging to files (violates 12-factor)
- ⚠️ Not all logs structured
- ❌ Log aggregation not standardized

**Required Changes:**

**CRITICAL: Stream all logs to stdout/stderr**

```typescript
// Remove file-based logging
// ❌ BAD - Writing to files
winston.createLogger({
  transports: [
    new winston.transports.File({ filename: "error.log" }),
  ],
});

// ✅ GOOD - Stream to stdout
winston.createLogger({
  transports: [
    new winston.transports.Console({
      format: winston.format.json(), // Structured logging
    }),
  ],
});
```

**Structured Logging:**

```typescript
// All logs should be structured JSON
logger.info("Target created", {
  targetId: "target-123",
  userId: "user-456",
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV,
});

// Output:
// {"level":"info","message":"Target created","targetId":"target-123","userId":"user-456","timestamp":"2025-10-01T12:00:00Z","environment":"production"}
```

### XII. Admin Processes ✅

**Run admin/management tasks as one-off processes**

```bash
# ✅ GOOD - One-off admin processes
bun run db:migrate
bun run db:seed
bun run db:reset

# ❌ BAD - Admin UI in main app
app.get("/admin/reset-database", async (req, res) => {
  await database.reset(); // ❌ Don't do this
});
```

**Current State:**
- ✅ Database migrations run as separate processes
- ✅ Seed scripts are one-off processes
- ✅ Admin tasks use same codebase and config
- ✅ Scripts properly use environment variables

---

## 🎯 Implementation Roadmap

### Phase 1: Critical Fixes (Week 1-2)

1. **Config (Factor III)** - HIGH PRIORITY
   - [ ] Create `.env.example` with all variables
   - [ ] Remove JSON config files for environment settings
   - [ ] Update all services to read from environment
   - [ ] Update documentation

2. **Dev/Prod Parity (Factor X)** - HIGH PRIORITY
   - [ ] Create `docker-compose.dev.yml` with PostgreSQL
   - [ ] Update schema.prisma to support PostgreSQL
   - [ ] Document development setup with Docker
   - [ ] Test migrations on PostgreSQL

### Phase 2: Important Improvements (Week 3-4)

3. **Logs (Factor XI)** - MEDIUM PRIORITY
   - [ ] Remove all file-based logging
   - [ ] Implement structured JSON logging everywhere
   - [ ] Add request ID tracking
   - [ ] Document log aggregation setup

4. **Disposability (Factor IX)** - MEDIUM PRIORITY
   - [ ] Implement comprehensive graceful shutdown
   - [ ] Add startup time monitoring
   - [ ] Add health check endpoints
   - [ ] Test signal handling

### Phase 3: Documentation & Validation (Week 5)

5. **Documentation**
   - [ ] Update all docs with 12-factor compliance
   - [ ] Create deployment checklist
   - [ ] Document environment variables
   - [ ] Update README with best practices

6. **Testing**
   - [ ] Test deployments in all environments
   - [ ] Validate configuration management
   - [ ] Test graceful shutdown
   - [ ] Verify log aggregation

---

## 🚨 Anti-Patterns to Avoid

### ❌ Hardcoded Configuration
```typescript
// ❌ NEVER DO THIS
const config = {
  database: "postgresql://prod-server/db",
  port: 3000,
  apiKey: "EXAMPLE_FAKE_API_KEY_DO_NOT_USE",
};
```

### ❌ File-Based Logging
```typescript
// ❌ NEVER DO THIS
fs.appendFile("app.log", message);
winston.transports.File({ filename: "error.log" });
```

### ❌ Stateful Services
```typescript
// ❌ NEVER DO THIS
class Service {
  private cache = new Map(); // Won't work with multiple instances
}
```

### ❌ Mixed Environments
```bash
# ❌ NEVER DO THIS
# Development: SQLite
DATABASE_URL=file:./dev.db

# Production: PostgreSQL
DATABASE_URL=postgresql://...
```

---

## ✅ Best Practices

### 1. Environment First
```bash
# Always use .env for local development
cp .env.example .env
nano .env
```

### 2. Docker for Backing Services
```bash
# Start PostgreSQL, RabbitMQ, etc.
docker-compose -f docker-compose.dev.yml up -d
```

### 3. Structured Logging
```typescript
// Use JSON for structured logs
logger.info("Event", { key: "value" });
```

### 4. Health Checks
```typescript
// Always provide health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date() });
});
```

### 5. Graceful Shutdown
```typescript
// Always handle SIGTERM and SIGINT
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
```

---

## 🎯 Success Criteria

✅ **12 out of 12 factors fully compliant**

- All configuration from environment variables
- PostgreSQL in all environments
- Logs stream to stdout/stderr
- Graceful shutdown < 30 seconds
- Startup time < 3 seconds
- Zero secrets in version control
- Can deploy to any cloud platform

**Target: 12/12 Factors Fully Compliant**

---

## 📚 Resources

- [The Twelve-Factor App](https://12factor.net/) - Official methodology
- [Environment Variables Best Practices](https://12factor.net/config)
- [Graceful Shutdown in Node.js](https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html)
- [PostgreSQL in Docker](https://hub.docker.com/_/postgres)

---

**Remember: Follow these principles religiously. They make your app portable, scalable, and cloud-native!** 🚀