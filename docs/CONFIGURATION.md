# 🔧 Dynamic Service Configuration System

This project now supports **dynamic service configuration** through JSON files, allowing you to easily switch between different service implementations without changing any code.

## 🚀 Quick Start

### List Available Configurations

```bash
bun run config:list
# or
bun run scripts/switch-config.ts list
```text

### Switch Configuration

```bash
bun run config:switch all-concrete.json
# or
bun run scripts/switch-config.ts switch all-concrete.json
```text

### Show Current Configuration

```bash
bun run config:current
# or
bun run scripts/switch-config.ts current
```text

### Run Configuration Demo

```bash
bun run config:demo
# or
bun run scripts/config-demo.ts
```text

## 📁 Configuration Library

The `configs/` directory contains various pre-configured scenarios:

| Configuration               | Use Case           | Services                                              |
| --------------------------- | ------------------ | ----------------------------------------------------- |
| `all-concrete.json`         | Production         | All concrete implementations                          |
| `auth-mock-only.json`       | Development        | Auth mocked, rest concrete                            |
| `all-mock.json`             | Testing            | All mock implementations                              |
| `offline-development.json`  | Offline Dev        | Logger + EventBus concrete, rest mocked               |
| `performance-testing.json`  | Performance Tests  | EventBus + Monitor + Alerting concrete                |
| `database-testing.json`     | Database Tests     | Only database concrete                                |
| `notification-testing.json` | Notification Tests | EventBus + Alerting + Notifications concrete          |
| `monitoring-testing.json`   | Monitoring Tests   | Logger + EventBus + Monitor + Alerting concrete       |
| `alerting-testing.json`     | Alerting Tests     | Logger + EventBus + Alerting + Notifications concrete |

## 🔄 How It Works

1. **Active Configuration**: The system loads from `service-config.json` in the root directory by default
2. **Easy Switching**: Use `cp` or the switch script to change configurations
3. **Environment Variables**: Set `SERVICE_CONFIG` to load a specific file
4. **Automatic Loading**: The container automatically loads the active configuration

## 💡 Common Workflows

### Development Workflow

```bash
# Start with auth mock only (default)
bun run config:switch auth-mock-only.json

# When you need to test without external dependencies
bun run config:switch offline-development.json

# When you need to test database operations
bun run config:switch database-testing.json

# Or manually copy configurations
cp configs/auth-mock-only.json service-config.json
```text

### Testing Workflow

```bash
# Run unit tests with all mocks
bun run config:switch all-mock.json
bun run test

# Run integration tests with specific services
bun run config:switch database-testing.json
bun run test
```text

### Production Workflow

```bash
# Deploy with all concrete services
bun run config:switch all-concrete.json
bun run build:prod
```text

## 🛠️ Creating Custom Configurations

1. **Copy an existing configuration**:

   ```bash
   cp configs/auth-mock-only.json configs/my-custom.json
   ```

2. **Edit the configuration**:

   ```json
   {
     "name": "My Custom Config",
     "description": "Custom configuration for my specific needs",
     "environment": "development",
     "services": {
       "ILogger": {
         "module": "../src/lib/services/concrete/LoggerService",
         "className": "LoggerService",
         "description": "Real logger"
       }
       // ... other services
     }
   }
   ```

3. **Switch to your configuration**:

   ```bash
   bun run config:switch my-custom.json
   ```

## 🔍 Service Types

| Service                | Interface              | Purpose                    |
| ---------------------- | ---------------------- | -------------------------- |
| `ILogger`              | `ILogger`              | Logging and debugging      |
| `IEventBus`            | `IEventBus`            | Event-driven communication |
| `IDatabaseService`     | `IDatabaseService`     | Database operations        |
| `IMonitorService`      | `IMonitorService`      | Network monitoring         |
| `IAlertingService`     | `IAlertingService`     | Alert management           |
| `INotificationService` | `INotificationService` | Push notifications         |
| `IAuthService`         | `IAuthService`         | Authentication             |

## 📝 Configuration File Structure

```json
{
  "name": "Configuration Name",
  "description": "What this configuration is for",
  "environment": "development|test|production",
  "services": {
    "ILogger": {
      "module": "path/to/service/module",
      "className": "ServiceClassName",
      "isMock": true|false,
      "description": "What this service does"
    }
  }
}
```text

## 🎯 Benefits

- ✅ **Zero Code Changes** - Switch implementations via config only
- ✅ **Environment Flexibility** - Different configs for different environments
- ✅ **Easy Testing** - Switch to mocks with one command
- ✅ **Production Safety** - Use concrete services in production
- ✅ **Development Speed** - Use mocks for faster development
- ✅ **Maintainability** - Centralized service configuration
- ✅ **Team Collaboration** - Share configurations via version control

## 🚨 Important Notes

- **Always commit your configurations** to version control
- **Use descriptive names** for custom configurations
- **Test your configurations** before deploying
- **Document custom configurations** in the README
- **Keep configurations in sync** across team members

## 🔧 Advanced Usage

### Environment Variables

```bash
# Load specific configuration file
export SERVICE_CONFIG=configs/my-custom.json
bun run dev

# Load active configuration (default behavior)
export NODE_ENV=active
bun run dev
```text

### Programmatic Loading

```typescript
import { createContainerWithEnvironment } from "./lib/container/flexible-container";

// Load specific environment
const container = await createContainerWithEnvironment("development");

// Load active configuration
const container = await createContainerWithEnvironment("active");

// Load custom file
process.env.SERVICE_CONFIG = "configs/my-custom.json";
const container = await createContainerWithEnvironment("active");
```text

This system makes it incredibly easy to switch between different service implementations for development, testing, and production scenarios!
