export declare class TestContainer {
    private container;
    constructor();
    initialize(): Promise<void>;
    registerMock<T>(key: symbol, mock: T): void;
    get<T>(key: symbol): T;
    has(key: symbol): boolean;
    getRegisteredTypes(): symbol[];
    clear(): void;
}
export declare function getTestContainer(): TestContainer;
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
export declare class TargetBuilder {
    private target;
    withId(id: string): TargetBuilder;
    withName(name: string): TargetBuilder;
    withAddress(address: string): TargetBuilder;
    withOwnerId(ownerId: string): TargetBuilder;
    withSpeedTestResults(results: any[]): TargetBuilder;
    withAlertRules(rules: any[]): TargetBuilder;
    build(): any;
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
    build(): any;
}
//# sourceMappingURL=setup.d.ts.map