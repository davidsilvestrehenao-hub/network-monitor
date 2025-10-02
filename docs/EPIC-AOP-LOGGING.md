# Epic: Implement AOP-like Logging with `injectify-js` Dependency Injection

## 🎯 **Objective**

Implement an Aspect-Oriented Programming (AOP) style logging decorator for services using the `injectify-js` dependency injection container. This will add comprehensive logging functionality to service methods without modifying the original service source code, following the **Decorator design pattern**.

## 📋 **Background**

Currently, our network monitor project uses a custom DI container system. We want to enhance it with AOP-like capabilities using `injectify-js` to:

1. **Separate cross-cutting concerns** (logging) from business logic
2. **Add method-level logging** without code modification
3. **Maintain clean architecture** with decorator pattern
4. **Enable performance monitoring** with execution time tracking
5. **Provide consistent logging** across all services

## 🏗️ **Architecture Overview**

```text
┌─────────────────────┐    ┌──────────────────────────┐    ┌─────────────────────┐
│   Consumer          │───▶│  Logging Decorator       │───▶│  Original Service   │
│   (AppComponent)    │    │  (Cross-cutting Concern) │    │  (Business Logic)   │
└─────────────────────┘    └──────────────────────────┘    └─────────────────────┘
```

## 🎯 **Success Criteria**

- [ ] Services can be decorated with logging without source code modification
- [ ] Method entry/exit logging with parameters and execution time
- [ ] Error logging with stack traces
- [ ] Zero impact on business logic
- [ ] Type-safe decorator implementation
- [ ] Integration with existing DI container system

## 📦 **Implementation Tasks**

### Phase 1: Foundation Setup

#### Task 1.1: Install and Configure Dependencies

- [ ] Install `injectify-js` and `reflect-metadata`
- [ ] Update `tsconfig.json` for decorator support
- [ ] Configure project for AOP patterns

**Acceptance Criteria:**

- Dependencies installed and configured
- TypeScript decorators enabled
- Project builds without errors

#### Task 1.2: Create Base Logging Infrastructure

- [ ] Create `ILoggingDecorator` interface
- [ ] Implement base logging decorator class
- [ ] Add logging configuration options

**Acceptance Criteria:**

- Logging decorator interface defined
- Base decorator implementation complete
- Configurable logging levels and formats

### Phase 2: Service Integration

#### Task 2.1: Enhance MonitorService with AOP Logging

- [ ] Create `LoggingMonitorServiceDecorator`
- [ ] Wrap existing `MonitorService` methods
- [ ] Configure DI container for decorator injection

**Files to modify:**

- `packages/monitor/src/LoggingMonitorServiceDecorator.ts` (new)
- `packages/infrastructure/src/container/aop-container.ts` (new)
- `packages/monitor/src/index.ts` (update exports)

**Acceptance Criteria:**

- MonitorService methods logged without source modification
- Method parameters and return values logged
- Execution time tracking implemented
- Error handling with stack traces

#### Task 2.2: Enhance NotificationService with AOP Logging

- [ ] Create `LoggingNotificationServiceDecorator`
- [ ] Wrap notification methods
- [ ] Add push notification logging

**Files to modify:**

- `packages/notification/src/LoggingNotificationServiceDecorator.ts` (new)
- Update container configuration

**Acceptance Criteria:**

- Notification methods comprehensively logged
- Push notification delivery tracking
- Error scenarios properly logged

#### Task 2.3: Enhance AlertingService with AOP Logging

- [ ] Create `LoggingAlertingServiceDecorator`
- [ ] Wrap alerting methods
- [ ] Add rule evaluation logging

**Files to modify:**

- `packages/alerting/src/LoggingAlertingServiceDecorator.ts` (new)
- Update container configuration

**Acceptance Criteria:**

- Alert rule evaluation logged
- Alert triggering and resolution tracked
- Performance metrics for alerting system

### Phase 3: Advanced Features

#### Task 3.1: Performance Monitoring Integration

- [ ] Add performance metrics collection
- [ ] Implement method execution time tracking
- [ ] Create performance dashboard integration

**Acceptance Criteria:**

- Method execution times tracked
- Performance bottlenecks identified
- Metrics available for monitoring dashboard

#### Task 3.2: Conditional Logging

- [ ] Implement log level filtering
- [ ] Add environment-based logging configuration
- [ ] Create debug vs production logging modes

**Acceptance Criteria:**

- Logging configurable per environment
- Debug logging in development only
- Production logging optimized for performance

#### Task 3.3: Structured Logging Enhancement

- [ ] Implement structured JSON logging
- [ ] Add correlation IDs for request tracking
- [ ] Integrate with existing Winston logger

**Acceptance Criteria:**

- Structured log format implemented
- Request correlation tracking
- Integration with existing logging infrastructure

### Phase 4: Testing and Documentation

#### Task 4.1: Comprehensive Testing

- [ ] Unit tests for all decorators
- [ ] Integration tests for DI container
- [ ] Performance impact testing

**Acceptance Criteria:**

- 90%+ test coverage for decorators
- Integration tests pass
- Performance impact < 5% overhead

#### Task 4.2: Documentation and Examples

- [ ] Create AOP logging documentation
- [ ] Add usage examples
- [ ] Update architecture documentation

**Acceptance Criteria:**

- Complete documentation with examples
- Architecture diagrams updated
- Developer onboarding guide created

## 🔧 **Technical Implementation Details**

### Core Components

#### 1. Service Interface and Implementation

```typescript
// Example: IDataService interface
export interface IDataService {
  fetchData(id: string): Promise<{ id: string; content: string }>;
}

// Concrete implementation
@injectable()
export class DataService implements IDataService {
  public async fetchData(id: string): Promise<{ id: string; content: string }> {
    // Business logic here
    return { id, content: 'Data from database' };
  }
}
```

#### 2. Logging Decorator

```typescript
@injectable()
export class LoggingDataServiceDecorator implements IDataService {
  constructor(@inject(DataService) private readonly decoratedService: IDataService) {}

  public async fetchData(id: string): Promise<{ id: string; content: string }> {
    console.log(`[LOG] Entering 'fetchData' with argument: ${id}`);
    const startTime = Date.now();

    try {
      const result = await this.decoratedService.fetchData(id);
      const duration = Date.now() - startTime;
      console.log(`[LOG] Exiting 'fetchData' successfully. Duration: ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[LOG] Exiting 'fetchData' with error. Duration: ${duration}ms`, error);
      throw error;
    }
  }
}
```

#### 3. Container Configuration

```typescript
// Configure DI container to use decorator
container.register<IDataService>({
  token: DATA_SERVICE_TOKEN,
  useClass: LoggingDataServiceDecorator,
});
```

### Expected Output

```text
AppComponent is running...
[LOG] Entering 'fetchData' with argument: user-abc-123
--> Inside DataService: fetching data for user-abc-123
[LOG] Exiting 'fetchData' successfully. Duration: 51ms
AppComponent received data: { id: 'user-abc-123', content: 'Some important data from the database' }
```

## 🚀 **Benefits**

1. **Clean Separation of Concerns**: Business logic remains untouched
2. **Consistent Logging**: Uniform logging across all services
3. **Performance Monitoring**: Built-in execution time tracking
4. **Error Tracking**: Comprehensive error logging with context
5. **Maintainability**: Easy to add/remove logging without code changes
6. **Type Safety**: Full TypeScript support with interfaces

## 📊 **Metrics and Monitoring**

- Method execution times
- Error rates by service method
- Request volume by endpoint
- Performance bottleneck identification
- Log volume and storage optimization

## 🔗 **Dependencies**

- `injectify-js`: Lightweight DI container
- `reflect-metadata`: Decorator metadata support
- Existing infrastructure packages
- Winston logger integration

## 🎯 **Acceptance Criteria Summary**

- [ ] All services can be decorated with logging
- [ ] Zero modification to existing business logic
- [ ] Comprehensive method-level logging implemented
- [ ] Performance monitoring integrated
- [ ] Error handling and tracking enhanced
- [ ] Type-safe implementation throughout
- [ ] Documentation and examples complete
- [ ] Test coverage > 90%
- [ ] Performance overhead < 5%

## 📝 **Notes**

This epic implements a foundational AOP pattern that can be extended for other cross-cutting concerns like:

- Authentication/Authorization
- Caching
- Rate limiting
- Metrics collection
- Transaction management

The decorator pattern provides a clean, maintainable approach to adding functionality without modifying core business logic.

---

**Priority**: High
**Complexity**: Medium
**Estimated Effort**: 3-4 sprints
**Dependencies**: None (can be implemented independently)

## 🏷️ **Labels**

- `epic`
- `enhancement`
- `logging`
- `architecture`
- `aop`
- `dependency-injection`

## 📋 **GitHub Issue Creation**

To create this as a GitHub issue, copy this content and:

1. Go to your GitHub repository
2. Click "Issues" → "New Issue"
3. Use the title: "Epic: Implement AOP-like Logging with injectify-js Dependency Injection"
4. Paste this content in the body
5. Add the labels listed above
6. Assign to appropriate team members
7. Set milestone if applicable

Alternatively, you can use the GitHub CLI:

```bash
gh issue create \
  --title "Epic: Implement AOP-like Logging with injectify-js Dependency Injection" \
  --body-file docs/EPIC-AOP-LOGGING.md \
  --label "epic,enhancement,logging,architecture,aop,dependency-injection"
```
