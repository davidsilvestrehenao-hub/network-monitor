# @network-monitor/speed-test

Speed testing and monitoring scheduler services.

## Overview

This package contains services for executing speed tests (ping, download, upload) and scheduling continuous monitoring tasks.

## Exports

```typescript
import { 
  SpeedTestService,
  SpeedTestConfigService,
  MonitoringScheduler 
} from "@network-monitor/speed-test";
```

## SpeedTestService

Service for executing network performance tests.

### Responsibilities

- **Ping Testing**: Measure latency using native ping command
- **Download Testing**: Measure download speed by fetching files
- **Upload Testing**: Measure upload speed (coming soon)
- **Continuous Monitoring**: Schedule automated tests
- **Batch Testing**: Run tests on multiple targets concurrently
- **Result Storage**: Save test results to database

### Key Methods

```typescript
// Individual tests
runPingTest(targetAddress: string, config?: { timeout?: number }): Promise<PingResult>
runSpeedTest(targetAddress: string, config?: SpeedTestConfig): Promise<SpeedResult>
runComprehensiveTest(config: SpeedTestConfig): Promise<ComprehensiveSpeedTestResult>

// Continuous monitoring
startContinuousMonitoring(targetId: string, targetAddress: string, intervalMs: number): void
stopContinuousMonitoring(targetId: string): void
pauseContinuousMonitoring(targetId: string): void
resumeContinuousMonitoring(targetId: string): void
isMonitoring(targetId: string): boolean
getActiveMonitoringTargets(): string[]

// Batch operations
runBatchTests(targetIds: string[], config?: SpeedTestConfig): Promise<ComprehensiveSpeedTestResult[]>

// Service lifecycle
start(): Promise<void>
stop(): Promise<void>
isRunning(): boolean

// Configuration
setDefaultTimeout(timeout: number): void
setDefaultInterval(interval: number): void
getDefaultConfig(): Partial<SpeedTestConfig>
```

## SpeedTestConfigService

Service for managing speed test URLs and configuration.

### Responsibilities

- **URL Management**: Manage downloadable test file URLs
- **Provider Configuration**: Configure speed test providers
- **URL Selection**: Intelligently select best URL for tests
- **Validation**: Validate URL configurations

### Key Methods

```typescript
// URL management
getAllUrls(): SpeedTestUrl[]
getEnabledUrls(): SpeedTestUrl[]
addCustomUrl(url: Omit<SpeedTestUrl, "id">): SpeedTestUrl
updateUrl(id: string, updates: Partial<SpeedTestUrl>): SpeedTestUrl | null
removeUrl(id: string): boolean

// URL selection
selectBestUrl(criteria?: SelectionCriteria): SpeedTestUrlSelection

// Configuration
getConfig(): SpeedTestUrlConfig
updateConfig(config: Partial<SpeedTestUrlConfig>): void
resetToDefaults(): void

// Validation
validateUrl(url: string): boolean
validateUrlConfig(url: SpeedTestUrl): { valid: boolean; errors: string[] }
```

## MonitoringScheduler

Advanced scheduler for managing continuous monitoring of multiple targets.

### Responsibilities

- **Target Scheduling**: Schedule tests for multiple targets
- **Interval Management**: Manage different intervals per target
- **Failure Handling**: Track and handle failed tests
- **Resource Management**: Limit concurrent tests
- **Health Monitoring**: Track scheduler health status

### Key Methods

```typescript
// Target management
addTarget(config: MonitoringTargetConfig): void
removeTarget(targetId: string): void
updateTargetConfig(targetId: string, config: Partial<MonitoringTargetConfig>): void
getTargetConfig(targetId: string): MonitoringTargetConfig | null
getAllTargetConfigs(): MonitoringTargetConfig[]

// Scheduler control
start(): Promise<void>
stop(): Promise<void>
pause(): void
resume(): void
isRunning(): boolean
isPaused(): boolean

// Target control
enableTarget(targetId: string): void
disableTarget(targetId: string): void
pauseTarget(targetId: string): void
resumeTarget(targetId: string): void

// Statistics
getStats(): SchedulerStats
getActiveTargets(): string[]
getFailedTargets(): string[]

// Health checks
isHealthy(): boolean
getHealthStatus(): { status: string; issues: string[]; lastCheck: Date }
```

## Usage Example

```typescript
import { SpeedTestService, SpeedTestConfigService } from "@network-monitor/speed-test";

// Create config service
const configService = new SpeedTestConfigService(logger);

// Create speed test service
const speedTestService = new SpeedTestService(
  speedTestRepository,
  targetRepository,
  eventBus,
  logger,
  configService
);

// Run a ping test
const pingResult = await speedTestService.runPingTest("8.8.8.8", {
  timeout: 5000,
});

// Run a comprehensive test
const result = await speedTestService.runComprehensiveTest({
  targetId: "target-123",
  target: "https://example.com",
  timeout: 10000,
});

// Start continuous monitoring (every 30 seconds)
speedTestService.startContinuousMonitoring(
  "target-123",
  "https://example.com",
  30000
);
```

## Speed Test Implementation

### Ping Test
1. Extracts hostname from URL
2. Executes native `ping` command (3 packets)
3. Parses ping times from output
4. Calculates average and jitter
5. Returns result with latency metrics

### Download Test
1. Selects optimal download URL from config
2. Downloads test file with timeout
3. Measures download time and size
4. Calculates speed in Mbps
5. Implements fallback URLs on failure

### Upload Test
Coming soon - will use POST requests to measure upload bandwidth.

## Configuration

The service uses configurable test URLs:

```typescript
const config = {
  urls: [
    {
      id: "cloudflare-10mb",
      name: "Cloudflare 10MB",
      url: "https://speed.cloudflare.com/__down?bytes=10000000",
      sizeBytes: 10_000_000,
      provider: "cloudflare",
      enabled: true,
      priority: 1,
    },
    // ... more URLs
  ],
  defaultProvider: "cloudflare",
  maxConcurrentTests: 3,
  timeoutMs: 30000,
};
```

## Event-Driven Architecture

### Listens To:
- `SPEED_TEST_START_REQUESTED`
- `SPEED_TEST_STOP_REQUESTED`
- `CONTINUOUS_MONITORING_START_REQUESTED`
- `CONTINUOUS_MONITORING_STOP_REQUESTED`

### Emits:
- `SPEED_TEST_COMPLETED`
- `SPEED_TEST_FAILED`
- `MONITORING_STARTED`
- `MONITORING_STOPPED`

## Testing

```bash
# Run tests
bun test

# Type checking
bun run type-check

# Linting
bun run lint
```

## Building

```bash
# Build TypeScript
bun run build

# Watch mode for development
bun run dev
```

## Performance Considerations

- Limits concurrent tests to avoid network saturation
- Implements smart URL selection for optimal performance
- Falls back to alternative URLs on failure
- Respects timeout configurations
- Efficient resource cleanup

