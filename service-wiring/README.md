# Service Wiring Configuration

**Location:** `/service-wiring/` (root level)

## ⚠️ Important: This is NOT Runtime Configuration

These JSON files define **which service implementations** to use (dependency injection wiring), **NOT runtime configuration values**.

### What Goes Here ✅

- Which implementation class to use for each interface
- Which module to load implementations from  
- Mock vs Real implementations
- Service topology and wiring

### What Does NOT Go Here ❌

- Database URLs → Use `DATABASE_URL` environment variable
- API keys/secrets → Use environment variables
- Port numbers → Use `PORT` environment variable
- Log levels → Use `LOG_LEVEL` environment variable
- Any environment-specific values → Use `.env` file

---

## 📁 Available Configurations

### Core Configurations

#### `development.json` 🔨

**For daily development work**

- ✅ Real logger, event bus, services
- ⚠️ Mock database & repositories
- 🎯 Use case: Standard development

**Use:** `NODE_ENV=development bun run dev`

#### `production.json` 🚀

**For production deployment**

- ✅ All real implementations
- ✅ Real PostgreSQL database
- ✅ Real repositories
- 🎯 Use case: Production environment

**Use:** `NODE_ENV=production bun run start`

#### `test.json` 🧪

**For unit testing**

- ✅ All mocks for isolation
- ✅ Fast, deterministic tests
- ⚠️ Mock logger (silent)
- 🎯 Use case: Unit tests, TDD

**Use:** `NODE_ENV=test bun test`

#### `offline.json` ✈️

**For offline development**

- ✅ Everything mocked
- ✅ No network/database needed
- 🎯 Use case: Airplane coding, unstable internet

**Use:** `SERVICE_WIRING_CONFIG=offline bun run dev`

---

### Specialized Configurations

#### `frontend-dev.json` 🎨

**Optimized for frontend developers**

- ✅ Real services & logger
- ⚠️ All repositories mocked
- ⚠️ Mock event bus (fast)
- 🎯 Use case: UI/UX development, component work

**Use:** `SERVICE_WIRING_CONFIG=frontend-dev bun run dev`

**Benefits:**

- Instant startup
- Rich test data
- No backend setup needed
- Perfect for React/Solid components

#### `integration-test.json` 🔗

**For integration testing**

- ✅ Real services & event bus
- ⚠️ Mock repositories
- 🎯 Use case: Test service interactions, event-driven flow

**Use:** `SERVICE_WIRING_CONFIG=integration-test bun test`

**Tests:**

- Event bus communication
- Service orchestration
- Cross-service workflows

#### `ci.json` 🤖

**Optimized for CI/CD pipelines**

- ⚠️ All mocked (except services)
- ⚠️ Mock logger (silent)
- ✅ Fast, no external deps
- 🎯 Use case: GitHub Actions, CI/CD

**Use:** `SERVICE_WIRING_CONFIG=ci bun test`

**Benefits:**

- Sub-second startup
- No database setup
- Parallel test safe
- Zero external dependencies

#### `demo.json` 🎭

**For product demos**

- ✅ Real services & event bus
- ⚠️ Mock repositories with rich data
- 🎯 Use case: Sales demos, presentations

**Use:** `SERVICE_WIRING_CONFIG=demo bun run dev`

**Features:**

- Impressive demo data
- Real-time updates work
- Realistic behavior
- No setup needed

---

## 🎯 12-Factor Compliance

**Yes, this is 12-factor compliant!** ✅

Service wiring (code topology) ≠ Runtime configuration (values)

- ✅ Runtime config in environment variables
- ✅ Service wiring defines code structure

---

## 🔄 Switching Configurations

### By Environment (Default)

```bash
NODE_ENV=development bun run dev      # Uses development.json
NODE_ENV=production bun run start     # Uses production.json
NODE_ENV=test bun test                # Uses test.json
```

### By Explicit Override

```bash
# Development scenarios
SERVICE_WIRING_CONFIG=offline bun run dev       # Offline development
SERVICE_WIRING_CONFIG=frontend-dev bun run dev  # Frontend work
SERVICE_WIRING_CONFIG=demo bun run dev          # Product demo

# Testing scenarios
SERVICE_WIRING_CONFIG=integration-test bun test # Integration tests
SERVICE_WIRING_CONFIG=ci bun test               # CI/CD pipeline
SERVICE_WIRING_CONFIG=test bun test             # Unit tests
```

### In Your .env File

```bash
# Add to .env to always use a specific wiring
SERVICE_WIRING_CONFIG=frontend-dev
```

---

## 🎯 Quick Decision Guide

**Choose the right wiring for your scenario:**

| Scenario | Configuration | Why |
|----------|--------------|-----|
| 👨‍💻 Daily backend work | `development.json` | Standard dev setup |
| 🎨 Frontend development | `frontend-dev.json` | Fast, mocked backend |
| ✈️ On airplane/train | `offline.json` | No network needed |
| 🧪 Writing unit tests | `test.json` | All mocked, isolated |
| 🔗 Testing integrations | `integration-test.json` | Real event flow |
| 🤖 CI/CD pipeline | `ci.json` | Fast, no deps |
| 🎭 Product demo | `demo.json` | Rich data, impressive |
| 🚀 Production deploy | `production.json` | All real services |

---

## 📝 Creating Custom Configurations

Create your own for specific needs:

```json
// service-wiring/my-custom.json
{
  "name": "My Custom Wiring",
  "description": "Specific setup for my needs",
  "WARNING": "⚠️  This is SERVICE WIRING, NOT runtime configuration!",
  "runtimeConfig": "All runtime configuration must be in environment variables",
  "purpose": "Defines WHICH classes to use, not VALUES",
  "environment": "my-custom",
  "useCase": "Describe when to use this",
  "services": {
    // Your custom service wiring
  }
}
```

Use it: `SERVICE_WIRING_CONFIG=my-custom bun run dev`

---

See full documentation in `/docs/12-FACTOR-APP.md`
