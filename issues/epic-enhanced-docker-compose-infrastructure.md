# Epic: Enhanced Docker Compose Infrastructure - Monitoring, Observability & Messaging

**Labels:** epic, infrastructure, docker, monitoring, observability, messaging

## 🎯 **Epic Overview**

Transform the Network Monitor's Docker Compose infrastructure into a comprehensive development and production-ready platform with full monitoring, observability, caching, and messaging capabilities. This epic will establish a robust foundation for scalable microservices architecture.

## 🌟 **Epic Value Proposition**

- **Complete Observability**: Full monitoring stack with Grafana, Prometheus, and Loki
- **Production Ready**: Production-grade infrastructure with proper networking and security
- **Developer Experience**: One-command setup for complete development environment
- **Scalability**: Infrastructure that supports microservices and horizontal scaling
- **Messaging**: Event-driven architecture with Kafka and RabbitMQ support

## 🏗️ **Current State Analysis**

### **Existing Docker Compose**

Current `docker-compose.yml` provides basic services:

```yaml
# Current minimal setup
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/network_monitor
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=network_monitor
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

### **Current Limitations**

1. **No Monitoring**: No observability or monitoring capabilities
2. **No Caching**: No Redis or caching layer
3. **No Messaging**: No event streaming or message queuing
4. **Basic Networking**: Limited network configuration
5. **No Security**: Missing security configurations
6. **No Health Checks**: Limited health monitoring

## 🎯 **Epic Goals**

### **Primary Objectives**

1. **Grafana Stack Integration**: Prometheus, Loki, Tempo for full observability
2. **Messaging Infrastructure**: Kafka and RabbitMQ for event-driven architecture
3. **Caching Layer**: Redis for performance optimization
4. **Security Hardening**: Proper networking, secrets management, and access controls
5. **Production Readiness**: Health checks, logging, and monitoring

### **Success Criteria**

- ✅ Complete monitoring stack with Grafana dashboards
- ✅ Event streaming with Kafka and message queuing with RabbitMQ
- ✅ Redis caching layer for performance optimization
- ✅ Secure networking and secrets management
- ✅ One-command development environment setup

## 📋 **Epic User Stories**

### **Story 1: Monitoring Stack Setup**
**As a** DevOps engineer  
**I want** a complete monitoring stack with Grafana, Prometheus, and Loki  
**So that** I can monitor application performance and troubleshoot issues

### **Story 2: Event Streaming Infrastructure**
**As a** developer  
**I want** Kafka and RabbitMQ available in the development environment  
**So that** I can build event-driven microservices

### **Story 3: Caching Layer**
**As a** performance engineer  
**I want** Redis available for caching and session management  
**So that** I can optimize application performance

### **Story 4: Security Hardening**
**As a** security engineer  
**I want** proper networking, secrets management, and access controls  
**So that** the infrastructure meets security requirements

## 🔧 **Technical Implementation Plan**

### **Phase 1: Core Infrastructure Enhancement**

#### **1.1 Enhanced Docker Compose Structure**

```yaml
# docker-compose.yml - Main production configuration
version: '3.8'

services:
  # Application Services
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/network_monitor
      - REDIS_URL=redis://redis:6379
      - KAFKA_BROKERS=kafka:9092
      - RABBITMQ_URL=amqp://guest:${RABBITMQ_PASSWORD}@rabbitmq:5672
    depends_on:
      - db
      - redis
      - kafka
      - rabbitmq
    networks:
      - app-network
      - monitoring-network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Database
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=network_monitor
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    ports:
      - "5432:5432"
    networks:
      - app-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Kafka Event Streaming
  zookeeper:
    image: confluentinc/cp-zookeeper:7.4.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper_data:/var/lib/zookeeper/data
    networks:
      - messaging-network

  kafka:
    image: confluentinc/cp-kafka:7.4.0
    depends_on:
      - zookeeper
    ports:
      - "9092:9092"
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,PLAINTEXT_INTERNAL://kafka:29092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,PLAINTEXT_INTERNAL:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: PLAINTEXT_INTERNAL
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: 'true'
    volumes:
      - kafka_data:/var/lib/kafka/data
    networks:
      - messaging-network
      - app-network
    healthcheck:
      test: ["CMD", "kafka-broker-api-versions", "--bootstrap-server", "localhost:9092"]
      interval: 30s
      timeout: 10s
      retries: 3

  # RabbitMQ Message Queue
  rabbitmq:
    image: rabbitmq:3.12-management-alpine
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: ${RABBITMQ_PASSWORD}
      RABBITMQ_DEFAULT_VHOST: /
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    ports:
      - "5672:5672"
      - "15672:15672"  # Management UI
    networks:
      - app-network
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Monitoring Stack
  prometheus:
    image: prom/prometheus:v2.45.0
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    volumes:
      - ./monitoring/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - monitoring-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:9090/-/healthy"]
      interval: 30s
      timeout: 10s
      retries: 3

  grafana:
    image: grafana/grafana:10.0.0
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
    ports:
      - "3001:3000"
    networks:
      - monitoring-network
    depends_on:
      - prometheus
      - loki
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  loki:
    image: grafana/loki:2.9.0
    command: -config.file=/etc/loki/local-config.yaml
    volumes:
      - ./monitoring/loki:/etc/loki
      - loki_data:/loki
    ports:
      - "3100:3100"
    networks:
      - monitoring-network
    healthcheck:
      test: ["CMD-SHELL", "wget --no-verbose --tries=1 --spider http://localhost:3100/ready || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3

  tempo:
    image: grafana/tempo:2.2.0
    command: [ "-config.file=/etc/tempo.yaml" ]
    volumes:
      - ./monitoring/tempo:/etc/tempo
      - tempo_data:/tmp/tempo
    ports:
      - "3200:3200"
    networks:
      - monitoring-network
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3200/ready"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Additional Services
  jaeger:
    image: jaegertracing/all-in-one:1.47
    environment:
      - COLLECTOR_OTLP_ENABLED=true
    ports:
      - "16686:16686"
      - "14268:14268"
    networks:
      - monitoring-network

  alertmanager:
    image: prom/alertmanager:v0.25.0
    volumes:
      - ./monitoring/alertmanager:/etc/alertmanager
      - alertmanager_data:/alertmanager
    ports:
      - "9093:9093"
    networks:
      - monitoring-network
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'

volumes:
  postgres_data:
  redis_data:
  kafka_data:
  zookeeper_data:
  rabbitmq_data:
  prometheus_data:
  grafana_data:
  loki_data:
  tempo_data:
  alertmanager_data:

networks:
  app-network:
    driver: bridge
  monitoring-network:
    driver: bridge
  messaging-network:
    driver: bridge
```

#### **1.2 Environment Configuration**

```bash
# .env.example
# Database
POSTGRES_PASSWORD=your_secure_postgres_password

# Redis
REDIS_PASSWORD=your_secure_redis_password

# RabbitMQ
RABBITMQ_PASSWORD=your_secure_rabbitmq_password

# Grafana
GRAFANA_PASSWORD=your_secure_grafana_password

# Application
NODE_ENV=development
LOG_LEVEL=debug
ENABLE_METRICS=true
```

### **Phase 2: Monitoring Configuration**

#### **2.1 Prometheus Configuration**

```yaml
# monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'network-monitor-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'kafka'
    static_configs:
      - targets: ['kafka-exporter:9308']

  - job_name: 'rabbitmq'
    static_configs:
      - targets: ['rabbitmq-exporter:9419']
```

#### **2.2 Grafana Dashboard Configuration**

```yaml
# monitoring/grafana/provisioning/dashboards/dashboard.yml
apiVersion: 1

providers:
  - name: 'default'
    orgId: 1
    folder: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 10
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

#### **2.3 Loki Configuration**

```yaml
# monitoring/loki/loki.yml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  path_prefix: /loki
  storage:
    filesystem:
      chunks_directory: /loki/chunks
      rules_directory: /loki/rules
  replication_factor: 1
  ring:
    instance_addr: 127.0.0.1
    kvstore:
      store: inmemory

query_scheduler:
  max_outstanding_requests_per_tenant: 2048

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

ruler:
  alertmanager_url: http://alertmanager:9093
```

### **Phase 3: Service Discovery & Health Checks**

#### **3.1 Application Health Endpoints**

```typescript
// apps/web/src/routes/api/health.ts
import { json } from 'solid-start';
import { createServerData$ } from 'solid-start/server';

export async function GET() {
  const health = await createServerData$(async () => {
    const checks = await Promise.allSettled([
      checkDatabase(),
      checkRedis(),
      checkKafka(),
      checkRabbitMQ(),
    ]);

    const status = checks.every(check => check.status === 'fulfilled') 
      ? 'healthy' 
      : 'unhealthy';

    return {
      status,
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: checks[0].status === 'fulfilled' ? 'ok' : 'error',
        redis: checks[1].status === 'fulfilled' ? 'ok' : 'error',
        kafka: checks[2].status === 'fulfilled' ? 'ok' : 'error',
        rabbitmq: checks[3].status === 'fulfilled' ? 'ok' : 'error',
      },
    };
  });

  return json(health());
}

async function checkDatabase(): Promise<void> {
  // Database health check implementation
}

async function checkRedis(): Promise<void> {
  // Redis health check implementation
}

async function checkKafka(): Promise<void> {
  // Kafka health check implementation
}

async function checkRabbitMQ(): Promise<void> {
  // RabbitMQ health check implementation
}
```

#### **3.2 Metrics Endpoint**

```typescript
// apps/web/src/routes/api/metrics.ts
import { createServerData$ } from 'solid-start/server';
import { register, collectDefaultMetrics } from 'prom-client';

// Collect default metrics
collectDefaultMetrics();

export async function GET() {
  const metrics = await createServerData$(async () => {
    return await register.metrics();
  });

  return new Response(metrics(), {
    headers: {
      'Content-Type': register.contentType,
    },
  });
}
```

### **Phase 4: Development Profiles**

#### **4.1 Development Docker Compose**

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - LOG_LEVEL=debug
      - ENABLE_METRICS=true
    volumes:
      - .:/app
      - /app/node_modules
    command: bun run dev
    depends_on:
      - db
      - redis
    networks:
      - dev-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=network_monitor_dev
      - POSTGRES_USER=dev
      - POSTGRES_PASSWORD=dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    networks:
      - dev-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - dev-network

  # Development monitoring (simplified)
  grafana:
    image: grafana/grafana:10.0.0
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    ports:
      - "3001:3000"
    volumes:
      - grafana_dev_data:/var/lib/grafana
    networks:
      - dev-network

volumes:
  postgres_dev_data:
  grafana_dev_data:

networks:
  dev-network:
    driver: bridge
```

#### **4.2 Production Docker Compose**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
      - ENABLE_METRICS=true
    restart: unless-stopped
    depends_on:
      - db
      - redis
      - kafka
      - rabbitmq
    networks:
      - app-network
      - monitoring-network

  # Include all monitoring and messaging services
  # ... (same as main docker-compose.yml)

networks:
  app-network:
    driver: bridge
  monitoring-network:
    driver: bridge
  messaging-network:
    driver: bridge
```

### **Phase 5: Security & Secrets Management**

#### **5.1 Docker Secrets**

```yaml
# docker-compose.secrets.yml
version: '3.8'

services:
  app:
    secrets:
      - postgres_password
      - redis_password
      - rabbitmq_password
      - grafana_password
    environment:
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres_password
      - REDIS_PASSWORD_FILE=/run/secrets/redis_password
      - RABBITMQ_PASSWORD_FILE=/run/secrets/rabbitmq_password
      - GRAFANA_PASSWORD_FILE=/run/secrets/grafana_password

secrets:
  postgres_password:
    file: ./secrets/postgres_password.txt
  redis_password:
    file: ./secrets/redis_password.txt
  rabbitmq_password:
    file: ./secrets/rabbitmq_password.txt
  grafana_password:
    file: ./secrets/grafana_password.txt
```

#### **5.2 Network Security**

```yaml
# docker-compose.security.yml
version: '3.8'

services:
  app:
    networks:
      - app-network
      - monitoring-network
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
      - /var/tmp

  db:
    networks:
      - app-network
    security_opt:
      - no-new-privileges:true

networks:
  app-network:
    driver: bridge
    internal: false
  monitoring-network:
    driver: bridge
    internal: true
```

## 📊 **Implementation Breakdown**

### **Epic Tasks**

#### **Phase 1: Core Infrastructure (2 weeks)**
- [ ] **Task 1.1**: Create enhanced Docker Compose configuration
- [ ] **Task 1.2**: Add Redis caching layer
- [ ] **Task 1.3**: Add Kafka event streaming
- [ ] **Task 1.4**: Add RabbitMQ message queuing
- [ ] **Task 1.5**: Implement health checks for all services

#### **Phase 2: Monitoring Stack (2 weeks)**
- [ ] **Task 2.1**: Configure Prometheus for metrics collection
- [ ] **Task 2.2**: Set up Grafana with pre-configured dashboards
- [ ] **Task 2.3**: Configure Loki for log aggregation
- [ ] **Task 2.4**: Set up Tempo for distributed tracing
- [ ] **Task 2.5**: Configure AlertManager for alerting

#### **Phase 3: Application Integration (1 week)**
- [ ] **Task 3.1**: Add health check endpoints to application
- [ ] **Task 3.2**: Implement metrics collection endpoints
- [ ] **Task 3.3**: Add structured logging for monitoring
- [ ] **Task 3.4**: Configure service discovery

#### **Phase 4: Development Experience (1 week)**
- [ ] **Task 4.1**: Create development Docker Compose profile
- [ ] **Task 4.2**: Create production Docker Compose profile
- [ ] **Task 4.3**: Add Docker Compose override files
- [ ] **Task 4.4**: Create development setup scripts

#### **Phase 5: Security & Documentation (1 week)**
- [ ] **Task 5.1**: Implement Docker secrets management
- [ ] **Task 5.2**: Configure network security
- [ ] **Task 5.3**: Create deployment documentation
- [ ] **Task 5.4**: Add troubleshooting guides

## 🎯 **Acceptance Criteria**

### **Functional Requirements**
- ✅ Complete monitoring stack with Grafana, Prometheus, Loki, Tempo
- ✅ Event streaming with Kafka and message queuing with RabbitMQ
- ✅ Redis caching layer for performance optimization
- ✅ Health checks for all services
- ✅ One-command development environment setup

### **Technical Requirements**
- ✅ Docker Compose profiles for different environments
- ✅ Proper networking and service discovery
- ✅ Secrets management for sensitive data
- ✅ Security hardening with network isolation
- ✅ Comprehensive logging and monitoring

### **Performance Requirements**
- ✅ All services start within 2 minutes
- ✅ Health checks respond within 5 seconds
- ✅ Monitoring stack doesn't impact application performance
- ✅ Caching layer improves application response times

## 🚀 **Benefits & Impact**

### **Development Benefits**
- **Complete Environment**: One command sets up entire development stack
- **Observability**: Full visibility into application behavior
- **Event-Driven**: Ready for microservices architecture
- **Performance**: Caching layer improves development experience

### **Production Benefits**
- **Monitoring**: Complete observability stack for production
- **Scalability**: Infrastructure ready for horizontal scaling
- **Reliability**: Health checks and alerting for reliability
- **Security**: Proper network isolation and secrets management

### **Operational Benefits**
- **Troubleshooting**: Rich logging and tracing for issue resolution
- **Alerting**: Proactive monitoring with alerting
- **Performance**: Caching and optimization for better performance
- **Compliance**: Structured logging and monitoring for compliance

## 🔍 **Risk Assessment**

### **Technical Risks**
- **Complexity**: More services increase operational complexity
- **Resource Usage**: Monitoring stack requires additional resources
- **Network Issues**: Complex networking may cause connectivity issues
- **Security**: More services increase attack surface

### **Mitigation Strategies**
- **Documentation**: Comprehensive setup and troubleshooting guides
- **Resource Planning**: Clear resource requirements and limits
- **Network Testing**: Thorough network connectivity testing
- **Security Review**: Regular security audits and updates

## 📈 **Success Metrics**

### **Implementation Metrics**
- **Setup Time**: Development environment ready in <5 minutes
- **Service Health**: All services healthy within 2 minutes
- **Resource Usage**: <2GB additional memory for monitoring stack
- **Network Latency**: <10ms additional latency for monitoring

### **Operational Metrics**
- **Uptime**: 99.9% uptime for all services
- **Alert Response**: Alerts generated within 30 seconds
- **Log Processing**: Logs processed within 5 seconds
- **Dashboard Load**: Grafana dashboards load within 3 seconds

## 🎉 **Epic Completion Definition**

This epic is considered complete when:

1. ✅ Complete monitoring stack is operational
2. ✅ Event streaming and message queuing are working
3. ✅ Caching layer is integrated and improving performance
4. ✅ Security hardening is implemented
5. ✅ Development environment is one-command setup
6. ✅ Production deployment is ready and documented

---

## 📝 **Epic Notes**

### **Infrastructure Philosophy**
This epic establishes a **"infrastructure as code"** approach where the entire development and production environment is defined in Docker Compose files, making it reproducible and maintainable.

### **Future Enhancements**
- **Kubernetes**: Migration to Kubernetes for production
- **Service Mesh**: Istio integration for advanced networking
- **CI/CD Integration**: Automated deployment pipelines
- **Multi-Environment**: Staging and production environment separation

### **Related Epics**
- **Microservices Migration**: This infrastructure enables microservices
- **Performance Optimization**: Monitoring helps identify bottlenecks
- **Security Hardening**: Infrastructure security improvements

---

**Epic Owner**: Infrastructure Team  
**Stakeholders**: Development Team, DevOps Team, Security Team  
**Priority**: High  
**Estimated Effort**: 7 weeks  
**Target Release**: Next Major Version
