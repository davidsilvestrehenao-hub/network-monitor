# Microservice Bootstrap Utilities

This package provides a DRY (Don't Repeat Yourself) approach to bootstrapping microservices with JSON-configurable DI containers.

## Features

✅ **JSON Configuration** - Configure services declaratively via JSON files  
✅ **Automatic DI** - Dependency injection handled automatically  
✅ **Graceful Shutdown** - Built-in signal handling and cleanup  
✅ **Database Management** - Automatic database connection/disconnection  
✅ **Error Handling** - Comprehensive error handling with logging  
✅ **Health Checks** - Optional health check endpoints  
✅ **Event-Driven** - EventBus integration for loosely coupled services  

## Quick Start

### 1. Create a JSON Configuration

Create a configuration file in `configs/` directory:

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
      "description": "Production logger service"
    },
    "IEventBus": {
      "module": "@network-monitor/infrastructure",
      "className": "EventBus",
      "isMock": false,
      "description": "Event bus for distributed communication"
    },
    "IDatabaseService": {
      "module": "@network-monitor/database",
      "className": "DatabaseService",
      "isMock": false,
      "description": "Database service for persistence"
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

### 2. Bootstrap Your Microservice

Create your microservice entry point:

```typescript
// apps/my-service/src/main.ts
import {
  bootstrapMicroservice,
  getRequiredService,
  type MicroserviceContext,
} from "@network-monitor/infrastructure";
import type { IMyService } from "@my-package/shared";

async function startMyService() {
  const context = await bootstrapMicroservice({
    serviceName: "My Service",
    configPath: "configs/my-service.json",
    enableDatabase: true,
    
    // Custom initialization
    onInitialized: async (ctx: MicroserviceContext) => {
      const myService = getRequiredService<IMyService>(ctx, "myService");
      
      // Setup event handlers
      ctx.eventBus.on("MY_EVENT", async (data) => {
        ctx.logger.info("Handling MY_EVENT", { data });
        // Handle event
      });
      
      ctx.logger.info("My Service is ready!");
    },
    
    // Custom shutdown
    onShutdown: async (ctx: MicroserviceContext) => {
      ctx.logger.info("Cleaning up...");
      // Cleanup logic
    },
  });
  
  context.logger.info("My Service is running");
}

startMyService();
```

### 3. Run Your Microservice

```bash
# Development
bun run apps/my-service/src/main.ts

# Production
bun run apps/my-service/dist/main.js
```

## API Reference

### `bootstrapMicroservice(options)`

Bootstrap a microservice with JSON-configurable DI container.

**Parameters:**

```typescript
interface MicroserviceBootstrapOptions {
  // Name of the microservice (e.g., "Monitor Service")
  serviceName: string;
  
  // Path to JSON configuration (defaults to "service-config.json")
  configPath?: string;
  
  // Enable database connection (default: true)
  enableDatabase?: boolean;
  
  // Custom initialization callback
  onInitialized?: (context: MicroserviceContext) => Promise<void> | void;
  
  // Custom shutdown callback
  onShutdown?: (context: MicroserviceContext) => Promise<void> | void;
  
  // Port number for health checks (optional)
  port?: number;
  
  // Enable console banner (default: true)
  showBanner?: boolean;
}
```

**Returns:** `Promise<MicroserviceContext>`

**Example:**

```typescript
const context = await bootstrapMicroservice({
  serviceName: "My Service",
  configPath: "configs/my-service.json",
  enableDatabase: true,
  onInitialized: async (ctx) => {
    // Setup logic
  },
});
```

### `MicroserviceContext`

Context provided to initialization and shutdown callbacks.

```typescript
interface MicroserviceContext {
  // Logger service
  logger: ILogger;
  
  // Event bus for inter-service communication
  eventBus: IEventBus;
  
  // Database service (null if disabled)
  database: IDatabaseService | null;
  
  // All registered services
  services: Record<string, unknown>;
  
  // All registered repositories
  repositories: Record<string, unknown>;
}
```

### `getRequiredService<T>(context, serviceName)`

Get a required service from context, throwing if not available.

**Parameters:**

- `context: MicroserviceContext` - The microservice context
- `serviceName: string` - The service name (e.g., "monitor", "alerting")

**Returns:** `T` - The service instance

**Throws:** `Error` if service is not available

**Example:**

```typescript
const monitorService = getRequiredService<IMonitorService>(context, "monitor");
```

### `getRequiredRepository<T>(context, repositoryName)`

Get a required repository from context, throwing if not available.

**Parameters:**

- `context: MicroserviceContext` - The microservice context
- `repositoryName: string` - The repository name

**Returns:** `T` - The repository instance

**Throws:** `Error` if repository is not available

**Example:**

```typescript
const targetRepo = getRequiredRepository<ITargetRepository>(context, "target");
```

### `createHealthCheckEndpoint(context, port)`

Create a simple health check endpoint.

**Parameters:**

- `context: MicroserviceContext` - The microservice context
- `port: number` - Port number for health checks

**Example:**

```typescript
createHealthCheckEndpoint(context, 3001);
```

## Built-in Features

### Automatic Graceful Shutdown

The bootstrap utility automatically handles:

- `SIGINT` (Ctrl+C)
- `SIGTERM` (Docker stop)
- `uncaughtException`
- `unhandledRejection`

It will:

1. Log the shutdown signal
2. Call your custom `onShutdown` callback
3. Disconnect the database if enabled
4. Exit gracefully

### Error Handling

All errors are logged with context:

```typescript
context.logger.error("Operation failed", {
  error,
  additionalContext,
});
```

### Database Connection Management

When `enableDatabase: true`:

- Automatically connects during initialization
- Automatically disconnects during shutdown
- Provides `context.database` for manual operations

## Configuration Files

### Available Configurations

The project includes pre-configured JSON files:

**Microservices:**

- `configs/monitor-service.json` - Monitor Service
- `configs/alerting-service.json` - Alerting Service  
- `configs/notification-service.json` - Notification Service
- `configs/api-monolith.json` - Monolith (all services)

**Testing:**

- `configs/all-mock.json` - All mocked services
- `configs/database-testing.json` - Real database, mocked services
- `configs/offline-development.json` - Minimal dependencies

### Switching Configurations

```bash
# Use Monitor Service config
ln -sf configs/monitor-service.json service-config.json

# Or copy directly
cp configs/monitor-service.json service-config.json
```

## Best Practices

### 1. Keep Configuration DRY

Reuse the bootstrap utility across all microservices:

```typescript
// ✅ Good: Using shared bootstrap
await bootstrapMicroservice({ ... });

// ❌ Bad: Manual initialization in each service
const logger = new LoggerService();
const eventBus = new EventBus();
// ... repetitive setup
```

### 2. Use Type-Safe Service Access

```typescript
// ✅ Good: Type-safe with error checking
const service = getRequiredService<IMyService>(context, "myService");

// ❌ Bad: Unsafe casting
const service = context.services.myService as IMyService;
```

### 3. Implement Proper Cleanup

```typescript
onShutdown: async (ctx) => {
  // Stop timers
  clearInterval(myInterval);
  
  // Close connections
  await myConnection.close();
  
  // Cleanup resources
  await cleanupResources();
}
```

### 4. Log Important Events

```typescript
onInitialized: async (ctx) => {
  ctx.logger.info("Service initialized successfully", {
    version: "1.0.0",
    environment: process.env.NODE_ENV,
  });
}
```

## Examples

### Basic Microservice

```typescript
import { bootstrapMicroservice } from "@network-monitor/infrastructure";

await bootstrapMicroservice({
  serviceName: "Simple Service",
  configPath: "configs/simple-service.json",
});
```

### Microservice with Event Handlers

```typescript
await bootstrapMicroservice({
  serviceName: "Event Handler Service",
  configPath: "configs/event-service.json",
  onInitialized: async (ctx) => {
    ctx.eventBus.on("USER_CREATED", async (data) => {
      ctx.logger.info("User created", { userId: data.id });
      // Handle event
    });
  },
});
```

### Microservice without Database

```typescript
await bootstrapMicroservice({
  serviceName: "Stateless Service",
  configPath: "configs/stateless-service.json",
  enableDatabase: false, // No database needed
});
```

## Troubleshooting

### Service Not Found

```
Error: Required service 'myService' is not available
```

**Solution:** Check your JSON configuration includes the service:

```json
{
  "services": {
    "IMyService": {
      "module": "@my-package/services",
      "className": "MyService",
      ...
    }
  }
}
```

### Configuration File Not Found

```
Configuration file not found: configs/my-service.json
```

**Solution:** Ensure the config file exists and the path is correct:

```bash
ls -la configs/my-service.json
```

### Database Connection Failed

```
Failed to connect to database
```

**Solution:** Check your `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

## Related Documentation

- [JSON Configuration Guide](../container/README.md)
- [DI Container Documentation](../container/flexible-container.ts)
- [Service Configuration Examples](../../../../configs/README.md)

## Contributing

When adding new microservices:

1. Create a JSON configuration in `configs/`
2. Use `bootstrapMicroservice()` in your entry point
3. Document any special requirements
4. Add to this README if patterns are reusable
