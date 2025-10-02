# Configuration Guide

Complete guide to configuring and running the Network Monitor application.

## 🚀 Quick Start

### Most Common Commands

```bash
# Development (default) - Run from project root
bun run apps/api/src/main.ts

# Development - Run from app directory  
cd apps/monitor-service
bun run dev

# Offline development (no DB needed)
cd apps/api
bun run dev:offline

# Production
cd apps/monitor-service
bun run start
```

## 📦 What Each App Does

### API Monolith (`apps/api`)

**All services in one process** - Best for development and small deployments

```bash
cd apps/api
bun run dev              # Development with mocked DB
bun run dev:offline      # Offline mode
bun run dev:mock         # Everything mocked
bun run dev:concrete     # All real (needs DB)
bun run start            # Production
```

### Monitor Service (`apps/monitor-service`)

**Target management and speed tests** - Can run independently

```bash
cd apps/monitor-service
bun run dev              # Development
bun run dev:offline      # Offline mode
bun run dev:mock         # Complete mocking
bun run start            # Production
```

### Alerting Service (`apps/alerting-service`)

**Alert rules and incidents** - Can run independently

```bash
cd apps/alerting-service
bun run dev              # Development
bun run dev:offline      # Offline mode
bun run dev:mock         # Complete mocking
bun run start            # Production
```

### Notification Service (`apps/notification-service`)

**Push notifications** - Can run independently

```bash
cd apps/notification-service
bun run dev              # Development
bun run dev:offline      # Offline mode
bun run dev:mock         # Complete mocking
bun run start            # Production
```

### Web App (`apps/web`)

**PWA Frontend** - SolidStart application

```bash
cd apps/web
bun run dev              # Development server
bun run build            # Build for production
bun run start            # Start production server
```

## 🎮 Three Ways to Control Configuration

### 1. Package Scripts (Easiest)

Just `cd` into an app directory and run:

```bash
cd apps/monitor-service

bun run dev              # Normal development
bun run dev:offline      # Offline mode (no DB needed)
bun run dev:mock         # Complete mocking
bun run start            # Production
bun run start:staging    # Staging environment
```

### 2. NODE_ENV Variable

```bash
# Development
NODE_ENV=development bun run apps/monitor-service/src/main.ts

# Production
NODE_ENV=production bun run apps/monitor-service/dist/main.js

# Staging (create staging.json first)
NODE_ENV=staging bun run apps/monitor-service/dist/main.js
```

### 3. CONFIG_PATH Variable (Full Control)

```bash
# Use specific config file
CONFIG_PATH=configs/shared/offline-development.json \
  bun run apps/api/src/main.ts

# Use custom config
CONFIG_PATH=/path/to/my-config.json \
  bun run apps/monitor-service/src/main.ts
```

## 📁 Configuration Structure

```text
configs/
├── apps/                           # Per-app configs (use these!)
│   ├── monitor-service/
│   │   ├── development.json       # Auto-selected by NODE_ENV
│   │   └── production.json        # Auto-selected by NODE_ENV
│   ├── alerting-service/
│   ├── notification-service/
│   └── api/
└── shared/                         # Special scenarios
    ├── all-mock.json              # Everything mocked
    ├── all-concrete.json          # Everything real
    └── offline-development.json   # Offline work
```

## 💡 Common Scenarios

### First Time Running

```bash
# Just run it - works out of the box!
bun run apps/api/src/main.ts
```

### Working Offline (Airplane, Train)

```bash
cd apps/api
bun run dev:offline
```

### Testing in Isolation

```bash
cd apps/api
bun run dev:mock
```

### Production Deployment

```bash
# Build first
bun run build

# Run in production
cd apps/api
bun run start
```

### Want Real Database in Development

```bash
cd apps/api
bun run dev:concrete
```

## 🔍 How to Know Which Config is Being Used

When you start an app, it logs the config path:

```bash
$ bun run apps/monitor-service/src/main.ts

🚀 Starting Monitor Service ...
📋 Loading configuration: Monitor Service Development (development)
[INFO] Monitor Service: Initializing...
  configPath: configs/apps/monitor-service/development.json  ← HERE!
  database: enabled
```

## 🛠️ Service Configuration

The system uses JSON files to configure which service implementations to use:

### Service Types

| Service | Interface | Purpose |
|---------|-----------|---------|
| `ILogger` | `ILogger` | Logging and debugging |
| `IEventBus` | `IEventBus` | Event-driven communication |
| `IDatabaseService` | `IDatabaseService` | Database operations |
| `IMonitorService` | `IMonitorService` | Network monitoring |
| `IAlertingService` | `IAlertingService` | Alert management |
| `INotificationService` | `INotificationService` | Push notifications |
| `IAuthService` | `IAuthService` | Authentication |

### Configuration File Structure

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
```

## 🎯 Available Configurations

| Configuration | Use Case | Services |
|---------------|----------|----------|
| `all-concrete.json` | Production | All concrete implementations |
| `auth-mock-only.json` | Development | Auth mocked, rest concrete |
| `all-mock.json` | Testing | All mock implementations |
| `offline-development.json` | Offline Dev | Logger + EventBus concrete, rest mocked |
| `performance-testing.json` | Performance Tests | EventBus + Monitor + Alerting concrete |
| `database-testing.json` | Database Tests | Only database concrete |
| `notification-testing.json` | Notification Tests | EventBus + Alerting + Notifications concrete |
| `monitoring-testing.json` | Monitoring Tests | Logger + EventBus + Monitor + Alerting concrete |
| `alerting-testing.json` | Alerting Tests | Logger + EventBus + Alerting + Notifications concrete |

## 🔧 Creating Custom Configurations

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
     }
   }
   ```

3. **Use your configuration**:

   ```bash
   CONFIG_PATH=configs/my-custom.json bun run apps/api/src/main.ts
   ```

## 🚨 Troubleshooting

### Config file not found

```bash
# Check if the file exists
ls configs/apps/monitor-service/development.json

# Check NODE_ENV value
echo $NODE_ENV

# Try with explicit path
CONFIG_PATH=configs/apps/monitor-service/development.json bun run apps/monitor-service/src/main.ts
```

### Wrong config being used

```bash
# Check what config is loaded (look at startup logs)
bun run apps/monitor-service/src/main.ts

# Logs will show:
# "Monitor Service: Initializing..."
# "  configPath: configs/apps/monitor-service/development.json"
```

### Need to verify config

```bash
# Validate JSON syntax
cat configs/apps/monitor-service/production.json | jq .

# Check what services are configured
cat configs/apps/monitor-service/production.json | jq '.services | keys'
```

## ✅ What's Configured Automatically

When you run `bun run dev`:

- ✅ Logger configured
- ✅ Event bus configured  
- ✅ Database mocked (development) or real (production)
- ✅ All repositories configured
- ✅ All services initialized
- ✅ Graceful shutdown handlers
- ✅ Database connections managed

You don't need to configure anything!

## 🎉 Key Benefits

- ✅ **Zero Code Changes** - Switch implementations via config only
- ✅ **Environment Flexibility** - Different configs for different environments
- ✅ **Easy Testing** - Switch to mocks with one command
- ✅ **Production Safety** - Use concrete services in production
- ✅ **Development Speed** - Use mocks for faster development
- ✅ **Maintainability** - Centralized service configuration
- ✅ **Team Collaboration** - Share configurations via version control

## 📚 Quick Reference

| Goal | Command |
|------|---------|
| **Run app in dev** | `bun run apps/{app}/src/main.ts` |
| **Run app in prod** | `NODE_ENV=production bun run apps/{app}/dist/main.js` |
| **Use custom env** | `NODE_ENV=staging bun run apps/{app}/src/main.ts` |
| **Use specific config** | `CONFIG_PATH=path/to/config.json bun run apps/{app}/src/main.ts` |
| **Offline development** | `CONFIG_PATH=configs/shared/offline-development.json bun run apps/api/src/main.ts` |
| **Full mock testing** | `CONFIG_PATH=configs/shared/all-mock.json bun run apps/api/src/main.ts` |

---

**Ready to start developing? Just run:**

```bash
bun run apps/api/src/main.ts
```

That's it! Everything else is automatic. 🎉
