// Test mock interfaces to replace 'any' types
// These interfaces define the structure of mock objects used in tests

import type { Mock } from "vitest";
import type {
  SpeedTestResult,
  AlertRule,
  MonitoringTarget,
} from "./standardized-domain-types";
import type { SpeedTestStatus } from "../constants/domain-constants";
import type { EventMap } from "./event-map-types";

// Mock Logger Interface
export interface MockLogger {
  debug: Mock;
  info: Mock;
  warn: Mock;
  error: Mock;
  fatal: Mock;
  setLevel: Mock;
  getLevel: Mock;
  isLevelEnabled: Mock;
  setContext: Mock;
  getContext: Mock;
  child: Mock;
}

// Mock Event Bus Interface
export interface MockEventBus {
  // Strongly-typed event methods (preferred)
  on: Mock;
  once: Mock;
  off: Mock;
  emit: Mock;
  emitAsync: Mock;

  // Dynamic event methods (for events not in EventMap)
  onDynamic: Mock;
  onceDynamic: Mock;
  offDynamic: Mock;
  emitDynamic: Mock;
  emitAsyncDynamic: Mock;

  // Typed event object methods
  publishEvent: Mock;
  subscribeToEvent: Mock;

  // Event management
  removeAllListeners: Mock;
  listenerCount: Mock;
  eventNames: Mock;
  getTypedEventNames: Mock;

  // Lifecycle
  connect: Mock;
  disconnect: Mock;
  isConnected: Mock;

  // Event validation
  isValidEventType: (eventType: string) => eventType is keyof EventMap;
  validateEventData: <T extends keyof EventMap>(
    eventType: T,
    data: unknown
  ) => data is EventMap[T];
}

// Mock Database Service Interface
export interface MockDatabaseService {
  getClient: Mock;
  connect: Mock;
  disconnect: Mock;
}

// Mock Prisma Client Interface
export interface MockPrismaClient {
  monitoringTarget: MockPrismaModel;
  speedTestResult: MockPrismaModel;
  alertRule: MockPrismaModel;
  incidentEvent: MockPrismaModel;
  notification: MockPrismaModel;
  pushSubscription: MockPrismaModel;
  user: MockPrismaModel;
  $transaction: Mock;
}

// Mock Prisma Model Interface (for CRUD operations)
export interface MockPrismaModel {
  findUnique: Mock;
  findMany: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  count: Mock;
  createMany?: Mock;
}

// Mock Repository Interfaces
export interface MockTargetRepository {
  findById: Mock;
  findByUserId: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  count: Mock;
  getAll: Mock;
  findByIdWithRelations: Mock;
  findByUserIdWithRelations: Mock;
  getAllWithRelations: Mock;
}

export interface MockSpeedTestResultRepository {
  findById: Mock;
  findByTargetId: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  count: Mock;
  getAll: Mock;
}

export interface MockSpeedTestRepository {
  runSpeedTest: Mock;
}

export interface MockMonitoringTargetRepository {
  findById: Mock;
  findByUserId: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  count: Mock;
  getAll: Mock;
}

export interface MockAlertRuleRepository {
  findById: Mock;
  findByTargetId: Mock;
  findByQuery: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  deleteByTargetId: Mock;
  count: Mock;
  getAll: Mock;
  toggleEnabled: Mock;
}

export interface MockIncidentEventRepository {
  findById: Mock;
  findByTargetId: Mock;
  findByQuery: Mock;
  getUnresolvedByTargetId: Mock;
  findUnresolved: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  deleteByTargetId: Mock;
  resolve: Mock;
  resolveByTargetId: Mock;
  count: Mock;
  getAll: Mock;
}

export interface MockNotificationRepository {
  findById: Mock;
  findByUserId: Mock;
  findByQuery: Mock;
  getUnreadByUserId: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  deleteByUserId: Mock;
  deleteOldNotifications: Mock;
  count: Mock;
  getAll: Mock;
  markAsRead: Mock;
  markAllAsReadByUserId: Mock;
}

export interface MockPushSubscriptionRepository {
  findById: Mock;
  findByUserId: Mock;
  findByEndpoint: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  deleteByUserId: Mock;
  count: Mock;
  getAll: Mock;
  deleteByEndpoint: Mock;
}

export interface MockUserRepository {
  findById: Mock;
  findByEmail: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  count: Mock;
  getAll: Mock;
}

export interface MockUserSpeedTestPreferenceRepository {
  findById: Mock;
  findByUserId: Mock;
  create: Mock;
  update: Mock;
  delete: Mock;
  count: Mock;
  getAll: Mock;
}

// Test Data Builder Interfaces
export interface TargetBuilder<T = MonitoringTarget> {
  withId(id: string): TargetBuilder<T>;
  withName(name: string): TargetBuilder<T>;
  withAddress(address: string): TargetBuilder<T>;
  withOwnerId(ownerId: string): TargetBuilder<T>;
  // Use proper interfaces instead of unknown for better type safety
  withSpeedTestResults(results: SpeedTestResult[]): TargetBuilder<T>;
  withAlertRules(rules: AlertRule[]): TargetBuilder<T>;
  // Generic return type for type-safe building
  build<R = T>(overrides?: Partial<Record<string, unknown>>): R;
}

export interface SpeedTestResultBuilder<T = SpeedTestResult> {
  withId(id: string): SpeedTestResultBuilder<T>;
  withTargetId(targetId: string): SpeedTestResultBuilder<T>;
  withPing(ping: number): SpeedTestResultBuilder<T>;
  withDownload(download: number): SpeedTestResultBuilder<T>;
  withUpload(upload: number): SpeedTestResultBuilder<T>;
  withStatus(
    status: typeof SpeedTestStatus.SUCCESS | typeof SpeedTestStatus.FAILURE
  ): SpeedTestResultBuilder<T>;
  withError(error: string): SpeedTestResultBuilder<T>;
  withTimestamp(timestamp: string): SpeedTestResultBuilder<T>;
  // Generic return type for type-safe building
  build<R = T>(overrides?: Partial<Record<string, unknown>>): R;
}

// Mock Fetch Interface
export interface MockFetch extends Mock {
  mockImplementation: Mock;
  mockResolvedValue: Mock;
  mockRejectedValue: Mock;
}

// Mock Response Interface
export interface MockResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json: Mock;
  text: Mock;
  blob: Mock;
  arrayBuffer: Mock;
  headers: Headers;
}

// Test Helper Function Types
export type TestDataFactory<T> = (overrides?: Partial<T>) => T;
// Justification: Test expectations need to accept any arguments for flexible spy verification
export type ServiceCallExpectation = (spy: Mock, ...args: unknown[]) => void;
export type EventListenerExpectation = (
  eventBus: MockEventBus,
  event: string
) => void;
// Justification: Database transaction mocks need to handle any result type for testing
export type DatabaseTransactionMock<T = unknown> = (
  databaseService: MockDatabaseService,
  result: T
) => void;
