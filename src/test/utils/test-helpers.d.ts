import { TestContainer } from "../setup";
export declare function createTestContainer(): TestContainer;
export declare function registerMockServices(container: TestContainer): void;
export declare function createMockTargetRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByUserId: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    count: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockSpeedTestResultRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByTargetId: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    count: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockAlertRuleRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByTargetId: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    count: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockIncidentEventRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByTargetId: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    count: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockNotificationRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByUserId: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    count: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockPushSubscriptionRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByUserId: import("vitest").Mock<(...args: any[]) => any>;
    findByEndpoint: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    count: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockUserRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByEmail: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    count: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockMonitorService(): {
    getById: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    getByUserId: import("vitest").Mock<(...args: any[]) => any>;
    startMonitoring: import("vitest").Mock<(...args: any[]) => any>;
    stopMonitoring: import("vitest").Mock<(...args: any[]) => any>;
    getActiveTargets: import("vitest").Mock<(...args: any[]) => any>;
    runSpeedTest: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockAlertingService(): {
    getById: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    getByUserId: import("vitest").Mock<(...args: any[]) => any>;
    evaluateRules: import("vitest").Mock<(...args: any[]) => any>;
    createAlert: import("vitest").Mock<(...args: any[]) => any>;
    resolveAlert: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockNotificationService(): {
    getById: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    getByUserId: import("vitest").Mock<(...args: any[]) => any>;
    sendPushNotification: import("vitest").Mock<(...args: any[]) => any>;
    sendInAppNotification: import("vitest").Mock<(...args: any[]) => any>;
    markAsRead: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockAuthService(): {
    getById: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    getByUserId: import("vitest").Mock<(...args: any[]) => any>;
    authenticate: import("vitest").Mock<(...args: any[]) => any>;
    authorize: import("vitest").Mock<(...args: any[]) => any>;
    getCurrentUser: import("vitest").Mock<(...args: any[]) => any>;
    login: import("vitest").Mock<(...args: any[]) => any>;
    logout: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockSpeedTestService(): {
    runSpeedTest: import("vitest").Mock<(...args: any[]) => any>;
    getConfig: import("vitest").Mock<(...args: any[]) => any>;
    updateConfig: import("vitest").Mock<(...args: any[]) => any>;
    startMonitoring: import("vitest").Mock<(...args: any[]) => any>;
    stopMonitoring: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createTestTarget(overrides?: Partial<any>): {
    id: string;
    name: string;
    address: string;
    ownerId: string;
    speedTestResults: never[];
    alertRules: never[];
};
export declare function createTestSpeedTestResult(overrides?: Partial<any>): {
    id: number;
    targetId: string;
    ping: number;
    download: number;
    upload: number;
    status: string;
    error: null;
    createdAt: Date;
};
export declare function createTestAlertRule(overrides?: Partial<any>): {
    id: number;
    name: string;
    metric: string;
    condition: string;
    threshold: number;
    enabled: boolean;
    targetId: string;
};
export declare function createTestIncidentEvent(overrides?: Partial<any>): {
    id: number;
    timestamp: Date;
    type: string;
    description: string;
    resolved: boolean;
    targetId: string;
    ruleId: number;
};
export declare function createTestUser(overrides?: Partial<any>): {
    id: string;
    name: string;
    email: string;
    emailVerified: Date;
    image: null;
};
export declare function expectServiceToBeCalledWith(service: any, method: string, ...args: any[]): void;
export declare function expectServiceToHaveBeenCalledTimes(service: any, method: string, times: number): void;
export declare function expectServiceToHaveBeenCalled(service: any, method: string): void;
export declare function expectServiceNotToHaveBeenCalled(service: any, method: string): void;
export declare function expectEventToBeEmitted(eventBus: any, event: string, data?: any): void;
export declare function expectEventListenerToBeRegistered(eventBus: any, event: string): void;
export declare function expectEventListenerToBeRemoved(eventBus: any, event: string): void;
export declare function mockDatabaseQuery(databaseService: any, table: string, method: string, result: any): void;
export declare function mockDatabaseTransaction(databaseService: any, result: any): any;
export declare function expectToThrowAsync(fn: Function, errorMessage?: string): any;
export declare function measureExecutionTime(fn: Function): Promise<number>;
export declare function expectExecutionTimeToBeLessThan(fn: Function, maxTime: number): any;
//# sourceMappingURL=test-helpers.d.ts.map