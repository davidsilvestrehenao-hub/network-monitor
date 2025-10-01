# API Collections & Documentation Guide

Complete guide for testing the Network Monitor API using various tools.

## 📚 Available Documentation

The API server provides **four ways** to explore and test the API:

| Tool | Format | Best For | URL/File |
|------|--------|----------|----------|
| **Scalar/Swagger UI** | Web UI | Interactive testing | `http://localhost:3000/api/docs` |
| **GraphQL Playground** | Web UI | GraphQL queries | `http://localhost:3000/graphql` |
| **Postman** | Collection | Team collaboration | `postman-collection.json` |
| **Insomnia** | Collection | Personal testing | `insomnia-collection.json` |

---

## 🚀 Quick Start

### 1. Start the API Server

```bash
cd apps/api
bun run dev
```

**In development mode, the API documentation will automatically open in your browser!**

You should see:

```
🚀 API Server is now running
📚 Available Protocols:
  ✅ REST API - Standard HTTP/JSON
  ✅ GraphQL - Flexible queries and mutations

📖 Documentation:
  📘 OpenAPI/Swagger: http://localhost:3000/api/docs
  🎮 GraphQL Playground: http://localhost:3000/graphql
  📄 Postman Collection: apps/api/postman-collection.json
  📄 Insomnia Collection: apps/api/insomnia-collection.json

🚀 Opening API documentation in browser: http://localhost:3000/api/docs
```

### 2. Choose Your Tool

Pick the documentation tool you prefer:

- **Web-based?** → Visit `http://localhost:3000/api/docs`
- **GraphQL?** → Visit `http://localhost:3000/graphql`
- **Postman user?** → Import `postman-collection.json`
- **Insomnia user?** → Import `insomnia-collection.json`

---

## 📘 Option 1: OpenAPI/Swagger UI (Scalar)

### What You Get

A beautiful, modern API documentation interface with:

- ✅ Interactive API explorer
- ✅ Try-it-now functionality
- ✅ Automatic request/response examples
- ✅ Schema validation
- ✅ cURL command generation
- ✅ Multiple language code examples

### How to Use

1. **Visit** `http://localhost:3000/api/docs`
2. **Browse** endpoints in the sidebar
3. **Try** any endpoint with the "Send" button
4. **Copy** generated cURL commands

### Features

- **Search**: Find endpoints quickly
- **Filtering**: Filter by tags (Targets, Alerts, etc.)
- **Authentication**: Set Bearer token in the UI
- **Dark Mode**: Beautiful dark/light theme
- **Code Generation**: Get examples in curl, JavaScript, Python, etc.

### Example Workflow

1. Click on "Targets" → "Create Target"
2. Fill in the request body:

   ```json
   {
     "name": "Google DNS",
     "address": "https://8.8.8.8"
   }
   ```

3. Add Authorization header: `Bearer user-123`
4. Click "Send"
5. See the response immediately

---

## 🎮 Option 2: GraphQL Playground

### What You Get

- ✅ Interactive GraphQL IDE
- ✅ Auto-complete queries
- ✅ Documentation explorer
- ✅ Query history
- ✅ Variable editor

### How to Use

1. **Visit** `http://localhost:3000/graphql`
2. **Type** your query (auto-complete helps!)
3. **Run** with Ctrl+Enter
4. **Explore** schema in the Docs panel

### Example Queries

#### Simple Query

```graphql
query {
  targets {
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
      createdAt
    }
    alertRules {
      name
      threshold
      enabled
    }
  }
  unresolvedIncidents {
    description
    timestamp
  }
}
```

#### Mutation with Variables

```graphql
mutation CreateTarget($input: CreateTargetInput!) {
  createTarget(input: $input) {
    id
    name
    address
  }
}

# Variables (bottom panel):
{
  "input": {
    "name": "Google DNS",
    "address": "https://8.8.8.8"
  }
}
```

---

## 📮 Option 3: Postman Collection

### Import the Collection

1. Open Postman
2. Click "Import" → "File"
3. Select `apps/api/postman-collection.json`
4. Collection imported! ✅

### Features

- ✅ Organized by category (Targets, Alerts, Incidents, etc.)
- ✅ Pre-configured requests with examples
- ✅ Environment variables
- ✅ Auto-saves target IDs for chaining requests
- ✅ Test scripts included

### Pre-Configured Variables

The collection includes these variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `baseUrl` | `http://localhost:3000` | API server URL |
| `authToken` | `user-123` | Auth token (mock) |
| `targetId` | (auto-set) | Current target ID |
| `alertRuleId` | (auto-set) | Current alert rule ID |
| `userId` | `user-123` | Current user ID |

### Workflow Example

1. **Create Target** - Auto-saves `targetId` variable
2. **Start Monitoring** - Uses saved `targetId`
3. **Create Alert Rule** - Auto-saves `alertRuleId`
4. **Get Incidents** - Uses saved `targetId`

### Updating Variables

Click the collection → "Variables" tab to update:

- Change `baseUrl` for production testing
- Update `authToken` when implementing real auth

---

## 🛋️ Option 4: Insomnia Collection

### Import the Collection

1. Open Insomnia
2. Click "Create" → "Import From" → "File"
3. Select `apps/api/insomnia-collection.json`
4. Collection imported! ✅

### Features

- ✅ Organized folder structure
- ✅ Multiple environments (Development, Production)
- ✅ Template variables
- ✅ Request chaining
- ✅ Code generation

### Environments

The collection includes two environments:

#### Development

```json
{
  "baseUrl": "http://localhost:3000",
  "authToken": "user-123",
  "userId": "user-123"
}
```

#### Production

```json
{
  "baseUrl": "https://api.networkmonitor.example.com",
  "authToken": "",
  "userId": ""
}
```

### Switching Environments

Click the environment dropdown → Select "Development" or "Production"

### Workflow Example

1. Select "Development" environment
2. Run "Create Target" request
3. Copy the returned `id` from response
4. Paste into `targetId` environment variable
5. Run "Start Monitoring" request

---

## 🔐 Authentication

All collections use **Bearer token** authentication.

### Current (Mock Auth)

```bash
Authorization: Bearer user-123
```

The user ID is extracted from the Bearer token.

### Future (Real Auth)

When implementing real authentication:

1. **Get JWT token** from auth endpoint
2. **Update** `authToken` variable
3. **All requests** automatically include it

Example:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🧪 Testing Workflows

### Complete Target Management Flow

#### Using Postman/Insomnia

1. **Create Target**
   - Request: `POST /api/targets`
   - Body: `{ "name": "Google", "address": "https://google.com" }`
   - ✅ Save returned `id`

2. **Start Monitoring**
   - Request: `POST /api/targets/{id}/start`
   - Body: `{ "intervalMs": 30000 }`

3. **Run Speed Test**
   - Request: `POST /api/targets/{id}/test`

4. **Create Alert Rule**
   - Request: `POST /api/alert-rules`
   - Body: `{ "name": "High Ping", "targetId": "{id}", ... }`

5. **Check Incidents**
   - Request: `GET /api/incidents/target/{id}`

#### Using Swagger UI

1. Click "Targets" → "POST /api/targets"
2. Click "Try it out"
3. Fill in the request body
4. Add auth header
5. Click "Execute"
6. See response immediately

#### Using GraphQL Playground

```graphql
mutation {
  createTarget(input: {
    name: "Google"
    address: "https://google.com"
  }) {
    id
    name
  }
}
```

---

## 📊 Comparing the Tools

### Swagger UI (Scalar)

**Pros:**

- ✅ No installation needed (web-based)
- ✅ Beautiful modern UI
- ✅ Auto-generated from OpenAPI spec
- ✅ Perfect for documentation
- ✅ Auto-launches in dev mode

**Cons:**

- ❌ No request history
- ❌ No collections/folders
- ❌ Can't save custom requests

**Best for:** Quick testing, sharing docs, onboarding

### GraphQL Playground

**Pros:**

- ✅ Built-in auto-complete
- ✅ Schema explorer
- ✅ Query history
- ✅ Variables support

**Cons:**

- ❌ GraphQL only (not REST)
- ❌ Different syntax than REST

**Best for:** GraphQL-first clients, complex queries

### Postman

**Pros:**

- ✅ Industry standard
- ✅ Team collaboration
- ✅ Advanced features (tests, scripts, monitoring)
- ✅ Environment management
- ✅ Request history

**Cons:**

- ❌ Requires installation
- ❌ Heavy application

**Best for:** Professional teams, complex workflows

### Insomnia

**Pros:**

- ✅ Lightweight
- ✅ Beautiful UI
- ✅ GraphQL + REST support
- ✅ Environment management
- ✅ Free and open-source

**Cons:**

- ❌ Requires installation
- ❌ Smaller community than Postman

**Best for:** Individual developers, modern workflows

---

## 🎯 Recommendations

### For Learning/Exploring

→ Use **Swagger UI** (`http://localhost:3000/api/docs`)

- Auto-launches in dev mode
- No setup required
- See all endpoints at once

### For Development

→ Use **Insomnia** or **Postman**

- Save custom requests
- Environment switching
- Request history

### For GraphQL

→ Use **GraphQL Playground** (`http://localhost:3000/graphql`)

- Best GraphQL experience
- Schema explorer
- Auto-complete

### For CI/CD

→ Use **cURL** with OpenAPI spec

- Scriptable
- No GUI needed
- Generate from spec

---

## 📥 Download Links

### Postman

- **File:** `apps/api/postman-collection.json`
- **Import:** Postman → Import → Select file
- **Download Postman:** <https://www.postman.com/downloads/>

### Insomnia

- **File:** `apps/api/insomnia-collection.json`
- **Import:** Insomnia → Import → Select file
- **Download Insomnia:** <https://insomnia.rest/download>

### OpenAPI Spec

- **YAML:** `http://localhost:3000/api/docs/spec.yaml`
- **JSON:** `http://localhost:3000/api/docs/spec.json`
- **File:** `apps/api/openapi.yaml`

---

## 🔧 Customization

### Updating Postman Collection

1. Make changes in Postman
2. Export collection
3. Replace `postman-collection.json`

### Updating Insomnia Collection

1. Make changes in Insomnia
2. Export → "Export Insomnia Collection"
3. Replace `insomnia-collection.json`

### Updating OpenAPI Spec

1. Edit `apps/api/openapi.yaml`
2. Restart server
3. Refresh Swagger UI

---

## 🐛 Troubleshooting

### Swagger UI Not Loading

**Problem:** Visit `/api/docs` but see blank page

**Solutions:**

```bash
# Check server is running
curl http://localhost:3000/health

# Check OpenAPI spec loads
curl http://localhost:3000/api/docs/spec.yaml

# Check browser console for errors
# (Open DevTools → Console)
```

### Postman Requests Failing

**Problem:** All requests return errors

**Solutions:**

1. Check `baseUrl` variable matches your server
2. Update `authToken` if needed
3. Ensure server is running: `bun run dev`
4. Check request body is valid JSON

### Browser Doesn't Auto-Launch

**Problem:** Server starts but browser doesn't open

**Expected behavior:** Only auto-launches in development mode

**Manual access:**

```
http://localhost:3000/api/docs
```

### Collections Won't Import

**Problem:** Postman/Insomnia can't import collection

**Solutions:**

1. Ensure you're importing the correct file:
   - Postman → `postman-collection.json`
   - Insomnia → `insomnia-collection.json`
2. Check file exists in `apps/api/`
3. Try dragging file into the app window

---

## 🎓 Learning Path

### Day 1: Explore with Swagger UI

1. Start server: `bun run dev`
2. Browser auto-opens to `/api/docs`
3. Try the "Health Check" endpoint
4. Try "Create Target" endpoint
5. Explore other endpoints

### Day 2: Import into Postman/Insomnia

1. Import the collection
2. Run through the "Targets" folder
3. Try creating and managing targets
4. Experiment with alert rules

### Day 3: Try GraphQL

1. Visit `/graphql`
2. Run example queries
3. Try mutations
4. Explore the schema

### Day 4: Integrate into Your App

1. Use the API from your mobile app
2. Or use tRPC from TypeScript web app
3. All use the same backend!

---

## 🌟 Pro Tips

### Postman Tips

1. **Chain requests** with test scripts:

   ```javascript
   // Save target ID from response
   const response = pm.response.json();
   pm.collectionVariables.set('targetId', response.id);
   ```

2. **Use environments** for dev/staging/prod

3. **Generate code** → Click "Code" button for curl/JavaScript/Python examples

### Insomnia Tips

1. **Use templates** with `{{ _.variable }}`
2. **Switch environments** easily
3. **Generate code** for any language

### Swagger UI Tips

1. **Authorize once** at the top (🔒 button)
2. **Download** as cURL, JavaScript, Python
3. **View schema** for each endpoint
4. **Test directly** in the browser

### GraphQL Tips

1. **Use Ctrl+Space** for auto-complete
2. **Click on types** to explore schema
3. **Save queries** in the History tab
4. **Use variables** for dynamic values

---

## 📦 Sharing Collections

### With Your Team (Postman)

1. **Export** your customized collection
2. **Commit** to version control
3. **Team imports** the latest version

### With Clients (OpenAPI)

1. **Share** the OpenAPI spec URL
2. Clients **generate** their own SDK:

   ```bash
   # Generate TypeScript SDK
   openapi-generator generate -i http://localhost:3000/api/docs/spec.yaml -g typescript-fetch
   
   # Generate Python SDK
   openapi-generator generate -i http://localhost:3000/api/docs/spec.yaml -g python
   
   # Generate Go SDK
   openapi-generator generate -i http://localhost:3000/api/docs/spec.yaml -g go
   ```

---

## 🎯 Next Steps

1. **Try the auto-launched docs** - Start server and explore
2. **Import into your favorite tool** - Postman or Insomnia
3. **Test the full workflow** - Create target → Monitor → Alert
4. **Customize for your needs** - Add your own requests
5. **Share with team** - Export and commit updated collections

---

## 📚 Additional Resources

- **OpenAPI Spec:** `apps/api/openapi.yaml`
- **Postman Collection:** `apps/api/postman-collection.json`
- **Insomnia Collection:** `apps/api/insomnia-collection.json`
- **Quick Start:** `API-QUICK-START.md`
- **DRY Architecture:** `DRY-ARCHITECTURE.md`
- **API Comparison:** `../API-COMPARISON.md`

---

## 🎉 Summary

You now have **complete API documentation** with:

- ✅ **Auto-launching Swagger UI** in dev mode
- ✅ **Interactive GraphQL Playground**
- ✅ **Postman collection** with test scripts
- ✅ **Insomnia collection** with environments
- ✅ **OpenAPI 3.0 spec** for code generation

**All tools test the same backend** - choose what works best for you!

Happy testing! 🚀
