# 🚀 START HERE - Network Monitor API

**Your headless API server with REST, GraphQL, and auto-launching documentation!**

---

## ⚡ Quick Start (30 seconds)

```bash
# 1. Install dependencies (if you haven't already)
bun install

# 2. Start the API server
cd apps/api
bun run dev

# 3. Your browser automatically opens the API documentation! 🎉
```

**That's it!** The server is running and the docs are open in your browser.

---

## 🌟 What Just Happened?

When you ran `bun run dev`, the server:

1. ✅ Initialized all services (Monitor, Alerting, Notification)
2. ✅ Connected to the database
3. ✅ Started REST API on `http://localhost:3000/api`
4. ✅ Started GraphQL API on `http://localhost:3000/graphql`
5. ✅ **Automatically opened API docs in your browser!**

---

## 📖 Your Documentation Options

### Option 1: Swagger UI (Auto-Opens!) ⭐ RECOMMENDED

**URL:** `http://localhost:3000/api/docs`

**What you get:**

- 📘 Interactive API explorer
- 🧪 Test endpoints directly in browser
- 📝 Auto-generated code examples (cURL, JS, Python)
- 🎨 Beautiful modern UI

**How to use:**

1. Click any endpoint (e.g., "POST /api/targets")
2. Click "Try it out"
3. Fill in the request body
4. Click "Execute"
5. See response immediately!

---

### Option 2: GraphQL Playground

**URL:** `http://localhost:3000/graphql`

**What you get:**

- 🎮 Interactive GraphQL IDE
- ✨ Auto-complete queries
- 📚 Schema explorer
- 🔍 Documentation browser

**Example query:**

```graphql
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
```

---

### Option 3: Postman Collection

**File:** `postman-collection.json`

**Import steps:**

1. Open Postman
2. Click "Import"
3. Select `apps/api/postman-collection.json`
4. Done!

**Includes:**

- ✅ All REST endpoints
- ✅ Pre-configured auth
- ✅ Test scripts
- ✅ Environment variables

---

### Option 4: Insomnia Collection

**File:** `insomnia-collection.json`

**Import steps:**

1. Open Insomnia
2. Import → File
3. Select `apps/api/insomnia-collection.json`
4. Choose "Development" environment

**Includes:**

- ✅ All endpoints
- ✅ Dev & Prod environments
- ✅ Template variables

---

## 🎯 Try Your First API Call

### Using Swagger UI (Easiest!)

1. Server should already be open at `/api/docs`
2. Scroll to "Targets" section
3. Click **"POST /api/targets"**
4. Click **"Try it out"**
5. Use this body:

   ```json
   {
     "name": "Google DNS",
     "address": "https://8.8.8.8"
   }
   ```

6. Click **"Execute"**
7. See your created target! ✅

### Using cURL

```bash
curl -X POST http://localhost:3000/api/targets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer user-123" \
  -d '{
    "name": "Google DNS",
    "address": "https://8.8.8.8"
  }'
```

### Using GraphQL Playground

1. Visit `http://localhost:3000/graphql`
2. Type this mutation:

   ```graphql
   mutation {
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

3. Press Ctrl+Enter
4. See your created target! ✅

---

## 🗺️ What's Available?

### REST API Endpoints

**Targets:**

- `GET /api/targets` - List all targets
- `POST /api/targets` - Create target
- `GET /api/targets/:id` - Get target
- `PUT /api/targets/:id` - Update target
- `DELETE /api/targets/:id` - Delete target
- `POST /api/targets/:id/start` - Start monitoring
- `POST /api/targets/:id/stop` - Stop monitoring
- `POST /api/targets/:id/test` - Run speed test

**Alert Rules:**

- `GET /api/alert-rules/target/:id` - Get rules
- `POST /api/alert-rules` - Create rule
- `PUT /api/alert-rules/:id` - Update rule
- `DELETE /api/alert-rules/:id` - Delete rule

**Incidents:**

- `GET /api/incidents/target/:id` - Get incidents
- `POST /api/incidents/:id/resolve` - Resolve incident

**Notifications:**

- `GET /api/notifications/user/:id` - Get notifications
- `POST /api/notifications/:id/read` - Mark as read

**Push Subscriptions:**

- `POST /api/push-subscriptions` - Create subscription

**Health:**

- `GET /health` - Health check

### GraphQL API

**All of the above, plus:**

- ✅ Nested queries (get target + rules + results in one request)
- ✅ Flexible field selection (no over-fetching)
- ✅ Subscriptions (coming soon - real-time updates)

---

## 🎓 Which Should You Use?

### For Web Development (TypeScript)

→ Use `apps/web/` with **tRPC** (fastest development)

### For Mobile Apps (iOS/Android)

→ Use `apps/api/` with **REST** (universal support)

### For Complex Queries

→ Use `apps/api/` with **GraphQL** (efficient data fetching)

### For Third-Party Integrations

→ Use `apps/api/` with **REST** (industry standard)

**All use the same backend services - no code duplication!**

---

## 📚 Documentation Files

Everything you need:

| File | Purpose |
|------|---------|
| `START-HERE.md` | ⭐ This file - quick start |
| `README.md` | Complete usage guide |
| `API-QUICK-START.md` | Quick reference |
| `COLLECTIONS-GUIDE.md` | Detailed tool comparison |
| `DRY-ARCHITECTURE.md` | Architecture deep dive |
| `DOCUMENTATION-SUMMARY.md` | What was implemented |
| `openapi.yaml` | OpenAPI specification |
| `postman-collection.json` | Postman collection |
| `insomnia-collection.json` | Insomnia collection |

---

## 🐛 Troubleshooting

### Server Won't Start

```bash
# Kill any process using port 3000
lsof -ti:3000 | xargs kill -9

# Try again
bun run dev
```

### Browser Didn't Auto-Open

**It's OK!** Just visit manually:

```
http://localhost:3000/api/docs
```

Auto-launch only works in development mode.

### Can't See Endpoints in Swagger UI

1. Check server is running: `curl http://localhost:3000/health`
2. Check spec loads: `curl http://localhost:3000/api/docs/spec.yaml`
3. Refresh your browser
4. Check browser console for errors

---

## 🎯 Next Steps

1. **Explore the docs** - Already open in your browser!
2. **Try an endpoint** - Create a target using Swagger UI
3. **Import to Postman/Insomnia** - For daily development
4. **Try GraphQL** - Visit `/graphql` for the playground
5. **Read the guides** - Learn about DRY architecture

---

## 💡 Cool Features

### Auto-Launching Documentation

In dev mode, the server automatically opens your browser to `/api/docs`:

```bash
bun run dev
# 🚀 Opens browser automatically!
```

### Multiple Environments

Switch between dev and prod easily:

```bash
# Development
bun run dev

# Production  
NODE_ENV=production bun run start
```

### Code Generation

Generate client SDKs from the OpenAPI spec:

```bash
# TypeScript
npx openapi-typescript http://localhost:3000/api/docs/spec.yaml

# Python
openapi-generator generate -i http://localhost:3000/api/docs/spec.yaml -g python
```

### Shared Service Layer

All three API styles (REST, GraphQL, tRPC) call the **same services**:

```typescript
// All three call MonitorService.createTarget():
MonitorService → TargetRepository → Database

// ✅ One implementation
// ✅ Three API styles
// ✅ Zero duplication!
```

---

## ❓ Questions?

- **How does this work?** → Read `DRY-ARCHITECTURE.md`
- **Which tool should I use?** → Read `COLLECTIONS-GUIDE.md`
- **REST vs GraphQL vs tRPC?** → Read `../API-COMPARISON.md`
- **Quick API reference?** → Read `API-QUICK-START.md`

---

## 🎉 You're Ready

Your API server is running with:

- ✅ REST API endpoints
- ✅ GraphQL API with playground
- ✅ Auto-launching Swagger UI
- ✅ Postman collection
- ✅ Insomnia collection
- ✅ Complete documentation

**Just run `bun run dev` and start exploring!** 🚀

---

**Pro tip:** Bookmark `http://localhost:3000/api/docs` - you'll be using it a lot! 😊
