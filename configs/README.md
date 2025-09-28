# Configuration Library

This directory contains various service configurations for different development and testing scenarios. You can easily switch between configurations by copying them to `service-config.json` in the root directory.

## Quick Start

To switch to a different configuration:

```bash
# Switch to all concrete services (production-like)
cp all-concrete.json ../service-config.json

# Switch to auth mock only (development)
cp auth-mock-only.json ../service-config.json

# Switch to all mock services (testing)
cp all-mock.json ../service-config.json
```

## Available Configurations

### 🏭 Production Configurations

#### `all-concrete.json`

- **Use Case**: Production deployment
- **Services**: All concrete implementations
- **Notes**: Only auth is mocked (replace with real auth service)

### 🛠️ Development Configurations

#### `auth-mock-only.json`

- **Use Case**: Regular development
- **Services**: All concrete except auth
- **Notes**: Easy development without auth setup

#### `offline-development.json`

- **Use Case**: Development without external dependencies
- **Services**: Logger + EventBus concrete, rest mocked
- **Notes**: No database, no notifications, no monitoring

### 🧪 Testing Configurations

#### `all-mock.json`

- **Use Case**: Unit testing, integration testing
- **Services**: All mock implementations
- **Notes**: Fast, isolated testing

#### `database-testing.json`

- **Use Case**: Testing database operations
- **Services**: Only database is concrete
- **Notes**: Test real database with mocked everything else

#### `notification-testing.json`

- **Use Case**: Testing notification system
- **Services**: EventBus + Alerting + Notifications concrete
- **Notes**: Test real notifications with mocked data

#### `monitoring-testing.json`

- **Use Case**: Testing monitoring system
- **Services**: Logger + EventBus + Monitor + Alerting concrete
- **Notes**: Test real monitoring with mocked data

#### `alerting-testing.json`

- **Use Case**: Testing alerting system
- **Services**: Logger + EventBus + Alerting + Notifications concrete
- **Notes**: Test real alerting with mocked data

#### `performance-testing.json`

- **Use Case**: Performance testing
- **Services**: EventBus + Monitor + Alerting concrete
- **Notes**: Minimal overhead for performance tests

## Configuration File Structure

Each configuration file follows this structure:

```json
{
  "name": "Configuration Name",
  "description": "What this configuration is for",
  "environment": "development|test|production",
  "services": {
    "ILogger": {
      "module": "path/to/service",
      "className": "ServiceClassName",
      "isMock": true|false,
      "description": "What this service does"
    }
  }
}
```

## Service Types

- **ILogger**: Logging service
- **IEventBus**: Event system
- **IDatabaseService**: Database operations
- **IMonitorService**: Network monitoring
- **IAlertingService**: Alert management
- **INotificationService**: Push notifications
- **IAuthService**: Authentication

## Usage in Code

The application will automatically load the `active.json` configuration:

```typescript
import { createContainerWithEnvironment } from "./lib/container/flexible-container";

// This will load the active.json configuration
const container = await createContainerWithEnvironment("active");
```

## Creating Custom Configurations

1. Copy an existing configuration file
2. Modify the services as needed
3. Update the name and description
4. Replace `active.json` with your new configuration

## Environment Variables

You can also set the configuration via environment variable:

```bash
export SERVICE_CONFIG=configs/performance-testing.json
```

## Best Practices

- **Development**: Use `auth-mock-only.json` for regular development
- **Testing**: Use `all-mock.json` for unit tests
- **Integration Testing**: Use specific testing configs (e.g., `database-testing.json`)
- **Production**: Use `all-concrete.json` (with real auth service)
- **Offline Work**: Use `offline-development.json` when without internet

## Troubleshooting

- **Service not found**: Check the module path is correct
- **Class not found**: Verify the className matches the exported class
- **Import errors**: Ensure the service file exists and exports the class
- **Type errors**: Make sure the service implements the correct interface
