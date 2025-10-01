import type {
  ISpeedTestConfigService,
  SpeedTestUrl,
  SpeedTestUrlConfig,
  SpeedTestUrlSelection,
} from "@network-monitor/shared";
import type { ILogger } from "@network-monitor/shared";

export class SpeedTestConfigService implements ISpeedTestConfigService {
  private config: SpeedTestUrlConfig;
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
    this.config = this.getDefaultConfig();
    this.logger.debug(
      "SpeedTestConfigService: Initialized with default configuration"
    );
  }

  private getDefaultConfig(): SpeedTestUrlConfig {
    return {
      urls: [
        // CacheFly URLs
        {
          id: "cachefly-10mb",
          name: "CacheFly 10MB",
          url: "http://cachefly.cachefly.net/10mb.test",
          sizeBytes: 10 * 1024 * 1024, // 10 MB
          provider: "CacheFly",
          region: "Global CDN",
          enabled: true,
          priority: 1,
          description: "Small test file for quick speed tests",
        },
        {
          id: "cachefly-100mb",
          name: "CacheFly 100MB",
          url: "http://cachefly.cachefly.net/100mb.test",
          sizeBytes: 100 * 1024 * 1024, // 100 MB
          provider: "CacheFly",
          region: "Global CDN",
          enabled: true,
          priority: 2,
          description: "Standard test file for accurate speed measurements",
        },
        {
          id: "cachefly-1gb",
          name: "CacheFly 1GB",
          url: "http://cachefly.cachefly.net/1gb.test",
          sizeBytes: 1024 * 1024 * 1024, // 1 GB
          provider: "CacheFly",
          region: "Global CDN",
          enabled: true,
          priority: 3,
          description: "Large test file for high-speed connection testing",
        },
        // ThinkBroadband URLs
        {
          id: "thinkbroadband-5mb",
          name: "ThinkBroadband 5MB",
          url: "http://ipv4.download.thinkbroadband.com/5MB.zip",
          sizeBytes: 5 * 1024 * 1024, // 5 MB
          provider: "ThinkBroadband",
          region: "UK",
          enabled: true,
          priority: 4,
          description: "Small compressed test file from UK provider",
        },
        {
          id: "thinkbroadband-50mb",
          name: "ThinkBroadband 50MB",
          url: "http://ipv4.download.thinkbroadband.com/50MB.zip",
          sizeBytes: 50 * 1024 * 1024, // 50 MB
          provider: "ThinkBroadband",
          region: "UK",
          enabled: true,
          priority: 5,
          description: "Medium compressed test file from UK provider",
        },
        {
          id: "thinkbroadband-200mb",
          name: "ThinkBroadband 200MB",
          url: "http://ipv4.download.thinkbroadband.com/200MB.zip",
          sizeBytes: 200 * 1024 * 1024, // 200 MB
          provider: "ThinkBroadband",
          region: "UK",
          enabled: true,
          priority: 6,
          description: "Large compressed test file from UK provider",
        },
      ],
      defaultProvider: "CacheFly",
      maxConcurrentTests: 3,
      timeoutMs: 30000, // 30 seconds
      retryAttempts: 2,
      fallbackEnabled: true,
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

    // Validate the URL before adding
    const validation = this.validateUrlConfig(newUrl);
    if (!validation.valid) {
      throw new Error(
        `Invalid URL configuration: ${validation.errors.join(", ")}`
      );
    }

    this.config.urls.push(newUrl);
    this.logger.debug("SpeedTestConfigService: Added custom URL", {
      url: newUrl,
    });

    return newUrl;
  }

  updateUrl(id: string, updates: Partial<SpeedTestUrl>): SpeedTestUrl | null {
    const urlIndex = this.config.urls.findIndex(url => url.id === id);
    if (urlIndex === -1) {
      this.logger.warn("SpeedTestConfigService: URL not found for update", {
        id,
      });
      return null;
    }

    const updatedUrl = { ...this.config.urls[urlIndex], ...updates };

    // Validate the updated URL
    const validation = this.validateUrlConfig(updatedUrl);
    if (!validation.valid) {
      throw new Error(
        `Invalid URL configuration: ${validation.errors.join(", ")}`
      );
    }

    this.config.urls[urlIndex] = updatedUrl;
    this.logger.debug("SpeedTestConfigService: Updated URL", { id, updates });

    return updatedUrl;
  }

  removeUrl(id: string): boolean {
    const urlIndex = this.config.urls.findIndex(url => url.id === id);
    if (urlIndex === -1) {
      this.logger.warn("SpeedTestConfigService: URL not found for removal", {
        id,
      });
      return false;
    }

    const removedUrl = this.config.urls[urlIndex];
    this.config.urls.splice(urlIndex, 1);
    this.logger.debug("SpeedTestConfigService: Removed URL", {
      id,
      removedUrl,
    });

    return true;
  }

  enableUrl(id: string): boolean {
    const url = this.config.urls.find(url => url.id === id);
    if (!url) {
      this.logger.warn("SpeedTestConfigService: URL not found for enabling", {
        id,
      });
      return false;
    }

    url.enabled = true;
    this.logger.debug("SpeedTestConfigService: Enabled URL", { id });

    return true;
  }

  disableUrl(id: string): boolean {
    const url = this.config.urls.find(url => url.id === id);
    if (!url) {
      this.logger.warn("SpeedTestConfigService: URL not found for disabling", {
        id,
      });
      return false;
    }

    url.enabled = false;
    this.logger.debug("SpeedTestConfigService: Disabled URL", { id });

    return true;
  }

  selectBestUrl(
    criteria: {
      preferredSize?: number;
      preferredProvider?: string;
      excludeProviders?: string[];
      maxSize?: number;
      minSize?: number;
    } = {}
  ): SpeedTestUrlSelection {
    const {
      preferredSize,
      preferredProvider,
      excludeProviders = [],
      maxSize,
      minSize,
    } = criteria;

    // Get enabled URLs that match criteria
    let candidates = this.getEnabledUrls().filter(url => {
      // Exclude providers if specified
      if (excludeProviders.includes(url.provider)) {
        return false;
      }

      // Size filters
      if (maxSize && url.sizeBytes > maxSize) {
        return false;
      }
      if (minSize && url.sizeBytes < minSize) {
        return false;
      }

      return true;
    });

    if (candidates.length === 0) {
      // Fallback to any enabled URL
      candidates = this.getEnabledUrls();
    }

    // Sort by priority and criteria
    candidates.sort((a, b) => {
      // First, prefer the preferred provider
      if (preferredProvider) {
        const aIsPreferred = a.provider === preferredProvider;
        const bIsPreferred = b.provider === preferredProvider;
        if (aIsPreferred && !bIsPreferred) return -1;
        if (!aIsPreferred && bIsPreferred) return 1;
      }

      // Then, prefer size closest to preferred size
      if (preferredSize) {
        const aDiff = Math.abs(a.sizeBytes - preferredSize);
        const bDiff = Math.abs(b.sizeBytes - preferredSize);
        if (aDiff !== bDiff) {
          return aDiff - bDiff;
        }
      }

      // Finally, sort by priority
      return a.priority - b.priority;
    });

    const selectedUrl = candidates[0];
    const fallbackUrls = candidates.slice(1, 4); // Keep up to 3 fallbacks

    let selectionReason = `Selected ${selectedUrl.name} (${selectedUrl.provider})`;
    if (preferredProvider && selectedUrl.provider === preferredProvider) {
      selectionReason += " - preferred provider";
    }
    if (preferredSize) {
      selectionReason += ` - closest size to ${preferredSize} bytes`;
    }

    this.logger.debug("SpeedTestConfigService: Selected URL", {
      selectedUrl: selectedUrl.id,
      selectionReason,
      fallbackCount: fallbackUrls.length,
    });

    return {
      selectedUrl,
      fallbackUrls,
      selectionReason,
    };
  }

  getConfig(): SpeedTestUrlConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<SpeedTestUrlConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.debug("SpeedTestConfigService: Updated configuration", {
      config,
    });
  }

  resetToDefaults(): void {
    this.config = this.getDefaultConfig();
    this.logger.debug("SpeedTestConfigService: Reset to default configuration");
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

    // Check for duplicate IDs
    const existingUrl = this.config.urls.find(
      existing => existing.id === url.id
    );
    if (existingUrl && existingUrl !== url) {
      errors.push("ID already exists");
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
