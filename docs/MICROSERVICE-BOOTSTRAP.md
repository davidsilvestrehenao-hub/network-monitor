# Microservice Bootstrap Guide

This guide explains how to use the JSON-configurable DI container system to bootstrap microservices in a DRY (Don't Repeat Yourself) way.

## Overview

The Network Monitor project uses a **generic microservice bootstrap utility** that eliminates boilerplate code and provides consistent initialization across all services.

### Key Benefits

✅ **Zero Boilerplate** - One-line initialization for microservices  
✅ **JSON Configuration** - Declarative service configuration  
✅ **Automatic DI** - Dependencies injected automatically  
✅ **Graceful Shutdown** - Built-in signal handling  
✅ **Database Management** - Auto connect/disconnect  
✅ **Event-Driven** - EventBus integration  
✅ **Type-Safe** - Full TypeScript support  

## Architecture

```text
Microservice Entry Point (main.ts)
    ↓
bootstrapMicroservice() utility
    ↓
JSON Configuration (configs/*.json)
    ↓
DI Container Initialization
    ↓
Service Dependencies Resolved
    ↓
Custom Initialization Callback
    ↓
Service Running + Event Handlers Setup
```

## Quick Start

### 1. Create a JSON Configuration

Create a configuration file for your microservice in `configs/`:

```json
// configs/my-service.json
{
  "name": "My Service Configuration",
  "description": "Configuration for My microservice",
  "environment": "production",
  "services": {
    "ILogger": {
      "module": "@network-monitor/infrastructure",
      "className": "LoggerService",
      "isMock": false,
      "description": "Production logger"
    },
    "IEventBus": {
      "module": "@network-monitor/infrastructure",
      "className": "EventBus",
      "isMock": false,
      "description": "Event bus"
    },
    "IDatabaseService": {
      "module": "@network-monitor/database",
      "className": "DatabaseService",
      "isMock": false,
      "description": "Database service"
    },
    "IMyService": {
      "module": "@my-package/services",
      "className": "MyService",
      "isMock": false,
      "description": "My service implementation"
    }
  }
}
```

### 2. Create the Microservice Entry Point

```typescript
// apps/my-service/src/main.ts
import {
  bootstrapMicroservice,
  getRequiredService,
  type MicroserviceContext,
} from "@network-monitor/infrastructure";
import type { IMyService } from "@network-monitor/shared";

async function startMyService() {
  const context = await bootstrapMicroservice({
    serviceName: "My Service",
    configPath: "configs/my-service.json",
    enableDatabase: true,
    
    onInitialized: async (ctx: MicroserviceContext) => {
      // Get your service
      const myService = getRequiredService<IMyService>(ctx, "myService");
      
      // Setup event handlers
      ctx.eventBus.on("MY_EVENT", async (data) => {
        ctx.logger.info("Handling MY_EVENT", { data });
        await myService.handleEvent(data);
      });
      
      ctx.logger.info("My Service is ready!");
    },
    
    onShutdown: async (ctx: MicroserviceContext) => {
      ctx.logger.info("Cleaning up...");
      // Cleanup logic here
    },
  });
  
  context.logger.info("My Service is running");
}

startMyService();
```

### 3. Run the Microservice

```bash
# Development
bun run apps/my-service/src/main.ts

# Production
bun run build --filter=my-service
bun run apps/my-service/dist/main.js
```

## Real-World Examples

### Monitor Service

The Monitor Service handles target management and speed tests:

```typescript
// apps/monitor-service/src/main.ts
import {
  bootstrapMicroservice,
  getRequiredService,
  type MicroserviceContext,
} from "@network-monitor/infrastructure";
import type { IMonitorService } from "@network-monitor/shared";

async function startMonitorService() {
  const context = await bootstrapMicroservice({
    serviceName: "Monitor Service",
    configPath: "configs/monitor-service.json",
    enableDatabase: true,
    
    onInitialized: async (ctx: MicroserviceContext) => {
      const monitorService = getRequiredService<IMonitorService>(ctx, "monitor");
      
      // Setup event handlers
      ctx.eventBus.on("TARGET_CREATE_REQUESTED", async (data) => {
        await monitorService.createTarget(data);
      });
      
      ctx.eventBus.on("SPEED_TEST_REQUESTED", async (data) => {
        await monitorService.runSpeedTest(data);
      });
      
      ctx.logger.info("Monitor Service ready!");
    },
  });
  
  context.logger.info("Monitor Service running");
}

startMonitorService();
```

**Configuration:** `configs/monitor-service.json`  
**Dependencies:** Monitor Service, Target Repository, Speed Test Repository  
**Events:** TARGET_CREATE_REQUESTED, SPEED_TEST_REQUESTED, etc.

### Alerting Service

The Alerting Service handles alert rules and incident management:

```typescript
// apps/alerting-service/src/main.ts
import {
  bootstrapMicroservice,
  getRequiredService,
  type MicroserviceContext,
} from "@network-monitor/infrastructure";
import type { IAlertingService } from "@network-monitor/shared";

async function startAlertingService() {
  const context = await bootstrapMicroservice({
    serviceName: "Alerting Service",
    configPath: "configs/alerting-service.json",
    enableDatabase: true,
    
    onInitialized: async (ctx: MicroserviceContext) => {
      const alertingService = getRequiredService<IAlertingService>(ctx, "alerting");
      
      // Setup event handlers
      ctx.eventBus.on("SPEED_TEST_COMPLETED", async (data) => {
        await alertingService.evaluateRules(data);
      });
      
      ctx.logger.info("Alerting Service ready!");
    },
  });
  
  context.logger.info("Alerting Service running");
}

startAlertingService();
```

**Configuration:** `configs/alerting-service.json`  
**Dependencies:** Alerting Service, Alert Rule Repository, Incident Repository  
**Events:** SPEED_TEST_COMPLETED, ALERT_RULE_CREATE_REQUESTED, etc.

### API Monolith

The API Monolith runs all services in a single process:

```typescript
// apps/api/src/main.ts
import {
  bootstrapMicroservice,
  type MicroserviceContext,
} from "@network-monitor/infrastructure";
import type {
  IMonitorService,
  IAlertingService,
  INotificationService,
} from "@network-monitor/shared";

async function startMonolith() {
  const context = await bootstrapMicroservice({
    serviceName: "Network Monitor Monolith",
    configPath: "configs/api-monolith.json",
    enableDatabase: true,
    
    onInitialized: async (ctx: MicroserviceContext) => {
      // All services are available
      const monitorService = ctx.services.monitor as IMonitorService;
      const alertingService = ctx.services.alerting as IAlertingService;
      const notificationService = ctx.services.notification as INotificationService;
      
      ctx.logger.info("All services initialized in monolith mode");
    },
  });
  
  context.logger.info("Monolith running");
}

startMonolith();
```

**Configuration:** `configs/api-monolith.json`  
**Dependencies:** ALL services and repositories  
**Events:** All events (in-memory event bus)

## Configuration Files

### Production Configurations

| File | Use Case | Services |
|------|----------|----------|
| `api-monolith.json` | Monolith deployment | All services |
| `monitor-service.json` | Monitor microservice | Monitor only |
| `alerting-service.json` | Alerting microservice | Alerting only |
| `notification-service.json` | Notification microservice | Notification only |

### Development Configurations

| File | Use Case | Services |
|------|----------|----------|
| `auth-mock-only.json` | Dev without auth | All concrete except auth |
| `offline-development.json` | Offline dev | Logger + EventBus only |
| `all-mock.json` | Unit testing | All mocked |

### Switching Configurations

```bash
# Use specific configuration
cp configs/monitor-service.json service-config.json

# Or symlink for easier switching
ln -sf configs/monitor-service.json service-config.json
```

## Advanced Usage

### Custom Initialization

Perform custom setup after container initialization:

```typescript
await bootstrapMicroservice({
  serviceName: "Custom Service",
  configPath: "configs/custom-service.json",
  
  onInitialized: async (ctx: MicroserviceContext) => {
    // Get required services
    const myService = getRequiredService<IMyService>(ctx, "myService");
    
    // Setup event handlers
    ctx.eventBus.on("EVENT_1", async (data) => {
      await myService.handleEvent1(data);
    });
    
    ctx.eventBus.on("EVENT_2", async (data) => {
      await myService.handleEvent2(data);
    });
    
    // Start background tasks
    setInterval(() => {
      myService.performPeriodicTask();
    }, 60000);
    
    // Initialize external connections
    await myService.connectToExternalService();
    
    ctx.logger.info("Custom initialization complete");
  },
});
```

### Custom Shutdown

Clean up resources gracefully:

```typescript
await bootstrapMicroservice({
  serviceName: "Custom Service",
  configPath: "configs/custom-service.json",
  
  onShutdown: async (ctx: MicroserviceContext) => {
    // Stop background tasks
    clearInterval(myInterval);
    
    // Close external connections
    await myExternalConnection.close();
    
    // Flush pending operations
    await myService.flushPendingOperations();
    
    // Save state
    await myService.saveState();
    
    ctx.logger.info("Shutdown complete");
  },
});
```

### Without Database

For stateless services that don't need a database:

```typescript
await bootstrapMicroservice({
  serviceName: "Stateless Service",
  configPath: "configs/stateless-service.json",
  enableDatabase: false, // No database connection
  
  onInitialized: async (ctx: MicroserviceContext) => {
    // ctx.database will be null
    ctx.logger.info("Stateless service ready");
  },
});
```

### Custom Banner

Disable the default banner for custom startup messages:

```typescript
await bootstrapMicroservice({
  serviceName: "My Service",
  configPath: "configs/my-service.json",
  showBanner: false, // Disable default banner
  
  onInitialized: async (ctx: MicroserviceContext) => {
    // Custom startup messages
    ctx.logger.info("╔════════════════════════════╗");
    ctx.logger.info("║   My Custom Service v2.0   ║");
    ctx.logger.info("╚════════════════════════════╝");
  },
});
```

## Type-Safe Service Access

### Using `getRequiredService()`

The recommended way to access services:

```typescript
const monitorService = getRequiredService<IMonitorService>(context, "monitor");
```

**Benefits:**

- Type-safe access
- Automatic error if service not configured
- Clear error messages
- No null checks needed

### Using Direct Access

For optional services:

```typescript
const myService = context.services.myService as IMyService | null;
if (myService) {
  await myService.doSomething();
} else {
  context.logger.warn("MyService not available");
}
```

## Deployment Patterns

### Monolith Deployment

**When to use:**

- Development
- Small deployments (< 10k users)
- Budget constraints ($20/month)

**Configuration:** `configs/api-monolith.json`

**Command:**

```bash
bun run apps/api/src/main.ts
```

### Microservice Deployment

**When to use:**

- Large scale (> 10k users)
- Independent scaling needs
- Different resource requirements per service

**Configurations:**

- `configs/monitor-service.json`
- `configs/alerting-service.json`
- `configs/notification-service.json`

**Commands:**

```bash
# Run each service separately
bun run apps/monitor-service/src/main.ts
bun run apps/alerting-service/src/main.ts
bun run apps/notification-service/src/main.ts
```

### Hybrid Deployment

Run some services as microservices, others as monolith:

```bash
# Monitor + Alerting in one process
# Use custom config combining both

# Notification service separately
bun run apps/notification-service/src/main.ts
```

## Docker Deployment

### Microservice Dockerfile

```dockerfile
FROM oven/bun:1.0-alpine AS base
WORKDIR /app

# Copy workspace files
COPY package.json bun.lockb turbo.json ./
COPY packages/ ./packages/
COPY apps/my-service/ ./apps/my-service/
COPY configs/my-service.json ./service-config.json

# Install and build
RUN bun install --frozen-lockfile
RUN bunx turbo run build --filter=my-service

# Production image
FROM oven/bun:1.0-alpine AS production
WORKDIR /app

COPY --from=base /app/apps/my-service/dist ./
COPY --from=base /app/service-config.json ./
COPY --from=base /app/node_modules ./node_modules

CMD ["bun", "run", "main.js"]
```

### Docker Compose

```yaml
version: "3.8"

services:
  monitor-service:
    build:
      context: .
      dockerfile: apps/monitor-service/Dockerfile
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
    volumes:
      - ./configs/monitor-service.json:/app/service-config.json
    restart: unless-stopped

  alerting-service:
    build:
      context: .
      dockerfile: apps/alerting-service/Dockerfile
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
    volumes:
      - ./configs/alerting-service.json:/app/service-config.json
    restart: unless-stopped

  notification-service:
    build:
      context: .
      dockerfile: apps/notification-service/Dockerfile
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
    volumes:
      - ./configs/notification-service.json:/app/service-config.json
    restart: unless-stopped
```

## Testing

### Unit Testing with Mocks

Use the all-mock configuration:

```typescript
import { bootstrapMicroservice } from "@network-monitor/infrastructure";

describe("My Service", () => {
  beforeEach(async () => {
    const context = await bootstrapMicroservice({
      serviceName: "Test Service",
      configPath: "configs/all-mock.json",
      enableDatabase: false,
    });
    
    // All services are mocked
  });
});
```

### Integration Testing

Use specific testing configurations:

```bash
# Test with real database
cp configs/database-testing.json service-config.json
bun test

# Test with real monitoring
cp configs/monitoring-testing.json service-config.json
bun test
```

## Environment Variables

### Required Variables

```bash
# Database connection
DATABASE_URL="postgresql://user:password@localhost:5432/network_monitor"

# Service configuration (optional, defaults to service-config.json)
SERVICE_CONFIG_PATH="configs/my-service.json"

# Environment
NODE_ENV="production"
```

### Optional Variables

```bash
# Logging level
LOG_LEVEL="info"

# Event bus configuration
RABBITMQ_URL="amqp://localhost:5672"

# Health check port
HEALTH_CHECK_PORT="3001"
```

## Troubleshooting

### Configuration Not Found

**Error:**

```text
Configuration file not found: configs/my-service.json
```

**Solution:**

```bash
# Check file exists
ls -la configs/my-service.json

# Check path is correct in your code
configPath: "configs/my-service.json"
```

### Service Not Available

**Error:**

```text
Required service 'myService' is not available
```

**Solution:**

1. Check JSON configuration includes the service
2. Verify service name matches (case-sensitive)
3. Ensure module path is correct

### Database Connection Failed

**Error:**

```text
Failed to connect to database
```

**Solution:**

```bash
# Check DATABASE_URL
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL

# Check database is running
docker ps | grep postgres
```

### Module Import Failed

**Error:**

```text
Failed to import module @my-package/services
```

**Solution:**

1. Ensure package is built: `bun run build --filter=@my-package/*`
2. Check package.json dependencies
3. Verify module exports the class

## Best Practices

### 1. One Configuration Per Service

Each microservice should have its own configuration:

```text
configs/
├── monitor-service.json       # Monitor Service only
├── alerting-service.json      # Alerting Service only
├── notification-service.json  # Notification Service only
└── api-monolith.json          # All services (monolith)
```

### 2. Use Environment-Specific Configs

```text
configs/
├── monitor-service.prod.json  # Production
├── monitor-service.dev.json   # Development
└── monitor-service.test.json  # Testing
```

```typescript
const env = process.env.NODE_ENV || "development";
const configPath = `configs/monitor-service.${env}.json`;

await bootstrapMicroservice({
  serviceName: "Monitor Service",
  configPath,
});
```

### 3. Implement Proper Error Handling

```typescript
onInitialized: async (ctx: MicroserviceContext) => {
  try {
    const service = getRequiredService<IMyService>(ctx, "myService");
    await service.initialize();
  } catch (error) {
    ctx.logger.error("Initialization failed", { error });
    throw error; // Bootstrap will handle cleanup
  }
}
```

### 4. Log Important Events

```typescript
onInitialized: async (ctx: MicroserviceContext) => {
  ctx.logger.info("Service starting", {
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    config: "monitor-service.json",
  });
  
  ctx.eventBus.on("MY_EVENT", async (data) => {
    ctx.logger.debug("Event received", { event: "MY_EVENT", data });
    // Handle event
  });
}
```

### 5. Clean Up Resources

```typescript
onShutdown: async (ctx: MicroserviceContext) => {
  // Stop timers
  if (myInterval) clearInterval(myInterval);
  
  // Close connections
  if (myConnection) await myConnection.close();
  
  // Save state
  await saveApplicationState();
  
  ctx.logger.info("Resources cleaned up");
}
```

## Comparison: Before vs After

### Before (Boilerplate-Heavy) ❌

```typescript
// 81 lines of repetitive code
import { EventBus } from "@network-monitor/infrastructure";
import { LoggerService, LogLevel } from "@network-monitor/infrastructure";
import { MonitorService } from "@network-monitor/monitor";

async function startMonitorService() {
  console.log("🚀 Starting Monitor Microservice...");
  console.log("📦 Independent service");
  console.log("🔌 Event Bus: RabbitMQ (distributed)");
  console.log("");

  const logger = new LoggerService(LogLevel.INFO);
  const eventBus = new EventBus();

  logger.info("Monitor Service: Initializing...");
  
  // Manual dependency wiring...
  // Repetitive error handling...
  // Manual signal handling...
  
  logger.info("✅ Monitor Service Ready!");
  
  process.on("SIGINT", () => {
    logger.info("Shutting down Monitor Service...");
    process.exit(0);
  });
}

startMonitorService().catch(error => {
  console.error("Failed to start Monitor Service:", error);
  process.exit(1);
});
```

### After (DRY, Clean) ✅

```typescript
// 30 lines of focused business logic
import {
  bootstrapMicroservice,
  getRequiredService,
  type MicroserviceContext,
} from "@network-monitor/infrastructure";
import type { IMonitorService } from "@network-monitor/shared";

async function startMonitorService() {
  const context = await bootstrapMicroservice({
    serviceName: "Monitor Service",
    configPath: "configs/monitor-service.json",
    enableDatabase: true,
    
    onInitialized: async (ctx: MicroserviceContext) => {
      const monitorService = getRequiredService<IMonitorService>(ctx, "monitor");
      
      // Focus on business logic only
      ctx.eventBus.on("TARGET_CREATE_REQUESTED", async (data) => {
        await monitorService.createTarget(data);
      });
      
      ctx.logger.info("Monitor Service ready!");
    },
  });
  
  context.logger.info("Monitor Service running");
}

startMonitorService();
```

**Benefits:**

- 60% less code
- Zero boilerplate
- Consistent across all services
- Type-safe
- Error handling built-in
- Graceful shutdown built-in

## Migration Guide

### Migrating Existing Services

1. **Create JSON Configuration:**

   ```bash
   cp configs/all-concrete.json configs/my-service.json
   # Edit to include only needed services
   ```

2. **Replace Manual Initialization:**

   ```typescript
   // Remove:
   const logger = new LoggerService(LogLevel.INFO);
   const eventBus = new EventBus();
   
   // Replace with:
   const context = await bootstrapMicroservice({ ... });
   ```

3. **Move Event Handlers:**

   ```typescript
   // Move to onInitialized callback
   onInitialized: async (ctx) => {
     ctx.eventBus.on("MY_EVENT", handler);
   }
   ```

4. **Test:**

   ```bash
   bun run apps/my-service/src/main.ts
   ```

## Next Steps

- [ ] Add health check HTTP endpoints
- [ ] Add metrics collection
- [ ] Add distributed tracing support
- [ ] Add service mesh integration
- [ ] Add configuration hot-reloading

## Related Documentation

- [JSON Configuration Guide](../../../../configs/README.md)
- [DI Container Documentation](../container/README.md)
- [Deployment Guide](../../../../docs/DEPLOYMENT.md)
- [Architecture Overview](../../../../docs/ARCHITECTURE.md)
