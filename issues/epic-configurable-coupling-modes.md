# Epic: Configurable Coupling Modes - Architectural Flexibility Enhancement

**Labels:** epic, architecture, coupling, enhancement, infrastructure

## 🎯 **Epic Overview**

Implement a configuration-driven system that allows the Network Monitor application to toggle between **loosely coupled (event-driven)** and **tightly coupled (direct-call)** architectures without changing business logic code. This enhancement will provide unprecedented architectural flexibility for testing, deployment, and migration scenarios.

## 🌟 **Epic Value Proposition**

- **Architectural Agility**: Switch between coupling modes via environment variables
- **Testing Flexibility**: Use direct calls for debugging, events for integration testing
- **Migration Support**: Gradually migrate from monolith to microservices architecture
- **Environment Optimization**: Different coupling strategies per environment
- **Zero Code Changes**: Business logic remains completely unchanged

## 🏗️ **Current Architecture Analysis**

### **Existing Event-Driven Architecture**

The application currently uses a **loosely coupled event-driven architecture**:

```typescript
// Current: MonitorService emits events
await this.eventBus.emit(EventKeys.SPEED_TEST_COMPLETED, {
  targetId: target.id,
  result: speedTestResult,
  timestamp: new Date(),
});

// AlertingService listens for events
this.eventBus.on(EventKeys.SPEED_TEST_COMPLETED, async (data) => {
  await this.processSpeedTestResult(data);
});
```

### **Service Communication Patterns**

Current services communicate via events:

- **MonitorService** → Events → **AlertingService**
- **MonitorService** → Events → **NotificationService**
- **AlertingService** → Events → **NotificationService**

## 🎯 **Epic Goals**

### **Primary Objectives**

1. **Configuration-Driven Architecture**: Toggle coupling modes via `COUPLING_MODE` environment variable
2. **Zero Business Logic Changes**: Existing service methods remain unchanged
3. **Interface Abstraction**: Create common contracts for both coupling modes
4. **Conditional DI Registration**: Container chooses implementation based on config
5. **Comprehensive Testing**: Validate both modes work identically

### **Success Criteria**

- ✅ `COUPLING_MODE=LOOSE` uses event-driven communication
- ✅ `COUPLING_MODE=TIGHT` uses direct service calls
- ✅ Business logic code remains identical in both modes
- ✅ All tests pass in both coupling modes
- ✅ Performance characteristics documented for each mode
- ✅ Migration path documented for existing deployments

## 📋 **Epic User Stories**

### **Story 1: Configuration-Based Mode Selection**

**As a** DevOps engineer  
**I want** to set `COUPLING_MODE=TIGHT` in development  
**So that** I can debug service interactions with direct calls and breakpoints

### **Story 2: Event-Driven Production Mode**

**As a** system architect  
**I want** to set `COUPLING_MODE=LOOSE` in production  
**So that** services remain decoupled and can scale independently

### **Story 3: Testing Flexibility**

**As a** developer  
**I want** to run the same test suite in both coupling modes  
**So that** I can verify behavioral consistency across architectures

### **Story 4: Migration Support**

**As a** platform team  
**I want** to gradually migrate from tight to loose coupling  
**So that** I can minimize risk during architectural transitions

## 🔧 **Technical Implementation Plan**

### **Phase 1: Abstraction Layer Design**

#### **1.1 Define Service Communication Contracts**

Create abstraction interfaces for cross-service communication:

```typescript
// packages/shared/src/interfaces/communication/IServiceNotifier.ts
export interface IServiceNotifier {
  notifySpeedTestCompleted(data: SpeedTestCompletedData): Promise<void>;
  notifyTargetCreated(data: TargetCreatedData): Promise<void>;
  notifyAlertTriggered(data: AlertTriggeredData): Promise<void>;
  notifyIncidentResolved(data: IncidentResolvedData): Promise<void>;
}

// packages/shared/src/interfaces/communication/IAlertProcessor.ts
export interface IAlertProcessor {
  processSpeedTestResult(data: SpeedTestCompletedData): Promise<void>;
  processTargetStatusChange(data: TargetStatusData): Promise<void>;
}

// packages/shared/src/interfaces/communication/INotificationDispatcher.ts
export interface INotificationDispatcher {
  dispatchAlert(alert: AlertData): Promise<void>;
  dispatchIncidentNotification(incident: IncidentData): Promise<void>;
}
```

#### **1.2 Create DI Container Tokens**

```typescript
// packages/shared/src/constants/di-tokens.ts
export const SERVICE_COMMUNICATION_TOKENS = {
  SERVICE_NOTIFIER: Symbol.for('IServiceNotifier'),
  ALERT_PROCESSOR: Symbol.for('IAlertProcessor'),
  NOTIFICATION_DISPATCHER: Symbol.for('INotificationDispatcher'),
} as const;
```

### **Phase 2: Loose Coupling Implementation**

#### **2.1 Event-Driven Service Notifier**

```typescript
// packages/infrastructure/src/communication/EventDrivenServiceNotifier.ts
export class EventDrivenServiceNotifier implements IServiceNotifier {
  constructor(
    private eventBus: IEventBus,
    private logger: ILogger
  ) {}

  async notifySpeedTestCompleted(data: SpeedTestCompletedData): Promise<void> {
    this.logger.debug('EVENT_MODE: Publishing speed test completed event');
    await this.eventBus.emitAsync(EventKeys.SPEED_TEST_COMPLETED, data);
  }

  async notifyTargetCreated(data: TargetCreatedData): Promise<void> {
    this.logger.debug('EVENT_MODE: Publishing target created event');
    await this.eventBus.emitAsync(EventKeys.TARGET_CREATED, data);
  }

  async notifyAlertTriggered(data: AlertTriggeredData): Promise<void> {
    this.logger.debug('EVENT_MODE: Publishing alert triggered event');
    await this.eventBus.emitAsync(EventKeys.ALERT_TRIGGERED, data);
  }

  async notifyIncidentResolved(data: IncidentResolvedData): Promise<void> {
    this.logger.debug('EVENT_MODE: Publishing incident resolved event');
    await this.eventBus.emitAsync(EventKeys.INCIDENT_RESOLVED, data);
  }
}
```

#### **2.2 Event-Driven Alert Processor**

```typescript
// packages/infrastructure/src/communication/EventDrivenAlertProcessor.ts
export class EventDrivenAlertProcessor implements IAlertProcessor {
  constructor(
    private eventBus: IEventBus,
    private logger: ILogger
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventBus.on(EventKeys.SPEED_TEST_COMPLETED, this.processSpeedTestResult.bind(this));
    this.eventBus.on(EventKeys.TARGET_UPDATED, this.processTargetStatusChange.bind(this));
  }

  async processSpeedTestResult(data: SpeedTestCompletedData): Promise<void> {
    this.logger.debug('EVENT_MODE: Processing speed test result via event');
    // Delegate to actual AlertingService
    await this.eventBus.emitAsync(EventKeys.ALERT_RULE_EVALUATION_REQUESTED, data);
  }

  async processTargetStatusChange(data: TargetStatusData): Promise<void> {
    this.logger.debug('EVENT_MODE: Processing target status change via event');
    await this.eventBus.emitAsync(EventKeys.TARGET_STATUS_EVALUATION_REQUESTED, data);
  }
}
```

### **Phase 3: Tight Coupling Implementation**

#### **3.1 Direct-Call Service Notifier**

```typescript
// packages/infrastructure/src/communication/DirectCallServiceNotifier.ts
export class DirectCallServiceNotifier implements IServiceNotifier {
  constructor(
    private alertingService: IAlertingService,
    private notificationService: INotificationService,
    private logger: ILogger
  ) {}

  async notifySpeedTestCompleted(data: SpeedTestCompletedData): Promise<void> {
    this.logger.debug('DIRECT_MODE: Processing speed test result via direct call');
    await Promise.all([
      this.alertingService.evaluateSpeedTestResult(data),
      this.notificationService.handleSpeedTestUpdate(data),
    ]);
  }

  async notifyTargetCreated(data: TargetCreatedData): Promise<void> {
    this.logger.debug('DIRECT_MODE: Processing target creation via direct call');
    await this.alertingService.setupDefaultRules(data.target);
  }

  async notifyAlertTriggered(data: AlertTriggeredData): Promise<void> {
    this.logger.debug('DIRECT_MODE: Processing alert trigger via direct call');
    await this.notificationService.sendAlert(data);
  }

  async notifyIncidentResolved(data: IncidentResolvedData): Promise<void> {
    this.logger.debug('DIRECT_MODE: Processing incident resolution via direct call');
    await this.notificationService.sendResolutionNotification(data);
  }
}
```

#### **3.2 Direct-Call Alert Processor**

```typescript
// packages/infrastructure/src/communication/DirectCallAlertProcessor.ts
export class DirectCallAlertProcessor implements IAlertProcessor {
  constructor(
    private alertingService: IAlertingService,
    private logger: ILogger
  ) {}

  async processSpeedTestResult(data: SpeedTestCompletedData): Promise<void> {
    this.logger.debug('DIRECT_MODE: Processing speed test result via direct call');
    await this.alertingService.evaluateSpeedTestResult(data);
  }

  async processTargetStatusChange(data: TargetStatusData): Promise<void> {
    this.logger.debug('DIRECT_MODE: Processing target status change via direct call');
    await this.alertingService.evaluateTargetStatus(data);
  }
}
```

### **Phase 4: Configuration-Driven Container Setup**

#### **4.1 Coupling Mode Configuration**

```typescript
// packages/infrastructure/src/config/coupling-config.ts
export enum CouplingMode {
  LOOSE = 'LOOSE',
  TIGHT = 'TIGHT',
}

export interface CouplingConfig {
  mode: CouplingMode;
  enableTransitionLogging: boolean;
  performanceMetrics: boolean;
}

export function getCouplingConfig(): CouplingConfig {
  const mode = (process.env.COUPLING_MODE as CouplingMode) || CouplingMode.LOOSE;
  
  return {
    mode,
    enableTransitionLogging: process.env.COUPLING_TRANSITION_LOGGING === 'true',
    performanceMetrics: process.env.COUPLING_PERFORMANCE_METRICS === 'true',
  };
}
```

#### **4.2 Conditional Container Registration**

```typescript
// packages/infrastructure/src/container/coupling-container-setup.ts
export function registerCommunicationServices(container: Container): void {
  const config = getCouplingConfig();
  
  container.logger.info(`Configuring container for ${config.mode} coupling mode`);

  if (config.mode === CouplingMode.TIGHT) {
    // Register tight coupling implementations
    container.bind(SERVICE_COMMUNICATION_TOKENS.SERVICE_NOTIFIER)
      .to(DirectCallServiceNotifier)
      .inSingletonScope();
    
    container.bind(SERVICE_COMMUNICATION_TOKENS.ALERT_PROCESSOR)
      .to(DirectCallAlertProcessor)
      .inSingletonScope();
    
    container.bind(SERVICE_COMMUNICATION_TOKENS.NOTIFICATION_DISPATCHER)
      .to(DirectCallNotificationDispatcher)
      .inSingletonScope();
      
  } else {
    // Register loose coupling implementations (default)
    container.bind(SERVICE_COMMUNICATION_TOKENS.SERVICE_NOTIFIER)
      .to(EventDrivenServiceNotifier)
      .inSingletonScope();
    
    container.bind(SERVICE_COMMUNICATION_TOKENS.ALERT_PROCESSOR)
      .to(EventDrivenAlertProcessor)
      .inSingletonScope();
    
    container.bind(SERVICE_COMMUNICATION_TOKENS.NOTIFICATION_DISPATCHER)
      .to(EventDrivenNotificationDispatcher)
      .inSingletonScope();
  }

  if (config.enableTransitionLogging) {
    container.bind(TYPES.ICouplingModeLogger)
      .to(CouplingModeLogger)
      .inSingletonScope();
  }
}
```

### **Phase 5: Service Integration**

#### **5.1 Update MonitorService**

```typescript
// packages/monitor/src/MonitorService.ts (updated sections)
export class MonitorService implements IMonitorService {
  constructor(
    // ... existing dependencies
    private serviceNotifier: IServiceNotifier, // NEW: Injected abstraction
    // ... rest of dependencies
  ) {
    // ... existing constructor logic
  }

  private async handleSpeedTestCompletion(
    target: Target,
    result: SpeedTestResult
  ): Promise<void> {
    // Store result (unchanged)
    await this.speedTestResultRepository.create({
      targetId: target.id,
      ping: result.ping,
      download: result.download,
      status: result.status,
      error: result.error,
    });

    // NEW: Use abstraction instead of direct event emission
    await this.serviceNotifier.notifySpeedTestCompleted({
      targetId: target.id,
      result,
      timestamp: new Date(),
    });

    // OLD CODE (removed):
    // await this.eventBus.emit(EventKeys.SPEED_TEST_COMPLETED, {
    //   targetId: target.id,
    //   result: speedTestResult,
    //   timestamp: new Date(),
    // });
  }

  async createTarget(data: CreateTargetData): Promise<Target> {
    const target = await this.targetRepository.create(data);
    
    // NEW: Use abstraction
    await this.serviceNotifier.notifyTargetCreated({
      target,
      userId: data.ownerId,
      timestamp: new Date(),
    });

    return target;
  }
}
```

#### **5.2 Update AlertingService**

```typescript
// packages/alerting/src/AlertingService.ts (updated sections)
export class AlertingService implements IAlertingService {
  constructor(
    // ... existing dependencies
    private serviceNotifier: IServiceNotifier, // NEW: Injected abstraction
    // ... rest of dependencies
  ) {
    // ... existing constructor logic
  }

  async evaluateSpeedTestResult(data: SpeedTestCompletedData): Promise<void> {
    const alerts = await this.checkAlertRules(data);
    
    for (const alert of alerts) {
      await this.createIncident(alert);
      
      // NEW: Use abstraction
      await this.serviceNotifier.notifyAlertTriggered({
        alert,
        targetId: data.targetId,
        timestamp: new Date(),
      });
    }
  }
}
```

### **Phase 6: Testing Strategy**

#### **6.1 Dual-Mode Test Suite**

```typescript
// src/test/integration/coupling-modes.test.ts
describe('Coupling Modes Integration', () => {
  describe.each([
    ['LOOSE', CouplingMode.LOOSE],
    ['TIGHT', CouplingMode.TIGHT],
  ])('Coupling Mode: %s', (modeName, mode) => {
    let container: Container;
    let monitorService: IMonitorService;
    let alertingService: IAlertingService;
    let notificationService: INotificationService;

    beforeEach(async () => {
      // Set coupling mode for this test
      process.env.COUPLING_MODE = mode;
      
      container = new Container();
      await setupTestContainer(container);
      
      monitorService = container.get(TYPES.IMonitorService);
      alertingService = container.get(TYPES.IAlertingService);
      notificationService = container.get(TYPES.INotificationService);
    });

    it('should create target and trigger alert workflow', async () => {
      // Create target
      const target = await monitorService.createTarget({
        name: 'Test Target',
        address: 'https://test.com',
        ownerId: 'user-123',
      });

      // Create alert rule
      await alertingService.createAlertRule({
        targetId: target.id,
        name: 'High Latency',
        metric: 'ping',
        condition: 'GREATER_THAN',
        threshold: 100,
      });

      // Simulate speed test that triggers alert
      const mockSpeedTestResult = {
        ping: 150, // Above threshold
        download: 50,
        status: SpeedTestStatus.SUCCESS,
        error: null,
      };

      // Start monitoring (this should eventually trigger the alert)
      await monitorService.startMonitoring(target.id, 1000);

      // Wait for alert processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Verify alert was created (behavior should be identical in both modes)
      const incidents = await alertingService.getIncidentsByTargetId(target.id);
      expect(incidents).toHaveLength(1);
      expect(incidents[0].type).toBe('ALERT');

      // Verify notification was sent (behavior should be identical in both modes)
      const notifications = await notificationService.getNotificationsByUserId('user-123');
      expect(notifications).toHaveLength(1);
      expect(notifications[0].message).toContain('High Latency');
    });

    it('should handle service failures gracefully', async () => {
      // Test error handling in both coupling modes
      // Implementation depends on specific error scenarios
    });
  });
});
```

#### **6.2 Performance Comparison Tests**

```typescript
// src/test/performance/coupling-performance.test.ts
describe('Coupling Mode Performance', () => {
  it('should measure performance characteristics of each mode', async () => {
    const results = {
      loose: await measureCouplingModePerformance(CouplingMode.LOOSE),
      tight: await measureCouplingModePerformance(CouplingMode.TIGHT),
    };

    console.log('Performance Results:', {
      loose: {
        avgResponseTime: results.loose.avgResponseTime,
        throughput: results.loose.throughput,
        memoryUsage: results.loose.memoryUsage,
      },
      tight: {
        avgResponseTime: results.tight.avgResponseTime,
        throughput: results.tight.throughput,
        memoryUsage: results.tight.memoryUsage,
      },
    });

    // Document performance characteristics
    expect(results.loose.avgResponseTime).toBeGreaterThan(0);
    expect(results.tight.avgResponseTime).toBeGreaterThan(0);
  });
});
```

## 📊 **Implementation Breakdown**

### **Epic Tasks**

#### **Phase 1: Foundation (2 weeks)**

- [ ] **Task 1.1**: Design service communication abstractions
- [ ] **Task 1.2**: Create DI container tokens for communication services
- [ ] **Task 1.3**: Define coupling mode configuration system
- [ ] **Task 1.4**: Create base interfaces for both coupling modes

#### **Phase 2: Loose Coupling Implementation (2 weeks)**

- [ ] **Task 2.1**: Implement EventDrivenServiceNotifier
- [ ] **Task 2.2**: Implement EventDrivenAlertProcessor
- [ ] **Task 2.3**: Implement EventDrivenNotificationDispatcher
- [ ] **Task 2.4**: Create event-driven integration tests

#### **Phase 3: Tight Coupling Implementation (2 weeks)**

- [ ] **Task 3.1**: Implement DirectCallServiceNotifier
- [ ] **Task 3.2**: Implement DirectCallAlertProcessor
- [ ] **Task 3.3**: Implement DirectCallNotificationDispatcher
- [ ] **Task 3.4**: Create direct-call integration tests

#### **Phase 4: Container Integration (1 week)**

- [ ] **Task 4.1**: Implement conditional container registration
- [ ] **Task 4.2**: Create coupling mode configuration loader
- [ ] **Task 4.3**: Add coupling mode logging and metrics
- [ ] **Task 4.4**: Update service-wiring configurations

#### **Phase 5: Service Updates (2 weeks)**

- [ ] **Task 5.1**: Update MonitorService to use abstractions
- [ ] **Task 5.2**: Update AlertingService to use abstractions
- [ ] **Task 5.3**: Update NotificationService to use abstractions
- [ ] **Task 5.4**: Remove direct event bus usage from business logic

#### **Phase 6: Testing & Validation (2 weeks)**

- [ ] **Task 6.1**: Create dual-mode integration test suite
- [ ] **Task 6.2**: Implement performance comparison tests
- [ ] **Task 6.3**: Create coupling mode migration guide
- [ ] **Task 6.4**: Validate all existing tests pass in both modes

#### **Phase 7: Documentation & Deployment (1 week)**

- [ ] **Task 7.1**: Update architecture documentation
- [ ] **Task 7.2**: Create coupling mode deployment guide
- [ ] **Task 7.3**: Update environment configuration templates
- [ ] **Task 7.4**: Create troubleshooting guide for coupling modes

## 🎯 **Acceptance Criteria**

### **Functional Requirements**

- ✅ Application runs identically in both `COUPLING_MODE=LOOSE` and `COUPLING_MODE=TIGHT`
- ✅ All existing functionality works without changes in both modes
- ✅ Business logic services remain unchanged (zero code changes)
- ✅ Configuration change requires only environment variable update
- ✅ Both modes pass the complete test suite

### **Technical Requirements**

- ✅ DI container conditionally registers implementations based on config
- ✅ Service abstractions provide identical interfaces for both modes
- ✅ Event-driven mode uses existing event bus infrastructure
- ✅ Direct-call mode bypasses event bus for immediate execution
- ✅ Error handling works consistently in both modes

### **Performance Requirements**

- ✅ Loose coupling mode maintains current performance characteristics
- ✅ Tight coupling mode shows improved latency for direct operations
- ✅ Memory usage documented and acceptable for both modes
- ✅ No memory leaks in either coupling mode

### **Documentation Requirements**

- ✅ Architecture decision record (ADR) created
- ✅ Deployment guide updated with coupling mode instructions
- ✅ Troubleshooting guide includes coupling mode scenarios
- ✅ Performance characteristics documented for each mode

## 🚀 **Benefits & Impact**

### **Development Benefits**

- **Debugging**: Direct calls enable easier debugging with breakpoints
- **Testing**: Simplified integration testing with synchronous calls
- **Development Speed**: Faster feedback loops in development environment

### **Production Benefits**

- **Scalability**: Event-driven architecture supports horizontal scaling
- **Resilience**: Loose coupling provides fault isolation
- **Flexibility**: Easy to add new services without changing existing ones

### **Operational Benefits**

- **Migration Support**: Gradual transition between architectural patterns
- **Environment Optimization**: Different strategies per environment
- **Risk Reduction**: Test architectural changes without code changes

## 🔍 **Risk Assessment**

### **Technical Risks**

- **Complexity**: Additional abstraction layer increases system complexity
- **Testing Overhead**: Need to test both coupling modes thoroughly
- **Performance Impact**: Abstraction layer may introduce minimal overhead

### **Mitigation Strategies**

- **Comprehensive Testing**: Dual-mode test suite ensures consistency
- **Performance Monitoring**: Continuous monitoring of both modes
- **Gradual Rollout**: Phased implementation with rollback capability

## 📈 **Success Metrics**

### **Implementation Metrics**

- **Code Coverage**: >95% test coverage for both coupling modes
- **Performance**: <5% performance difference between modes
- **Reliability**: 100% functional parity between modes

### **Adoption Metrics**

- **Development Usage**: Teams using tight coupling for debugging
- **Production Usage**: Production environments using loose coupling
- **Migration Success**: Successful transitions between coupling modes

## 🎉 **Epic Completion Definition**

This epic is considered complete when:

1. ✅ Both coupling modes are fully implemented and tested
2. ✅ All existing functionality works identically in both modes
3. ✅ Configuration-driven mode switching is operational
4. ✅ Performance characteristics are documented and acceptable
5. ✅ Documentation is complete and deployment guides are updated
6. ✅ Production deployment successfully uses the new architecture

---

## 📝 **Epic Notes**

### **Architecture Philosophy**

This epic embodies the principle of **"programming to an abstraction, not an implementation."** By creating a common contract that both coupling modes fulfill, we achieve maximum flexibility while maintaining code simplicity.

### **Future Enhancements**

- **Hybrid Mode**: Combine event-driven and direct-call patterns selectively
- **Dynamic Switching**: Runtime coupling mode changes without restart
- **Performance Optimization**: Mode-specific optimizations based on usage patterns

### **Related Epics**

- **Microservices Migration**: This epic enables gradual microservices adoption
- **Performance Optimization**: Coupling mode selection impacts performance strategy
- **Testing Infrastructure**: Enhanced testing capabilities across architectural patterns

---

**Epic Owner**: Architecture Team  
**Stakeholders**: Development Team, DevOps Team, Platform Team  
**Priority**: High  
**Estimated Effort**: 12 weeks  
**Target Release**: Next Major Version
