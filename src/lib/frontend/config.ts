import { LogLevel } from "@network-monitor/shared";

/**
 * Frontend-specific configuration
 * Separate from backend service config for browser environment
 */
export interface FrontendConfig {
  // Logging configuration
  logging: {
    level: LogLevel;
    enableConsole: boolean;
    enablePerformanceLogging: boolean;
  };

  // API configuration
  api: {
    baseUrl?: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };

  // Event bus configuration
  eventBus: {
    enableDebugLogging: boolean;
    maxListeners: number;
  };

  // Performance monitoring
  performance: {
    enabled: boolean;
    sampleRate: number; // 0-1
  };

  // Feature flags
  features: {
    enableMockData: boolean;
    enableDevTools: boolean;
    enableAnalytics: boolean;
  };
}

// Default configuration
export const defaultFrontendConfig: FrontendConfig = {
  logging: {
    level: LogLevel.INFO,
    enableConsole: true,
    enablePerformanceLogging: false,
  },
  api: {
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },
  eventBus: {
    enableDebugLogging: false,
    maxListeners: 50,
  },
  performance: {
    enabled: true,
    sampleRate: 0.1, // 10% of users
  },
  features: {
    enableMockData: false,
    enableDevTools: import.meta.env.DEV,
    enableAnalytics: import.meta.env.PROD,
  },
};

// Development configuration
export const developmentFrontendConfig: FrontendConfig = {
  ...defaultFrontendConfig,
  logging: {
    level: LogLevel.DEBUG,
    enableConsole: true,
    enablePerformanceLogging: true,
  },
  eventBus: {
    enableDebugLogging: true,
    maxListeners: 100,
  },
  features: {
    enableMockData: false,
    enableDevTools: true,
    enableAnalytics: false,
  },
};

// Production configuration
export const productionFrontendConfig: FrontendConfig = {
  ...defaultFrontendConfig,
  logging: {
    level: LogLevel.WARN,
    enableConsole: false,
    enablePerformanceLogging: false,
  },
  features: {
    enableMockData: false,
    enableDevTools: false,
    enableAnalytics: true,
  },
};

// Get configuration based on environment
export function getFrontendConfig(): FrontendConfig {
  if (import.meta.env.DEV) {
    return developmentFrontendConfig;
  }
  return productionFrontendConfig;
}

