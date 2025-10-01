# @network-monitor/monitor

Business logic package for target monitoring and speed test execution.

## Overview

This package contains the `MonitorService` which handles target management, speed test execution, and continuous monitoring scheduling.

## Exports

```typescript
import { MonitorService } from "@network-monitor/monitor";
```

## MonitorService

The main service class that implements `IMonitorService`.

### Responsibilities

- **Target Management**: Create, read, update, delete monitoring targets
- **Speed Testing**: Execute ping and bandwidth tests on targets
- **Continuous Monitoring**: Schedule and manage automated monitoring tasks
- **Event Handling**: Listen for target and monitoring-related events
- **Result Storage**: Save speed test results to database

### Key Methods

```typescript
// Target management
createTarget(data: CreateTargetData): Promise<Target>
getTarget(id: string): Promise<Target | null>
getTargets(userId: string): Promise<Target[]>
updateTarget(id: string, data: UpdateTargetData): Promise<Target>
deleteTarget(id: string): Promise<void>

// Speed testing
runSpeedTest(config: SpeedTestConfig): Promise<SpeedTestResult>
getTargetResults(targetId: string, limit?: number): Promise<SpeedTestResult[]>

// Continuous monitoring
startMonitoring(targetId: string, intervalMs: number): void
stopMonitoring(targetId: string): void
getActiveTargets(): string[]
```

## Dependencies

This service requires:
- `ITargetRepository` - Simple target data access (basic CRUD)
- `ISpeedTestRepository` - Speed test result storage (basic CRUD)
- `IMonitoringTargetRepository` - Full target data access (with relations)
- `ISpeedTestResultRepository` - Full speed test result access (with relations)
- `IEventBus` - Event-driven communication
- `ILogger` - Logging

These are injected via the DI container.

## Event-Driven Architecture

### Listens To:
- `TARGET_CREATE_REQUESTED` - Create a new target
- `TARGET_UPDATE_REQUESTED` - Update an existing target
- `TARGET_DELETE_REQUESTED` - Delete a target
- `SPEED_TEST_REQUESTED` - Run a speed test
- `MONITORING_START_REQUESTED` - Start monitoring
- `MONITORING_STOP_REQUESTED` - Stop monitoring

### Emits:
- `TARGET_CREATED` - Target successfully created
- `TARGET_UPDATED` - Target successfully updated
- `TARGET_DELETED` - Target successfully deleted
- `SPEED_TEST_COMPLETED` - Speed test finished
- `SPEED_TEST_FAILED` - Speed test failed
- `MONITORING_STARTED` - Monitoring began
- `MONITORING_STOPPED` - Monitoring stopped

## Usage Example

```typescript
import { MonitorService } from "@network-monitor/monitor";

const service = new MonitorService(
  targetRepository,
  speedTestRepository,
  monitoringTargetRepository,
  speedTestResultRepository,
  eventBus,
  logger
);

// Create a target
const target = await service.createTarget({
  name: "Google DNS",
  address: "8.8.8.8",
  ownerId: "user-123",
});

// Run a speed test
const result = await service.runSpeedTest({
  targetId: target.id,
  target: target.address,
  timeout: 10000,
});

// Start continuous monitoring (every 30 seconds)
service.startMonitoring(target.id, 30000);

// Stop monitoring
service.stopMonitoring(target.id);
```

## Speed Test Implementation

The service performs:

1. **Ping Test**: Measures latency using native ping command
2. **Download Test**: Measures download speed by fetching a file
3. **Result Storage**: Saves results to database via repositories
4. **Event Emission**: Publishes `SPEED_TEST_COMPLETED` event

```typescript
const result = await service.runSpeedTest({
  targetId: "target-123",
  target: "https://example.com",
  timeout: 10000,
});

// Result structure:
{
  id: "uuid",
  targetId: "target-123",
  ping: 45.2,      // milliseconds
  download: 87.5,  // Mbps
  upload: null,    // Not yet implemented
  status: "SUCCESS",
  timestamp: "2025-10-01T12:00:00Z",
  createdAt: "2025-10-01T12:00:00Z",
}
```

## Continuous Monitoring

Monitoring runs in the background using `setInterval`:

```typescript
// Start monitoring
service.startMonitoring("target-123", 30000); // Every 30 seconds

// Check active targets
const active = service.getActiveTargets();
// Returns: ["target-123"]

// Stop monitoring
service.stopMonitoring("target-123");
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

## Architecture Notes

This service follows **perfect loose coupling**:
- Does NOT call other services directly
- Uses EventBus for all inter-service communication
- Can be deployed independently as a microservice
- Stateless (monitoring state is ephemeral)

