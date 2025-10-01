# 12-Factor App Compliance

This document assesses and documents the PWA Connection Monitor's compliance with the [12-Factor App methodology](https://12factor.net/), which defines best practices for building modern, scalable, cloud-native applications.

## 📊 Compliance Overview

| Factor | Status | Compliance |
|--------|--------|------------|
| I. Codebase | ✅ | 100% Compliant |
| II. Dependencies | ✅ | 100% Compliant |
| III. Config | ⚠️ | **Needs Improvement** |
| IV. Backing services | ✅ | 100% Compliant |
| V. Build, release, run | ✅ | 100% Compliant |
| VI. Processes | ✅ | 100% Compliant |
| VII. Port binding | ✅ | 100% Compliant |
| VIII. Concurrency | ✅ | 100% Compliant |
| IX. Disposability | ⚠️ | **Needs Improvement** |
| X. Dev/prod parity | ⚠️ | **Needs Improvement** |
| XI. Logs | ⚠️ | **Needs Improvement** |
| XII. Admin processes | ✅ | 100% Compliant |

**Overall Score: 8/12 Fully Compliant, 4/12 Need Improvement**

---

## I. Codebase ✅

> **One codebase tracked in revision control, many deploys**

### Current State

- ✅ Single Git repository with monorepo structure
- ✅ Turborepo for managing multiple apps and packages
- ✅ Clear separation of concerns (apps/, packages/)
- ✅ Same codebase deployed to development, staging, and production

### Implementation

```bash
# Single repository structure
network-monitor/
├── apps/              # Deployable applications
│   ├── api/          # Monolith deployment
│   ├── web/          # Frontend PWA
│   ├── monitor-service/
│   ├── alerting-service/
│   └── notification-service/
└── packages/         # Shared libraries
    ├── database/
    ├── infrastructure/
    └── shared/
```

### Best Practices

- ✅ One codebase for monolith and microservices
- ✅ Shared packages for common functionality
- ✅ Consistent versioning across all deployments

---

## II. Dependencies ✅

> **Explicitly declare and isolate dependencies**

### Current State

- ✅ Using Bun package manager with `package.json`
- ✅ Lock file (`bun.lock`) ensures consistent dependencies
- ✅ Workspace dependencies properly declared
- ✅ No system-level dependencies assumed

### Implementation

```json
// package.json with explicit dependencies
{
  "dependencies": {
    "@prisma/client": "^5.22.0",
    "solid-js": "^1.9.3",
    "trpc": "^10.x.x"
  },
  "devDependencies": {
    "typescript": "^5.6.3",
    "bun": "^1.2.22"
  }
}
```

### Best Practices

- ✅ All dependencies declared in `package.json`
- ✅ Lock file committed to version control
- ✅ No implicit system dependencies
- ✅ Dependency isolation through workspaces

---

## III. Config ⚠️

> **Store config in the environment**

### Current State (Issues)

- ❌ Configuration stored in JSON files (`configs/*.json`)
- ❌ Hard to override configs per deployment
- ⚠️ Some environment variables used, but not consistently
- ❌ JSON config files contain environment-specific settings

### Required Changes

**CRITICAL: Move from JSON configuration to environment variables**

#### Migration Plan

1. **Create `.env.example` file**
2. **Update all services to read from environment variables**
3. **Remove JSON config files** or use them only for service discovery
4. **Update documentation** to reflect environment-based config

#### Implementation

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
# Optional override for download speed test URL
# Defaults: 10MB file in non-production, 100MB file in production
SPEED_TEST_URL=
```

### Best Practices

- Use environment variables for ALL configuration
- Never commit secrets to version control
- Provide `.env.example` with all required variables
- Use consistent naming conventions (UPPERCASE_WITH_UNDERSCORES)
- Group related variables with prefixes (DB_, AUTH_, etc.)

---

## IV. Backing Services ✅

> **Treat backing services as attached resources**

### Current State

- ✅ Database abstracted through Prisma ORM
- ✅ Repository pattern isolates data access
- ✅ Event bus abstracted through interfaces
- ✅ Services can switch between implementations via DI

### Implementation

```typescript
// Backing services are abstracted
interface IDatabaseService {
  getClient(): PrismaClient;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
}

interface IEventBus {
  emit(event: string, data: unknown): void;
  on(event: string, handler: Function): void;
}

// Can switch between implementations without code changes
// - In-memory event bus for monolith
// - RabbitMQ event bus for microservices
// - SQLite for development
// - PostgreSQL for production
```

### Best Practices

- ✅ Database URL comes from environment variables
- ✅ Services don't care about backing service location
- ✅ Can swap implementations (mock, in-memory, remote)
- ✅ No code changes needed to switch backing services

---

## V. Build, Release, Run ✅

> **Strictly separate build and run stages**

### Current State

- ✅ Separate build and run stages
- ✅ Docker support for containerized deployments
- ✅ TypeScript compilation produces artifacts
- ✅ No runtime compilation in production

### Implementation

```bash
# Build stage
bun run build          # Compiles TypeScript to JavaScript

# Release stage
docker build -t app:v1.0.0  # Creates immutable release artifact

# Run stage
docker run app:v1.0.0       # Runs the built artifact
```

### Build Process

```typescript
// package.json scripts
{
  "scripts": {
    "build": "turbo run build",      // Build all packages
    "start": "turbo run start",       // Run pre-built artifacts
    "dev": "turbo run dev"            // Development only
  }
}
```

### Best Practices

- ✅ Build produces immutable artifacts
- ✅ No source code in production containers
- ✅ Separate dev and production workflows
- ✅ Version tagging for releases

---

## VI. Processes ✅

> **Execute the app as one or more stateless processes**

### Current State

- ✅ Services designed to be stateless
- ✅ State stored in database, not in-memory
- ✅ Event-driven architecture prevents tight coupling
- ✅ Can scale horizontally

### Implementation

```typescript
// Services are stateless
class MonitorService {
  // No instance state, all data from database
  async getTarget(id: string): Promise<Target> {
    return this.targetRepository.findById(id);
  }

  async createTarget(data: CreateTargetData): Promise<Target> {
    const target = await this.targetRepository.create(data);
    this.eventBus.emit("TARGET_CREATED", target);
    return target;
  }
}
```

### Best Practices

- ✅ No sticky sessions required
- ✅ Request state not stored in memory
- ✅ Can kill and restart processes without data loss
- ✅ Horizontal scaling supported

---

## VII. Port Binding ✅

> **Export services via port binding**

### Current State

- ✅ Services bind to ports specified in environment
- ✅ Self-contained HTTP servers (Bun)
- ✅ No external web server required
- ✅ Port configuration via environment variables

### Implementation

```typescript
// Services bind to ports
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

Bun.serve({
  port: PORT,
  hostname: HOST,
  fetch: handler,
});

console.log(`Server listening on ${HOST}:${PORT}`);
```

### Best Practices

- ✅ Self-contained HTTP server
- ✅ Port configured via environment
- ✅ No external web server dependency
- ✅ Services can run standalone

---

## VIII. Concurrency ✅

> **Scale out via the process model**

### Current State

- ✅ Multiple service types for different workloads
- ✅ Can scale each service independently
- ✅ Event-driven decoupling enables scaling
- ✅ Stateless design supports horizontal scaling

### Implementation

```yaml
# Docker Compose - Scale independently
services:
  monitor-service:
    deploy:
      replicas: 3  # Scale to 3 instances

  alerting-service:
    deploy:
      replicas: 2  # Scale to 2 instances

  notification-service:
    deploy:
      replicas: 1  # Single instance
```

### Scaling Strategy

```bash
# Start as monolith (1-10k users)
docker-compose up monolith

# Scale to microservices (10k+ users)
docker-compose up -d --scale monitor-service=3 \
                     --scale alerting-service=2 \
                     --scale notification-service=1
```

### Best Practices

- ✅ Process-based concurrency model
- ✅ Different process types for different workloads
- ✅ Can scale each service type independently
- ✅ Load balancing across instances

---

## IX. Disposability ⚠️

> **Maximize robustness with fast startup and graceful shutdown**

### Current State (Issues)

- ⚠️ Startup time is reasonable but not optimized
- ⚠️ Graceful shutdown implemented but needs improvement
- ❌ No explicit signal handling for all edge cases
- ⚠️ Database connections may not close gracefully

### Required Changes

**Implement comprehensive graceful shutdown**

#### Implementation Needed

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

// Fast startup
async function startup() {
  const startTime = Date.now();

  // Parallel initialization where possible
  await Promise.all([
    database.connect(),
    eventBus.connect(),
    loadConfiguration(),
  ]);

  console.log(`Startup completed in ${Date.now() - startTime}ms`);
}
```

### Best Practices

- Startup time < 3 seconds
- Graceful shutdown < 30 seconds
- Handle SIGTERM and SIGINT
- Close all connections cleanly
- Fail fast on startup errors

---

## X. Dev/prod Parity ⚠️

> **Keep development, staging, and production as similar as possible**

### Current State (Issues)

- ❌ SQLite for development, PostgreSQL for production
- ⚠️ In-memory event bus for dev, RabbitMQ for prod
- ⚠️ Mock services in dev, real services in prod
- ❌ Significant differences in database behavior

### Required Changes

**CRITICAL: Improve dev/prod parity**

#### Gap Analysis

| Component | Development | Production | Gap |
|-----------|------------|------------|-----|
| Database | SQLite | PostgreSQL | **HIGH** |
| Event Bus | In-memory | RabbitMQ | Medium |
| Services | Mocked | Real | Medium |
| Logging | Console | Structured | Low |

#### Implementation Needed

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

```bash
# .env.development
DATABASE_URL=postgresql://dev:dev@localhost:5432/network_monitor_dev
RABBITMQ_URL=amqp://dev:dev@localhost:5672
```

### Best Practices

- Use same database type in all environments
- Use Docker Compose for backing services in dev
- Minimize time gap between deploys
- Same people write and deploy code
- Keep environments as similar as possible

---

## XI. Logs ⚠️

> **Treat logs as event streams**

### Current State (Issues)

- ⚠️ Some logging to console (good)
- ❌ Some logging to files (violates 12-factor)
- ⚠️ Not all logs structured
- ❌ Log aggregation not standardized

### Required Changes

**CRITICAL: Stream all logs to stdout/stderr**

#### Implementation Needed

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

#### Structured Logging

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

#### Log Aggregation

```bash
# Development: View in terminal
bun run dev

# Production: Collect with log aggregation service
# - Docker logs → Logstash → Elasticsearch
# - Systemd journal → journalctl
# - Cloud platform → CloudWatch/Stackdriver
```

### Best Practices

- ✅ Write all logs to stdout/stderr
- ❌ Never write to log files
- ✅ Use structured JSON format
- ✅ Include context (request ID, user ID, etc.)
- ✅ Let infrastructure handle log routing and storage

---

## XII. Admin Processes ✅

> **Run admin/management tasks as one-off processes**

### Current State

- ✅ Database migrations run as separate processes
- ✅ Seed scripts are one-off processes
- ✅ Admin tasks use same codebase and config
- ✅ Scripts properly use environment variables

### Implementation

```bash
# Admin processes as one-off tasks
bun run db:migrate      # Run migrations
bun run db:seed         # Seed database
bun run db:reset        # Reset database

# Scripts use same environment
DATABASE_URL=postgresql://... bun run db:migrate
```

### Admin Scripts

```typescript
// scripts/reset-database.ts
// Uses same codebase and configuration
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL, // Same config as app
    },
  },
});

async function resetDatabase() {
  console.log("Resetting database...");
  await prisma.$executeRaw`DROP SCHEMA public CASCADE;`;
  await prisma.$executeRaw`CREATE SCHEMA public;`;
  console.log("Database reset complete");
}

resetDatabase();
```

### Best Practices

- ✅ One-off processes use same codebase
- ✅ Same configuration mechanism
- ✅ Same dependency management
- ✅ Can run in any environment

---

## 🎯 Compliance Roadmap

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

## 📚 Resources

- [The Twelve-Factor App](https://12factor.net/)
- [Heroku Dev Center](https://devcenter.heroku.com/articles/architecting-apps)
- [Cloud Native Computing Foundation](https://www.cncf.io/)

---

## ✅ Success Criteria

- ✅ All 12 factors fully implemented
- ✅ No configuration in code or JSON files
- ✅ Same database type in dev and prod
- ✅ All logs stream to stdout/stderr
- ✅ Graceful shutdown < 30 seconds
- ✅ Startup time < 3 seconds
- ✅ Can deploy with zero code changes

**Target: 12/12 Factors Fully Compliant**
