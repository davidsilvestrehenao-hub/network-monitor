# Headless API Server (REST + GraphQL)

A multi-protocol API server built with **Hono** framework on **Bun** runtime, exposing all services via REST and GraphQL.

## Overview

This is a **headless API server** powered by **Hono** (ultra-fast web framework) that provides multiple ways to interact with the Network Monitor services:

- **REST API** - Standard HTTP/JSON endpoints
- **GraphQL API** - Flexible queries, mutations, and subscriptions

All protocols share the **same service layer** (DRY principle) - no code duplication!

## When to Use This

✅ **Perfect For:**

- Mobile app backends (iOS, Android, Flutter)
- External integrations and webhooks
- Multi-language clients (Python, Go, Java, etc.)
- Third-party API access
- Microservices communication
- GraphQL-first applications
- OpenAPI/REST-first applications

✅ **Use `apps/web/` Instead For:**

- Web frontend with tRPC (faster development)
- TypeScript-only clients
- Monorepo with shared types

## API Protocols

### REST API

Standard HTTP/JSON endpoints following REST conventions.

**Base URL:** `http://localhost:3000/api`

**Example:**

```bash
# Get all targets
curl http://localhost:3000/api/targets

# Create a target
curl -X POST http://localhost:3000/api/targets \
  -H "Content-Type: application/json" \
  -d '{"name":"Google","address":"https://google.com"}'

# Start monitoring
curl -X POST http://localhost:3000/api/targets/abc123/start \
  -H "Content-Type: application/json" \
  -d '{"intervalMs":30000}'
```

### GraphQL API

Flexible query language with introspection and playground.

**Endpoint:** `http://localhost:3000/graphql`  
**Playground:** Visit in browser for interactive docs

**Example:**

```graphql
# Query multiple resources in one request
query {
  targets {
    id
    name
    address
    alertRules {
      name
      threshold
    }
  }
}

# Create a target
mutation {
  createTarget(input: {
    name: "Google"
    address: "https://google.com"
  }) {
    id
    name
  }
}

# Subscribe to real-time updates
subscription {
  speedTestCompleted(targetId: "abc123") {
    ping
    download
    status
  }
}
```

## Services Included

All services run in the same process and are exposed via both REST and GraphQL:

- **Monitor Service** - Target management and speed tests
- **Alerting Service** - Alert rules and incident detection
- **Notification Service** - Push notifications and in-app messages

## Event Bus

Uses **in-memory EventBus** since all services share the same process. This provides:

- Zero network latency
- Simple debugging
- No external message broker required
- Maintains loose coupling architecture

## Configuration

Uses JSON-based DI container configuration from `configs/apps/api/`:

- `production.json` - Real database, all services enabled
- `development.json` - Mocked database for offline development

Environment is selected automatically based on `NODE_ENV`.

## Running

```bash
# Development (uses development.json)
# ⭐ Auto-launches OpenAPI docs in browser!
bun run dev

# Production (uses production.json)
NODE_ENV=production bun run start

# Custom config
CONFIG_PATH=service-wiring/custom.json bun run start
```

**In development mode, the server will automatically open the API documentation in your browser!**

Visit these URLs:

- 📘 **OpenAPI/Swagger UI:** `http://localhost:3000/api/docs` (auto-opens)
- 🎮 **GraphQL Playground:** `http://localhost:3000/graphql`
- ❤️ **Health Check:** `http://localhost:3000/health`

## Testing the APIs

### REST API

```bash
# Health check
curl http://localhost:3000/health

# Get all targets
curl http://localhost:3000/api/targets \
  -H "Authorization: Bearer user-123"

# Create a target
curl -X POST http://localhost:3000/api/targets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user-123" \
  -d '{
    "name": "Google DNS",
    "address": "https://8.8.8.8"
  }'

# Start monitoring
curl -X POST http://localhost:3000/api/targets/TARGET_ID/start \
  -H "Content-Type: application/json" \
  -d '{"intervalMs": 30000}'
```

### GraphQL API

```bash
# Query targets
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user-123" \
  -d '{
    "query": "{ targets { id name address } }"
  }'

# Create a target
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user-123" \
  -d '{
    "query": "mutation($input: CreateTargetInput!) { createTarget(input: $input) { id name } }",
    "variables": {
      "input": {
        "name": "Google DNS",
        "address": "https://8.8.8.8"
      }
    }
  }'

# Or visit http://localhost:3000/graphql in your browser for the GraphQL Playground
```

## 📚 Documentation & Testing Tools

### Interactive Documentation (Auto-Launches!)

When you run `bun run dev`, the **OpenAPI documentation** automatically opens in your browser!

**Features:**

- ✅ Interactive API explorer
- ✅ Try endpoints directly in browser
- ✅ Auto-generated code examples (curl, JS, Python, etc.)
- ✅ Schema validation
- ✅ Beautiful modern UI powered by Scalar

**Manual Access:**

```text
http://localhost:3000/api/docs
```

### Import into API Clients

#### Postman

```bash
# Import the collection
1. Open Postman
2. Click "Import"
3. Select apps/api/postman-collection.json
4. Start testing!
```

**Includes:**

- ✅ All REST endpoints organized by category
- ✅ Environment variables (dev/prod)
- ✅ Test scripts that auto-save IDs
- ✅ Request examples with validation

#### Insomnia

```bash
# Import the collection
1. Open Insomnia
2. Click "Import From" → "File"
3. Select apps/api/insomnia-collection.json
4. Choose "Development" environment
```

**Includes:**

- ✅ All endpoints with examples
- ✅ Multiple environments
- ✅ Template variables
- ✅ Clean folder structure

### OpenAPI Specification

Download or use the spec directly:

- **YAML:** `http://localhost:3000/api/docs/spec.yaml`
- **JSON:** `http://localhost:3000/api/docs/spec.json`
- **File:** `apps/api/openapi.yaml`

**Use for:**

- Code generation (TypeScript, Python, Go, etc.)
- API contract testing
- Client SDK generation
- Integration with CI/CD

### Complete Guide

See **`COLLECTIONS-GUIDE.md`** for detailed instructions on:

- Using each tool effectively
- Workflow examples
- Pro tips and tricks
- Troubleshooting

---

## Docker Deployment

```bash
# Build image
docker build -f Dockerfile -t network-monitor-api .

# Run container
docker run -p 3000:3000 network-monitor-api
```

## Scaling to Microservices

When ready to scale, simply deploy the individual microservices instead:

```bash
# Deploy each service separately
docker run monitor-service
docker run alerting-service
docker run notification-service
```

**Zero code changes required!** The same service implementations work in both architectures.

## Resource Requirements

**Minimum:**

- 512MB RAM
- 1 CPU core
- 10GB storage

**Recommended:**

- 1GB RAM
- 2 CPU cores
- 20GB storage

## Monitoring

The monolith exposes:

- Health check endpoint
- Performance metrics
- Service status
- Event bus statistics

## Dependencies

- `@network-monitor/shared` - Shared interfaces and types
- `@network-monitor/infrastructure` - DI container, EventBus, Logger
- `@network-monitor/database` - Repositories for data access
- `@network-monitor/monitor` - MonitorService business logic
- `@network-monitor/alerting` - AlertingService business logic
- `@network-monitor/notification` - NotificationService business logic
