# Epic: Eliminate Console Logs - Replace with Pino Logging

**Labels:** epic, logging, infrastructure, cleanup, observability

## 🎯 **Epic Overview**

Replace all `console.log`, `console.error`, `console.warn`, and `console.info` statements throughout the Network Monitor application with a structured Pino logging system. This epic will establish a consistent, production-ready logging infrastructure that supports structured logging, log levels, and proper observability.

## 🌟 **Epic Value Proposition**

- **Structured Logging**: JSON-formatted logs for better parsing and analysis
- **Performance**: Pino is one of the fastest Node.js loggers available
- **Production Ready**: Proper log levels, formatting, and error handling
- **Observability**: Better integration with monitoring and alerting systems
- **Consistency**: Unified logging approach across all services and packages

## 🏗️ **Current State Analysis**

### **Console Usage Audit**

The application currently uses console statements in multiple locations:

```typescript
// Current console usage patterns
console.log('Service started successfully');
console.error('Database connection failed:', error);
console.warn('Deprecated API endpoint used');
console.info('User authentication successful');
```

### **Issues with Current Approach**

1. **No Log Levels**: All console output is treated equally
2. **No Structure**: Plain text logs are hard to parse programmatically
3. **No Context**: Missing request IDs, user context, service names
4. **Performance Impact**: Console operations can be slow in production
5. **No Filtering**: Cannot easily filter logs by level or component

## 🎯 **Epic Goals**

### **Primary Objectives**

1. **Complete Console Elimination**: Remove all console statements from codebase
2. **Pino Infrastructure**: Implement Pino logger with proper configuration
3. **Structured Logging**: All logs in JSON format with consistent fields
4. **Log Level Management**: Proper DEBUG, INFO, WARN, ERROR levels
5. **Service Integration**: Each service has its own logger instance

### **Success Criteria**

- ✅ Zero `console.log`, `console.error`, `console.warn`, `console.info` statements
- ✅ All services use Pino logger via dependency injection
- ✅ Logs are structured JSON with consistent fields
- ✅ Log levels are properly configured and respected
- ✅ Performance impact is minimal or positive

## 📋 **Epic User Stories**

### **Story 1: Infrastructure Logging Setup**

**As a** DevOps engineer  
**I want** Pino logger configured for infrastructure services  
**So that** I can monitor system health with structured logs

### **Story 2: Application Service Logging**

**As a** developer  
**I want** each service to have its own logger instance  
**So that** I can trace operations across service boundaries

### **Story 3: Error Logging Enhancement**

**As a** support engineer  
**I want** errors logged with full context and stack traces  
**So that** I can quickly diagnose and resolve issues

### **Story 4: Performance Logging**

**As a** performance engineer  
**I want** operation timing and metrics in logs  
**So that** I can identify performance bottlenecks

## 🔧 **Technical Implementation Plan**

### **Phase 1: Pino Infrastructure Setup**

#### **1.1 Install Pino Dependencies**

```bash
# Core Pino packages
bun add pino pino-pretty pino-http

# Development dependencies
bun add -D @types/pino
```

#### **1.2 Create Pino Configuration**

```typescript
// packages/infrastructure/src/logging/pino-config.ts
import pino from 'pino';

export interface PinoConfig {
  level: string;
  pretty: boolean;
  redact: string[];
  serializers: Record<string, any>;
}

export function createPinoConfig(): PinoConfig {
  return {
    level: process.env.LOG_LEVEL || 'info',
    pretty: process.env.NODE_ENV === 'development',
    redact: [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.headers.cookie',
    ],
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  };
}

export function createPinoLogger(config: PinoConfig, serviceName: string): pino.Logger {
  const baseLogger = pino({
    level: config.level,
    redact: config.redact,
    serializers: config.serializers,
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });

  return baseLogger.child({
    service: serviceName,
    version: process.env.APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
}
```

#### **1.3 Create Logger Service Interface**

```typescript
// packages/shared/src/interfaces/ILogger.ts
export interface ILogger {
  debug(message: string, data?: Record<string, any>): void;
  info(message: string, data?: Record<string, any>): void;
  warn(message: string, data?: Record<string, any>): void;
  error(message: string, error?: Error, data?: Record<string, any>): void;
  fatal(message: string, error?: Error, data?: Record<string, any>): void;
  child(bindings: Record<string, any>): ILogger;
  setLevel(level: string): void;
  getLevel(): string;
}

// packages/infrastructure/src/logging/PinoLogger.ts
export class PinoLogger implements ILogger {
  constructor(private logger: pino.Logger) {}

  debug(message: string, data?: Record<string, any>): void {
    this.logger.debug(data, message);
  }

  info(message: string, data?: Record<string, any>): void {
    this.logger.info(data, message);
  }

  warn(message: string, data?: Record<string, any>): void {
    this.logger.warn(data, message);
  }

  error(message: string, error?: Error, data?: Record<string, any>): void {
    this.logger.error({ err: error, ...data }, message);
  }

  fatal(message: string, error?: Error, data?: Record<string, any>): void {
    this.logger.fatal({ err: error, ...data }, message);
  }

  child(bindings: Record<string, any>): ILogger {
    return new PinoLogger(this.logger.child(bindings));
  }

  setLevel(level: string): void {
    this.logger.level = level;
  }

  getLevel(): string {
    return this.logger.level;
  }
}
```

### **Phase 2: Service Configuration Updates**

#### **2.1 Update Infrastructure Services**

```typescript
// packages/infrastructure/src/container/container-setup.ts
import { createPinoConfig, createPinoLogger } from '../logging/pino-config';
import { PinoLogger } from '../logging/PinoLogger';

export async function setupInfrastructureServices(container: Container): Promise<void> {
  const pinoConfig = createPinoConfig();
  
  // Register base logger
  container.bind(TYPES.ILogger)
    .toDynamicValue(() => {
      const logger = createPinoLogger(pinoConfig, 'infrastructure');
      return new PinoLogger(logger);
    })
    .inSingletonScope();

  // Register service-specific loggers
  container.bind(TYPES.IDatabaseLogger)
    .toDynamicValue(() => {
      const logger = createPinoLogger(pinoConfig, 'database');
      return new PinoLogger(logger);
    })
    .inSingletonScope();

  container.bind(TYPES.IEventBusLogger)
    .toDynamicValue(() => {
      const logger = createPinoLogger(pinoConfig, 'eventbus');
      return new PinoLogger(logger);
    })
    .inSingletonScope();
}
```

#### **2.2 Update Application Services**

```typescript
// packages/monitor/src/MonitorService.ts
export class MonitorService implements IMonitorService {
  private logger: ILogger;

  constructor(
    private targetRepository: ITargetRepository,
    private speedTestResultRepository: ISpeedTestResultRepository,
    private eventBus: IEventBus,
    logger: ILogger, // Injected logger
    // ... other dependencies
  ) {
    this.logger = logger.child({ service: 'MonitorService' });
  }

  async createTarget(data: CreateTargetData): Promise<Target> {
    this.logger.info('Creating new monitoring target', {
      targetName: data.name,
      targetAddress: data.address,
      ownerId: data.ownerId,
    });

    try {
      const target = await this.targetRepository.create(data);
      
      this.logger.info('Target created successfully', {
        targetId: target.id,
        targetName: target.name,
      });

      return target;
    } catch (error) {
      this.logger.error('Failed to create target', error as Error, {
        targetName: data.name,
        targetAddress: data.address,
      });
      throw error;
    }
  }

  async startMonitoring(targetId: string, intervalMs: number): Promise<void> {
    this.logger.info('Starting target monitoring', {
      targetId,
      intervalMs,
    });

    // ... monitoring logic

    this.logger.debug('Monitoring started successfully', {
      targetId,
      intervalMs,
    });
  }
}
```

### **Phase 3: Console Log Replacement**

#### **3.1 Infrastructure Console Replacement**

```typescript
// packages/infrastructure/src/database/DatabaseService.ts
export class DatabaseService implements IDatabaseService {
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger.child({ service: 'DatabaseService' });
  }

  async connect(): Promise<void> {
    this.logger.info('Connecting to database', {
      databaseUrl: this.maskDatabaseUrl(this.databaseUrl),
    });

    try {
      await this.prisma.$connect();
      this.logger.info('Database connected successfully');
    } catch (error) {
      this.logger.error('Database connection failed', error as Error);
      throw error;
    }
  }

  private maskDatabaseUrl(url: string): string {
    return url.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
  }
}
```

#### **3.2 Application Console Replacement**

```typescript
// packages/alerting/src/AlertingService.ts
export class AlertingService implements IAlertingService {
  private logger: ILogger;

  constructor(
    private alertRuleRepository: IAlertRuleRepository,
    private incidentRepository: IIncidentRepository,
    logger: ILogger,
  ) {
    this.logger = logger.child({ service: 'AlertingService' });
  }

  async evaluateSpeedTestResult(data: SpeedTestCompletedData): Promise<void> {
    this.logger.debug('Evaluating speed test result', {
      targetId: data.targetId,
      ping: data.result.ping,
      download: data.result.download,
    });

    const rules = await this.alertRuleRepository.findByTargetId(data.targetId);
    
    for (const rule of rules) {
      const triggered = this.evaluateRule(rule, data.result);
      
      if (triggered) {
        this.logger.warn('Alert rule triggered', {
          ruleId: rule.id,
          ruleName: rule.name,
          targetId: data.targetId,
          threshold: rule.threshold,
          actualValue: this.getMetricValue(rule.metric, data.result),
        });

        await this.createIncident(rule, data);
      }
    }
  }
}
```

### **Phase 4: HTTP Request Logging**

#### **4.1 Express Middleware Integration**

```typescript
// apps/web/src/server/middleware/request-logging.ts
import pinoHttp from 'pino-http';
import { createPinoConfig, createPinoLogger } from '@network-monitor/infrastructure';

export function createRequestLoggingMiddleware() {
  const config = createPinoConfig();
  const logger = createPinoLogger(config, 'http-server');

  return pinoHttp({
    logger,
    serializers: {
      req: (req) => ({
        method: req.method,
        url: req.url,
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
        },
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        headers: {
          'content-type': res.getHeader('content-type'),
        },
      }),
    },
    customLogLevel: (req, res, err) => {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return 'warn';
      } else if (res.statusCode >= 500) {
        return 'error';
      }
      return 'info';
    },
  });
}
```

### **Phase 5: Error Handling Enhancement**

#### **5.1 Global Error Handler**

```typescript
// apps/web/src/server/error-handler.ts
export function createErrorHandler(logger: ILogger) {
  return (error: Error, req: Request, res: Response, next: NextFunction) => {
    const errorId = generateErrorId();
    
    logger.error('Unhandled application error', error, {
      errorId,
      requestId: req.id,
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });

    res.status(500).json({
      error: 'Internal Server Error',
      errorId,
      message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
    });
  };
}
```

## 📊 **Implementation Breakdown**

### **Epic Tasks**

#### **Phase 1: Infrastructure Setup (1 week)**

- [ ] **Task 1.1**: Install Pino dependencies and types
- [ ] **Task 1.2**: Create Pino configuration system
- [ ] **Task 1.3**: Implement PinoLogger wrapper class
- [ ] **Task 1.4**: Update DI container with logger registration

#### **Phase 2: Service Integration (2 weeks)**

- [ ] **Task 2.1**: Update all infrastructure services to use Pino
- [ ] **Task 2.2**: Update all application services to use Pino
- [ ] **Task 2.3**: Add service-specific logger child instances
- [ ] **Task 2.4**: Update error handling to use structured logging

#### **Phase 3: Console Elimination (2 weeks)**

- [ ] **Task 3.1**: Replace console statements in infrastructure package
- [ ] **Task 3.2**: Replace console statements in monitor package
- [ ] **Task 3.3**: Replace console statements in alerting package
- [ ] **Task 3.4**: Replace console statements in notification package
- [ ] **Task 3.5**: Replace console statements in web application

#### **Phase 4: HTTP Logging (1 week)**

- [ ] **Task 4.1**: Implement Pino HTTP middleware
- [ ] **Task 4.2**: Add request/response logging
- [ ] **Task 4.3**: Implement error logging middleware
- [ ] **Task 4.4**: Add performance timing logs

#### **Phase 5: Testing & Validation (1 week)**

- [ ] **Task 5.1**: Create logging integration tests
- [ ] **Task 5.2**: Validate log output format and structure
- [ ] **Task 5.3**: Test log level filtering
- [ ] **Task 5.4**: Performance testing with Pino

## 🎯 **Acceptance Criteria**

### **Functional Requirements**

- ✅ Zero console.log, console.error, console.warn, console.info statements
- ✅ All services use ILogger interface via dependency injection
- ✅ Logs are structured JSON with consistent fields
- ✅ Log levels (DEBUG, INFO, WARN, ERROR, FATAL) work correctly
- ✅ Sensitive data is properly redacted

### **Technical Requirements**

- ✅ Pino logger configured with proper serializers
- ✅ Service-specific logger child instances
- ✅ HTTP request/response logging implemented
- ✅ Error logging includes full context and stack traces
- ✅ Log level configuration via environment variables

### **Performance Requirements**

- ✅ Pino logging performance is equal or better than console
- ✅ No significant memory overhead from logging
- ✅ Logging doesn't block main application thread
- ✅ Structured logging doesn't impact application performance

## 🚀 **Benefits & Impact**

### **Development Benefits**

- **Better Debugging**: Structured logs with context make debugging easier
- **Consistent Format**: All logs follow the same JSON structure
- **Service Tracing**: Easy to trace operations across service boundaries
- **Error Context**: Rich error information with full context

### **Production Benefits**

- **Observability**: Better integration with monitoring systems
- **Performance**: Pino is one of the fastest Node.js loggers
- **Scalability**: Structured logs scale better for log aggregation
- **Security**: Sensitive data is properly redacted

### **Operational Benefits**

- **Log Analysis**: JSON logs are easier to parse and analyze
- **Alerting**: Better integration with log-based alerting systems
- **Compliance**: Structured logging helps with audit requirements
- **Troubleshooting**: Faster issue resolution with better context

## 🔍 **Risk Assessment**

### **Technical Risks**

- **Migration Complexity**: Large codebase with many console statements
- **Performance Impact**: Potential performance impact during migration
- **Breaking Changes**: Logger interface changes might break existing code

### **Mitigation Strategies**

- **Phased Migration**: Replace console statements incrementally
- **Performance Testing**: Continuous performance monitoring during migration
- **Backward Compatibility**: Maintain existing interfaces during transition

## 📈 **Success Metrics**

### **Implementation Metrics**

- **Console Elimination**: 100% of console statements replaced
- **Code Coverage**: >95% test coverage for logging functionality
- **Performance**: <5% performance impact from logging changes

### **Quality Metrics**

- **Log Structure**: 100% of logs follow JSON structure
- **Error Context**: All errors include full context and stack traces
- **Data Security**: 100% of sensitive data properly redacted

## 🎉 **Epic Completion Definition**

This epic is considered complete when:

1. ✅ All console statements are eliminated from the codebase
2. ✅ Pino logging is fully integrated across all services
3. ✅ Structured JSON logging is working consistently
4. ✅ Log levels and filtering are properly configured
5. ✅ Performance impact is minimal or positive
6. ✅ All tests pass with the new logging system

---

## 📝 **Epic Notes**

### **Logging Philosophy**

This epic establishes a **"structured logging first"** approach where all log output is JSON-formatted with consistent fields, making the application more observable and maintainable.

### **Future Enhancements**

- **Log Aggregation**: Integration with ELK stack or similar
- **Distributed Tracing**: Correlation IDs across service boundaries
- **Metrics Integration**: Log-based metrics and alerting
- **Log Retention**: Automated log rotation and archival

### **Related Epics**

- **Observability Enhancement**: This epic enables better monitoring
- **Performance Optimization**: Structured logging helps identify bottlenecks
- **Security Hardening**: Proper data redaction improves security posture

---

**Epic Owner**: Infrastructure Team  
**Stakeholders**: Development Team, DevOps Team, Security Team  
**Priority**: High  
**Estimated Effort**: 7 weeks  
**Target Release**: Next Minor Version
