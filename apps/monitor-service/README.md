# Monitor Service

A standalone microservice responsible for monitoring target management and speed test execution.

## Overview

This service handles all monitoring-related operations in the Network Monitor application. It can be deployed independently or as part of the monolith.

## Responsibilities

- **Target Management**: Create, read, update, and delete monitoring targets
- **Speed Test Execution**: Run ping and bandwidth tests on targets
- **Continuous Monitoring**: Schedule and execute automated monitoring tasks
- **Event Emission**: Publish monitoring events to the event bus

## Event-Driven Communication

### Listens To

- `TARGET_CREATE_REQUESTED` - Create a new target
- `TARGET_UPDATE_REQUESTED` - Update an existing target
- `TARGET_DELETE_REQUESTED` - Delete a target
- `SPEED_TEST_REQUESTED` - Run a speed test
- `MONITORING_START_REQUESTED` - Start monitoring a target
- `MONITORING_STOP_REQUESTED` - Stop monitoring a target

### Emits

- `TARGET_CREATED` - Target successfully created
- `TARGET_UPDATED` - Target successfully updated
- `TARGET_DELETED` - Target successfully deleted
- `SPEED_TEST_COMPLETED` - Speed test finished
- `MONITORING_STARTED` - Monitoring began
- `MONITORING_STOPPED` - Monitoring stopped

## Configuration

Uses JSON-based DI container configuration from `configs/apps/monitor-service/`:

- `production.json` - Real database and repositories
- `development.json` - Mocked database for offline development

Environment is selected automatically based on `NODE_ENV`.

## Running

```bash
# Development (uses development.json)
bun run dev

# Production (uses production.json)
NODE_ENV=production bun run start

# Custom config
CONFIG_PATH=configs/custom.json bun run start
```

## Docker Deployment

```bash
# Build image
docker build -f Dockerfile -t monitor-service .

# Run container
docker run -p 3001:3001 monitor-service
```

## Architecture

Follows the **Router → Service → Repository** pattern with complete loose coupling:

- No direct dependencies on other services
- All inter-service communication via EventBus
- Can be scaled independently
- Can be replaced with different implementation

## Dependencies

- `@network-monitor/shared` - Shared interfaces and types
- `@network-monitor/infrastructure` - DI container, EventBus, Logger
- `@network-monitor/database` - Repositories for data access
- `@network-monitor/monitor` - MonitorService business logic
