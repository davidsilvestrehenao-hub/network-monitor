# 12-Factor App Migration Guide

This guide walks you through migrating the PWA Connection Monitor to full 12-factor app compliance.

## 📊 Current Status

**8 out of 12 factors are fully compliant.**

**4 factors need improvement:**

- ⚠️ **Factor III: Config** - Move from JSON files to environment variables
- ⚠️ **Factor IX: Disposability** - Improve graceful shutdown
- ⚠️ **Factor X: Dev/prod parity** - Use PostgreSQL in all environments
- ⚠️ **Factor XI: Logs** - Ensure all logs stream to stdout/stderr

## 🎯 Migration Goals

1. **Zero downtime** - No service interruption during migration
2. **Backward compatible** - Old configs work during transition
3. **Well tested** - Test each change thoroughly
4. **Documented** - Clear documentation for all changes

## 📅 Migration Timeline

### Phase 1: Critical Fixes (Week 1-2)

- [ ] Set up PostgreSQL for development
- [ ] Migrate to environment variables
- [ ] Test configuration system
- [ ] Update documentation

### Phase 2: Improvements (Week 3-4)

- [ ] Implement graceful shutdown
- [ ] Fix logging to stdout/stderr
- [ ] Test deployment scenarios
- [ ] Performance validation

### Phase 3: Cleanup (Week 5)

- [ ] Remove legacy JSON configs
- [ ] Update all documentation
- [ ] Final testing and validation
- [ ] Deploy to production

---

## 🔧 Phase 1: Critical Fixes

### Step 1: Set Up PostgreSQL for Development (Factor X)

**Why:** Dev/prod parity - same database type in all environments.

#### 1.1 Start PostgreSQL with Docker Compose

```bash
# Start PostgreSQL and other backing services
docker-compose -f docker-compose.dev.yml up -d postgres

# Verify PostgreSQL is running
docker-compose -f docker-compose.dev.yml ps postgres

# Check logs
docker-compose -f docker-compose.dev.yml logs -f postgres
```

#### 1.2 Update Database Connection

```bash
# Create .env file from template
cp env.template .env

# Edit .env and set DATABASE_URL
DATABASE_URL=postgresql://dev:dev@localhost:5432/network_monitor_dev
```

#### 1.3 Run Migrations

```bash
# Generate Prisma client
bun run db:generate

# Run migrations
bun run db:migrate

# Seed database (optional)
bun run db:seed
```

#### 1.4 Test Database Connection

```bash
# Test the connection
bun run dev

# Check logs for successful connection
# You should see: ✅ Database connected
```

**Validation:**

- [ ] PostgreSQL running in Docker
- [ ] Migrations run successfully
- [ ] Application connects to PostgreSQL
- [ ] All CRUD operations work

---

### Step 2: Migrate to Environment Variables (Factor III)

**Why:** Configuration should be in environment, not code or JSON files.

#### 2.1 Create Environment Configuration

```bash
# Copy template to .env
cp env.template .env

# Edit .env with your values
# See env.template for all available options
```

#### 2.2 Update Service Entry Points

**Before (using JSON config):**

```typescript
// apps/api/src/main.ts
const configPath = `configs/apps/api/${env}.json`;
const context = await bootstrapMicroservice({
  serviceName: "API",
  configPath, // ❌ Reading config from JSON file
});
```

**After (using environment variables):**

```typescript
// apps/api/src/main.ts
import { validateEnvironment, getEnvironment } from "@network-monitor/infrastructure";

// Validate environment at startup
validateEnvironment();

const config = getEnvironment();

const context = await bootstrapMicroservice({
  serviceName: "API",
  config, // ✅ Using validated environment config
});
```

#### 2.3 Update All Service Entry Points

Apply the same pattern to:

- `apps/api/src/main.ts`
- `apps/monitor-service/src/main.ts`
- `apps/alerting-service/src/main.ts`
- `apps/notification-service/src/main.ts`
- `apps/web/src/routes/api/trpc/[...trpc].ts`

#### 2.4 Update Configuration Access

**Before:**

```typescript
// Reading from JSON config
const config = JSON.parse(fs.readFileSync("config.json", "utf-8"));
const dbUrl = config.database.url;
```

**After:**

```typescript
// Reading from environment
import { getEnvironment } from "@network-monitor/infrastructure";

const config = getEnvironment();
const dbUrl = config.databaseUrl;
```

**Validation:**

- [ ] All services start with environment variables
- [ ] No JSON config files are loaded
- [ ] Configuration is validated at startup
- [ ] All services work as expected

---

### Step 3: Update Deployment Scripts

#### 3.1 Update Docker Files

**Before:**

```dockerfile
# Dockerfile with hardcoded config
COPY configs/ ./configs/
ENV NODE_ENV=production
```

**After:**

```dockerfile
# Dockerfile with environment-based config
# No config files copied
ENV NODE_ENV=production
# All other config via environment variables
```

#### 3.2 Update Docker Compose

**Before:**

```yaml
services:
  monolith:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=file:./db.sqlite  # ❌ SQLite
```

**After:**

```yaml
services:
  monolith:
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://...  # ✅ PostgreSQL
      - AUTH_SECRET=${AUTH_SECRET}     # ✅ From environment
      - LOG_LEVEL=info
      - LOG_FORMAT=json
```

#### 3.3 Update systemd Service

**Before:**

```ini
[Service]
Environment=NODE_ENV=production
Environment=DATABASE_URL=file:./prod.db
```

**After:**

```ini
[Service]
EnvironmentFile=/etc/network-monitor/.env
# All variables loaded from environment file
```

**Validation:**

- [ ] Docker build succeeds
- [ ] Docker containers start correctly
- [ ] All services use environment variables
- [ ] No hardcoded configuration

---

## 🔧 Phase 2: Improvements

### Step 4: Implement Graceful Shutdown (Factor IX)

#### 4.1 Create Shutdown Handler

```typescript
// packages/infrastructure/src/graceful-shutdown.ts
import type { ILogger } from "./services/ILogger";
import type { IDatabaseService } from "./services/IDatabaseService";
import type { IEventBus } from "./services/IEventBus";

export interface GracefulShutdownOptions {
  logger: ILogger;
  database?: IDatabaseService;
  eventBus?: IEventBus;
  shutdownTimeout?: number;
}

export function setupGracefulShutdown(
  options: GracefulShutdownOptions,
): void {
  const { logger, database, eventBus, shutdownTimeout = 30000 } = options;

  let isShuttingDown = false;

  async function shutdown(signal: string): Promise<void> {
    if (isShuttingDown) {
      logger.warn("Shutdown already in progress");
      return;
    }

    isShuttingDown = true;
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    try {
      // Set shutdown timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Shutdown timeout")), shutdownTimeout);
      });

      // Shutdown sequence
      const shutdownPromise = (async () => {
        // 1. Stop accepting new requests (handled by server)
        logger.info("Stopping new request acceptance...");

        // 2. Complete in-flight requests
        logger.info("Completing in-flight requests...");
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // 3. Close event bus
        if (eventBus) {
          logger.info("Closing event bus...");
          await eventBus.disconnect?.();
        }

        // 4. Close database connections
        if (database) {
          logger.info("Closing database connections...");
          await database.disconnect();
        }

        logger.info("Graceful shutdown complete");
      })();

      // Race between shutdown and timeout
      await Promise.race([shutdownPromise, timeoutPromise]);

      process.exit(0);
    } catch (error) {
      logger.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  }

  // Register signal handlers
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  // Handle uncaught errors
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught exception:", error);
    shutdown("uncaughtException");
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("Unhandled rejection:", reason);
    shutdown("unhandledRejection");
  });
}
```

#### 4.2 Update Service Entry Points

```typescript
// apps/api/src/main.ts
import { setupGracefulShutdown } from "@network-monitor/infrastructure";

async function startMonolith() {
  const context = await bootstrapMicroservice({...});

  // Setup graceful shutdown
  setupGracefulShutdown({
    logger: context.logger,
    database: context.database,
    eventBus: context.eventBus,
    shutdownTimeout: 30000,
  });

  context.logger.info("Server started with graceful shutdown handlers");
}
```

**Validation:**

- [ ] SIGTERM triggers graceful shutdown
- [ ] SIGINT (Ctrl+C) triggers graceful shutdown
- [ ] Database connections close cleanly
- [ ] Event bus disconnects properly
- [ ] Shutdown completes within timeout

---

### Step 5: Fix Logging to Stdout/Stderr (Factor XI)

#### 5.1 Update Logger Configuration

**Remove file-based logging:**

```typescript
// ❌ BAD - Remove this
const logger = winston.createLogger({
  transports: [
    new winston.transports.File({ filename: "error.log" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});
```

**Use console-only logging:**

```typescript
// ✅ GOOD - Use this
import { getEnvironment } from "./config/env";

const config = getEnvironment();

const logger = winston.createLogger({
  level: config.logLevel,
  format: config.logFormat === "json"
    ? winston.format.json()
    : winston.format.simple(),
  transports: [
    new winston.transports.Console(), // Only console
  ],
});
```

#### 5.2 Remove All File Logging

Search for and remove:

```bash
# Find all file logging
grep -r "winston.transports.File" .
grep -r "fs.writeFile.*log" .
grep -r "createWriteStream.*log" .

# Remove all file-based logging
```

#### 5.3 Use Structured Logging

```typescript
// ✅ GOOD - Structured JSON logging
logger.info("Target created", {
  targetId: target.id,
  userId: user.id,
  timestamp: new Date().toISOString(),
  environment: config.nodeEnv,
});

// Output: {"level":"info","message":"Target created","targetId":"123",...}
```

**Validation:**

- [ ] No file-based logging
- [ ] All logs go to stdout/stderr
- [ ] Logs are structured (JSON)
- [ ] Log aggregation works (Docker logs, journalctl, etc.)

---

## 🔧 Phase 3: Cleanup & Documentation

### Step 6: Remove Legacy Configuration

#### 6.1 Remove JSON Config Files

```bash
# Move configs to archive (don't delete immediately)
mkdir -p archive/configs
mv configs/*.json archive/configs/

# Update .gitignore
echo "archive/" >> .gitignore
```

#### 6.2 Update Documentation

Files to update:

- [ ] `README.md` - Add 12-factor compliance section
- [ ] `docs/QUICK-START.md` - Update setup instructions
- [ ] `docs/DEPLOYMENT.md` - Update deployment guide
- [ ] `docs/CONFIGURATION.md` - Replace with environment variables guide

#### 6.3 Update Package Scripts

```json
// package.json
{
  "scripts": {
    "dev": "NODE_ENV=development bun run apps/web/src/entry-server.tsx",
    "start": "NODE_ENV=production bun run dist/main.js",
    "db:migrate": "cd packages/database && bunx prisma migrate deploy"
  }
}
```

---

## ✅ Validation Checklist

### Configuration (Factor III)

- [ ] All config comes from environment variables
- [ ] No JSON config files loaded
- [ ] Secrets not in code or version control
- [ ] `.env.example` or `env.template` provided
- [ ] Environment validation at startup

### Backing Services (Factor IV)

- [ ] Database URL from environment
- [ ] Event bus URL from environment
- [ ] No hardcoded service URLs

### Disposability (Factor IX)

- [ ] Graceful shutdown implemented
- [ ] SIGTERM handler works
- [ ] SIGINT handler works
- [ ] Database connections close cleanly
- [ ] Shutdown timeout enforced

### Dev/Prod Parity (Factor X)

- [ ] PostgreSQL in development
- [ ] PostgreSQL in production
- [ ] Same database schema
- [ ] Same migrations
- [ ] Docker Compose for dev backing services

### Logs (Factor XI)

- [ ] All logs to stdout/stderr
- [ ] No file-based logging
- [ ] Structured logging (JSON)
- [ ] Log aggregation tested

---

## 🚀 Deployment Checklist

### Before Deployment

- [ ] All tests pass
- [ ] Environment variables documented
- [ ] Secrets securely stored
- [ ] Database migrations ready
- [ ] Rollback plan prepared

### During Deployment

- [ ] Set all environment variables
- [ ] Run database migrations
- [ ] Start services
- [ ] Verify health checks
- [ ] Monitor logs

### After Deployment

- [ ] Verify all services running
- [ ] Check database connectivity
- [ ] Test critical user flows
- [ ] Monitor error rates
- [ ] Review logs for issues

---

## 🆘 Troubleshooting

### Issue: Missing Environment Variable

**Symptom:** Application fails to start with validation error

**Solution:**

```bash
# Check which variables are missing
bun run dev

# Copy env.template to .env
cp env.template .env

# Fill in all required values
nano .env
```

### Issue: Database Connection Failed

**Symptom:** `Error: connect ECONNREFUSED`

**Solution:**

```bash
# Start PostgreSQL
docker-compose -f docker-compose.dev.yml up -d postgres

# Check if running
docker-compose -f docker-compose.dev.yml ps

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Issue: Graceful Shutdown Not Working

**Symptom:** Process killed immediately on SIGTERM

**Solution:**

```typescript
// Ensure shutdown handler is registered
setupGracefulShutdown({
  logger,
  database,
  eventBus,
});

// Test with:
// kill -TERM <pid>
```

---

## 📚 Resources

- [The Twelve-Factor App](https://12factor.net/)
- [Environment Variables Best Practices](https://12factor.net/config)
- [Graceful Shutdown in Node.js](https://expressjs.com/en/advanced/healthcheck-graceful-shutdown.html)
- [PostgreSQL in Docker](https://hub.docker.com/_/postgres)

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
