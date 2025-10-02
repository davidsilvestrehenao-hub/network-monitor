import { vi } from "vitest";
import {
  TestContainer,
  createMockLogger,
  createMockEventBus,
  createMockDatabaseService,
} from "../setup";
import { TYPES } from "@network-monitor/infrastructure/container/types";
// Test container factory
export function createTestContainer() {
  const container = new TestContainer();
  return container;
}
// Mock service registration helpers
export function registerMockServices(container) {
  // Register core mocks
  container.registerMock(TYPES.ILogger, createMockLogger());
  container.registerMock(TYPES.IEventBus, createMockEventBus());
  container.registerMock(TYPES.IDatabaseService, createMockDatabaseService());
}
// Service-specific mock factories
export function createMockTargetRepository() {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}
export function createMockSpeedTestResultRepository() {
  return {
    findById: vi.fn(),
    findByTargetId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}
export function createMockAlertRuleRepository() {
  return {
    findById: vi.fn(),
    findByTargetId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}
export function createMockIncidentEventRepository() {
  return {
    findById: vi.fn(),
    findByTargetId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}
export function createMockNotificationRepository() {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}
export function createMockPushSubscriptionRepository() {
  return {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findByEndpoint: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}
export function createMockUserRepository() {
  return {
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    count: vi.fn(),
    getAll: vi.fn(),
  };
}
// Service mock factories
export function createMockMonitorService() {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getByUserId: vi.fn(),
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(),
    getActiveTargets: vi.fn(),
    runSpeedTest: vi.fn(),
  };
}
export function createMockAlertingService() {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getByUserId: vi.fn(),
    evaluateRules: vi.fn(),
    createAlert: vi.fn(),
    resolveAlert: vi.fn(),
  };
}
export function createMockNotificationService() {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getByUserId: vi.fn(),
    sendPushNotification: vi.fn(),
    sendInAppNotification: vi.fn(),
    markAsRead: vi.fn(),
  };
}
export function createMockAuthService() {
  return {
    getById: vi.fn(),
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getByUserId: vi.fn(),
    authenticate: vi.fn(),
    authorize: vi.fn(),
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  };
}
export function createMockSpeedTestService() {
  return {
    runSpeedTest: vi.fn(),
    getConfig: vi.fn(),
    updateConfig: vi.fn(),
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(),
  };
}
// Test data factories
export function createTestTarget(overrides = {}) {
  return {
    id: "target-123",
    name: "Test Target",
    address: "https://test.com",
    ownerId: "user-123",
    speedTestResults: [],
    alertRules: [],
    ...overrides,
  };
}
export function createTestSpeedTestResult(overrides = {}) {
  return {
    id: 1,
    targetId: "target-123",
    ping: 50,
    download: 100,
    upload: 50,
    status: "SUCCESS",
    error: null,
    createdAt: new Date(),
    ...overrides,
  };
}
export function createTestAlertRule(overrides = {}) {
  return {
    id: 1,
    name: "High Ping Alert",
    metric: "ping",
    condition: "GREATER_THAN",
    threshold: 100,
    enabled: true,
    targetId: "target-123",
    ...overrides,
  };
}
export function createTestIncidentEvent(overrides = {}) {
  return {
    id: 1,
    timestamp: new Date(),
    type: "ALERT",
    description: "High ping detected",
    resolved: false,
    targetId: "target-123",
    ruleId: 1,
    ...overrides,
  };
}
export function createTestUser(overrides = {}) {
  return {
    id: "user-123",
    name: "Test User",
    email: "test@example.com",
    emailVerified: new Date(),
    image: null,
    ...overrides,
  };
}
// Assertion helpers
export function expectServiceToBeCalledWith(service, method, ...args) {
  expect(service[method]).toHaveBeenCalledWith(...args);
}
export function expectServiceToHaveBeenCalledTimes(service, method, times) {
  expect(service[method]).toHaveBeenCalledTimes(times);
}
export function expectServiceToHaveBeenCalled(service, method) {
  expect(service[method]).toHaveBeenCalled();
}
export function expectServiceNotToHaveBeenCalled(service, method) {
  expect(service[method]).not.toHaveBeenCalled();
}
// Event bus testing helpers
export function expectEventToBeEmitted(eventBus, event, data) {
  expect(eventBus.emit).toHaveBeenCalledWith(event, data);
}
export function expectEventListenerToBeRegistered(eventBus, event) {
  expect(eventBus.on).toHaveBeenCalledWith(event, expect.any(Function));
}
export function expectEventListenerToBeRemoved(eventBus, event) {
  expect(eventBus.off).toHaveBeenCalledWith(event, expect.any(Function));
}
// Database testing helpers
export function mockDatabaseQuery(databaseService, table, method, result) {
  const client = databaseService.getClient();
  client[table][method].mockResolvedValue(result);
}
export function mockDatabaseTransaction(databaseService, result) {
  const client = databaseService.getClient();
  client.$transaction.mockImplementation(async callback => {
    return await callback(client);
  });
  return result;
}
// Error testing helpers
export function expectToThrowAsync(fn, errorMessage) {
  return expect(async () => {
    await fn();
  }).rejects.toThrow(errorMessage);
}
// Performance testing helpers
export async function measureExecutionTime(fn) {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
}
export function expectExecutionTimeToBeLessThan(fn, maxTime) {
  return expect(measureExecutionTime(fn)).resolves.toBeLessThan(maxTime);
}
