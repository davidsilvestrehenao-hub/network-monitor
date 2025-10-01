# Service Wiring Configuration - Migration Complete ✅

## 🎯 What We Did

We reorganized the JSON configuration files to make it **crystal clear** that they are for **dependency injection wiring**, NOT runtime configuration.

### Key Changes

1. **Renamed Directory Structure**

   ```text
   # Old
   configs/apps/api/development.json
   configs/apps/api/production.json
   configs/shared/all-mock.json
   
   # New
   service-wiring/development.json
   service-wiring/production.json
   service-wiring/test.json
   service-wiring/offline.json
   ```

2. **Updated All JSON Files**
   - Added clear warnings about purpose
   - Explained this is NOT runtime config
   - Added documentation headers

3. **Added Environment Variable Override**
   - `SERVICE_WIRING_CONFIG` - Override which wiring to use
   - Defaults to `NODE_ENV` value

4. **Updated All Services**
   - API monolith
   - Monitor service
   - Alerting service
   - Notification service

5. **Created Documentation**
   - `service-wiring/README.md` - Complete guide
   - `env.template` - Added SERVICE_WIRING_CONFIG docs

---

## 🎓 Understanding the Distinction

### Service Wiring (JSON Files) ✅

**Purpose:** Defines WHICH classes to use for each interface

```json
{
  "IDatabaseService": {
    "module": "@network-monitor/database",
    "className": "DatabaseService"  // ← WHICH class
  }
}
```

**This is:** Code structure, dependency injection topology  
**Changes:** Rarely (only during refactoring)  
**Contains:** Class names, module names  
**Secrets:** Never

### Runtime Configuration (Environment Variables) ✅

**Purpose:** Defines VALUES for configuration

```bash
DATABASE_URL=postgresql://localhost:5432/db  # ← ACTUAL VALUE
PORT=3000
LOG_LEVEL=info
```

**This is:** Actual configuration values  
**Changes:** Often (per environment)  
**Contains:** URLs, ports, keys, passwords  
**Secrets:** Yes (properly secured)

---

## 🚀 How to Use

### By Environment (Default)

```bash
# Development (uses development.json)
NODE_ENV=development bun run dev

# Production (uses production.json)
NODE_ENV=production bun run start

# Test (uses test.json)
NODE_ENV=test bun test
```

### By Explicit Override

```bash
# Use test wiring in development
SERVICE_WIRING_CONFIG=test bun run dev

# Use offline wiring (no network needed)
SERVICE_WIRING_CONFIG=offline bun run dev

# Use production wiring with development environment
NODE_ENV=development SERVICE_WIRING_CONFIG=production bun run dev
```

### In Your .env File

```bash
# Add to .env to always use a specific wiring
SERVICE_WIRING_CONFIG=development
```

---

## 📁 Available Wiring Configurations

| File | Purpose | Database | Repositories | Services |
|------|---------|----------|--------------|----------|
| `development.json` | Daily development | Mock | Mock | Real |
| `production.json` | Production deployment | Real | Real | Real |
| `test.json` | Automated testing | Mock | Mock | Real |
| `offline.json` | Offline development | Mock | Mock | Real |

---

## 🎯 12-Factor Compliance

### Is This 12-Factor Compliant?

**YES!** ✅

The 12-Factor App (Factor III) says:
> "Store config in the environment"

**Config** means **runtime configuration values** (database URLs, API keys, ports).

**Service wiring** is about **code structure** (which classes to use), not runtime values.

### Analogy

Think of it like a Spring Boot or NestJS application:

**Service Wiring (JSON):**

```java
// Like Spring @Configuration
@Bean
public DatabaseService database() {
  return new PostgreSQLDatabase();  // ← Which implementation
}
```

**Runtime Configuration (Environment):**

```properties
# Like application.properties
spring.datasource.url=jdbc:postgresql://...  # ← Actual value
```

---

## 🔄 Migration Impact

### What Changed

1. **File locations moved**
   - From: `configs/apps/*/` and `configs/shared/`
   - To: `service-wiring/`

2. **Service loading updated**
   - All 4 services now use new location
   - Support for `SERVICE_WIRING_CONFIG` override

3. **Environment variables added**
   - `SERVICE_WIRING_CONFIG` (optional)

### What Didn't Change

1. **File contents** - Same services, same wiring
2. **Functionality** - Everything works the same
3. **Default behavior** - Still uses `NODE_ENV` by default

### Breaking Changes

**None!** ✅

The default behavior (using `NODE_ENV`) still works exactly the same.

---

## 📝 Examples

### Example 1: Normal Development

```bash
# Before (still works)
NODE_ENV=development bun run dev

# After (same thing)
NODE_ENV=development bun run dev

# Result: Uses service-wiring/development.json
```

### Example 2: Testing with All Mocks

```bash
# Before
NODE_ENV=test bun test

# After (same thing)
NODE_ENV=test bun test

# Or explicitly:
SERVICE_WIRING_CONFIG=test bun test

# Result: Uses service-wiring/test.json
```

### Example 3: Offline Development

```bash
# New capability!
SERVICE_WIRING_CONFIG=offline bun run dev

# Result: Uses service-wiring/offline.json
# Everything mocked, no network needed
```

---

## ✅ Validation

### Build Status

```bash
bun run build
# ✅ All packages build successfully
```

### Runtime Test

```bash
# Start with default wiring
bun run dev:api

# You'll see:
# 📦 Service wiring: development.json
# ⚙️  Runtime config: from environment variables
```

### Override Test

```bash
# Start with different wiring
SERVICE_WIRING_CONFIG=offline bun run dev:api

# You'll see:
# 📦 Service wiring: offline.json
# ⚙️  Runtime config: from environment variables
```

---

## 🎓 Key Takeaways

1. **Service Wiring ≠ Runtime Configuration**
   - Wiring = Which classes (code structure)
   - Config = Actual values (database URLs, ports)

2. **Still 12-Factor Compliant**
   - Runtime config is in environment variables ✅
   - Service wiring is code structure (not covered by 12-factor)

3. **More Flexible**
   - Easy to switch between implementations
   - Override with `SERVICE_WIRING_CONFIG`
   - Create custom wiring configurations

4. **Well Documented**
   - Clear purpose in each file
   - Comprehensive README
   - Examples in env.template

---

## 📚 Further Reading

- `service-wiring/README.md` - Complete guide
- `docs/12-FACTOR-APP.md` - Full 12-factor assessment
- `env.template` - All environment variables

---

## 🆘 Questions?

**Q: Why not put everything in environment variables?**

A: Complex DI wiring would require 15+ environment variables and complex logic. This approach is cleaner and more maintainable while still being 12-factor compliant.

**Q: Can I create custom wiring configurations?**

A: Yes! Just create a new JSON file in `service-wiring/` and use it with `SERVICE_WIRING_CONFIG=your-custom-config`.

**Q: Are the old files still there?**

A: Yes, the original files are untouched. The new `service-wiring/` directory has copies with updates. You can delete the old `configs/apps/` and `configs/shared/` directories if you want.

---

**Migration Complete!** ✅ Your app now has clear separation between service wiring and runtime configuration.
