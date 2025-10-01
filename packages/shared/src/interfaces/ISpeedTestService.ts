import type { SpeedTestResult } from "./ITargetRepository";
import type { SpeedTestConfig } from "./IMonitorService";
import type { IBackgroundService } from "./base/IService";

// Comprehensive config extends the basic SpeedTestConfig
export interface ComprehensiveSpeedTestConfig extends SpeedTestConfig {
  testPing?: boolean;
  testDownload?: boolean;
  testUpload?: boolean;
}

export interface PingResult {
  ping: number | null;
  jitter: number | null;
  status: "SUCCESS" | "FAILURE";
  error?: string;
}

export interface SpeedResult {
  download: number | null;
  upload: number | null;
  status: "SUCCESS" | "FAILURE";
  error?: string;
}

export interface ComprehensiveSpeedTestResult extends SpeedTestResult {
  jitter?: number;
  testDuration?: number;
  serverInfo?: {
    location?: string;
    name?: string;
    distance?: number;
  };
}

export interface ISpeedTestService extends IBackgroundService {
  // Core testing methods
  runPingTest(
    targetAddress: string,
    config?: { timeout?: number }
  ): Promise<PingResult>;
  runSpeedTest(
    targetAddress: string,
    config?: SpeedTestConfig
  ): Promise<SpeedResult>;
  runComprehensiveTest(
    config: SpeedTestConfig
  ): Promise<ComprehensiveSpeedTestResult>;

  // Continuous monitoring
  startContinuousMonitoring(
    targetId: string,
    targetAddress: string,
    intervalMs: number
  ): void;
  stopContinuousMonitoring(targetId: string): void;
  pauseContinuousMonitoring(targetId: string): void;
  resumeContinuousMonitoring(targetId: string): void;
  isMonitoring(targetId: string): boolean;
  getActiveMonitoringTargets(): string[];

  // Batch operations
  runBatchTests(
    targetIds: string[],
    config?: SpeedTestConfig
  ): Promise<ComprehensiveSpeedTestResult[]>;

  // Service management
  isRunning(): boolean;

  // Configuration
  setDefaultTimeout(timeout: number): void;
  setDefaultInterval(interval: number): void;
  getDefaultConfig(): Partial<SpeedTestConfig>;
}
