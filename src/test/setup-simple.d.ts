import { FlexibleContainer } from "@network-monitor/infrastructure/container";
import type { Container } from "@network-monitor/infrastructure/container/types";
export declare function createMockLogger(): {
    debug: import("vitest").Mock<(...args: any[]) => any>;
    info: import("vitest").Mock<(...args: any[]) => any>;
    warn: import("vitest").Mock<(...args: any[]) => any>;
    error: import("vitest").Mock<(...args: any[]) => any>;
    setLevel: import("vitest").Mock<(...args: any[]) => any>;
    getLevel: import("vitest").Mock<() => string>;
};
export declare function createMockEventBus(): {
    on: import("vitest").Mock<(event: string, listener: Function) => void>;
    off: import("vitest").Mock<(event: string, listener: Function) => void>;
    emit: import("vitest").Mock<(event: string, data?: unknown) => void>;
    removeAllListeners: import("vitest").Mock<(event?: string) => void>;
};
export declare function createMockDatabaseService(): {
    getClient: import("vitest").Mock<() => {
        monitoringTarget: {
            findUnique: import("vitest").Mock<(...args: any[]) => any>;
            findMany: import("vitest").Mock<(...args: any[]) => any>;
            create: import("vitest").Mock<(...args: any[]) => any>;
            update: import("vitest").Mock<(...args: any[]) => any>;
            delete: import("vitest").Mock<(...args: any[]) => any>;
            count: import("vitest").Mock<(...args: any[]) => any>;
        };
        speedTestResult: {
            findUnique: import("vitest").Mock<(...args: any[]) => any>;
            findMany: import("vitest").Mock<(...args: any[]) => any>;
            create: import("vitest").Mock<(...args: any[]) => any>;
            update: import("vitest").Mock<(...args: any[]) => any>;
            delete: import("vitest").Mock<(...args: any[]) => any>;
            count: import("vitest").Mock<(...args: any[]) => any>;
        };
        alertRule: {
            findUnique: import("vitest").Mock<(...args: any[]) => any>;
            findMany: import("vitest").Mock<(...args: any[]) => any>;
            create: import("vitest").Mock<(...args: any[]) => any>;
            update: import("vitest").Mock<(...args: any[]) => any>;
            delete: import("vitest").Mock<(...args: any[]) => any>;
            count: import("vitest").Mock<(...args: any[]) => any>;
        };
        incidentEvent: {
            findUnique: import("vitest").Mock<(...args: any[]) => any>;
            findMany: import("vitest").Mock<(...args: any[]) => any>;
            create: import("vitest").Mock<(...args: any[]) => any>;
            update: import("vitest").Mock<(...args: any[]) => any>;
            delete: import("vitest").Mock<(...args: any[]) => any>;
            count: import("vitest").Mock<(...args: any[]) => any>;
        };
        pushSubscription: {
            findUnique: import("vitest").Mock<(...args: any[]) => any>;
            findMany: import("vitest").Mock<(...args: any[]) => any>;
            create: import("vitest").Mock<(...args: any[]) => any>;
            update: import("vitest").Mock<(...args: any[]) => any>;
            delete: import("vitest").Mock<(...args: any[]) => any>;
            count: import("vitest").Mock<(...args: any[]) => any>;
        };
        notification: {
            findUnique: import("vitest").Mock<(...args: any[]) => any>;
            findMany: import("vitest").Mock<(...args: any[]) => any>;
            create: import("vitest").Mock<(...args: any[]) => any>;
            update: import("vitest").Mock<(...args: any[]) => any>;
            delete: import("vitest").Mock<(...args: any[]) => any>;
            count: import("vitest").Mock<(...args: any[]) => any>;
        };
        user: {
            findUnique: import("vitest").Mock<(...args: any[]) => any>;
            findMany: import("vitest").Mock<(...args: any[]) => any>;
            create: import("vitest").Mock<(...args: any[]) => any>;
            update: import("vitest").Mock<(...args: any[]) => any>;
            delete: import("vitest").Mock<(...args: any[]) => any>;
            count: import("vitest").Mock<(...args: any[]) => any>;
        };
        $transaction: import("vitest").Mock<(...args: any[]) => any>;
    }>;
    connect: import("vitest").Mock<(...args: any[]) => any>;
    disconnect: import("vitest").Mock<(...args: any[]) => any>;
    isConnected: import("vitest").Mock<() => boolean>;
};
export declare function createMockTargetRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByUserId: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    count: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
    findByIdWithRelations: import("vitest").Mock<(...args: any[]) => any>;
    findByUserIdWithRelations: import("vitest").Mock<(...args: any[]) => any>;
    getAllWithRelations: import("vitest").Mock<(...args: any[]) => any>;
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
export declare function createMockSpeedTestRepository(): {
    runSpeedTest: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockMonitoringTargetRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByUserId: import("vitest").Mock<(...args: any[]) => any>;
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
    toggleEnabled: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockIncidentEventRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByTargetId: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    count: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
    resolve: import("vitest").Mock<(...args: any[]) => any>;
    findUnresolved: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createMockNotificationRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByUserId: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    count: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
    markAsRead: import("vitest").Mock<(...args: any[]) => any>;
    markAllAsReadByUserId: import("vitest").Mock<(...args: any[]) => any>;
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
    deleteByEndpoint: import("vitest").Mock<(...args: any[]) => any>;
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
export declare function createMockUserSpeedTestPreferenceRepository(): {
    findById: import("vitest").Mock<(...args: any[]) => any>;
    findByUserId: import("vitest").Mock<(...args: any[]) => any>;
    create: import("vitest").Mock<(...args: any[]) => any>;
    update: import("vitest").Mock<(...args: any[]) => any>;
    delete: import("vitest").Mock<(...args: any[]) => any>;
    count: import("vitest").Mock<(...args: any[]) => any>;
    getAll: import("vitest").Mock<(...args: any[]) => any>;
};
export declare function createTestContainer(): FlexibleContainer;
export declare function registerMockServices(container: Container): void;
export declare class TargetBuilder {
    private target;
    withId(id: string): TargetBuilder;
    withName(name: string): TargetBuilder;
    withAddress(address: string): TargetBuilder;
    withOwnerId(ownerId: string): TargetBuilder;
    withSpeedTestResults(results: any[]): TargetBuilder;
    withAlertRules(rules: any[]): TargetBuilder;
    build(overrides?: Partial<any>): any;
}
export declare class SpeedTestResultBuilder {
    private result;
    withId(id: number): SpeedTestResultBuilder;
    withTargetId(targetId: string): SpeedTestResultBuilder;
    withPing(ping: number): SpeedTestResultBuilder;
    withDownload(download: number): SpeedTestResultBuilder;
    withUpload(upload: number): SpeedTestResultBuilder;
    withStatus(status: string): SpeedTestResultBuilder;
    withError(error: string): SpeedTestResultBuilder;
    build(overrides?: Partial<any>): any;
}
export declare const createTestTarget: (overrides?: Partial<any>) => any;
export declare const createTestSpeedTestResult: (overrides?: Partial<any>) => any;
export declare const createTestAlertRule: (overrides?: Partial<any>) => {
    id: string;
    targetId: string;
    metric: string;
    operator: string;
    threshold: number;
    enabled: boolean;
};
export declare const createTestIncidentEvent: (overrides?: Partial<any>) => {
    id: string;
    alertRuleId: string;
    targetId: string;
    status: string;
    triggeredAt: Date;
};
export declare const createTestNotification: (overrides?: Partial<any>) => {
    id: string;
    userId: string;
    message: string;
    read: boolean;
    createdAt: Date;
};
export declare const createTestPushSubscription: (overrides?: Partial<any>) => {
    id: string;
    userId: string;
    endpoint: string;
    p256dh: string;
    auth: string;
};
export declare const createTestUser: (overrides?: Partial<any>) => {
    id: string;
    email: string;
    password: string;
};
export declare const expectServiceToBeCalledWith: (spy: any, ...args: any[]) => void;
export declare const expectEventToBeEmitted: (eventBus: ReturnType<typeof createMockEventBus>, event: string, data?: unknown) => void;
//# sourceMappingURL=setup-simple.d.ts.map