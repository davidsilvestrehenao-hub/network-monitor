# API Quick Start Guide

Your headless API server is now running with **three protocols**: REST, GraphQL, and tRPC.

## Start the Server

```bash
# Install dependencies
bun install

# Development mode
bun run dev

# Production mode
NODE_ENV=production bun run build
NODE_ENV=production bun run start
```

The server will start on `http://localhost:3000` (or your configured `PORT`).

## 🌐 Explore the APIs

### Option 1: Visit in Browser

```
http://localhost:3000/
```

You'll see a JSON response showing all available endpoints.

### Option 2: GraphQL Playground

```
http://localhost:3000/graphql
```

Interactive GraphQL playground with full documentation and autocomplete!

### Option 3: Health Check

```bash
curl http://localhost:3000/health
```

Returns service status and availability.

---

## 🚀 Quick Examples

### REST API

#### Create a Target

```bash
curl -X POST http://localhost:3000/api/targets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user-123" \
  -d '{
    "name": "Google DNS",
    "address": "https://8.8.8.8"
  }'
```

#### Get All Targets

```bash
curl http://localhost:3000/api/targets \
  -H "Authorization: Bearer user-123"
```

#### Start Monitoring

```bash
curl -X POST http://localhost:3000/api/targets/TARGET_ID/start \
  -H "Content-Type: application/json" \
  -d '{"intervalMs": 30000}'
```

#### Run Speed Test

```bash
curl -X POST http://localhost:3000/api/targets/TARGET_ID/test \
  -H "Content-Type: application/json"
```

---

### GraphQL API

#### Query Targets (Interactive Playground)

Visit `http://localhost:3000/graphql` and try:

```graphql
query GetTargets {
  targets {
    id
    name
    address
    alertRules {
      name
      threshold
      enabled
    }
  }
}
```

#### Create Target with Mutation

```graphql
mutation CreateTarget {
  createTarget(input: {
    name: "Google DNS"
    address: "https://8.8.8.8"
  }) {
    id
    name
    address
  }
}
```

#### Complex Nested Query

```graphql
query Dashboard {
  targets {
    id
    name
    speedTestResults {
      ping
      download
      status
      createdAt
    }
    alertRules {
      name
      metric
      threshold
      enabled
    }
  }
  unresolvedIncidents {
    id
    type
    description
    timestamp
  }
}
```

#### Using cURL with GraphQL

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user-123" \
  -d '{
    "query": "{ targets { id name address } }"
  }'
```

---

## 📚 Complete REST Endpoint Reference

### Health & Info

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API documentation |

### Targets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/targets` | List all targets |
| POST | `/api/targets` | Create target |
| GET | `/api/targets/:id` | Get target by ID |
| PUT | `/api/targets/:id` | Update target |
| DELETE | `/api/targets/:id` | Delete target |
| POST | `/api/targets/:id/start` | Start monitoring |
| POST | `/api/targets/:id/stop` | Stop monitoring |
| POST | `/api/targets/:id/test` | Run speed test |
| GET | `/api/targets/active` | List active targets |

### Alert Rules

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alert-rules/target/:targetId` | Get rules for target |
| POST | `/api/alert-rules` | Create alert rule |
| PUT | `/api/alert-rules/:id` | Update alert rule |
| DELETE | `/api/alert-rules/:id` | Delete alert rule |

### Incidents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents/target/:targetId` | Get incidents |
| POST | `/api/incidents/:id/resolve` | Resolve incident |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications/user/:userId` | Get notifications |
| POST | `/api/notifications/:id/read` | Mark as read |

### Push Subscriptions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/push-subscriptions` | Create subscription |

---

## 🎯 GraphQL Schema Overview

### Queries (Read Operations)

- `health` - Server health status
- `targets` - All targets
- `target(id)` - Single target
- `activeTargets` - Currently monitored targets
- `alertRulesByTarget(targetId)` - Alert rules
- `incidentsByTarget(targetId)` - Incidents
- `unresolvedIncidents` - All unresolved incidents
- `notifications(userId)` - Notifications
- `unreadNotifications` - Unread only
- `pushSubscriptions` - Push subscriptions
- `currentUser` - Current user info

### Mutations (Write Operations)

- `createTarget(input)` - Create target
- `updateTarget(id, input)` - Update target
- `deleteTarget(id)` - Delete target
- `startMonitoring(targetId, intervalMs)` - Start monitoring
- `stopMonitoring(targetId)` - Stop monitoring
- `runSpeedTest(targetId)` - Run speed test
- `createAlertRule(input)` - Create alert rule
- `updateAlertRule(id, input)` - Update alert rule
- `deleteAlertRule(id)` - Delete alert rule
- `resolveIncident(id)` - Resolve incident
- `markNotificationAsRead(id)` - Mark as read
- `createPushSubscription(input)` - Create subscription

### Subscriptions (Real-time) 🚧 Coming Soon

- `targetUpdated(targetId)` - Real-time target updates
- `speedTestCompleted(targetId)` - Real-time test results
- `incidentCreated(targetId)` - Real-time alerts
- `notificationReceived` - Real-time notifications

---

## 🔐 Authentication

Currently using mock authentication. The `Authorization` header should contain a user ID:

```bash
# REST
curl http://localhost:3000/api/targets \
  -H "Authorization: Bearer user-123"

# GraphQL
curl -X POST http://localhost:3000/graphql \
  -H "Authorization: Bearer user-123" \
  -d '{"query": "{ targets { id } }"}'
```

**TODO:** Replace with real JWT/OAuth authentication.

---

## 🧪 Testing

### Test REST Endpoint

```bash
# Create a target
curl -X POST http://localhost:3000/api/targets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-user" \
  -d '{
    "name": "Test Target",
    "address": "https://example.com"
  }'

# Should return 201 Created with target object
```

### Test GraphQL Endpoint

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer test-user" \
  -d '{
    "query": "mutation { createTarget(input: {name:\"Test\",address:\"https://example.com\"}) { id name } }"
  }'

# Should return 200 with data object
```

### Interactive Testing

1. **REST:** Use Postman, Insomnia, or curl
2. **GraphQL:** Visit `http://localhost:3000/graphql` for GraphQL Playground

---

## 🐛 Troubleshooting

### Server Won't Start

```bash
# Check if port is already in use
lsof -ti:3000 | xargs kill -9

# Check environment variables
echo $DATABASE_URL
echo $PORT

# Check logs
bun run dev
```

### GraphQL Playground Not Loading

1. Ensure server is running: `curl http://localhost:3000/health`
2. Visit `http://localhost:3000/graphql` (not `/graphql/`)
3. Check browser console for errors

### REST Endpoints Return 404

1. Check endpoint path matches exactly
2. Ensure HTTP method is correct (GET, POST, etc.)
3. Check authorization header is included

### Service Not Available (503)

This means the service wasn't loaded from the DI container:

```bash
# Check your service configuration
cat service-wiring/development.json

# Ensure services are enabled
{
  "services": {
    "IMonitorService": { ... },    # ← Must be configured
    "IAlertingService": { ... },   # ← Must be configured
    "INotificationService": { ... }# ← Must be configured
  }
}
```

---

## 📖 Full Documentation

- **DRY Architecture:** See `DRY-ARCHITECTURE.md`
- **API Comparison:** See `../API-COMPARISON.md`
- **Deployment:** See `README.md`

---

## 🎯 Next Steps

1. **Try the GraphQL Playground** - Visit `http://localhost:3000/graphql`
2. **Test REST endpoints** - Use curl or Postman
3. **Implement authentication** - Replace mock auth with real JWT
4. **Add rate limiting** - Protect endpoints from abuse
5. **Generate OpenAPI docs** - For REST API documentation

**Happy coding!** 🚀
