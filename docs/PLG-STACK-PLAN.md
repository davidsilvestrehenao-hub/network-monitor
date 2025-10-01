# PLG Stack Implementation Plan

## 🎯 Overview

The **PLG Stack** (Prometheus, Loki, Grafana) is a modern observability stack for monitoring and logging. This document outlines the plan to integrate it with the PWA Connection Monitor.

## 📊 What is PLG Stack?

### Components

1. **Prometheus** - Time-series database for metrics
   - Collects and stores metrics
   - Supports powerful queries (PromQL)
   - Built-in alerting

2. **Loki** - Log aggregation system
   - Like Prometheus, but for logs
   - Indexes metadata, not log content (efficient)
   - Works seamlessly with Grafana

3. **Grafana** - Visualization and dashboards
   - Beautiful dashboards
   - Supports multiple data sources
   - Alerting and notifications

4. **Promtail** - Log shipping agent
   - Ships logs from applications to Loki
   - Extracts labels from logs
   - Transforms log streams

## 🏗️ Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │
│  │   API   │  │ Monitor │  │Alerting │  │  Notif  │       │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘       │
│       │            │             │             │             │
│       ├─ stdout ───┼─────────────┼─────────────┤             │
│       ├─ /metrics ─┼─────────────┼─────────────┤             │
│       │            │             │             │             │
└───────┼────────────┼─────────────┼─────────────┼─────────────┘
        │            │             │             │
        ▼            ▼             ▼             ▼
┌─────────────────────────────────────────────────────────────┐
│                    Collection Layer                          │
│  ┌──────────────┐                    ┌──────────────┐       │
│  │  Promtail    │◄───(stdout)────────│  Docker Logs │       │
│  │  (Logs)      │                    └──────────────┘       │
│  └──────┬───────┘                                            │
│         │                                                     │
│         ▼                                                     │
│  ┌──────────────┐                    ┌──────────────┐       │
│  │ Prometheus   │◄───(/metrics)──────│  App         │       │
│  │ (Metrics)    │                    │  Endpoints   │       │
│  └──────────────┘                    └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
        │                                     │
        ▼                                     ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storage Layer                           │
│  ┌──────────────┐                    ┌──────────────┐       │
│  │     Loki     │                    │  Prometheus  │       │
│  │  (Log Store) │                    │  (Metrics DB)│       │
│  └──────────────┘                    └──────────────┘       │
└─────────────────────────────────────────────────────────────┘
        │                                     │
        └───────────────┬─────────────────────┘
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                   Visualization Layer                        │
│                   ┌──────────────┐                           │
│                   │   Grafana    │                           │
│                   │  (Dashboards)│                           │
│                   └──────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Implementation Phases

### Phase 1: Prometheus Metrics (Week 1)

**Goal:** Add metrics endpoint to all services

**Tasks:**

1. Install Prometheus client library

   ```bash
   bun add prom-client
   ```

2. Create metrics service

   ```typescript
   // packages/infrastructure/src/metrics/PrometheusMetrics.ts
   import { Registry, Counter, Histogram, Gauge } from 'prom-client';

   export class PrometheusMetrics {
     private registry: Registry;
     
     // HTTP metrics
     public httpRequests: Counter;
     public httpDuration: Histogram;
     
     // Business metrics
     public activeTargets: Gauge;
     public speedTestResults: Counter;
     public alertsTriggered: Counter;
     
     constructor() {
       this.registry = new Registry();
       
       // Initialize metrics
       this.httpRequests = new Counter({
         name: 'http_requests_total',
         help: 'Total HTTP requests',
         labelNames: ['method', 'route', 'status_code'],
         registers: [this.registry],
       });
       
       this.httpDuration = new Histogram({
         name: 'http_request_duration_seconds',
         help: 'HTTP request duration',
         labelNames: ['method', 'route'],
         buckets: [0.1, 0.5, 1, 2, 5],
         registers: [this.registry],
       });
       
       // Business metrics
       this.activeTargets = new Gauge({
         name: 'monitoring_targets_active',
         help: 'Number of active monitoring targets',
         registers: [this.registry],
       });
       
       this.speedTestResults = new Counter({
         name: 'speed_tests_total',
         help: 'Total speed tests executed',
         labelNames: ['target', 'status'],
         registers: [this.registry],
       });
       
       this.alertsTriggered = new Counter({
         name: 'alerts_triggered_total',
         help: 'Total alerts triggered',
         labelNames: ['type', 'severity'],
         registers: [this.registry],
       });
     }
     
     async getMetrics(): Promise<string> {
       return this.registry.metrics();
     }
   }
   ```

3. Add `/metrics` endpoint to each service

   ```typescript
   // In each service's main.ts
   import { PrometheusMetrics } from '@network-monitor/infrastructure';
   
   const metrics = new PrometheusMetrics();
   
   // Expose metrics endpoint
   Bun.serve({
     port: config.metricsPort || 9090,
     fetch: async (req) => {
       if (req.url.endsWith('/metrics')) {
         return new Response(await metrics.getMetrics(), {
           headers: { 'Content-Type': 'text/plain' },
         });
       }
       return new Response('Not Found', { status: 404 });
     },
   });
   ```

4. Update environment variables

   ```bash
   # Add to env.template
   METRICS_PORT=9090
   ENABLE_METRICS=true
   ```

**Validation:**

```bash
# Start app
bun run dev:api

# Check metrics endpoint
curl http://localhost:9090/metrics

# You should see Prometheus metrics format
```

### Phase 2: Loki & Promtail (Week 2)

**Goal:** Ship logs to Loki for centralized storage

**Tasks:**

1. Create Docker Compose for PLG stack

   ```yaml
   # docker-compose.plg.yml
   version: '3.8'

   services:
     loki:
       image: grafana/loki:latest
       ports:
         - "3100:3100"
       command: -config.file=/etc/loki/local-config.yaml
       volumes:
         - loki_data:/loki
       networks:
         - plg

     promtail:
       image: grafana/promtail:latest
       volumes:
         - /var/log:/var/log
         - ./promtail-config.yml:/etc/promtail/config.yml
       command: -config.file=/etc/promtail/config.yml
       depends_on:
         - loki
       networks:
         - plg

     prometheus:
       image: prom/prometheus:latest
       ports:
         - "9091:9090"
       volumes:
         - ./prometheus.yml:/etc/prometheus/prometheus.yml
         - prometheus_data:/prometheus
       command:
         - '--config.file=/etc/prometheus/prometheus.yml'
         - '--storage.tsdb.path=/prometheus'
       networks:
         - plg

     grafana:
       image: grafana/grafana:latest
       ports:
         - "3001:3000"
       environment:
         - GF_SECURITY_ADMIN_PASSWORD=admin
         - GF_USERS_ALLOW_SIGN_UP=false
       volumes:
         - grafana_data:/var/lib/grafana
         - ./grafana-datasources.yml:/etc/grafana/provisioning/datasources/datasources.yml
       depends_on:
         - loki
         - prometheus
       networks:
         - plg

   networks:
     plg:
       driver: bridge

   volumes:
     loki_data:
     prometheus_data:
     grafana_data:
   ```

2. Create Promtail configuration

   ```yaml
   # promtail-config.yml
   server:
     http_listen_port: 9080
     grpc_listen_port: 0

   positions:
     filename: /tmp/positions.yaml

   clients:
     - url: http://loki:3100/loki/api/v1/push

   scrape_configs:
     - job_name: docker
       docker_sd_configs:
         - host: unix:///var/run/docker.sock
           refresh_interval: 5s
       relabel_configs:
         - source_labels: ['__meta_docker_container_name']
           regex: '/(.*)'
           target_label: 'container'
         - source_labels: ['__meta_docker_container_log_stream']
           target_label: 'stream'
   ```

3. Create Prometheus configuration

   ```yaml
   # prometheus.yml
   global:
     scrape_interval: 15s
     evaluation_interval: 15s

   scrape_configs:
     - job_name: 'network-monitor'
       static_configs:
         - targets:
           - 'host.docker.internal:9090'  # API
           - 'host.docker.internal:9091'  # Monitor Service
           - 'host.docker.internal:9092'  # Alerting Service
           - 'host.docker.internal:9093'  # Notification Service
       metric_relabel_configs:
         - source_labels: [__name__]
           regex: 'go_.*'
           action: drop
   ```

4. Configure structured logging

   ```typescript
   // Ensure all logs are JSON format
   import { getEnvironment } from '@network-monitor/infrastructure';
   
   const config = getEnvironment();
   
   const logger = winston.createLogger({
     level: config.logLevel,
     format: winston.format.combine(
       winston.format.timestamp(),
       winston.format.json()
     ),
     transports: [
       new winston.transports.Console()
     ],
   });
   ```

**Validation:**

```bash
# Start PLG stack
docker-compose -f docker-compose.plg.yml up -d

# Start app
bun run dev:api

# Check Loki is receiving logs
curl http://localhost:3100/loki/api/v1/label

# Check Prometheus is scraping metrics
curl http://localhost:9091/api/v1/targets
```

### Phase 3: Grafana Dashboards (Week 3)

**Goal:** Create beautiful dashboards for monitoring

**Tasks:**

1. Create data source configuration

   ```yaml
   # grafana-datasources.yml
   apiVersion: 1

   datasources:
     - name: Prometheus
       type: prometheus
       access: proxy
       url: http://prometheus:9090
       isDefault: true

     - name: Loki
       type: loki
       access: proxy
       url: http://loki:3100
       jsonData:
         maxLines: 1000
   ```

2. Create dashboard JSON files
   - `grafana-dashboards/overview.json` - System overview
   - `grafana-dashboards/monitoring.json` - Monitoring targets
   - `grafana-dashboards/alerts.json` - Alerts and incidents
   - `grafana-dashboards/logs.json` - Log explorer

3. Key metrics to visualize:
   - **HTTP Requests** (rate, duration, status codes)
   - **Active Targets** (count, status distribution)
   - **Speed Test Results** (ping, download, upload over time)
   - **Alerts** (triggered, resolved, by type)
   - **Database Performance** (query duration, connection pool)
   - **System Resources** (CPU, memory, disk)

4. Create alerts in Grafana
   - High error rate (> 5% of requests)
   - Slow response times (p95 > 2 seconds)
   - Target monitoring failures
   - Database connection pool exhaustion

**Validation:**

```bash
# Access Grafana
open http://localhost:3001

# Login: admin / admin
# Navigate to Dashboards
# Verify data from Prometheus and Loki
```

### Phase 4: Production Deployment (Week 4)

**Goal:** Deploy PLG stack to production

**Tasks:**

1. Update production Docker Compose
2. Configure persistent storage
3. Set up authentication and SSL
4. Configure retention policies
5. Set up alerting (Slack, email, etc.)
6. Create runbooks for common issues

## 📝 Configuration Files to Create

1. `docker-compose.plg.yml` - PLG stack services
2. `promtail-config.yml` - Log collection config
3. `prometheus.yml` - Metrics scraping config
4. `grafana-datasources.yml` - Data source config
5. `grafana-dashboards/` - Dashboard definitions

## 🎯 Success Metrics

After implementation, you should have:

- ✅ `/metrics` endpoint on all services
- ✅ Structured JSON logs streaming to Loki
- ✅ Prometheus scraping metrics every 15 seconds
- ✅ Grafana dashboards showing real-time data
- ✅ Alerts configured for critical issues
- ✅ 30-day retention for metrics and logs

## 🔗 Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Loki Documentation](https://grafana.com/docs/loki/latest/)
- [Grafana Documentation](https://grafana.com/docs/grafana/latest/)
- [Promtail Documentation](https://grafana.com/docs/loki/latest/clients/promtail/)
- [PLG Stack Tutorial](https://grafana.com/blog/2020/05/12/an-only-slightly-technical-introduction-to-loki-the-prometheus-like-log-aggregation-system/)

## 🎓 Learning Path

1. **Week 1:** Learn Prometheus basics and PromQL
2. **Week 2:** Understand Loki and LogQL
3. **Week 3:** Master Grafana dashboards
4. **Week 4:** Production best practices

---

**Note:** This implementation aligns perfectly with 12-Factor App principles:

- ✅ **Factor XI: Logs** - Logs treated as event streams (stdout → Promtail → Loki)
- ✅ **Backing Services** - PLG stack as attached resources
- ✅ **Observability** - Essential for production monitoring

Start with Phase 1 (Prometheus Metrics) as it provides immediate value! 🚀
