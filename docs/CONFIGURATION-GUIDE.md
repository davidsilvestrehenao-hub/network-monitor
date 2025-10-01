# Configuration Guide

Complete guide to configuring and running apps with different configurations.

## Overview

Each app uses **environment-based config selection** by default, but can be overridden for special use cases.

## Default Behavior: Environment-Based Selection

All apps automatically select their config based on the `NODE_ENV` environment variable:

```typescript
// This is in every app's main.ts
const env = process.env.NODE_ENV || "development";
const configPath = `configs/apps/{app-name}/${env}.json`;
```

### Development (Default)

```bash
# Runs with configs/apps/monitor-service/development.json
bun run apps/monitor-service/src/main.ts

# Or explicitly set NODE_ENV
NODE_ENV=development bun run apps/monitor-service/src/main.ts
```

### Production

```bash
# Runs with configs/apps/monitor-service/production.json
NODE_ENV=production bun run apps/monitor-service/dist/main.js
```

## Method 1: Environment Variable (Recommended)

The **cleanest and most portable** way to control config selection.

### All Apps

```bash
# Monitor Service
NODE_ENV=development bun run apps/monitor-service/src/main.ts
NODE_ENV=production bun run apps/monitor-service/dist/main.js

# Alerting Service
NODE_ENV=development bun run apps/alerting-service/src/main.ts
NODE_ENV=production bun run apps/alerting-service/dist/main.js

# Notification Service
NODE_ENV=development bun run apps/notification-service/src/main.ts
NODE_ENV=production bun run apps/notification-service/dist/main.js

# API Monolith
NODE_ENV=development bun run apps/api/src/main.ts
NODE_ENV=production bun run apps/api/dist/main.js

# Web App
NODE_ENV=development bun run apps/web -- dev
NODE_ENV=production bun run apps/web/start
```

## Method 2: Custom Environment Names

You can create custom environment configs:

```bash
# 1. Create a custom config
cat > configs/apps/monitor-service/staging.json << 'EOF'
{
  "name": "Monitor Service Staging",
  "environment": "staging",
  "services": {
    "ILogger": {
      "module": "@network-monitor/infrastructure",
      "className": "WinstonLoggerService",
      ...
    }
  }
}
EOF

# 2. Run with custom environment
NODE_ENV=staging bun run apps/monitor-service/src/main.ts
```

Common custom environments:

- `staging` - Pre-production environment
- `test` - Automated testing environment
- `demo` - Demo/preview deployments
- `local` - Personal development overrides

## Method 3: Direct Config Path Override

For one-off testing or using shared configs, add support for `CONFIG_PATH`:

### Update App Code

Modify your app's `main.ts` to support `CONFIG_PATH`:

```typescript
async function startMonitorService() {
  // Support both NODE_ENV and CONFIG_PATH
  const env = process.env.NODE_ENV || "development";
  const configPath = 
    process.env.CONFIG_PATH || 
    `configs/apps/monitor-service/${env}.json`;

  const context = await bootstrapMicroservice({
    serviceName: "Monitor Service",
    configPath,
    enableDatabase: true,
    // ... rest of config
  });
}
```

### Usage

```bash
# Use shared all-mock config
CONFIG_PATH=configs/shared/all-mock.json bun run apps/api/src/main.ts

# Use shared offline-development config
CONFIG_PATH=configs/shared/offline-development.json bun run apps/api/src/main.ts

# Use custom config from anywhere
CONFIG_PATH=/path/to/my-custom-config.json bun run apps/monitor-service/src/main.ts
```

## Method 4: Docker Environment Variables

In Docker deployments, pass environment variables:

```yaml
# docker-compose.yml
services:
  monitor-service:
    image: monitor-service:latest
    environment:
      - NODE_ENV=production
      # Or override with custom path
      # - CONFIG_PATH=configs/apps/monitor-service/staging.json
    command: ["bun", "run", "main.js"]
```

## Method 5: Package.json Scripts

Add convenience scripts to package.json:

```json
{
  "scripts": {
    "dev": "bun run src/main.ts",
    "dev:offline": "CONFIG_PATH=configs/shared/offline-development.json bun run src/main.ts",
    "dev:mock": "CONFIG_PATH=configs/shared/all-mock.json bun run src/main.ts",
    "start": "NODE_ENV=production bun run dist/main.js",
    "start:staging": "NODE_ENV=staging bun run dist/main.js"
  }
}
```

Then run:

```bash
cd apps/monitor-service
bun run dev:offline  # Uses shared offline config
```

## Configuration Priority

When multiple methods are used, priority is:

1. **Hardcoded in code** (highest priority)
2. **CONFIG_PATH env var** (if implemented)
3. **NODE_ENV env var** (default behavior)
4. **Default value** (`"development"`)

## Current Apps Configuration

### Apps with Auto Environment Selection

All microservices currently use automatic environment-based selection:

- ✅ `apps/monitor-service` - Uses `configs/apps/monitor-service/${NODE_ENV}.json`
- ✅ `apps/alerting-service` - Uses `configs/apps/alerting-service/${NODE_ENV}.json`
- ✅ `apps/notification-service` - Uses `configs/apps/notification-service/${NODE_ENV}.json`
- ✅ `apps/api` - Uses `configs/apps/api/${NODE_ENV}.json`

### Web App

The web app doesn't use this system because it initializes the container from `service-config.json` (which is a symlink or should be updated to point to the right config).

## Recommended Patterns

## Monitoring Settings

- `SPEED_TEST_INTERVAL` controls how often tests run.
- `SPEED_TEST_URL` can optionally override the download speed test URL.
  - Default behavior: 10MB file in non-production, 100MB file in production.
  - Use this to point at an internal mirror or a smaller payload in constrained environments.
- UI note: The Settings screen shows a note about these defaults. An admin-only field can expose `SPEED_TEST_URL` as a read-only reminder or editable override if desired.

### For Development

```bash
# Just run the app - uses development.json automatically
bun run apps/monitor-service/src/main.ts
```

### For Production

```bash
# Set NODE_ENV to production
NODE_ENV=production bun run apps/monitor-service/dist/main.js
```

### For Testing

```bash
# Use all-mock for unit tests
CONFIG_PATH=configs/shared/all-mock.json bun test

# Use app-specific development config for integration tests
NODE_ENV=development bun test
```

### For Offline Development

```bash
# Use shared offline config
CONFIG_PATH=configs/shared/offline-development.json bun run apps/api/src/main.ts
```

## Adding CONFIG_PATH Support

To add `CONFIG_PATH` override support to an app, update its `main.ts`:

```typescript
async function startMyService() {
  // Support both CONFIG_PATH override and NODE_ENV selection
  const env = process.env.NODE_ENV || "development";
  const configPath = 
    process.env.CONFIG_PATH ||  // Explicit override
    `configs/apps/my-service/${env}.json`;  // Auto-selection

  const context = await bootstrapMicroservice({
    serviceName: "My Service",
    configPath,
    enableDatabase: true,
    // ... rest of options
  });
}
```

## Example Scenarios

### Scenario 1: Local Development

```bash
# Uses configs/apps/monitor-service/development.json
bun run apps/monitor-service/src/main.ts
```

### Scenario 2: Production Deployment

```bash
# Uses configs/apps/monitor-service/production.json
NODE_ENV=production bun run apps/monitor-service/dist/main.js
```

### Scenario 3: Staging Environment

```bash
# Create configs/apps/monitor-service/staging.json first
NODE_ENV=staging bun run apps/monitor-service/dist/main.js
```

### Scenario 4: Offline Development (All Apps)

```bash
# Uses shared offline config with all mocked repositories
CONFIG_PATH=configs/shared/offline-development.json bun run apps/api/src/main.ts
```

### Scenario 5: Complete Testing Isolation

```bash
# Uses shared all-mock config
CONFIG_PATH=configs/shared/all-mock.json bun run apps/api/src/main.ts
```

### Scenario 6: Integration Testing

```bash
# Uses shared all-concrete config with real database
CONFIG_PATH=configs/shared/all-concrete.json bun run apps/api/src/main.ts
```

## Configuration File Locations

```text
configs/
├── apps/                           # Per-app configs (use these 99% of the time)
│   ├── monitor-service/
│   │   ├── development.json       # Auto-selected when NODE_ENV=development
│   │   └── production.json        # Auto-selected when NODE_ENV=production
│   ├── alerting-service/
│   │   ├── development.json
│   │   └── production.json
│   ├── notification-service/
│   │   ├── development.json
│   │   └── production.json
│   └── api/
│       ├── development.json
│       └── production.json
└── shared/                         # Shared configs (special use cases)
    ├── all-mock.json              # Complete isolation
    ├── all-concrete.json          # Full production
    └── offline-development.json   # Offline work
```

## Quick Reference

| Goal | Command |
|------|---------|
| **Run app in dev** | `bun run apps/{app}/src/main.ts` |
| **Run app in prod** | `NODE_ENV=production bun run apps/{app}/dist/main.js` |
| **Use custom env** | `NODE_ENV=staging bun run apps/{app}/src/main.ts` |
| **Use specific config** | `CONFIG_PATH=path/to/config.json bun run apps/{app}/src/main.ts` |
| **Offline development** | `CONFIG_PATH=configs/shared/offline-development.json bun run apps/api/src/main.ts` |
| **Full mock testing** | `CONFIG_PATH=configs/shared/all-mock.json bun run apps/api/src/main.ts` |

## Troubleshooting

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

## Next Steps

Want to add `CONFIG_PATH` support to all apps? Run:

```bash
# This would update all apps to support CONFIG_PATH override
for app in apps/*/src/main.ts; do
  # Add CONFIG_PATH support (manual edit recommended)
  echo "Update $app to add CONFIG_PATH support"
done
```

Or keep it simple and use `NODE_ENV` for everything! 🎯
