import type { IBackgroundService, IObservableService } from "../base/IService";

/**
 * Interface for worker applications that run as standalone background processes.
 * These are different from IService implementations - they are complete applications
 * that can be deployed independently and communicate via events.
 */
export interface IWorker extends IBackgroundService, IObservableService {
  // Worker lifecycle
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // Health and status
  isHealthy(): boolean;
  getStatus(): WorkerStatus;

  // Configuration
  getName(): string;
  getVersion(): string;
}

export interface WorkerStatus {
  name: string;
  version: string;
  status: "starting" | "running" | "stopping" | "stopped" | "error";
  uptime: number;
  lastError?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Base configuration for workers
 */
export interface WorkerConfig {
  name: string;
  version: string;
  port?: number;
  healthCheckInterval?: number;
  shutdownTimeout?: number;
  enableMetrics?: boolean;
}
