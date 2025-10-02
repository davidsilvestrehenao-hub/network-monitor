# @network-monitor/mock-services

Mock service implementations for testing and development environments.

## Overview

This package contains all mock implementations of the network monitor services. These mocks are used for:

- **Development**: Fast development without external dependencies
- **Testing**: Predictable behavior for unit and integration tests
- **Offline Development**: Work without database or network connections
- **CI/CD**: Reliable testing in automated environments

## Services Included

### Core Services
- `MockMonitorService` - Mock network monitoring
- `MockAlertingService` - Mock alerting system
- `MockNotificationService` - Mock notifications
- `MockAuthService` - Mock authentication
- `MockSpeedTestService` - Mock speed testing
- `MockSpeedTestConfigService` - Mock speed test configuration

### Infrastructure Services
- `MockLogger` - Mock logging
- `MockEventBus` - Mock event system
- `MockDatabase` - Mock database operations

### Repository Mocks
- `MockMonitoringTargetRepository`
- `MockSpeedTestResultRepository`
- `MockAlertRuleRepository`
- `MockIncidentEventRepository`
- `MockNotificationRepository`
- `MockPushSubscriptionRepository`
- `MockUserRepository`

## Usage

```typescript
import { MockMonitorService, MockDatabase } from "@network-monitor/mock-services";

// Use in service wiring configurations
const mockMonitor = new MockMonitorService(mockLogger);
```

## Features

- **Seeded Test Data**: All mocks come with realistic test data
- **Event Simulation**: Mocks emit appropriate events
- **Configurable Behavior**: Adjust mock behavior for different test scenarios
- **Type Safety**: Full TypeScript support with proper interfaces
- **Performance**: Fast execution for rapid development cycles

## Configuration

Mock services can be configured through service wiring files:

```json
{
  "IMonitorService": {
    "module": "@network-monitor/mock-services",
    "className": "MockMonitorService",
    "isMock": true,
    "description": "Mock monitor service for development"
  }
}
```
