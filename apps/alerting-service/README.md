# Alerting Service

A standalone microservice responsible for alert rule management and incident detection.

## Overview

This service handles all alerting-related operations in the Network Monitor application. It evaluates alert rules against speed test results and creates incidents when thresholds are breached.

## Responsibilities

- **Alert Rule Management**: Create, update, delete, and toggle alert rules
- **Incident Detection**: Evaluate speed test results against alert rules
- **Incident Tracking**: Create and manage incident events
- **Alert Notifications**: Emit events when alerts are triggered

## Event-Driven Communication

### Listens To:
- `ALERT_RULE_CREATE_REQUESTED` - Create a new alert rule
- `ALERT_RULE_UPDATE_REQUESTED` - Update an existing rule
- `ALERT_RULE_DELETE_REQUESTED` - Delete a rule
- `SPEED_TEST_COMPLETED` - Evaluate rules against new test results
- `INCIDENT_RESOLVE_REQUESTED` - Mark an incident as resolved

### Emits:
- `ALERT_RULE_CREATED` - Alert rule successfully created
- `ALERT_RULE_UPDATED` - Alert rule successfully updated
- `ALERT_RULE_DELETED` - Alert rule successfully deleted
- `ALERT_TRIGGERED` - Alert threshold breached
- `INCIDENT_CREATED` - New incident created
- `INCIDENT_RESOLVED` - Incident marked as resolved

## Configuration

Uses JSON-based DI container configuration from `configs/apps/alerting-service/`:
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

## Alert Rule Evaluation

The service automatically evaluates alert rules when `SPEED_TEST_COMPLETED` events are received:

1. Retrieve all enabled rules for the target
2. Compare metric values (ping/download) against thresholds
3. Create incidents when conditions are met
4. Emit `ALERT_TRIGGERED` and `INCIDENT_CREATED` events

## Architecture

Follows the **Router → Service → Repository** pattern with complete loose coupling:
- No direct dependencies on other services
- All inter-service communication via EventBus
- Can be scaled independently
- Stateless design for horizontal scaling

## Dependencies

- `@network-monitor/shared` - Shared interfaces and types
- `@network-monitor/infrastructure` - DI container, EventBus, Logger
- `@network-monitor/database` - Repositories for data access
- `@network-monitor/alerting` - AlertingService business logic

