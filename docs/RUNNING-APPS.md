# Running Apps - Quick Reference

Quick commands for running apps with different configurations.

## 🚀 Quick Start Commands

### Development (Default - Mocked Database)

```bash
# Monitor Service
bun run apps/monitor-service/src/main.ts

# Alerting Service
bun run apps/alerting-service/src/main.ts

# Notification Service
bun run apps/notification-service/src/main.ts

# API Monolith (all services)
bun run apps/api/src/main.ts

# Web App
cd apps/web && bun run dev
```

### Production (Real Database)

```bash
# Monitor Service
NODE_ENV=production bun run apps/monitor-service/dist/main.js

# Alerting Service
NODE_ENV=production bun run apps/alerting-service/dist/main.js

# Notification Service
NODE_ENV=production bun run apps/notification-service/dist/main.js

# API Monolith
NODE_ENV=production bun run apps/api/dist/main.js

# Web App
cd apps/web && NODE_ENV=production bun run start
```

## 📦 Using Package Scripts (Recommended)

Each app has convenient scripts:

```bash
# Development
cd apps/monitor-service
bun run dev                 # Normal development (mocked DB)
bun run dev:offline         # Offline mode (all mocked, pre-seeded data)
bun run dev:mock            # Complete mocking (for testing)

# Production
bun run start               # Production (real DB)
bun run start:staging       # Staging environment
```

### API Monolith Extra Scripts

The API monolith has an additional script for testing with all real services:

```bash
cd apps/api
bun run dev:concrete        # All real services + real database
```

## 🎯 Configuration Methods

### Method 1: NODE_ENV (Automatic Selection)

**Best for:** Standard development and production

```bash
# Development
bun run apps/monitor-service/src/main.ts

# Production
NODE_ENV=production bun run apps/monitor-service/dist/main.js

# Staging (create staging.json first)
NODE_ENV=staging bun run apps/monitor-service/dist/main.js
```

### Method 2: CONFIG_PATH (Explicit Override)

**Best for:** Shared configs or custom scenarios

```bash
# Use shared offline config
CONFIG_PATH=configs/shared/offline-development.json \
  bun run apps/api/src/main.ts

# Use shared all-mock config
CONFIG_PATH=configs/shared/all-mock.json \
  bun run apps/monitor-service/src/main.ts

# Use custom config
CONFIG_PATH=/path/to/custom-config.json \
  bun run apps/monitor-service/src/main.ts
```

### Method 3: Package Scripts

**Best for:** Common scenarios

```bash
cd apps/monitor-service

bun run dev              # → configs/apps/monitor-service/development.json
bun run dev:offline      # → configs/shared/offline-development.json
bun run dev:mock         # → configs/shared/all-mock.json
bun run start            # → configs/apps/monitor-service/production.json
bun run start:staging    # → configs/apps/monitor-service/staging.json
```

## 🔧 Common Scenarios

### Scenario: Local Development

```bash
# Just run the app - uses development.json with mocked database
bun run apps/monitor-service/src/main.ts
```

**Config Used:** `configs/apps/monitor-service/development.json`  
**What You Get:** Real services, mocked repositories, no DB setup needed

### Scenario: Offline Development (Airplane Mode)

```bash
cd apps/api
bun run dev:offline

# Or directly:
CONFIG_PATH=configs/shared/offline-development.json bun run apps/api/src/main.ts
```

**Config Used:** `configs/shared/offline-development.json`  
**What You Get:** Real services, mocked repositories with pre-seeded data, works offline

### Scenario: Complete Testing Isolation

```bash
cd apps/api
bun run dev:mock

# Or directly:
CONFIG_PATH=configs/shared/all-mock.json bun run apps/api/src/main.ts
```

**Config Used:** `configs/shared/all-mock.json`  
**What You Get:** Everything mocked, perfect for unit tests

### Scenario: Integration Testing

```bash
# Use all-concrete config with real database
CONFIG_PATH=configs/shared/all-concrete.json bun run apps/api/src/main.ts
```

**Config Used:** `configs/shared/all-concrete.json`  
**What You Get:** All real implementations, real database

### Scenario: Production Deployment

```bash
# Build first
bun run build --filter=monitor-service

# Run in production
cd apps/monitor-service
bun run start

# Or with explicit NODE_ENV
NODE_ENV=production bun run dist/main.js
```

**Config Used:** `configs/apps/monitor-service/production.json`  
**What You Get:** All real implementations, real database

## 🐳 Docker Usage

### Environment Variables

```yaml
# docker-compose.yml
services:
  monitor-service:
    image: monitor-service:latest
    environment:
      - NODE_ENV=production
      # Or use CONFIG_PATH for specific config
      # - CONFIG_PATH=configs/shared/all-concrete.json
```

### Docker Run

```bash
# Production
docker run -e NODE_ENV=production monitor-service

# Custom config
docker run \
  -e CONFIG_PATH=configs/shared/offline-development.json \
  monitor-service
```

## 🔍 Verifying Configuration

Check which config is loaded:

```bash
# Run the app and look at startup logs
bun run apps/monitor-service/src/main.ts

# Output shows:
# 🚀 Monitor Service
# ====================================
# Monitor Service: Initializing...
#   configPath: configs/apps/monitor-service/development.json  ← Here!
#   database: enabled
```

## 📁 Available Configurations

### Per-App Configs (Use These Most)

```
configs/apps/
├── monitor-service/
│   ├── development.json     ← NODE_ENV=development
│   └── production.json      ← NODE_ENV=production
├── alerting-service/
│   ├── development.json
│   └── production.json
├── notification-service/
│   ├── development.json
│   └── production.json
└── api/
    ├── development.json
    └── production.json
```

### Shared Configs (Special Use Cases)

```
configs/shared/
├── all-mock.json              ← Complete mocking
├── all-concrete.json          ← Full production
└── offline-development.json   ← Offline work
```

## 💡 Tips

1. **Just starting?** Run `bun run apps/api/src/main.ts` - it works out of the box!

2. **Need real database?** Set `NODE_ENV=production` or use `all-concrete.json`

3. **Working offline?** Use `dev:offline` script or `offline-development.json`

4. **Testing in isolation?** Use `dev:mock` script or `all-mock.json`

5. **Debugging config issues?** Check the startup logs - they show which config was loaded

## 🎓 Configuration Priority

When multiple methods are used:

1. **CONFIG_PATH env var** (explicit override) - highest priority
2. **NODE_ENV env var** (environment selection) - default
3. **Hardcoded default** (`"development"`) - fallback

Example:

```bash
# CONFIG_PATH takes precedence over NODE_ENV
NODE_ENV=production CONFIG_PATH=configs/shared/all-mock.json \
  bun run apps/monitor-service/src/main.ts
# → Uses all-mock.json (not production.json)
```

## 📖 More Information

- [Configuration Guide](./docs/CONFIGURATION-GUIDE.md) - Complete configuration documentation
- [Microservice Bootstrap Guide](./docs/MICROSERVICE-BOOTSTRAP.md) - Microservice utilities
- [App-Specific READMEs](./apps/) - See each app's README for details
- [Config Library](./configs/README.md) - All available configurations
