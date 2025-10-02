# @network-monitor/services

Production-ready service implementations.

## Overview

This package contains all concrete implementations of the network monitor services. These are the real, production-ready services that:

- **Connect to databases** through repository patterns
- **Perform actual network operations** (ping, speed tests, monitoring)
- **Send real notifications** (push notifications, emails)
- **Handle authentication** with proper security
- **Emit events** for inter-service communication
- **Log operations** for monitoring and debugging

## Services Included

### Core Services
- `MonitorService` - Real network monitoring with database persistence
- `AlertingService` - Real alerting system with rule evaluation
- `NotificationService` - Real notification delivery (push, email)
- `AuthService` - Real authentication with session management
- `SpeedTestService` - Real network speed testing
- `SpeedTestConfigService` - Real speed test URL configuration

### Infrastructure Services
- `LoggerService` - Real logging with Winston
- `WinstonLoggerService` - Advanced Winston-based logging
- `DatabaseService` - Real database operations with Prisma

## Usage

```typescript
import { MonitorService, AlertingService } from "@network-monitor/services";

// Use in service wiring configurations
const monitor = new MonitorService(
  targetRepository,
  speedTestRepository,
  eventBus,
  logger
);
```

## Features

- **Database Integration**: Full Prisma ORM integration
- **Event-Driven**: Proper event emission and handling
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error handling and logging
- **Performance**: Optimized for production workloads
- **Monitoring**: Built-in metrics and health checks
- **Security**: Proper authentication and authorization

## Configuration

Concrete services are configured through service wiring files:

```json
{
  "IMonitorService": {
    "module": "@network-monitor/services",
    "className": "MonitorService",
    "isMock": false,
    "description": "Real monitor service with database integration"
  }
}
```

## Dependencies

- **@network-monitor/shared**: Interfaces and types
- **@network-monitor/database**: Database repositories and Prisma client
- **winston**: Logging framework
- **Node.js APIs**: For network operations and system integration

## Production Considerations

- Ensure proper environment variables are set
- Configure logging levels appropriately
- Set up proper database connections
- Configure authentication providers
- Set up monitoring and alerting for the services themselves
