export interface SpeedTestUrl {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  provider: string;
  region?: string;
  enabled: boolean;
  priority: number; // Lower number = higher priority
  description?: string;
}

export interface SpeedTestUrlConfig {
  urls: SpeedTestUrl[];
  defaultProvider: string;
  maxConcurrentTests: number;
  timeoutMs: number;
  retryAttempts: number;
  fallbackEnabled: boolean;
}

export interface SpeedTestUrlSelection {
  selectedUrl: SpeedTestUrl;
  fallbackUrls: SpeedTestUrl[];
  selectionReason: string;
}

export interface ISpeedTestConfigService {
  // URL Management
  getAllUrls(): SpeedTestUrl[];
  getEnabledUrls(): SpeedTestUrl[];
  getUrlsByProvider(provider: string): SpeedTestUrl[];
  getUrlsBySize(sizeBytes: number): SpeedTestUrl[];
  addCustomUrl(url: Omit<SpeedTestUrl, "id">): SpeedTestUrl;
  updateUrl(id: string, updates: Partial<SpeedTestUrl>): SpeedTestUrl | null;
  removeUrl(id: string): boolean;
  enableUrl(id: string): boolean;
  disableUrl(id: string): boolean;

  // URL Selection
  selectBestUrl(criteria?: {
    preferredSize?: number;
    preferredProvider?: string;
    excludeProviders?: string[];
    maxSize?: number;
    minSize?: number;
  }): SpeedTestUrlSelection;

  // Configuration Management
  getConfig(): SpeedTestUrlConfig;
  updateConfig(config: Partial<SpeedTestUrlConfig>): void;
  resetToDefaults(): void;

  // Validation
  validateUrl(url: string): boolean;
  validateUrlConfig(url: SpeedTestUrl): { valid: boolean; errors: string[] };

  // Statistics
  getUrlStats(): {
    totalUrls: number;
    enabledUrls: number;
    providers: string[];
    sizeRange: { min: number; max: number };
  };
}
