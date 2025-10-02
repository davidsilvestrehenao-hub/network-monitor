# Graceful Shutdown Implementation Guide

## Overview

This document describes the **pure interface-based graceful shutdown implementation** across all applications in the Network Monitor monorepo. The implementation follows the **12-Factor App methodology** (Factor IX: Disposability) and provides consistent, reliable shutdown behavior across all applications.

**Note**: This is a new application with no legacy code. All graceful shutdown is implemented using the modern `BaseGracefulShutdown` class approach.

## Architecture

### Interface-Based Design

The graceful shutdown system uses an interface-based approach that provides:

- **Consistency**: All apps implement the same `IGracefulShutdown` interface
- **Flexibility**: Each app can customize shutdown behavior via the `BaseGracefulShutdown` class
- **Testability**: Easy to mock and test shutdown logic
- **Maintainability**: Clear separation of concerns

### Core Components

#### 1. IGracefulShutdown Interface

```typescript
export interface IGracefulShutdown {
  setupGracefulShutdown(): void;
  shutdown(signal: string): Promise<void>;
  isShuttingDown(): boolean;
}
```

#### 2. BaseGracefulShutdown Class

```typescript
export abstract class BaseGracefulShutdown implements IGracefulShutdown {
  // Handles signal registration and shutdown orchestration
  protected abstract performShutdown(): Promise<void>;
}
```

#### 3. setupGracefulShutdown Function

The existing utility function for direct usage and infrastructure cleanup.

## Implementation by Application Type

### Worker Applications

**Files**: `apps/{alerting,monitor,notification}-worker/src/main.ts`

Each worker extends `BaseGracefulShutdown` and implements custom shutdown logic:

```typescript
class AlertingWorkerApplication extends BaseGracefulShutdown {
  constructor(private context: MicroserviceContext) {
    super(
      context.logger,
      context.database ?? undefined,
      context.eventBus,
      30000 // 30 second timeout
    );
  }
  
  protected async performAppShutdown(): Promise<void> {
    // 1. Stop worker-specific tasks
    await this.stopAlertEvaluations();
    await this.cancelPendingRules();
    
    // 2. Save any in-progress state
    await this.saveWorkerState();
    
    // Infrastructure cleanup (database, event bus) is automatic
  }
}
```

**Shutdown Sequence**:

1. Stop accepting new work
2. Complete in-flight operations
3. Clean up worker-specific resources
4. Clean up infrastructure (database, event bus)
5. Exit gracefully

### API Application

**File**: `apps/api/src/main.ts`

The API server extends `BaseGracefulShutdown` and handles HTTP server shutdown:

```typescript
class APIApplication extends BaseGracefulShutdown {
  constructor(
    private context: MicroserviceContext,
    private server: any // Bun server instance
  ) {
    super(
      context.logger,
      context.database ?? undefined,
      context.eventBus,
      30000 // 30 second timeout
    );
  }
  
  protected async performAppShutdown(): Promise<void> {
    // 1. Stop accepting new requests
    await this.stopHttpServer();
    
    // 2. Complete in-flight requests
    await this.completeInFlightRequests();
    
    // 3. Close any remaining connections
    await this.closeConnections();
    
    // Infrastructure cleanup (database, event bus) is automatic
  }
}
```

**Shutdown Sequence**:

1. Stop accepting new HTTP requests
2. Complete in-flight requests
3. Close server connections
4. Clean up infrastructure
5. Exit gracefully

### Web Application (SolidStart)

**File**: `apps/web/src/lib/graceful-shutdown.ts`

The web app uses a singleton pattern for graceful shutdown:

```typescript
class WebApplication extends BaseGracefulShutdown {
  private static instance: WebApplication | null = null;
  
  static async getInstance(): Promise<WebApplication> {
    if (!WebApplication.instance) {
      // Get context from bootstrap if available
      const context = await getWebAppContext();
      const logger = context?.services?.logger || getWebAppLogger();
      
      WebApplication.instance = new WebApplication(
        logger,
        context?.services?.database || undefined,
        context?.services?.eventBus || undefined
      );
    }
    return WebApplication.instance;
  }
  
  protected async performAppShutdown(): Promise<void> {
    // Clean up web-specific resources
    await this.cleanupWebResources();
    
    // Clean up any client-side resources
    await this.cleanupClientResources();
    
    // Infrastructure cleanup (database, event bus) is automatic
  }
}
```

**Initialization**: Automatically initialized in `apps/web/src/app.tsx`

## Signal Handling

All applications handle the following signals:

- **SIGTERM**: Graceful shutdown request (production deployments)
- **SIGINT**: Interrupt signal (Ctrl+C in development)
- **uncaughtException**: Unhandled exceptions
- **unhandledRejection**: Unhandled promise rejections

## Shutdown Timeout

- **Default**: 30 seconds
- **Configurable**: Can be customized per application
- **Behavior**: Forces exit if shutdown takes longer than timeout

## Logging

All shutdown operations are logged with structured data:

```typescript
this.logger.info("Received SIGTERM, starting graceful shutdown...", {
  signal: "SIGTERM",
  timeout: 30000,
});
```

## Testing

### Unit Testing

Each application class can be unit tested:

```typescript
describe("AlertingWorkerApplication", () => {
  it("should shutdown gracefully", async () => {
    const mockLogger = createMockLogger();
    const mockContext = createMockContext();
    
    const app = new AlertingWorkerApplication(mockContext, mockLogger);
    
    await app.shutdown("SIGTERM");
    
    expect(mockLogger.info).toHaveBeenCalledWith(
      expect.stringContaining("graceful shutdown")
    );
  });
});
```

### Integration Testing

Test signal handling in isolated environments:

```bash
# Start application
bun run start &
APP_PID=$!

# Send SIGTERM
kill -TERM $APP_PID

# Verify graceful shutdown
wait $APP_PID
echo "Exit code: $?"
```

## Deployment Considerations

### Docker

Ensure proper signal forwarding in Docker containers:

```dockerfile
# Use exec form to ensure proper signal handling
CMD ["bun", "run", "start"]

# Or use tini as init system
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["bun", "run", "start"]
```

### Kubernetes

Configure proper termination grace period:

```yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      terminationGracePeriodSeconds: 45  # Longer than app timeout
      containers:
      - name: app
        # ... container config
```

### Process Managers

For PM2, systemd, or other process managers:

```json
// PM2 ecosystem.config.js
{
  "kill_timeout": 45000,  // Longer than app timeout
  "wait_ready": true
}
```

## Troubleshooting

### Common Issues

1. **Shutdown Timeout**: Increase timeout or optimize cleanup logic
2. **Hanging Processes**: Check for unclosed connections or timers
3. **Data Loss**: Ensure proper state persistence before shutdown
4. **Signal Not Received**: Verify signal forwarding in containerized environments

### Debug Logging

Enable debug logging to trace shutdown process:

```bash
LOG_LEVEL=debug bun run start
```

### Health Checks

Monitor shutdown progress via health check endpoints:

```bash
curl http://localhost:3000/api/health
# Should return 503 during shutdown
```

## Best Practices

### Do's

- ✅ Always extend `BaseGracefulShutdown` for new applications
- ✅ Implement proper cleanup in `performShutdown()`
- ✅ Use structured logging for shutdown events
- ✅ Test shutdown behavior in staging environments
- ✅ Set appropriate timeouts for your application

### Don'ts

- ❌ Don't use `process.exit()` directly (except in base class)
- ❌ Don't ignore shutdown signals
- ❌ Don't perform long-running operations during shutdown
- ❌ Don't forget to clean up resources (timers, connections, etc.)

## Implementation Guide for New Applications

### Creating a New Application with Graceful Shutdown

**Step 1: Extend BaseGracefulShutdown**

```typescript
import { BaseGracefulShutdown, type MicroserviceContext } from "@network-monitor/infrastructure";

class MyApplication extends BaseGracefulShutdown {
  constructor(private context: MicroserviceContext) {
    super(
      context.logger,
      context.database ?? undefined,
      context.eventBus,
      30000 // timeout in milliseconds
    );
  }
  
  protected async performAppShutdown(): Promise<void> {
    // 1. Stop accepting new work
    await this.stopAcceptingWork();
    
    // 2. Complete in-flight operations
    await this.completeInFlightOperations();
    
    // 3. Clean up app-specific resources
    await this.cleanupAppResources();
    
    // Infrastructure cleanup is automatic
  }
  
  private async stopAcceptingWork(): Promise<void> {
    // Implementation specific to your app
  }
  
  private async completeInFlightOperations(): Promise<void> {
    // Implementation specific to your app
  }
  
  private async cleanupAppResources(): Promise<void> {
    // Implementation specific to your app
  }
}
```

**Step 2: Initialize in Main Function**

```typescript
async function main() {
  const context = await bootstrapMicroservice({
    applicationName: "My Application",
    // ... other options
  });
  
  // Create and setup graceful shutdown
  const app = new MyApplication(context);
  app.setupGracefulShutdown();
  
  // Your application logic here
}
```

## References

- [12-Factor App - Disposability](https://12factor.net/disposability)
- [Node.js Process Signals](https://nodejs.org/api/process.html#process_signal_events)
- [Docker Signal Handling](https://docs.docker.com/engine/reference/builder/#cmd)
- [Kubernetes Termination](https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination)

## Contributing

When adding new applications:

1. Extend `BaseGracefulShutdown`
2. Implement `performShutdown()` method
3. Add unit tests for shutdown logic
4. Update this documentation
5. Test in staging environment

Remember: **Graceful shutdown is not optional—it's essential for production reliability.**
