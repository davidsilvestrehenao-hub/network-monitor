import type {
  ISpeedTestService,
  SpeedTestConfig,
  PingResult,
  SpeedResult,
  ComprehensiveSpeedTestResult,
} from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";
import type {
  ISpeedTestConfigService,
  SpeedTestUrl,
} from "@network-monitor/shared";

export class MockSpeedTestService implements ISpeedTestService {
  private monitoringTargets: Set<string> = new Set();
  private isServiceRunning = false;
  private defaultTimeout = 10000;
  private defaultInterval = 30000;

  private logger?: ILogger;
  private configService?: ISpeedTestConfigService;

  constructor(logger?: ILogger, configService?: ISpeedTestConfigService) {
    this.logger = logger;
    this.configService = configService;
    this.logger?.debug("MockSpeedTestService: Initialized");
  }

  async runPingTest(
    targetAddress: string,
    config: { timeout?: number } = {}
  ): Promise<PingResult> {
    this.logger?.debug("MockSpeedTestService: Running mock ping test", {
      targetAddress,
      config,
    });

    // Simulate network latency
    await this.simulateDelay(100, 500);

    // Simulate occasional failures (10% chance)
    if (Math.random() < 0.1) {
      return {
        ping: null,
        jitter: null,
        status: "FAILURE",
        error: "Connection timeout",
      };
    }

    // Generate realistic ping values
    const ping = Math.random() * 100 + 5; // 5-105ms
    const jitter = Math.random() * 20; // 0-20ms

    return {
      ping: Math.round(ping * 100) / 100,
      jitter: Math.round(jitter * 100) / 100,
      status: "SUCCESS",
    };
  }

  async runSpeedTest(
    targetAddress: string,
    config?: { timeout?: number }
  ): Promise<SpeedResult> {
    this.logger?.debug("MockSpeedTestService: Running mock speed test", {
      targetAddress,
      config,
    });

    // Simulate network testing time (2-5 seconds for download test)
    await this.simulateDelay(2000, 5000);

    // Simulate occasional failures (5% chance)
    if (Math.random() < 0.05) {
      return {
        download: null,
        upload: null,
        status: "FAILURE",
        error: "Speed test server unavailable",
      };
    }

    // Get URL selection from configuration service if available
    let selectedUrl: SpeedTestUrl | null = null;
    if (this.configService) {
      const urlSelection = this.configService.selectBestUrl({
        preferredSize: 100 * 1024 * 1024, // Prefer 100MB files
        preferredProvider: "CacheFly",
      });
      selectedUrl = urlSelection.selectedUrl;
    }

    // Simulate realistic download speed testing using configured URLs
    // Generate realistic speed values based on typical internet connections
    const download = Math.random() * 100 + 10; // 10-110 Mbps
    const upload = Math.random() * 50 + 5; // 5-55 Mbps

    const testFileInfo = selectedUrl
      ? `${selectedUrl.name} (${selectedUrl.provider}) - ${selectedUrl.url}`
      : "http://cachefly.cachefly.net/100mb.test (simulated)";

    this.logger?.debug("MockSpeedTestService: Mock speed test completed", {
      testFile: testFileInfo,
      downloadMbps: Math.round(download * 100) / 100,
      uploadMbps: Math.round(upload * 100) / 100,
      formula: "(sizeInBytes * 8) / durationInSeconds / 1_000_000",
      selectedUrl: selectedUrl?.name || "default",
    });

    return {
      download: Math.round(download * 100) / 100,
      upload: Math.round(upload * 100) / 100,
      status: "SUCCESS",
    };
  }

  async runComprehensiveTest(
    config: SpeedTestConfig
  ): Promise<ComprehensiveSpeedTestResult> {
    this.logger?.debug(
      "MockSpeedTestService: Running mock comprehensive test",
      { config }
    );

    if (!config.targetId) {
      throw new Error("Target ID is required for comprehensive test");
    }

    const startTime = Date.now();

    // Run ping test
    const pingResult = await this.runPingTest("mock-target", {
      timeout: config.timeout,
    });

    // Run speed test
    const speedResult = await this.runSpeedTest("mock-target", config);

    const testDuration = Date.now() - startTime;

    // Create comprehensive result
    const result: ComprehensiveSpeedTestResult = {
      id: crypto.randomUUID(),
      targetId: config.targetId,
      ping: pingResult.ping,
      download: speedResult.download,
      upload: speedResult.upload ?? null,
      status:
        pingResult.status === "SUCCESS" && speedResult.status === "SUCCESS"
          ? "SUCCESS"
          : "FAILURE",
      error: pingResult.error || speedResult.error || undefined,
      createdAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      jitter: pingResult.jitter ?? undefined,
      testDuration,
      serverInfo: {
        location: "Mock Test Server",
        name: "Mock Speed Test Server",
        distance: Math.floor(Math.random() * 1000) + 100, // 100-1100 km
      },
    };

    this.logger?.debug("MockSpeedTestService: Comprehensive test completed", {
      targetId: config.targetId,
      result,
    });

    return result;
  }

  startContinuousMonitoring(
    targetId: string,
    _targetAddress: string,
    intervalMs: number
  ): void {
    this.logger?.debug(
      "MockSpeedTestService: Starting mock continuous monitoring",
      {
        targetId,
        intervalMs,
      }
    );

    this.monitoringTargets.add(targetId);

    // Simulate continuous monitoring with a mock interval
    // const _interval = setInterval(async () => {
    //   try {
    //     await this.runComprehensiveTest({ targetId });
    //   } catch (error) {
    //     this.logger?.error(
    //       "MockSpeedTestService: Continuous monitoring error",
    //       {
    //         error,
    //         targetId,
    //       }
    //     );
    //   }
    // }, intervalMs);

    // Store the interval for cleanup (in a real implementation, you'd need to track this)
    // For mock purposes, we just track the target ID
  }

  stopContinuousMonitoring(targetId: string): void {
    this.logger?.debug(
      "MockSpeedTestService: Stopping mock continuous monitoring",
      {
        targetId,
      }
    );

    this.monitoringTargets.delete(targetId);
  }

  pauseContinuousMonitoring(targetId: string): void {
    this.logger?.debug(
      "MockSpeedTestService: Pausing mock continuous monitoring",
      {
        targetId,
      }
    );

    // In a real implementation, you'd pause the interval
    // For mock purposes, we just log the action
  }

  resumeContinuousMonitoring(targetId: string): void {
    this.logger?.debug(
      "MockSpeedTestService: Resuming mock continuous monitoring",
      {
        targetId,
      }
    );

    // In a real implementation, you'd resume the interval
    // For mock purposes, we just log the action
  }

  isMonitoring(targetId: string): boolean {
    return this.monitoringTargets.has(targetId);
  }

  getActiveMonitoringTargets(): string[] {
    return Array.from(this.monitoringTargets);
  }

  async runBatchTests(
    targetIds: string[],
    config?: Partial<SpeedTestConfig>
  ): Promise<ComprehensiveSpeedTestResult[]> {
    this.logger?.debug("MockSpeedTestService: Running mock batch tests", {
      targetIds,
      config,
    });

    const results: ComprehensiveSpeedTestResult[] = [];

    // Run tests sequentially for mock (in real implementation, you'd run in parallel)
    for (const targetId of targetIds) {
      try {
        const result = await this.runComprehensiveTest({
          targetId,
          target: `target-${targetId}`,
          timeout: config?.timeout,
        });
        results.push(result);
      } catch (error) {
        this.logger?.error("MockSpeedTestService: Batch test failed", {
          targetId,
          error,
        });

        // Add error result
        results.push({
          id: crypto.randomUUID(),
          targetId,
          ping: null,
          download: null,
          upload: null,
          status: "FAILURE",
          error: error instanceof Error ? error.message : "Unknown error",
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
        });
      }
    }

    this.logger?.debug("MockSpeedTestService: Batch tests completed", {
      targetIds,
      resultCount: results.length,
    });

    return results;
  }

  async start(): Promise<void> {
    this.logger?.info("MockSpeedTestService: Starting mock service");
    this.isServiceRunning = true;
  }

  async stop(): Promise<void> {
    this.logger?.info("MockSpeedTestService: Stopping mock service");

    // Stop all continuous monitoring
    this.monitoringTargets.clear();
    this.isServiceRunning = false;
  }

  isRunning(): boolean {
    return this.isServiceRunning;
  }

  setDefaultTimeout(timeout: number): void {
    this.defaultTimeout = timeout;
    this.logger?.debug("MockSpeedTestService: Default timeout set", {
      timeout,
    });
  }

  setDefaultInterval(interval: number): void {
    this.defaultInterval = interval;
    this.logger?.debug("MockSpeedTestService: Default interval set", {
      interval,
    });
  }

  getDefaultConfig(): Partial<SpeedTestConfig> {
    return {
      timeout: this.defaultTimeout,
    };
  }

  // Helper method to simulate network delays
  private async simulateDelay(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Helper method to seed with test data
  seedTestData(): void {
    this.logger?.debug("MockSpeedTestService: Seeding with test data");

    // Add some mock monitoring targets
    this.monitoringTargets.add("mock-target-1");
    this.monitoringTargets.add("mock-target-2");
    this.monitoringTargets.add("mock-target-3");
  }

  // Helper method to clear all test data
  clearTestData(): void {
    this.logger?.debug("MockSpeedTestService: Clearing test data");

    this.monitoringTargets.clear();
    this.isServiceRunning = false;
  }

  // Helper method to simulate network issues
  simulateNetworkIssues(): void {
    this.logger?.debug("MockSpeedTestService: Simulating network issues");

    // In a real implementation, this would modify the behavior of ping/speed tests
    // to simulate various network conditions
  }

  // Helper method to get service statistics
  getServiceStats(): {
    activeTargets: number;
    isRunning: boolean;
    defaultTimeout: number;
    defaultInterval: number;
  } {
    return {
      activeTargets: this.monitoringTargets.size,
      isRunning: this.isServiceRunning,
      defaultTimeout: this.defaultTimeout,
      defaultInterval: this.defaultInterval,
    };
  }

  // URL Configuration Management (Mock implementations)
  getAvailableUrls() {
    if (this.configService) {
      return this.configService.getAllUrls();
    }
    return [];
  }

  getEnabledUrls() {
    if (this.configService) {
      return this.configService.getEnabledUrls();
    }
    return [];
  }

  addCustomUrl(url: {
    name: string;
    url: string;
    sizeBytes: number;
    provider: string;
    region?: string;
    enabled?: boolean;
    priority?: number;
    description?: string;
  }) {
    if (this.configService) {
      return this.configService.addCustomUrl({
        ...url,
        enabled: url.enabled ?? true,
        priority: url.priority ?? 999,
      });
    }

    // Fallback mock implementation
    const mockUrl: SpeedTestUrl = {
      id: `mock-custom-${Date.now()}`,
      ...url,
      enabled: url.enabled ?? true,
      priority: url.priority ?? 999,
    };

    this.logger?.debug("MockSpeedTestService: Added custom URL (mock)", {
      url: mockUrl,
    });
    return mockUrl;
  }

  updateUrl(
    id: string,
    updates: Partial<{
      name: string;
      url: string;
      sizeBytes: number;
      provider: string;
      region?: string;
      enabled: boolean;
      priority: number;
      description?: string;
    }>
  ) {
    if (this.configService) {
      return this.configService.updateUrl(id, updates);
    }

    this.logger?.debug("MockSpeedTestService: Updated URL (mock)", {
      id,
      updates,
    });
    return null;
  }

  removeUrl(id: string) {
    if (this.configService) {
      return this.configService.removeUrl(id);
    }

    this.logger?.debug("MockSpeedTestService: Removed URL (mock)", { id });
    return true;
  }

  enableUrl(id: string) {
    if (this.configService) {
      return this.configService.enableUrl(id);
    }

    this.logger?.debug("MockSpeedTestService: Enabled URL (mock)", { id });
    return true;
  }

  disableUrl(id: string) {
    if (this.configService) {
      return this.configService.disableUrl(id);
    }

    this.logger?.debug("MockSpeedTestService: Disabled URL (mock)", { id });
    return true;
  }

  selectUrlForTest(criteria?: {
    preferredSize?: number;
    preferredProvider?: string;
    excludeProviders?: string[];
    maxSize?: number;
    minSize?: number;
  }) {
    if (this.configService) {
      return this.configService.selectBestUrl(criteria);
    }

    // Fallback mock selection
    const mockUrl: SpeedTestUrl = {
      id: "mock-default",
      name: "Mock Default URL",
      url: "http://cachefly.cachefly.net/100mb.test",
      sizeBytes: 100 * 1024 * 1024,
      provider: "CacheFly",
      region: "Mock",
      enabled: true,
      priority: 1,
      description: "Mock default URL for testing",
    };

    return {
      selectedUrl: mockUrl,
      fallbackUrls: [],
      selectionReason: "Mock default URL selection",
    };
  }

  getUrlStats() {
    if (this.configService) {
      return this.configService.getUrlStats();
    }

    return {
      totalUrls: 1,
      enabledUrls: 1,
      providers: ["CacheFly"],
      sizeRange: { min: 100 * 1024 * 1024, max: 100 * 1024 * 1024 },
    };
  }
}
