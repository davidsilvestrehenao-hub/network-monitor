# Service Wiring - Getting Started

## 🎯 What is Service Wiring?

Service wiring defines **which classes to use** for each interface in the application. This is **NOT** runtime configuration (like database URLs or API keys).

### The Distinction

| Service Wiring (JSON) | Runtime Configuration (Environment) |
|----------------------|-----------------------------------|
| Which class to use | Actual values |
| `"className": "DatabaseService"` | `DATABASE_URL=postgresql://...` |
| Code structure | Configuration values |
| Rarely changes | Changes per environment |
| No secrets | Contains secrets |

## 🚀 Quick Start (30 Seconds)

### Try Different Configurations

```bash
# Frontend development (fast, mocked backend)
SERVICE_WIRING_CONFIG=frontend-dev bun run dev

# Offline development (airplane coding)
SERVICE_WIRING_CONFIG=offline bun run dev

# Product demo (impressive data)
SERVICE_WIRING_CONFIG=demo bun run dev

# CI/CD testing (ultra fast)
SERVICE_WIRING_CONFIG=ci bun test
```

## 📁 8 Configurations Available

| Config | Best For | Speed | Network Needed |
|--------|----------|-------|----------------|
| `development.json` 🔨 | Daily backend work | Medium | No |
| `production.json` 🚀 | Production | Full | Yes |
| `test.json` 🧪 | Unit tests | Very Fast | No |
| `offline.json` ✈️ | Offline dev | Fast | No |
| `frontend-dev.json` 🎨 | UI/UX work | Very Fast | No |
| `integration-test.json` 🔗 | Integration tests | Fast | No |
| `ci.json` 🤖 | CI/CD | Ultra Fast | No |
| `demo.json` 🎭 | Product demos | Fast | No |

## 🎓 Common Workflows

### Frontend Developer

```bash
# Day 1: Clone and start
git clone repo
cd network-monitor
bun install

# Use frontend-optimized wiring
SERVICE_WIRING_CONFIG=frontend-dev bun run dev

# Start building components!
# ✅ Instant startup
# ✅ Rich test data
# ✅ No backend setup
```

### Backend Developer

```bash
# Standard development (default)
bun run dev

# Uses development.json automatically
# ✅ Real business logic
# ✅ Mock database (fast)
# ✅ Real event bus (test events)
```

### QA Engineer

```bash
# Unit tests
bun test  # Uses test.json

# Integration tests
SERVICE_WIRING_CONFIG=integration-test bun test

# CI/CD tests
SERVICE_WIRING_CONFIG=ci bun test
```

### Product Manager / Sales

```bash
# Impressive demo
SERVICE_WIRING_CONFIG=demo bun run dev

# Rich data, real-time updates
# No setup needed!
```

## 📝 Choosing the Right Config

```text
What are you working on?

├─ UI/Components? → frontend-dev.json
├─ Backend/Services? → development.json
├─ Integration tests? → integration-test.json
├─ Unit tests? → test.json (default)
├─ CI/CD? → ci.json
├─ Demo/Presentation? → demo.json
├─ Offline? → offline.json
└─ Production? → production.json
```

## ⚙️ How It Works

### 1. Service Wiring (JSON)

Defines **which classes** to use:

```json
{
  "IDatabaseService": {
    "module": "@network-monitor/database",
    "className": "DatabaseService"  // ← WHICH class
  }
}
```

### 2. Runtime Configuration (Environment)

Defines **actual values**:

```bash
DATABASE_URL=postgresql://localhost:5432/db  # ← ACTUAL value
PORT=3000
LOG_LEVEL=info
```

### 3. Combined at Startup

```typescript
// 1. Load service wiring (which classes)
const configPath = `service-wiring/${nodeEnv}.json`;

// 2. Load runtime config (values)
const config = getEnvironment();

// 3. Start services with both
const context = await bootstrapMicroservice({ configPath });
// Uses DatabaseService class
// Connects to config.databaseUrl
```

## 🎯 Examples

### Example 1: Normal Development

```bash
bun run dev
```

**What happens:**

1. `NODE_ENV=development` (default)
2. Loads `service-wiring/development.json`
3. Uses real services, mock database
4. Runtime config from `.env`

### Example 2: Frontend Work

```bash
SERVICE_WIRING_CONFIG=frontend-dev bun run dev
```

**What happens:**

1. Loads `service-wiring/frontend-dev.json`
2. Uses mock backend (fast!)
3. Real service logic (test features)
4. Runtime config from `.env`

### Example 3: Production

```bash
NODE_ENV=production bun run start
```

**What happens:**

1. Loads `service-wiring/production.json`
2. Uses all real implementations
3. Connects to real PostgreSQL
4. Runtime config from environment variables

## ✅ Verification

### Check Which Config is Loaded

```bash
# Start any service and look for:
# 📦 Service wiring: development.json
# ⚙️  Runtime config: from environment variables

bun run dev
```

### List All Configurations

```bash
ls -1 service-wiring/*.json
```

### Test a Configuration

```bash
# Try frontend-dev
SERVICE_WIRING_CONFIG=frontend-dev bun run dev

# Should start instantly with mocked backend
```

## 📚 More Information

- **Complete README:** [service-wiring/README.md](./README.md)
- **All Configurations:** [CONFIGURATIONS-SUMMARY.md](./CONFIGURATIONS-SUMMARY.md)
- **12-Factor Docs:** [/docs/12-FACTOR-APP.md](/docs/12-FACTOR-APP.md)

---

**Start with the default, experiment with specialized configs!** 🚀
