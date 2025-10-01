# 🔌 API Documentation

## **Overview**

Network Monitor uses **pRPC** (Prisma-like RPC) for type-safe server functions. All API calls are fully type-safe from frontend to backend with automatic TypeScript inference.

---

## 🏗️ **Architecture**

### **pRPC Server Functions**

All API functions are defined in `apps/web/src/server/prpc.ts` and automatically exposed as type-safe RPC endpoints.

```typescript
// Server-side function (apps/web/src/server/prpc.ts)
export const createTarget = async (data: { name: string; address: string }) => {
  "use server";
  // Server-side logic here
  return target;
};

// Frontend usage (automatic type inference!)
import * as prpc from '~/server/prpc';

const target = await prpc.createTarget({ 
  name: 'Google', 
  address: 'https://google.com' 
});
// target is fully typed as Target!
```

### **Event-Driven Backend**

pRPC functions communicate with backend services via **EventBus** for loose coupling:

```
Frontend → pRPC → EventRPC → EventBus → Services → Database
```

**Benefits:**
- Type-safe end-to-end
- Zero coupling between services
- Easy to test and mock
- Ready for microservices

---

## 📚 **API Reference**

### **Target Management**

#### **createTarget**
Create a new monitoring target.

```typescript
function createTarget(data: {
  name: string;
  address: string;
}): Promise<Target>
```

**Example:**
```typescript
const target = await prpc.createTarget({
  name: 'Google DNS',
  address: 'https://8.8.8.8'
});
```

#### **getTargets**
Get all monitoring targets for the current user.

```typescript
function getTargets(): Promise<Target[]>
```

**Example:**
```typescript
const targets = await prpc.getTargets();
```

#### **getTarget**
Get a specific monitoring target by ID.

```typescript
function getTarget(data: { 
  id: string 
}): Promise<Target>
```

**Example:**
```typescript
const target = await prpc.getTarget({ 
  id: 'cmfzxab7p0003rrntljv7rhka' 
});
```

#### **updateTarget**
Update a monitoring target.

```typescript
function updateTarget(data: {
  id: string;
  name?: string;
  address?: string;
}): Promise<Target>
```

**Example:**
```typescript
const target = await prpc.updateTarget({
  id: 'cmfzxab7p0003rrntljv7rhka',
  name: 'Updated Name'
});
```

#### **deleteTarget**
Delete a monitoring target.

```typescript
function deleteTarget(data: { 
  id: string 
}): Promise<void>
```

**Example:**
```typescript
await prpc.deleteTarget({ 
  id: 'cmfzxab7p0003rrntljv7rhka' 
});
```

---

### **Monitoring & Speed Tests**

#### **runSpeedTest**
Run a speed test for a target.

```typescript
function runSpeedTest(data: {
  targetId: string;
  timeout?: number;
}): Promise<SpeedTestResult>
```

**Example:**
```typescript
const result = await prpc.runSpeedTest({
  targetId: 'cmfzxab7p0003rrntljv7rhka',
  timeout: 30000 // 30 seconds
});
```

#### **getTargetResults**
Get speed test results for a target.

```typescript
function getTargetResults(data: {
  targetId: string;
  limit?: number;
}): Promise<SpeedTestResult[]>
```

**Example:**
```typescript
const results = await prpc.getTargetResults({
  targetId: 'cmfzxab7p0003rrntljv7rhka',
  limit: 50
});
```

#### **startMonitoring**
Start continuous monitoring for a target.

```typescript
function startMonitoring(data: {
  targetId: string;
  intervalMs: number;
}): Promise<void>
```

**Example:**
```typescript
await prpc.startMonitoring({
  targetId: 'cmfzxab7p0003rrntljv7rhka',
  intervalMs: 30000 // Test every 30 seconds
});
```

#### **stopMonitoring**
Stop continuous monitoring for a target.

```typescript
function stopMonitoring(data: { 
  targetId: string 
}): Promise<void>
```

**Example:**
```typescript
await prpc.stopMonitoring({ 
  targetId: 'cmfzxab7p0003rrntljv7rhka' 
});
```

#### **getActiveTargets**
Get list of actively monitored target IDs.

```typescript
function getActiveTargets(): Promise<string[]>
```

**Example:**
```typescript
const activeIds = await prpc.getActiveTargets();
```

---

### **Alert Rules**

#### **createAlertRule**
Create a new alert rule.

```typescript
function createAlertRule(data: {
  targetId: string;
  name: string;
  metric: 'ping' | 'download';
  condition: 'GREATER_THAN' | 'LESS_THAN';
  threshold: number;
  enabled?: boolean;
}): Promise<AlertRule>
```

**Example:**
```typescript
const rule = await prpc.createAlertRule({
  targetId: 'cmfzxab7p0003rrntljv7rhka',
  name: 'High Ping Alert',
  metric: 'ping',
  condition: 'GREATER_THAN',
  threshold: 100, // ms
  enabled: true
});
```

#### **getAlertRules**
Get all alert rules for a target.

```typescript
function getAlertRules(data: { 
  targetId: string 
}): Promise<AlertRule[]>
```

**Example:**
```typescript
const rules = await prpc.getAlertRules({ 
  targetId: 'cmfzxab7p0003rrntljv7rhka' 
});
```

#### **updateAlertRule**
Update an alert rule.

```typescript
function updateAlertRule(data: {
  id: number;
  name?: string;
  threshold?: number;
  enabled?: boolean;
}): Promise<AlertRule>
```

**Example:**
```typescript
const rule = await prpc.updateAlertRule({
  id: 1,
  threshold: 150,
  enabled: false
});
```

#### **deleteAlertRule**
Delete an alert rule.

```typescript
function deleteAlertRule(data: { 
  id: number 
}): Promise<void>
```

**Example:**
```typescript
await prpc.deleteAlertRule({ id: 1 });
```

---

### **Incidents**

#### **getIncidents**
Get incidents for a target.

```typescript
function getIncidents(data: {
  targetId: string;
  resolved?: boolean;
}): Promise<IncidentEvent[]>
```

**Example:**
```typescript
// Get unresolved incidents
const incidents = await prpc.getIncidents({
  targetId: 'cmfzxab7p0003rrntljv7rhka',
  resolved: false
});
```

#### **getAllIncidents**
Get all incidents across all targets.

```typescript
function getAllIncidents(data: {
  resolved?: boolean;
  limit?: number;
}): Promise<IncidentEvent[]>
```

**Example:**
```typescript
const allIncidents = await prpc.getAllIncidents({
  resolved: false,
  limit: 50
});
```

#### **resolveIncident**
Mark an incident as resolved.

```typescript
function resolveIncident(data: { 
  id: number 
}): Promise<void>
```

**Example:**
```typescript
await prpc.resolveIncident({ id: 1 });
```

---

### **Notifications**

#### **getNotifications**
Get notifications for the current user.

```typescript
function getNotifications(data?: {
  read?: boolean;
  limit?: number;
}): Promise<Notification[]>
```

**Example:**
```typescript
// Get unread notifications
const notifications = await prpc.getNotifications({
  read: false,
  limit: 20
});
```

#### **markNotificationAsRead**
Mark a notification as read.

```typescript
function markNotificationAsRead(data: { 
  id: number 
}): Promise<void>
```

**Example:**
```typescript
await prpc.markNotificationAsRead({ id: 1 });
```

#### **markAllNotificationsAsRead**
Mark all notifications as read.

```typescript
function markAllNotificationsAsRead(): Promise<void>
```

**Example:**
```typescript
await prpc.markAllNotificationsAsRead();
```

---

### **Push Notifications**

#### **createPushSubscription**
Subscribe to push notifications.

```typescript
function createPushSubscription(data: {
  endpoint: string;
  p256dh: string;
  auth: string;
}): Promise<PushSubscription>
```

**Example:**
```typescript
// Get subscription from service worker
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: vapidPublicKey
});

const pushSub = await prpc.createPushSubscription({
  endpoint: subscription.endpoint,
  p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
  auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
});
```

#### **getPushSubscriptions**
Get all push subscriptions for the current user.

```typescript
function getPushSubscriptions(): Promise<PushSubscription[]>
```

**Example:**
```typescript
const subscriptions = await prpc.getPushSubscriptions();
```

#### **deletePushSubscription**
Delete a push subscription.

```typescript
function deletePushSubscription(data: { 
  id: string 
}): Promise<void>
```

**Example:**
```typescript
await prpc.deletePushSubscription({ 
  id: 'sub-123' 
});
```

---

### **Authentication**

#### **getCurrentUser**
Get the currently authenticated user.

```typescript
function getCurrentUser(): Promise<User>
```

**Example:**
```typescript
const user = await prpc.getCurrentUser();
```

#### **getSession**
Get the current session.

```typescript
function getSession(): Promise<AuthSession>
```

**Example:**
```typescript
const session = await prpc.getSession();
```

#### **isAuthenticated**
Check if user is authenticated.

```typescript
function isAuthenticated(): Promise<boolean>
```

**Example:**
```typescript
const isAuth = await prpc.isAuthenticated();
```

---

## 📦 **Type Definitions**

### **Target**

```typescript
interface Target {
  id: string;
  name: string;
  address: string;
  ownerId: string;
  speedTestResults: SpeedTestResult[];
  alertRules: AlertRule[];
}
```

### **SpeedTestResult**

```typescript
interface SpeedTestResult {
  id: string;                      // UUID
  targetId: string;
  ping: number | null;             // Latency in ms
  download: number | null;         // Download speed in Mbps
  upload: number | null;           // Upload speed in Mbps
  status: 'SUCCESS' | 'FAILURE';
  error?: string;                  // Error message if failed
  timestamp: string;               // ISO timestamp
  createdAt: string;               // ISO timestamp
}
```

### **AlertRule**

```typescript
interface AlertRule {
  id: number;
  targetId: string;
  name: string;
  metric: 'ping' | 'download';
  condition: 'GREATER_THAN' | 'LESS_THAN';
  threshold: number;
  enabled: boolean;
  triggeredEvents: IncidentEvent[];
}
```

### **IncidentEvent**

```typescript
interface IncidentEvent {
  id: number;
  timestamp: Date;
  type: 'OUTAGE' | 'ALERT';
  description: string;
  resolved: boolean;
  targetId: string;
  ruleId: number | null;
  triggeredByRule: AlertRule | null;
}
```

### **Notification**

```typescript
interface Notification {
  id: number;
  message: string;
  sentAt: Date;
  read: boolean;
  userId: string;
}
```

### **PushSubscription**

```typescript
interface PushSubscription {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userId: string;
}
```

### **User**

```typescript
interface User {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}
```

### **AuthSession**

```typescript
interface AuthSession {
  user: User;
  expires: string;
}
```

---

## 🔒 **Authentication & Authorization**

### **Current Implementation**

Currently using **mock authentication** for development:
- All endpoints accessible without real authentication
- Mock user ID: `"mock-user"`
- Session persists across requests

### **Production Implementation** (Future)

Will use **Auth.js** (formerly NextAuth):
- OAuth providers (Google, GitHub)
- Email/password authentication
- Secure session management
- JWT tokens

---

## ⚡ **Error Handling**

### **Error Response**

All errors are thrown as Error objects with descriptive messages:

```typescript
try {
  const target = await prpc.createTarget({ name: '', address: '' });
} catch (error) {
  console.error(error.message); // "Target name is required"
}
```

### **Common Error Types**

| Error | Description |
|-------|-------------|
| `Target not found` | Target ID doesn't exist |
| `User not authenticated` | No valid session |
| `Invalid input` | Validation error |
| `Database error` | Database operation failed |
| `Test timeout` | Speed test exceeded timeout |

---

## 🧪 **Testing the API**

### **From Frontend**

```typescript
import * as prpc from '~/server/prpc';

// Create target
const target = await prpc.createTarget({
  name: 'Test Target',
  address: 'https://example.com'
});

// Run test
const result = await prpc.runSpeedTest({
  targetId: target.id
});

console.log('Ping:', result.ping, 'ms');
console.log('Download:', result.download, 'Mbps');
```

### **Manual Testing**

Since pRPC functions run server-side, you can't test them with curl directly. Instead:

1. **Use the Frontend UI** - Easiest way to test
2. **Write Unit Tests** - Test server functions directly
3. **Use Browser DevTools** - Inspect network requests

---

## 📊 **API Performance**

### **Expected Response Times**

| Endpoint | Typical | Maximum |
|----------|---------|---------|
| `getTargets` | < 100ms | 500ms |
| `createTarget` | < 200ms | 1s |
| `runSpeedTest` | 5-30s | 60s |
| `getTargetResults` | < 200ms | 1s |
| `createAlertRule` | < 100ms | 500ms |

### **Rate Limiting** (Future)

Will implement rate limiting:
- **100 requests/minute** per user
- **10 speed tests/minute** per target
- **Burst allowance** of 20 requests

---

## 🔄 **Real-Time Updates**

### **Event-Driven Frontend**

Components automatically update when data changes via EventBus:

```typescript
// Component listens for events
eventBus.onTyped('TARGET_CREATED', (target) => {
  // Automatically update UI
  setTargets(prev => [...prev, target]);
});

// API call triggers event
await prpc.createTarget({ name: 'New Target', address: 'https://example.com' });
// EVENT: TARGET_CREATED is emitted
// Component automatically updates!
```

---

## 📖 **Further Reading**

- **[Architecture Guide](ARCHITECTURE.md)** - Understand the system design
- **[Quick Start](QUICK-START.md)** - Get started developing
- **[pRPC Documentation](https://solid-mediakit.com/prpc)** - Learn about pRPC

---

## 🆘 **Support**

- **Issues**: GitHub Issues
- **Questions**: Documentation or team chat
- **Feature Requests**: GitHub Discussions

---

Made with ❤️ using pRPC for type-safe, event-driven APIs

