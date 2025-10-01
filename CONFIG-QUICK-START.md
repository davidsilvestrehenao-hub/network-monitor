# Configuration Quick Start Guide

The simplest guide to running apps with different configurations.

## 🎯 TL;DR - Most Common Commands

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

## 🗂️ Configuration Files Reference

```
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

## 🚫 What You DON'T Need to Do

- ❌ Don't create `service-config.json` (deprecated)
- ❌ Don't manually configure services
- ❌ Don't worry about container initialization
- ❌ Don't manage database connections manually

Everything is automatic via the `bootstrapMicroservice()` utility!

## 📚 More Information

- [Full Configuration Guide](./docs/CONFIGURATION-GUIDE.md)
- [Running Apps Reference](./RUNNING-APPS.md)
- [Microservice Bootstrap Guide](./docs/MICROSERVICE-BOOTSTRAP.md)
- [App-Specific READMEs](./apps/)

