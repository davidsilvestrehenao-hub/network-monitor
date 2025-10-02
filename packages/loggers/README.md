# @network-monitor/loggers

Concrete logger implementations for the Network Monitor application.

## Available Loggers

- **ConsoleLogger** - Simple console-based logger for development and basic production use
- **WinstonLogger** - Advanced logger using Winston with structured logging and multiple transports

## Usage

```typescript
import { ConsoleLogger, WinstonLogger } from "@network-monitor/loggers";

// Simple console logger
const consoleLogger = new ConsoleLogger("debug");
consoleLogger.info("Hello world");

// Advanced Winston logger
const winstonLogger = new WinstonLogger("info");
winstonLogger.info("Structured logging", { userId: "123", action: "login" });
```

## Adding New Loggers

When adding new logger implementations:

1. Implement the `ILogger` interface from `@network-monitor/shared`
2. Follow the naming convention: `*Logger` (not `*LoggerService`)
3. Add appropriate tests
4. Export from `src/index.ts`
5. Update this README

## Architecture

All loggers implement the `ILogger` interface, ensuring consistent behavior across different logging implementations. This allows for easy swapping of logger implementations via dependency injection.
