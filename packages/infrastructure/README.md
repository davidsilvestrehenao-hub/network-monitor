# @network-monitor/infrastructure

Core infrastructure services including DI container, event bus, logging, and microservice utilities.

## Overview

This package provides the **foundational infrastructure** for the Network Monitor application. It includes dependency injection, event-driven communication, logging, and utilities for bootstrapping microservices.

## Exports

```typescript
// DI Container
import { 
  getContainer,
  JsonConfigLoader,
  TYPES 
} from "@network-monitor/infrastructure";

// Event Bus
import { EventBus, MockEventBus } from "@network-monitor/infrastructure";

// Logging
import { LoggerService, WinstonLoggerService } from "@network-monitor/infrastructure";

// Database
import { DatabaseService, MockDatabase } from "@network-monitor/infrastructure";

// Microservice Bootstrap
import { 
  bootstrapMicroservice,
  getRequiredService,
  getRequiredRepository 
} from "@network-monitor/infrastructure";

// Mock Implementations
import {
  MockMonitor,
  MockAlerting,
  MockNotification,
  MockLogger,
  MockEventBus,
  MockDatabase,
  // ... all mock repositories
} from "@network-monitor/infrastructure";
```

## Key Components

### 1. DI Container System

**JSON-Configurable Dependency Injection** - Configure service implementations via JSON files.

```typescript
// Use microservice bootstrap (recommended)
const context = await bootstrapMicroservice({
  serviceName: "My Service",
  configPath: "configs/my-service.json"
});

// Access services
const logger = context.logger;
const eventBus = context.eventBus;
const monitorService = context.services.monitor;
```

**Features:**

- ✅ JSON-based configuration
- ✅ Automatic dependency resolution
- ✅ Dynamic service loading
- ✅ Environment-specific configs
- ✅ Type-safe service access
- ✅ Singleton and factory support

### 2. Event Bus

**Type-Safe Event-Driven Communication** - Loosely couple services via events.

```typescript
import { EventBus } from "@network-monitor/infrastructure";

const eventBus = new EventBus();

// Emit events
eventBus.emit("TARGET_CREATED", { id: "123", name: "Test" });
eventBus.emitTyped<BackendEvents["TARGET_CREATED"]>("TARGET_CREATED", data);

// Listen for events
eventBus.on("TARGET_CREATED", (data) => {
  console.log("Target created:", data);
});

eventBus.onTyped<BackendEvents["TARGET_CREATED"]>("TARGET_CREATED", (data) => {
  // Type-safe data access
});
```

### 3. Logging Services

**Flexible Logging** - Console logging or Winston for production.

```typescript
import { LoggerService, WinstonLoggerService } from "@network-monitor/infrastructure";

// Console logger (development)
const logger = new LoggerService(LogLevel.DEBUG);

// Winston logger (production)
const logger = new WinstonLoggerService(LogLevel.INFO);

logger.debug("Debug message", { userId: "123" });
logger.info("Info message", { action: "create" });
logger.warn("Warning message", { issue: "high latency" });
logger.error("Error message", { error: errorObj });
```

### 4. Microservice Bootstrap

**Zero-Boilerplate Microservice Initialization** - Generic utility for all microservices.

```typescript
import { bootstrapMicroservice } from "@network-monitor/infrastructure";

const context = await bootstrapMicroservice({
  serviceName: "My Service",
  configPath: "configs/apps/my-service/production.json",
  enableDatabase: true,
  
  onInitialized: async (ctx) => {
    // Setup event handlers
    const service = getRequiredService<IMyService>(ctx, "myService");
    ctx.logger.info("Service ready!");
  },
  
  onShutdown: async (ctx) => {
    // Cleanup
    ctx.logger.info("Shutting down...");
  },
});
```

**Features:**

- ✅ Automatic DI container initialization
- ✅ Graceful shutdown handling (SIGTERM, SIGINT)
- ✅ Database connection management
- ✅ Custom startup/shutdown hooks
- ✅ Health check endpoints
- ✅ Error handling and logging

### 5. Mock Implementations

Complete mock implementations for all services and repositories:

**Services:**

- `MockMonitor` - Mock monitoring service
- `MockAlerting` - Mock alerting service
- `MockNotification` - Mock notification service
- `MockSpeedTestService` - Mock speed testing

**Repositories:**

- `MockMonitoringTargetRepository`
- `MockSpeedTestResultRepository`
- `MockAlertRuleRepository`
- `MockIncidentEventRepository`
- `MockNotificationRepository`
- `MockPushSubscriptionRepository`
- `MockUserRepository`

**Infrastructure:**

- `MockLogger` - Mock logger with log capture
- `MockEventBus` - Mock event bus with event history
- `MockDatabase` - Mock database service

All mocks include:

- ✅ Pre-seeded test data
- ✅ Full interface compliance
- ✅ Helper methods for testing
- ✅ Event emission support

## Directory Structure

```text
src/
├── container/              # DI container implementation
│   ├── flexible-container.ts # Core DI container
│   ├── json-config-loader.ts # JSON config parser
│   └── types.ts           # Container types
├── event-bus/             # Event bus implementations
│   ├── EventBus.ts        # Production event bus
│   └── MockEventBus.ts    # Mock event bus
├── logger/                # Logging services
│   ├── LoggerService.ts   # Console logger
│   └── WinstonLoggerService.ts # Winston logger
├── microservice/          # Microservice utilities
│   ├── bootstrap.ts       # Bootstrap utility
│   └── README.md          # Microservice docs
├── mocks/                 # Mock implementations
│   ├── Mock*.ts           # All mock services/repositories
│   └── ...
└── index.ts               # Package exports
```

## Configuration Examples

### Production Config

```json
{
  "services": {
    "ILogger": {
      "module": "@network-monitor/infrastructure",
      "className": "WinstonLoggerService",
      "isMock": false
    },
    "IEventBus": {
      "module": "@network-monitor/infrastructure",
      "className": "EventBus",
      "isMock": false
    }
  }
}
```

### Development Config

```json
{
  "services": {
    "ILogger": {
      "module": "@network-monitor/infrastructure",
      "className": "LoggerService",
      "isMock": false
    },
    "IDatabaseService": {
      "module": "@network-monitor/infrastructure",
      "className": "MockDatabase",
      "isMock": true
    }
  }
}
```

## Testing

```bash
# Run tests
bun test

# Type checking
bun run type-check

# Linting
bun run lint
```

## Building

```bash
# Build TypeScript
bun run build

# Watch mode for development
bun run dev
```

## Documentation

- [Microservice Bootstrap Guide](./src/microservice/README.md)
- [Configuration Guide](../../configs/README.md)
- [Architecture Documentation](../../docs/ARCHITECTURE.md)
