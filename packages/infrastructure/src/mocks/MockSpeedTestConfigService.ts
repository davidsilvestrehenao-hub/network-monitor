import type {
  ISpeedTestConfigService,
  SpeedTestUrl,
  SpeedTestUrlConfig,
  SpeedTestUrlSelection,
} from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class MockSpeedTestConfigService implements ISpeedTestConfigService {
  private config: SpeedTestUrlConfig;
  private logger?: ILogger;

  constructor(logger?: ILogger) {
    this.logger = logger;
    this.config = this.getDefaultConfig();
    this.logger?.debug(
      "MockSpeedTestConfigService: Initialized with default configuration"
    );
  }

  private getDefaultConfig(): SpeedTestUrlConfig {
    return {
      urls: [
        {
          id: "mock-10mb",
          name: "Mock 10MB Test",
          url: "https://httpbin.org/bytes/10485760", // 10MB
          sizeBytes: 10 * 1024 * 1024,
          provider: "Mock",
          region: "Test",
          enabled: true,
          priority: 1,
          description: "Mock test file for browser testing",
        },
      ],
      defaultProvider: "Mock",
      maxConcurrentTests: 1,
      timeoutMs: 30000,
      retryAttempts: 1,
      fallbackEnabled: false,
    };
  }

  getAllUrls(): SpeedTestUrl[] {
    return [...this.config.urls];
  }

  getEnabledUrls(): SpeedTestUrl[] {
    return this.config.urls.filter(url => url.enabled);
  }

  getUrlsByProvider(provider: string): SpeedTestUrl[] {
    return this.config.urls.filter(url => url.provider === provider);
  }

  getUrlsBySize(sizeBytes: number): SpeedTestUrl[] {
    return this.config.urls.filter(url => url.sizeBytes === sizeBytes);
  }

  addCustomUrl(url: Omit<SpeedTestUrl, "id">): SpeedTestUrl {
    const newUrl: SpeedTestUrl = {
      ...url,
      id: `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.config.urls.push(newUrl);
    this.logger?.debug("MockSpeedTestConfigService: Added custom URL", {
      url: newUrl,
    });

    return newUrl;
  }

  updateUrl(id: string, updates: Partial<SpeedTestUrl>): SpeedTestUrl | null {
    const urlIndex = this.config.urls.findIndex(url => url.id === id);
    if (urlIndex === -1) {
      this.logger?.warn(
        "MockSpeedTestConfigService: URL not found for update",
        {
          id,
        }
      );
      return null;
    }

    const updatedUrl = { ...this.config.urls[urlIndex], ...updates };
    this.config.urls[urlIndex] = updatedUrl;
    this.logger?.debug("MockSpeedTestConfigService: Updated URL", {
      id,
      updates,
    });

    return updatedUrl;
  }

  removeUrl(id: string): boolean {
    const urlIndex = this.config.urls.findIndex(url => url.id === id);
    if (urlIndex === -1) {
      this.logger?.warn(
        "MockSpeedTestConfigService: URL not found for removal",
        {
          id,
        }
      );
      return false;
    }

    this.config.urls.splice(urlIndex, 1);
    this.logger?.debug("MockSpeedTestConfigService: Removed URL", { id });

    return true;
  }

  enableUrl(id: string): boolean {
    const url = this.config.urls.find(url => url.id === id);
    if (!url) {
      this.logger?.warn(
        "MockSpeedTestConfigService: URL not found for enabling",
        {
          id,
        }
      );
      return false;
    }

    url.enabled = true;
    this.logger?.debug("MockSpeedTestConfigService: Enabled URL", { id });

    return true;
  }

  disableUrl(id: string): boolean {
    const url = this.config.urls.find(url => url.id === id);
    if (!url) {
      this.logger?.warn(
        "MockSpeedTestConfigService: URL not found for disabling",
        {
          id,
        }
      );
      return false;
    }

    url.enabled = false;
    this.logger?.debug("MockSpeedTestConfigService: Disabled URL", { id });

    return true;
  }

  selectBestUrl(
    _criteria: {
      preferredSize?: number;
      preferredProvider?: string;
      excludeProviders?: string[];
      maxSize?: number;
      minSize?: number;
    } = {}
  ): SpeedTestUrlSelection {
    const enabledUrls = this.getEnabledUrls();
    const selectedUrl = enabledUrls[0] || this.config.urls[0];

    return {
      selectedUrl,
      fallbackUrls: [],
      selectionReason: "Mock service - single test URL",
    };
  }

  getConfig(): SpeedTestUrlConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<SpeedTestUrlConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger?.debug("MockSpeedTestConfigService: Updated configuration", {
      config,
    });
  }

  resetToDefaults(): void {
    this.config = this.getDefaultConfig();
    this.logger?.debug(
      "MockSpeedTestConfigService: Reset to default configuration"
    );
  }

  validateUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  }

  validateUrlConfig(url: SpeedTestUrl): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!url.id || url.id.trim() === "") {
      errors.push("ID is required");
    }

    if (!url.name || url.name.trim() === "") {
      errors.push("Name is required");
    }

    if (!this.validateUrl(url.url)) {
      errors.push("Invalid URL format");
    }

    if (!url.provider || url.provider.trim() === "") {
      errors.push("Provider is required");
    }

    if (url.sizeBytes <= 0) {
      errors.push("Size must be greater than 0");
    }

    if (url.priority < 0) {
      errors.push("Priority must be non-negative");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  getUrlStats(): {
    totalUrls: number;
    enabledUrls: number;
    providers: string[];
    sizeRange: { min: number; max: number };
  } {
    const enabledUrls = this.getEnabledUrls();
    const providers = [...new Set(this.config.urls.map(url => url.provider))];

    const sizes = this.config.urls.map(url => url.sizeBytes);
    const sizeRange = {
      min: Math.min(...sizes),
      max: Math.max(...sizes),
    };

    return {
      totalUrls: this.config.urls.length,
      enabledUrls: enabledUrls.length,
      providers,
      sizeRange,
    };
  }
}
