# 🚀 Deployment Guide

This guide covers deploying Network Monitor from development to production, including monolith and microservices deployment strategies.

---

## 📋 **Table of Contents**

- [Deployment Overview](#deployment-overview)
- [Option 1: Monolith Deployment](#option-1-monolith-deployment)
- [Option 2: Microservices Deployment](#option-2-microservices-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Monitoring & Logging](#monitoring--logging)
- [Security Checklist](#security-checklist)

---

## 🎯 **Deployment Overview**

Network Monitor supports **two deployment strategies**:

| Strategy | When to Use | Complexity | Cost |
|----------|-------------|------------|------|
| **Monolith** | < 10,000 users | Low | Low |
| **Microservices** | > 10,000 users | High | Medium-High |

**Key Insight:** The event-driven architecture means you can start with a monolith and migrate to microservices **without code changes**!

---

## 🏢 **Option 1: Monolith Deployment**

Deploy all services in a single container or process.

### **Advantages**

✅ Simple deployment  
✅ Lower hosting costs  
✅ Easy debugging  
✅ Single process to monitor  
✅ No distributed system complexity

### **Disadvantages**

❌ Limited horizontal scaling  
❌ Single point of failure  
❌ All services must be deployed together  
❌ Shared resource limits

---

### **1.1 Docker Deployment**

#### **Build Docker Image**

```bash
# Build production image
docker build -t network-monitor:latest .

# Or use Docker Compose
docker-compose build
```text

#### **Dockerfile**

```dockerfile
FROM oven/bun:1.2-alpine AS base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
COPY turbo.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/
RUN bun install --frozen-lockfile

# Build all packages
RUN bun run build

# Production stage
FROM oven/bun:1.2-alpine AS production
WORKDIR /app

COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/packages ./packages
COPY --from=base /app/apps ./apps
COPY --from=base /app/turbo.json ./
COPY --from=base /app/package.json ./

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start application
CMD ["bun", "run", "start"]
```text

#### **Docker Compose**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:password@db:5432/network_monitor
      NODE_ENV: production
    depends_on:
      - db
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: network_monitor
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```text

#### **Deploy**

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```text

---

### **1.2 Cloud Platform Deployment**

#### **Vercel**

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel deploy --prod
```text

**vercel.json:**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/web/package.json",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ]
}
```text

#### **Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```text

**railway.toml:**

```toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "bun run start"
healthcheckPath = "/health"
restartPolicyType = "on_failure"

[environments.production]
variables = { NODE_ENV = "production" }
```text

#### **Fly.io**

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Launch app
fly launch

# Deploy
fly deploy
```text

**fly.toml:**

```toml
app = "network-monitor"
primary_region = "sea"

[build]
  builder = "paketobuildpacks/builder:base"

[env]
  NODE_ENV = "production"
  PORT = "8080"

[[services]]
  internal_port = 8080
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443
```text

---

### **1.3 VPS Deployment**

For VPS providers like DigitalOcean, Linode, Vultr:

#### **Setup Script**

```bash
#!/bin/bash

# Install Bun
curl -fsSL https://bun.sh/install | bash

# Clone repository
git clone https://github.com/your-org/network-monitor.git
cd network-monitor

# Install dependencies
bun install

# Setup database
bun run db:generate
bun run db:push
bun run db:migrate

# Build application
bun run build

# Start with PM2
bun add -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```text

#### **PM2 Configuration**

**ecosystem.config.js:**

```javascript
module.exports = {
  apps: [{
    name: 'network-monitor',
    script: 'bun',
    args: 'run start',
    instances: 2,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    merge_logs: true,
    time: true
  }]
};
```text

#### **Nginx Reverse Proxy**

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```text

---

## ☸️ **Option 2: Microservices Deployment**

Deploy each service independently for maximum scalability.

### **Advantages**

✅ Independent scaling  
✅ Fault isolation  
✅ Team autonomy  
✅ Technology flexibility  
✅ Gradual rollouts

### **Disadvantages**

❌ Complex deployment  
❌ Distributed system challenges  
❌ Higher hosting costs  
❌ Requires orchestration

---

### **2.1 Kubernetes Deployment**

#### **Namespace**

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: network-monitor
```text

#### **ConfigMap**

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: network-monitor
data:
  NODE_ENV: "production"
  REDIS_URL: "redis://redis-service:6379"
```text

#### **Secrets**

```yaml
# k8s/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: network-monitor
type: Opaque
data:
  DATABASE_URL: <base64-encoded-url>
  AUTH_SECRET: <base64-encoded-secret>
```text

#### **Monitor Service Deployment**

```yaml
# k8s/monitor-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: monitor-service
  namespace: network-monitor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: monitor-service
  template:
    metadata:
      labels:
        app: monitor-service
    spec:
      containers:
      - name: monitor
        image: network-monitor/monitor:latest
        ports:
        - containerPort: 3001
        env:
        - name: SERVICE_NAME
          value: "monitor"
        envFrom:
        - configMapRef:
            name: app-config
        - secretRef:
            name: app-secrets
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 5
          periodSeconds: 5
```text

#### **Service**

```yaml
# k8s/monitor-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: monitor-service
  namespace: network-monitor
spec:
  selector:
    app: monitor-service
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3001
  type: ClusterIP
```text

#### **Horizontal Pod Autoscaler**

```yaml
# k8s/monitor-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: monitor-hpa
  namespace: network-monitor
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: monitor-service
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```text

#### **Ingress**

```yaml
# k8s/ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: network-monitor-ingress
  namespace: network-monitor
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  tls:
  - hosts:
    - monitor.yourdomain.com
    secretName: monitor-tls
  rules:
  - host: monitor.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web-service
            port:
              number: 80
```text

#### **Deploy to Kubernetes**

```bash
# Apply all configurations
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/monitor-deployment.yaml
kubectl apply -f k8s/monitor-service.yaml
kubectl apply -f k8s/monitor-hpa.yaml
kubectl apply -f k8s/ingress.yaml

# Check status
kubectl get pods -n network-monitor
kubectl get services -n network-monitor
kubectl get ingress -n network-monitor

# View logs
kubectl logs -f deployment/monitor-service -n network-monitor

# Scale manually
kubectl scale deployment monitor-service --replicas=5 -n network-monitor
```text

---

### **2.2 Message Broker Setup**

For microservices, replace in-memory EventBus with distributed message broker:

#### **Redis EventBus**

```typescript
// packages/infrastructure/src/event-bus/RedisEventBus.ts
import { Redis } from 'ioredis';
import type { IEventBus } from '@network-monitor/shared';

export class RedisEventBus implements IEventBus {
  private redis: Redis;
  private subscriber: Redis;
  private handlers: Map<string, Set<(data?: unknown) => void>> = new Map();

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl);
    this.subscriber = new Redis(redisUrl);

    this.subscriber.on('message', (channel, message) => {
      const handlers = this.handlers.get(channel);
      if (handlers) {
        const data = JSON.parse(message);
        handlers.forEach(handler => handler(data));
      }
    });
  }

  emit(event: string, data?: unknown): void {
    this.redis.publish(event, JSON.stringify(data));
  }

  on(event: string, handler: (data?: unknown) => void): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
      this.subscriber.subscribe(event);
    }
    this.handlers.get(event)!.add(handler);
  }

  // ... other methods
}
```text

#### **RabbitMQ EventBus**

```typescript
import amqp from 'amqplib';
import type { IEventBus } from '@network-monitor/shared';

export class RabbitMQEventBus implements IEventBus {
  private connection: amqp.Connection;
  private channel: amqp.Channel;
  private exchange = 'network-monitor';

  async connect(url: string) {
    this.connection = await amqp.connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange(this.exchange, 'topic', { durable: true });
  }

  emit(event: string, data?: unknown): void {
    this.channel.publish(
      this.exchange,
      event,
      Buffer.from(JSON.stringify(data))
    );
  }

  async on(event: string, handler: (data?: unknown) => void): Promise<void> {
    const queue = await this.channel.assertQueue('', { exclusive: true });
    await this.channel.bindQueue(queue.queue, this.exchange, event);
    
    this.channel.consume(queue.queue, (msg) => {
      if (msg) {
        const data = JSON.parse(msg.content.toString());
        handler(data);
      }
    }, { noAck: true });
  }

  // ... other methods
}
```text

---

## 🔧 **Environment Configuration**

### **Development**

```.env.development
NODE_ENV=development
DATABASE_URL=file:./dev.db
LOG_LEVEL=debug
PORT=3000
```text

### **Production**

```.env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/network_monitor
LOG_LEVEL=info
PORT=3000
AUTH_SECRET=your-secret-key-here
REDIS_URL=redis://redis:6379
```text

### **Environment Variables**

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Environment (development/production) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | Server port (default: 3000) |
| `LOG_LEVEL` | No | Logging level (debug/info/warn/error) |
| `AUTH_SECRET` | Production | Secret for JWT tokens |
| `REDIS_URL` | Microservices | Redis connection string |

---

## 🗄️ **Database Setup**

### **PostgreSQL Production**

```bash
# Create database
createdb network_monitor

# Run migrations
DATABASE_URL=postgresql://user:pass@host:5432/network_monitor \
  bun run db:migrate

# Seed data (optional)
bun run db:seed
```text

### **Connection Pooling**

```typescript
// packages/database/src/DatabaseService.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  },
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
});

// Connection pool settings (in DATABASE_URL)
// ?connection_limit=10&pool_timeout=20
```text

---

## 📊 **Monitoring & Logging**

### **Application Monitoring**

- **Logs**: Centralized logging with Winston
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry
- **Errors**: Sentry

### **Logging Configuration**

```typescript
// packages/infrastructure/src/logger/production-config.ts
export const productionLoggerConfig = {
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log' 
    })
  ]
};
```text

---

## 🔒 **Security Checklist**

### **Before Production**

- [ ] Use HTTPS with valid SSL certificate
- [ ] Set secure `AUTH_SECRET` environment variable
- [ ] Enable CORS with specific origins
- [ ] Implement rate limiting
- [ ] Use parameterized database queries (Prisma does this)
- [ ] Validate all user inputs
- [ ] Enable Content Security Policy headers
- [ ] Set secure cookie flags
- [ ] Implement proper authentication
- [ ] Use environment variables for secrets (never commit!)
- [ ] Enable database connection encryption
- [ ] Set up firewall rules
- [ ] Implement proper error handling (don't expose stack traces)
- [ ] Enable security headers (Helmet.js)
- [ ] Regular dependency updates
- [ ] Database backups configured

---

## 🎯 **Deployment Checklist**

### **Pre-Deployment**

- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Linting passes with zero warnings
- [ ] Security scan completed
- [ ] Performance tests passed
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] SSL certificates valid
- [ ] Backup strategy in place

### **Deployment**

- [ ] Deploy to staging first
- [ ] Run smoke tests in staging
- [ ] Deploy to production
- [ ] Verify health checks
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all features working
- [ ] Test critical user flows

### **Post-Deployment**

- [ ] Monitor application logs
- [ ] Check error rates
- [ ] Verify performance metrics
- [ ] Test critical functionality
- [ ] Monitor resource usage
- [ ] Check backup status
- [ ] Update documentation

---

## 📖 **Additional Resources**

- **[Scaling to Microservices](SCALING-TO-MICROSERVICES.md)** - Detailed microservices guide
- **[Architecture](ARCHITECTURE.md)** - System architecture overview
- **[Configuration](CONFIGURATION.md)** - Service configuration management

---

Made with ❤️ for reliable production deployments
