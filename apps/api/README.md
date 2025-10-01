# API Monolith

A monolithic deployment that runs all services in a single Bun process.

## Overview

This is the **monolith deployment option** for the Network Monitor application. It runs all services (Monitor, Alerting, Notification) in one process, making it perfect for development and small to medium deployments.

## When to Use This

✅ **Perfect For:**
- Development and testing
- Small deployments (1-10k users)
- Cost-effective hosting (~$20/month)
- Simple deployment and maintenance
- Quick startup and iteration

❌ **Not Recommended For:**
- Large-scale deployments (>10k users)
- High-traffic scenarios requiring independent scaling
- Multi-region deployments
- Services requiring different resource profiles

## Services Included

All services run in the same process:
- **Monitor Service** - Target management and speed tests
- **Alerting Service** - Alert rules and incident detection
- **Notification Service** - Push notifications and in-app messages

## Event Bus

Uses **in-memory EventBus** since all services share the same process. This provides:
- Zero network latency
- Simple debugging
- No external message broker required
- Maintains loose coupling architecture

## Configuration

Uses JSON-based DI container configuration from `configs/apps/api/`:
- `production.json` - Real database, all services enabled
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
docker build -f Dockerfile -t network-monitor-api .

# Run container
docker run -p 3000:3000 network-monitor-api
```

## Scaling to Microservices

When ready to scale, simply deploy the individual microservices instead:

```bash
# Deploy each service separately
docker run monitor-service
docker run alerting-service
docker run notification-service
```

**Zero code changes required!** The same service implementations work in both architectures.

## Resource Requirements

**Minimum:**
- 512MB RAM
- 1 CPU core
- 10GB storage

**Recommended:**
- 1GB RAM
- 2 CPU cores
- 20GB storage

## Monitoring

The monolith exposes:
- Health check endpoint
- Performance metrics
- Service status
- Event bus statistics

## Dependencies

- `@network-monitor/shared` - Shared interfaces and types
- `@network-monitor/infrastructure` - DI container, EventBus, Logger
- `@network-monitor/database` - Repositories for data access
- `@network-monitor/monitor` - MonitorService business logic
- `@network-monitor/alerting` - AlertingService business logic
- `@network-monitor/notification` - NotificationService business logic

