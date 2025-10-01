# @network-monitor/alerting

Business logic package for alert rule management and incident detection.

## Overview

This package contains the `AlertingService` which handles alert rule evaluation, incident creation, and alert-triggered event emission.

## Exports

```typescript
import { AlertingService } from "@network-monitor/alerting";
```

## AlertingService

The main service class that implements `IAlertingService`.

### Responsibilities

- **Alert Rule Management**: CRUD operations for alert rules
- **Rule Evaluation**: Evaluate speed test results against alert rules
- **Incident Management**: Create and resolve incident events
- **Event Handling**: Listen for speed test completions and evaluate rules

### Key Methods

```typescript
// Alert rule operations
createAlertRule(data: CreateAlertRuleData): Promise<AlertRule>
getAlertRule(id: number): Promise<AlertRule | null>
getAlertRulesByTargetId(targetId: string): Promise<AlertRule[]>
updateAlertRule(id: number, data: UpdateAlertRuleData): Promise<AlertRule>
deleteAlertRule(id: number): Promise<void>
toggleAlertRule(id: number, enabled: boolean): Promise<AlertRule>

// Alert processing
processSpeedTestResult(result: SpeedTestResult): Promise<void>
checkAlertRules(targetId: string, result: SpeedTestResult): Promise<void>
evaluateSpeedTestResult(result: SpeedTestResult): Promise<void>

// Incident management
getIncidentsByTargetId(targetId: string): Promise<IncidentEvent[]>
getUnresolvedIncidents(): Promise<IncidentEvent[]>
resolveIncident(id: number): Promise<void>
createIncident(data: CreateIncidentData): Promise<IncidentEvent>
```

## Dependencies

This service requires:
- `IAlertRuleRepository` - Alert rule data access
- `IIncidentEventRepository` - Incident event data access
- `IEventBus` - Event-driven communication
- `ILogger` - Logging

These are injected via the DI container.

## Event-Driven Architecture

### Listens To:
- `ALERT_RULE_CREATE_REQUESTED`
- `ALERT_RULE_UPDATE_REQUESTED`
- `ALERT_RULE_DELETE_REQUESTED`
- `SPEED_TEST_COMPLETED`

### Emits:
- `ALERT_RULE_CREATED`
- `ALERT_RULE_UPDATED`
- `ALERT_RULE_DELETED`
- `ALERT_TRIGGERED`
- `INCIDENT_CREATED`
- `INCIDENT_RESOLVED`

## Usage Example

```typescript
import { AlertingService } from "@network-monitor/alerting";

const service = new AlertingService(
  alertRuleRepository,
  incidentEventRepository,
  eventBus,
  logger
);

// Create an alert rule
const rule = await service.createAlertRule({
  name: "High Ping Alert",
  targetId: "target-123",
  metric: "ping",
  condition: "GREATER_THAN",
  threshold: 100,
  enabled: true,
});

// Evaluate a speed test result
await service.processSpeedTestResult({
  targetId: "target-123",
  ping: 150, // Will trigger the alert!
  download: 50,
  status: "SUCCESS",
});
```

## Alert Rule Logic

Rules are evaluated using the following logic:

```typescript
if (rule.metric === "ping" && rule.condition === "GREATER_THAN") {
  if (result.ping > rule.threshold) {
    // Trigger alert!
  }
}

if (rule.metric === "download" && rule.condition === "LESS_THAN") {
  if (result.download < rule.threshold) {
    // Trigger alert!
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

