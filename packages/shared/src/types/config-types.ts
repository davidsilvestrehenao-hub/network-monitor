/**
 * Shared types for configuration objects
 * These types are used for various configuration parameters across services
 */

// Speed test configuration types
export interface PingTestConfig {
  timeout?: number;
}

export interface DownloadUrlConfig {
  id: string;
  url: string;
  name: string;
  sizeBytes: number;
  provider: string;
  region?: string;
  enabled: boolean;
  priority: number;
  description?: string;
}

export interface SpeedTestTimeout {
  timeout: number;
}

// Validation result types
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface SizeRange {
  min: number;
  max: number;
}

// Common data types
export interface TargetIdData {
  targetId: string;
}

export interface UserIdData {
  userId: string;
}

export interface IdData {
  id: string;
}

// Note: TargetUpdateData and CreateTargetData are already defined in interfaces/ITargetRepository.ts

// Monitoring configuration types
export interface MonitoringConfig {
  intervalMs: number;
  enabled: boolean;
}

export interface AlertThresholdConfig {
  metric: string;
  condition: string;
  threshold: number;
  enabled: boolean;
}
