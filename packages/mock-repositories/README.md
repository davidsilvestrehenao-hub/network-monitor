# @network-monitor/mock-repositories

Mock repository implementations for development and testing.

## Overview

This package contains mock implementations of all repository interfaces. These mocks provide in-memory data storage and are perfect for:

- **Development**: Fast, no-setup development environment
- **Testing**: Isolated, predictable test data
- **Demos**: Rich, realistic demo data

## Mock Repositories

### Core Repositories
- `MockUserRepository` - User management
- `MockMonitoringTargetRepository` - Monitoring targets
- `MockSpeedTestResultRepository` - Speed test results
- `MockAlertRuleRepository` - Alert rules
- `MockIncidentEventRepository` - Incident tracking
- `MockNotificationRepository` - Notifications
- `MockPushSubscriptionRepository` - Push subscriptions

### Specialized Repositories
- `MockSpeedTestRepository` - Speed test configurations
- `MockTargetRepository` - Legacy target support
- `MockUserSpeedTestPreferenceRepository` - User preferences

## Usage

```typescript
import { MockUserRepository, MockTargetRepository } from "@network-monitor/mock-repositories";

const userRepo = new MockUserRepository();
const targetRepo = new MockTargetRepository();

// Repositories come pre-seeded with realistic test data
const users = await userRepo.getAll();
const targets = await targetRepo.getAll();
```

## Features

- **Pre-seeded Data**: Realistic test data out of the box
- **In-Memory Storage**: Fast, isolated data operations
- **Full Interface Compliance**: Drop-in replacements for real repositories
- **Test Utilities**: Helper methods for testing scenarios
