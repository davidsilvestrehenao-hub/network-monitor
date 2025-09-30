# Network Monitor API Documentation

## Overview

The Network Monitor API provides endpoints for monitoring internet connection quality, managing targets, configuring alerts, and handling notifications. The API uses pRPC (Procedure Remote Procedure Call) for type-safe communication.

## Base URL

- **Development**: `http://localhost:3000/api/prpc/`
- **Production**: `https://your-domain.com/api/prpc/`

## Authentication

Currently using mock authentication. All endpoints are accessible without authentication.

## API Collections

### Import Collections

- **Insomnia**: Import `insomnia-collection.json` into Insomnia
- **Postman**: Import `postman-collection.json` into Postman
- **OpenAPI**: Use `openapi.yaml` for Swagger UI or other OpenAPI tools

## Endpoints

### Target Management

| Method | Endpoint        | Description                |
| ------ | --------------- | -------------------------- |
| GET    | `/getTargets`   | Get all monitoring targets |
| POST   | `/createTarget` | Create a new target        |
| GET    | `/getTarget`    | Get a specific target      |
| POST   | `/updateTarget` | Update a target            |
| POST   | `/deleteTarget` | Delete a target            |

### Monitoring

| Method | Endpoint            | Description                   |
| ------ | ------------------- | ----------------------------- |
| GET    | `/getTargetResults` | Get speed test results        |
| GET    | `/getActiveTargets` | Get active monitoring targets |
| POST   | `/runSpeedTest`     | Run a speed test              |
| POST   | `/startMonitoring`  | Start monitoring a target     |
| POST   | `/stopMonitoring`   | Stop monitoring a target      |

### Alerts

| Method | Endpoint           | Description                  |
| ------ | ------------------ | ---------------------------- |
| POST   | `/createAlertRule` | Create an alert rule         |
| GET    | `/getAlertRules`   | Get alert rules for a target |
| POST   | `/updateAlertRule` | Update an alert rule         |
| POST   | `/deleteAlertRule` | Delete an alert rule         |
| GET    | `/getIncidents`    | Get incidents for a target   |
| POST   | `/resolveIncident` | Resolve an incident          |

### Notifications

| Method | Endpoint                      | Description                    |
| ------ | ----------------------------- | ------------------------------ |
| GET    | `/getNotifications`           | Get notifications for a user   |
| POST   | `/markNotificationAsRead`     | Mark notification as read      |
| POST   | `/markAllNotificationsAsRead` | Mark all notifications as read |
| POST   | `/createPushSubscription`     | Create push subscription       |
| GET    | `/getPushSubscriptions`       | Get push subscriptions         |
| POST   | `/deletePushSubscription`     | Delete push subscription       |
| POST   | `/sendPushNotification`       | Send push notification         |

### Authentication

| Method | Endpoint           | Description                 |
| ------ | ------------------ | --------------------------- |
| POST   | `/signIn`          | Sign in user                |
| POST   | `/signUp`          | Sign up user                |
| POST   | `/signOut`         | Sign out user               |
| GET    | `/getCurrentUser`  | Get current user            |
| GET    | `/getSession`      | Get current session         |
| GET    | `/isAuthenticated` | Check authentication status |

## Data Models

### Target

```typescript
interface Target {
  id: string;
  name: string;
  address: string;
  speedTestResults: SpeedTestResult[];
  alertRules: AlertRule[];
}
```

### SpeedTestResult

```typescript
interface SpeedTestResult {
  id: number;
  ping?: number;
  download?: number;
  status: "SUCCESS" | "FAILURE";
  error?: string;
  createdAt: string;
}
```

### AlertRule

```typescript
interface AlertRule {
  id: number;
  name: string;
  metric: "ping" | "download";
  condition: "GREATER_THAN" | "LESS_THAN";
  threshold: number;
  enabled: boolean;
}
```

## Example Usage

### Create a Target

```bash
curl -X POST http://localhost:3000/api/prpc/createTarget \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Google DNS",
    "address": "https://8.8.8.8"
  }'
```

### Get All Targets

```bash
curl http://localhost:3000/api/prpc/getTargets
```

### Run a Speed Test

```bash
curl -X POST http://localhost:3000/api/prpc/runSpeedTest \
  -H "Content-Type: application/json" \
  -d '{
    "targetId": "cmfzxab7p0003rrntljv7rhka",
    "timeout": 30000
  }'
```

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `500` - Internal Server Error

Error responses include:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

## Rate Limiting

Currently no rate limiting is implemented. This will be added in future versions.

## Testing

Use the provided collections to test the API:

1. **Insomnia**: Import `insomnia-collection.json`
2. **Postman**: Import `postman-collection.json`
3. **OpenAPI**: Use `openapi.yaml` with Swagger UI

## Development

To run the API locally:

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# The API will be available at http://localhost:3000/api/prpc/
```

## Support

For issues and questions, please refer to the project repository or create an issue.
