# Service Wiring Configuration Guide

## 🎯 Complete Guide to Service Wiring

This guide helps you choose and use the right service wiring configuration for your needs.

---

## 📋 All Available Configurations

### 1. `development.json` 🔨 - Daily Development

**Who:** Backend developers  
**When:** Standard daily development work  
**Network:** Optional (can work offline with mocked DB)  
**Speed:** Medium (real services, mock data)

**What's Real:**

- ✅ Logger (console output)
- ✅ Event bus (in-memory)
- ✅ Business services (Monitor, Alerting, Notification)

**What's Mocked:**

- ⚠️ Database (MockDatabase)
- ⚠️ All repositories (with test data)
- ⚠️ Authentication (MockAuth)

**Use:**

```bash
# Default for development
bun run dev

# Or explicitly
NODE_ENV=development bun run dev
```

**Perfect for:**

- Writing business logic
- Testing service interactions
- Quick iteration cycles
- Local development

---

### 2. `production.json` 🚀 - Production

**Who:** Ops, DevOps, Production  
**When:** Deploying to production  
**Network:** Required (PostgreSQL, etc.)  
**Speed:** Production-ready

**What's Real:**

- ✅ Everything!
- ✅ PostgreSQL database
- ✅ Real repositories
- ✅ Real services
- ✅ Real authentication

**What's Mocked:**

- ❌ Nothing (except in development, use MockAuth)

**Use:**

```bash
NODE_ENV=production bun run start
```

**Perfect for:**

- Production deployments
- Staging environments
- Performance testing with real database
- Final integration testing

---

### 3. `test.json` 🧪 - Unit Testing

**Who:** All developers  
**When:** Running unit tests  
**Network:** None (fully isolated)  
**Speed:** Very fast (<100ms startup)

**What's Real:**

- ✅ Business services (testing logic)

**What's Mocked:**

- ⚠️ Everything else
- ⚠️ Silent mock logger
- ⚠️ Mock event bus
- ⚠️ Mock database
- ⚠️ All repositories

**Use:**

```bash
NODE_ENV=test bun test
```

**Perfect for:**

- Unit testing
- TDD workflow
- Fast feedback loops
- CI/CD unit test phase

---

### 4. `offline.json` ✈️ - Offline Development

**Who:** Anyone  
**When:** No internet, airplane, train, coffee shop  
**Network:** None needed  
**Speed:** Very fast

**What's Real:**

- ✅ Logger
- ✅ Event bus (in-memory)
- ✅ Business services

**What's Mocked:**

- ⚠️ Everything else
- ⚠️ No network requests
- ⚠️ All data from memory

**Use:**

```bash
SERVICE_WIRING_CONFIG=offline bun run dev
```

**Perfect for:**

- Working offline
- Unstable internet
- Quick demos without setup
- Learning the codebase

---

### 5. `frontend-dev.json` 🎨 - Frontend Development

**Who:** Frontend developers  
**When:** Working on UI/UX, components, styling  
**Network:** None needed  
**Speed:** Very fast

**What's Real:**

- ✅ Logger (see API calls)
- ✅ Business services (realistic behavior)

**What's Mocked:**

- ⚠️ Event bus (instant)
- ⚠️ Database (rich test data)
- ⚠️ All repositories (varied data)
- ⚠️ Authentication (instant login)

**Use:**

```bash
SERVICE_WIRING_CONFIG=frontend-dev bun run dev
```

**Perfect for:**

- Building React/Solid components
- Testing UI states (loading, error, success)
- Styling and responsive design
- Working without backend setup

**Example workflow:**

```bash
# Frontend dev starts work
cd network-monitor
SERVICE_WIRING_CONFIG=frontend-dev bun run dev

# Instant startup, no database needed
# Rich test data for components
# Focus on UI/UX
```

---

### 6. `integration-test.json` 🔗 - Integration Testing

**Who:** Backend developers, QA  
**When:** Testing service interactions  
**Network:** None (mocked data layer)  
**Speed:** Fast

**What's Real:**

- ✅ Logger (debug integration issues)
- ✅ Event bus (test event-driven architecture!)
- ✅ Business services (test orchestration)

**What's Mocked:**

- ⚠️ Database (controlled test data)
- ⚠️ Repositories (predictable state)

**Use:**

```bash
SERVICE_WIRING_CONFIG=integration-test bun test
```

**Perfect for:**

- Testing event bus communication
- Service-to-service integration
- Event-driven workflows
- Cross-service scenarios

**What it tests:**

```typescript
// Example: Test that monitor service triggers alerts
1. Monitor service completes speed test
2. Emits SPEED_TEST_COMPLETED event
3. Alerting service receives event
4. Evaluates alert rules
5. Emits ALERT_TRIGGERED event
6. Notification service receives event
7. Sends notification
```

---

### 7. `ci.json` 🤖 - CI/CD Pipeline

**Who:** CI/CD system (GitHub Actions, etc.)  
**When:** Automated testing in pipelines  
**Network:** None  
**Speed:** Very fast (<50ms startup)

**What's Real:**

- ✅ Business services (test logic)

**What's Mocked:**

- ⚠️ Everything else
- ⚠️ Silent logger (no noise)
- ⚠️ Mock event bus
- ⚠️ All infrastructure

**Use:**

```bash
SERVICE_WIRING_CONFIG=ci bun test
```

**Perfect for:**

- GitHub Actions workflows
- GitLab CI pipelines
- Jenkins jobs
- Pre-commit hooks

**Example GitHub Action:**

```yaml
# .github/workflows/test.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: SERVICE_WIRING_CONFIG=ci bun test
```

---

### 8. `demo.json` 🎭 - Product Demos

**Who:** Sales, marketing, product managers  
**When:** Presenting to clients, stakeholders  
**Network:** None needed  
**Speed:** Fast

**What's Real:**

- ✅ Logger (show activity)
- ✅ Event bus (real-time updates!)
- ✅ All services (full features)

**What's Mocked:**

- ⚠️ Database (with impressive demo data)
- ⚠️ Repositories (rich, varied data)
- ⚠️ Authentication (instant login)

**Use:**

```bash
SERVICE_WIRING_CONFIG=demo bun run dev
```

**Perfect for:**

- Sales presentations
- Stakeholder demos
- Conference talks
- Product showcases

**Features:**

- Rich, impressive data
- Real-time updates work
- No database setup needed
- Consistent demo experience

---

## 🎓 Choosing the Right Configuration

### Quick Decision Tree

```text
Are you deploying to production?
├─ YES → production.json
└─ NO
   │
   Are you running automated tests?
   ├─ YES
   │  ├─ Unit tests? → test.json or ci.json
   │  ├─ Integration tests? → integration-test.json
   │  └─ CI/CD pipeline? → ci.json
   └─ NO
      │
      Are you developing?
      ├─ Frontend work? → frontend-dev.json
      ├─ Backend work? → development.json
      ├─ No internet? → offline.json
     └─ Demo/presentation? → demo.json
```

### By Use Case

| I want to... | Use this config |
|-------------|----------------|
| Work on backend features | `development.json` |
| Work on frontend/UI | `frontend-dev.json` |
| Work on airplane/train | `offline.json` |
| Run unit tests | `test.json` |
| Run integration tests | `integration-test.json` |
| Run in CI/CD | `ci.json` |
| Show a demo | `demo.json` |
| Deploy to production | `production.json` |

---

## 💡 Common Scenarios

### Scenario 1: Frontend Developer Starting Work

```bash
# Clone repo
git clone https://github.com/org/network-monitor.git
cd network-monitor

# Install dependencies
bun install

# Start with frontend-optimized wiring
SERVICE_WIRING_CONFIG=frontend-dev bun run dev

# Start working on components immediately!
# - No database setup needed
# - Rich test data available
# - Fast startup and reload
```

### Scenario 2: Backend Developer Testing Events

```bash
# Use integration-test wiring
SERVICE_WIRING_CONFIG=integration-test bun test

# Tests run with:
# - Real event bus (test event flow)
# - Real services (test orchestration)
# - Mock data (predictable, fast)
```

### Scenario 3: CI/CD Pipeline

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: SERVICE_WIRING_CONFIG=ci bun test
  
# Super fast, no external dependencies
```

### Scenario 4: Product Demo

```bash
# Start demo mode
SERVICE_WIRING_CONFIG=demo bun run dev

# Impressive features:
# - Multiple targets with varied performance
# - Active alerts and incidents
# - Real-time chart updates
# - Notifications flowing
```

---

## 🔧 Advanced Usage

### Combining with Environment Variables

```bash
# Frontend dev with debug logging
SERVICE_WIRING_CONFIG=frontend-dev LOG_LEVEL=debug bun run dev

# Demo with specific port
SERVICE_WIRING_CONFIG=demo PORT=3001 bun run dev

# CI with verbose output
SERVICE_WIRING_CONFIG=ci LOG_LEVEL=info bun test
```

### Creating Team-Specific Configurations

```json
// service-wiring/alice-dev.json
{
  "name": "Alice's Development Setup",
  "description": "Custom wiring for Alice's workflow",
  "services": {
    // Alice prefers real alerting service but mocked everything else
    "IAlertingService": { "className": "AlertingService", "isMock": false },
    // ... rest mocked
  }
}
```

### Per-Feature Configurations

```json
// service-wiring/feature-alerts.json
{
  "name": "Alert Feature Development",
  "description": "Real alerting components, mock everything else",
  "services": {
    "IAlertingService": { "className": "AlertingService", "isMock": false },
    "IAlertRuleRepository": { "className": "AlertRuleRepository", "isMock": false },
    "IIncidentEventRepository": { "className": "IncidentEventRepository", "isMock": false },
    // ... rest mocked
  }
}
```

---

## 📊 Configuration Comparison Matrix

| Configuration | Logger | Event Bus | Database | Repositories | Services | Auth | Startup |
|--------------|--------|-----------|----------|--------------|----------|------|---------|
| `development` | Real | Real | Mock | Mock | Real | Mock | ~1s |
| `production` | Real | Real | Real | Real | Real | Real | ~2s |
| `test` | Mock | Mock | Mock | Mock | Real | Mock | <100ms |
| `offline` | Real | Real | Mock | Mock | Real | Mock | ~500ms |
| `frontend-dev` | Real | Mock | Mock | Mock | Real | Mock | <500ms |
| `integration-test` | Real | Real | Mock | Mock | Real | Mock | ~1s |
| `ci` | Mock | Mock | Mock | Mock | Real | Mock | <50ms |
| `demo` | Real | Real | Mock | Mock | Real | Mock | ~1s |

---

## 🎯 Best Practices

### DO ✅

- Use `development.json` as your default
- Use `frontend-dev.json` when working on UI
- Use `ci.json` in automated pipelines
- Create custom configs for specific features
- Document your custom configs

### DON'T ❌

- Don't put runtime config in these files (use .env)
- Don't commit secrets anywhere
- Don't use production.json in development
- Don't modify these files for config values

---

## 📚 Additional Resources

- [Service Wiring README](../service-wiring/README.md)
- [12-Factor App Docs](./12-FACTOR-APP.md)
- [Migration Guide](./12-FACTOR-MIGRATION-GUIDE.md)

---

**Remember: Service wiring = Code structure, Environment variables = Configuration values** 🎯
