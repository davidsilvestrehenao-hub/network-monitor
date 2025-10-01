# Scaling to Microservices with Event-Driven Architecture

## 🎯 The Scaling Problem

**Today: Single Bun Process (Monolith)**

```text
┌─────────────────────────────────────────┐
│         Single Bun Process              │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ tRPC API Router                 │   │
│  │  ↓ (calls services)            │   │
│  │ MonitorService                  │   │
│  │ AlertingService                 │   │
│  │ NotificationService             │   │
│  │  ↓                              │   │
│  │ Repositories                    │   │
│  │  ↓                              │   │
│  │ Database                        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```text

**Tomorrow: Distributed Microservices**

```text
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   API Pod    │    │  Monitor Pod │    │ Alerting Pod │
│              │    │              │    │              │
│ tRPC         │    │ Monitor      │    │ Alerting     │
│ Router       │    │ Service      │    │ Service      │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │   Message Broker  │
                  │   (RabbitMQ/      │
                  │    Kafka/Redis)   │
                  └──────────────────┘
```text

---

## ✅ Event-Driven Enables Scaling with Minimal Rework

### Without Event-Driven (Direct Calls) ❌

**Current Code:**

```typescript
// tRPC procedure with direct service call
export const targetsRouter = t.router({
  create: t.procedure.mutation(async ({ ctx, data }) => {
  const target = await monitorService.createTarget(data);  // In-process call
  return target;
};
```text

**Problem when scaling:**

- ❌ Can't separate MonitorService to another container
- ❌ Would need to rewrite entire communication layer
- ❌ Would need to add HTTP/gRPC clients everywhere
- ❌ Would need to handle network errors everywhere
- ❌ Would need to change every single endpoint
- ❌ **Massive refactoring required**

### With Event-Driven (Event Bus) ✅

**Current Code:**

```typescript
// tRPC procedure with service layer (recommended)
export const targetsRouter = t.router({
  create: t.procedure.mutation(async ({ ctx, data }) => {
  const eventRPC = new EventRPC(eventBus, logger);
  const target = await eventRPC.request(
    "TARGET_CREATE_REQUESTED",
    "TARGET_CREATED",
    "TARGET_CREATE_FAILED",
    data
  );
  return target;
};
```text

**When scaling:**

- ✅ Code stays **exactly the same**
- ✅ Just swap `EventBus` implementation
- ✅ Events automatically flow through message broker
- ✅ Network errors handled by message broker
- ✅ **Zero code changes in business logic**
- ✅ **Minimal refactoring required**

---

## 🔧 The Migration Path

### Phase 1: Current State (Monolith)

```typescript
// Uses in-memory event bus
const eventBus = new EventBus(); // In-memory, same process
```text

### Phase 2: Add Message Broker (Still Monolith)

```typescript
// Swap to distributed event bus - NO OTHER CODE CHANGES!
const eventBus = new RabbitMQEventBus(config);
// or
const eventBus = new KafkaEventBus(config);
// or
const eventBus = new RedisEventBus(config);
```text

### Phase 3: Split into Microservices

```typescript
// Each service in its own container
// All using the same event bus interface
```text

---

## 📦 Implementation Examples

### Step 1: Create Message Broker Event Bus

**New File: `src/lib/services/concrete/RabbitMQEventBus.ts`**

```typescript
import type { IEventBus } from "../interfaces/IEventBus";
import { connect, type Connection, type Channel } from "amqplib";

/**
 * RabbitMQ-based event bus for distributed communication
 * 
 * Drop-in replacement for in-memory EventBus
 * Same interface, distributed backend
 */
export class RabbitMQEventBus implements IEventBus {
  private connection?: Connection;
  private channel?: Channel;
  private listeners: Map<string, Set<(data?: unknown) => void>> = new Map();
  
  constructor(private rabbitMQUrl: string) {
    this.connect();
  }

  private async connect(): Promise<void> {
    this.connection = await connect(this.rabbitMQUrl);
    this.channel = await this.connection.createChannel();
    
    // Declare exchange for pub/sub
    await this.channel.assertExchange("events", "topic", { durable: true });
  }

  // Same interface as EventBus - no code changes needed!
  emit(event: string, data?: unknown): void {
    if (!this.channel) throw new Error("Not connected");
    
    // Publish to RabbitMQ instead of in-memory
    this.channel.publish(
      "events",
      event,
      Buffer.from(JSON.stringify(data)),
      { persistent: true }
    );
  }

  emitTyped<T>(event: string, data: T): void {
    this.emit(event, data);
  }

  on<T = unknown>(event: string, handler: (data?: T) => void): void {
    if (!this.channel) throw new Error("Not connected");
    
    // Subscribe to RabbitMQ instead of in-memory
    this.channel.assertQueue("", { exclusive: true }).then(({ queue }) => {
      this.channel!.bindQueue(queue, "events", event);
      
      this.channel!.consume(queue, (msg) => {
        if (msg) {
          const data = JSON.parse(msg.content.toString());
          handler(data);
          this.channel!.ack(msg);
        }
      });
    });
    
    // Also keep local registry for management
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler as (data?: unknown) => void);
  }

  onTyped<T>(event: string, handler: (data: T) => void): void {
    this.on(event, handler);
  }

  // Implement other IEventBus methods...
  off<T = unknown>(event: string, handler: (data?: T) => void): void {
    // Implementation
  }

  once<T = unknown>(event: string, handler: (data?: T) => void): void {
    // Implementation
  }

  onceTyped<T>(event: string, handler: (data: T) => void): void {
    // Implementation
  }

  removeAllListeners(event?: string): void {
    // Implementation
  }

  async close(): Promise<void> {
    await this.channel?.close();
    await this.connection?.close();
  }
}
```text

### Step 2: Configuration-Based Switching

**Update `service-config.json`:**

```json
{
  "name": "Production Configuration",
  "environment": "production",
  "services": {
    "IEventBus": {
      "implementation": "RabbitMQEventBus",
      "config": {
        "url": "amqp://rabbitmq:5672"
      }
    }
  }
}
```text

**Container registration:**

```typescript
// src/lib/container/service-config.ts
import { RabbitMQEventBus } from "../services/concrete/RabbitMQEventBus";

export const productionServiceConfig = {
  [TYPES.IEventBus]: {
    factory: createServiceFactory<IEventBus>(
      () => new RabbitMQEventBus(process.env.RABBITMQ_URL!)
    ),
    dependencies: [],
    singleton: true,
    description: "Distributed event bus via RabbitMQ",
  },
  // ... other services
};
```text

### Step 3: Zero Code Changes in Business Logic

**Your existing code works unchanged:**

```typescript
// tRPC procedures - NO CHANGES NEEDED
export const targetsRouter = t.router({
  create: t.procedure.mutation(async ({ ctx, data }) => {
  const ctx = await getContext();
  const eventRPC = new EventRPC(ctx.services.eventBus, ctx.services.logger);
  
  // Same code works with in-memory OR distributed event bus!
  const target = await eventRPC.request(
    "TARGET_CREATE_REQUESTED",
    "TARGET_CREATED",
    "TARGET_CREATE_FAILED",
    data
  );
  
  return target;
};

// Services - NO CHANGES NEEDED
private async handleTargetCreateRequested(data) {
  if (!data) return;
  
  const target = await this.createTarget(data);
  
  // Same code works with in-memory OR distributed event bus!
  this.eventBus.emit(`TARGET_CREATED_${data.requestId}`, target);
}
```text

---

## 🏗️ Kubernetes Deployment Architecture

### Deployment Configuration

**1. API Service (tRPC Router)**

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: network-monitor-api
spec:
  replicas: 3  # Scale horizontally!
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: network-monitor-api:latest
        env:
        - name: SERVICE_TYPE
          value: "api"
        - name: RABBITMQ_URL
          value: "amqp://rabbitmq:5672"
        - name: DATABASE_URL
          value: "postgresql://postgres:5432/network_monitor"
        ports:
        - containerPort: 3000
---
apiVersion: v1
kind: Service
metadata:
  name: api-service
spec:
  selector:
    app: api
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
```text

**2. Monitor Service (Background Jobs)**

```yaml
# k8s/monitor-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: network-monitor-worker
spec:
  replicas: 5  # Scale based on workload!
  selector:
    matchLabels:
      app: monitor-worker
  template:
    metadata:
      labels:
        app: monitor-worker
    spec:
      containers:
      - name: worker
        image: network-monitor-worker:latest
        env:
        - name: SERVICE_TYPE
          value: "monitor"
        - name: RABBITMQ_URL
          value: "amqp://rabbitmq:5672"
        - name: DATABASE_URL
          value: "postgresql://postgres:5432/network_monitor"
        resources:
          limits:
            cpu: "2"
            memory: "2Gi"
```text

**3. Alerting Service**

```yaml
# k8s/alerting-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: network-monitor-alerting
spec:
  replicas: 2
  selector:
    matchLabels:
      app: alerting
  template:
    metadata:
      labels:
        app: alerting
    spec:
      containers:
      - name: alerting
        image: network-monitor-alerting:latest
        env:
        - name: SERVICE_TYPE
          value: "alerting"
        - name: RABBITMQ_URL
          value: "amqp://rabbitmq:5672"
        - name: DATABASE_URL
          value: "postgresql://postgres:5432/network_monitor"
```text

**4. RabbitMQ Message Broker**

```yaml
# k8s/rabbitmq-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rabbitmq
spec:
  replicas: 1
  selector:
    matchLabels:
      app: rabbitmq
  template:
    metadata:
      labels:
        app: rabbitmq
    spec:
      containers:
      - name: rabbitmq
        image: rabbitmq:3-management
        ports:
        - containerPort: 5672
        - containerPort: 15672  # Management UI
---
apiVersion: v1
kind: Service
metadata:
  name: rabbitmq
spec:
  selector:
    app: rabbitmq
  ports:
  - name: amqp
    port: 5672
  - name: management
    port: 15672
```text

---

## 🚀 Scaling Benefits

### 1. **Independent Scaling**

```yaml
# Scale API based on HTTP traffic
kubectl scale deployment network-monitor-api --replicas=10

# Scale workers based on queue depth
kubectl scale deployment network-monitor-worker --replicas=20

# Scale alerting independently
kubectl scale deployment network-monitor-alerting --replicas=5
```text

### 2. **Service Isolation**

- **Crash Isolation**: If AlertingService crashes, MonitorService keeps running
- **Resource Isolation**: CPU-intensive jobs don't affect API responsiveness
- **Deployment Isolation**: Update MonitorService without touching API

### 3. **Technology Flexibility**

```typescript
// Different services can use different tech stacks!

// API Service - Bun + SolidStart
// Monitor Service - Bun (worker mode)
// Alerting Service - Node.js (for compatibility)
// Notification Service - Python (for ML models)

// All communicate via same event bus - language agnostic!
```text

### 4. **Database Sharding**

```typescript
// Each service can have its own database
const apiConfig = {
  DATABASE_URL: "postgresql://api-db:5432/api",
};

const monitorConfig = {
  DATABASE_URL: "postgresql://monitor-db:5432/monitor",
};

// Event bus coordinates across databases
```text

---

## 📊 Before & After Comparison

### Without Event-Driven (Direct Calls)

**Monolith to Microservices:**

- 🔴 Rewrite all service calls to HTTP/gRPC
- 🔴 Add client libraries everywhere
- 🔴 Handle network failures manually
- 🔴 Update every endpoint
- 🔴 **Estimated effort: 2-3 months**
- 🔴 **High risk of breaking changes**

### With Event-Driven (Event Bus)

**Monolith to Microservices:**

- ✅ Swap EventBus implementation (1 file)
- ✅ Update configuration (1 JSON file)
- ✅ Create Kubernetes manifests
- ✅ Deploy to containers
- ✅ **Estimated effort: 1-2 weeks**
- ✅ **Low risk, gradual migration**

---

## 🎯 Migration Strategy

### Phase 1: Monolith with Distributed Event Bus (Week 1)

```typescript
// Still one Bun process, but using RabbitMQ
// Proves the concept works
const eventBus = new RabbitMQEventBus(config);
```text

**Benefits:**

- Test distributed communication
- No service separation yet (low risk)
- Easy to rollback

### Phase 2: Extract Background Services (Week 2)

```typescript
// Split into two containers:
// 1. API (tRPC router)
// 2. Workers (Monitor + Alerting + Notification)

// API Container
const apiServices = ["tRPC", "Auth"];

// Worker Container
const workerServices = ["Monitor", "Alerting", "Notification"];
```text

**Benefits:**

- API stays responsive under heavy worker load
- Scale workers independently
- Still relatively simple

### Phase 3: Full Microservices (Week 3-4)

```typescript
// Split into dedicated containers:
// 1. API
// 2. Monitor Service
// 3. Alerting Service
// 4. Notification Service

// Each container only loads its services
```text

**Benefits:**

- Maximum scalability
- Independent deployments
- Service isolation

---

## 💡 Key Insights

### 1. **Event-Driven = Future-Proof**

Your code is already written in a way that **naturally scales**:

- No assumptions about process boundaries
- No assumptions about synchronous calls
- No assumptions about same-memory access

### 2. **Interface Abstraction is Key**

```typescript
// This interface works for:
// - In-memory EventBus
// - RabbitMQ EventBus
// - Kafka EventBus
// - Redis Pub/Sub
// - AWS SNS/SQS
// - Google Cloud Pub/Sub
export interface IEventBus {
  emit(event: string, data?: unknown): void;
  on(event: string, handler: (data?: unknown) => void): void;
  // ...
}
```text

### 3. **Configuration-Based Deployment**

```json
// development.json
{
  "services": {
    "IEventBus": "EventBus"  // In-memory
  }
}

// production.json
{
  "services": {
    "IEventBus": "RabbitMQEventBus"  // Distributed
  }
}

// Same code, different deployment!
```text

---

## 🎓 Real-World Example

### Company Growth Scenario

**Year 1: 100 users**

- Single Bun process
- In-memory EventBus
- SQLite database
- **Cost:** $20/month (single VPS)

**Year 2: 10,000 users**

- Single Bun process
- RabbitMQ EventBus (test distributed)
- PostgreSQL database
- **Cost:** $100/month (larger VPS)
- **Code changes:** Just config file

**Year 3: 100,000 users**

- 3 API containers
- 5 Worker containers
- 2 Alerting containers
- RabbitMQ cluster
- PostgreSQL primary + replicas
- **Cost:** $500/month (K8s cluster)
- **Code changes:** Just config file + K8s manifests

**Year 4: 1,000,000 users**

- 20 API containers (autoscaling)
- 50 Worker containers (autoscaling)
- 10 Alerting containers
- Kafka cluster (replacing RabbitMQ)
- Sharded PostgreSQL
- **Cost:** $5,000/month (K8s + managed services)
- **Code changes:** Swap to KafkaEventBus (one file)

---

## ✅ Summary

**Question:** Does event-driven architecture help with scaling to K8s containers?

**Answer:** **ABSOLUTELY YES!**

### With Event-Driven

- ✅ **Minimal rework** (weeks, not months)
- ✅ **Gradual migration** (low risk)
- ✅ **Configuration-based** (no code changes)
- ✅ **Scale independently** (right-size each service)
- ✅ **Technology flexibility** (polyglot microservices)

### Without Event-Driven

- ❌ **Massive refactoring** (months of work)
- ❌ **Big bang migration** (high risk)
- ❌ **Code rewrite** (hundreds of changes)
- ❌ **Tight coupling** (hard to split services)
- ❌ **Technology lock-in** (all services same stack)

**The event-driven architecture you implement today will save you months of refactoring when you need to scale tomorrow.**

It's not just about loose coupling - it's about **being able to grow your application without rewriting it**. 🚀

---

*Scaling to Microservices*
*Event-Driven Architecture Enables Growth*
