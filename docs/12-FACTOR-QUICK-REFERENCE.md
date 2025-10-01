# 12-Factor App Quick Reference

Quick reference guide for 12-factor app principles in the PWA Connection Monitor.

## 🚀 Quick Checklist

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

---

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

---

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

---

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

---

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

---

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

---

### VII. Port Binding ✅

**Export services via port binding**

```typescript
// ✅ GOOD - Port from environment
const PORT = process.env.PORT || 3000;
Bun.serve({ port: PORT });

// ❌ BAD - Hardcoded port
Bun.serve({ port: 3000 });
```

---

### VIII. Concurrency ✅

**Scale out via the process model**

```bash
# ✅ GOOD - Scale with multiple processes
docker-compose up -d --scale monitor-service=3

# ❌ BAD - Single process with threads
node --max-old-space-size=8192 app.js
```

---

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

---

### X. Dev/prod parity ⚠️

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

---

### XI. Logs ⚠️

**Treat logs as event streams**

```typescript
// ✅ GOOD - Stream to stdout
logger.info("Event occurred", { userId, action });

// ❌ BAD - Write to files
fs.appendFile("app.log", message);
winston.transports.File({ filename: "error.log" });
```

---

### XII. Admin processes ✅

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

---

## 🎯 Common Patterns

### Environment Configuration

```typescript
// Load at startup
import { validateEnvironment, getEnvironment } from "@network-monitor/infrastructure";

validateEnvironment(); // Throws if invalid

const config = getEnvironment();
console.log(`Server starting on port ${config.port}`);
```

### Database Connection

```typescript
// Always from environment
const prisma = new PrismaClient({
  datasources: {
    db: { url: process.env.DATABASE_URL },
  },
});
```

### Logging

```typescript
// Structured logging to stdout
logger.info("Target created", {
  targetId: target.id,
  userId: user.id,
  timestamp: new Date().toISOString(),
});
```

### Graceful Shutdown

```typescript
// Handle signals
import { setupGracefulShutdown } from "@network-monitor/infrastructure";

setupGracefulShutdown({
  logger,
  database,
  eventBus,
});
```

---

## 🚨 Anti-Patterns to Avoid

### ❌ Hardcoded Configuration

```typescript
// ❌ NEVER DO THIS
const config = {
  database: "postgresql://prod-server/db",
  port: 3000,
  apiKey: "sk_live_abc123",
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
cp env.template .env
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

## 📚 More Information

- [Full 12-Factor Assessment](./12-FACTOR-APP.md)
- [Migration Guide](./12-FACTOR-MIGRATION-GUIDE.md)
- [Executive Summary](./12-FACTOR-SUMMARY.md)
- [Official 12-Factor App](https://12factor.net/)

---

**Remember: Follow these principles religiously. They make your app portable, scalable, and cloud-native!** 🚀
