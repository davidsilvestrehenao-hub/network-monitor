import type {
  ISpeedTestUrlRepository,
  CreateSpeedTestUrlData,
  UpdateSpeedTestUrlData,
} from "@network-monitor/shared";

// Define the correct SpeedTestUrl type locally to avoid the type alias conflict
interface SpeedTestUrl {
  id: string;
  name: string;
  url: string;
  sizeBytes: number;
  provider: string;
  region?: string;
  enabled: boolean;
  priority: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
  // Additional properties that might be present in the data
  averageSpeed?: number | null;
  reliability?: number | null;
  lastTestedAt?: Date | null;
  status?: string;
  isActive?: boolean;
  tags?: string[];
  version?: number;
  deletedAt?: Date | null;
  createdBy?: string | null;
  updatedBy?: string | null;
}

export class MockSpeedTestUrlRepository implements ISpeedTestUrlRepository {
  private urls: SpeedTestUrl[] = [];
  private nextId = 1;

  constructor() {
    this.seedData();
  }

  private seedData(): void {
    const now = new Date().toISOString();
    this.urls = [
      {
        id: "mock-url-1",
        name: "Mock 10MB Test",
        url: "https://httpbin.org/bytes/10485760",
        sizeBytes: 10 * 1024 * 1024, // 10 MB
        provider: "Mock",
        region: "Test",
        enabled: true,
        priority: 1,
        description: "Mock test file for browser testing",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "mock-url-2",
        name: "Mock 100MB Test",
        url: "https://httpbin.org/bytes/104857600",
        sizeBytes: 100 * 1024 * 1024, // 100 MB
        provider: "Mock",
        region: "Test",
        enabled: true,
        priority: 2,
        description: "Large mock test file",
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "mock-url-3",
        name: "Mock Disabled Test",
        url: "https://httpbin.org/bytes/5242880",
        sizeBytes: 5 * 1024 * 1024, // 5 MB
        provider: "MockDisabled",
        region: "Test",
        enabled: false,
        priority: 3,
        description: "Disabled mock test file",
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  async findById(id: string | number): Promise<SpeedTestUrl | null> {
    const stringId = String(id);
    return this.urls.find(url => url.id === stringId) || null;
  }

  async findByUrl(url: string): Promise<SpeedTestUrl | null> {
    return this.urls.find(u => u.url === url) || null;
  }

  async findByRegion(region: string): Promise<SpeedTestUrl[]> {
    return this.urls
      .filter(url => url.region === region)
      .sort((a, b) => a.priority - b.priority);
  }

  async getAll(limit?: number, offset?: number): Promise<SpeedTestUrl[]> {
    let result = [...this.urls].sort((a, b) => a.priority - b.priority);

    if (offset) {
      result = result.slice(offset);
    }

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }

  async create(data: CreateSpeedTestUrlData): Promise<SpeedTestUrl> {
    const now = new Date().toISOString();
    const newUrl: SpeedTestUrl = {
      id: `mock-url-${this.nextId++}`,
      name: data.name,
      url: data.url,
      sizeBytes: data.sizeBytes,
      provider: data.provider,
      region: data.region ?? undefined,
      enabled: data.enabled ?? true,
      priority: data.priority ?? 0,
      description: data.description ?? undefined,
      createdAt: now,
      updatedAt: now,
    };

    this.urls.push(newUrl);
    return newUrl;
  }

  async update(
    id: string | number,
    data: UpdateSpeedTestUrlData
  ): Promise<SpeedTestUrl> {
    const stringId = String(id);
    const urlIndex = this.urls.findIndex(url => url.id === stringId);
    if (urlIndex === -1) {
      throw new Error(`SpeedTestUrl with id ${stringId} not found`);
    }

    const updatedUrl = {
      ...this.urls[urlIndex],
      ...data,
      region: data.region ?? this.urls[urlIndex].region,
      description: data.description ?? this.urls[urlIndex].description,
      updatedAt: new Date().toISOString(),
    };

    this.urls[urlIndex] = updatedUrl;
    return updatedUrl;
  }

  async delete(id: string | number): Promise<void> {
    const stringId = String(id);
    const urlIndex = this.urls.findIndex(url => url.id === stringId);
    if (urlIndex === -1) {
      throw new Error(`SpeedTestUrl with id ${stringId} not found`);
    }

    this.urls.splice(urlIndex, 1);
  }

  async count(): Promise<number> {
    return this.urls.length;
  }

  async findByProvider(provider: string): Promise<SpeedTestUrl[]> {
    return this.urls
      .filter(url => url.provider === provider)
      .sort((a, b) => a.priority - b.priority);
  }

  async findBySize(sizeBytes: number): Promise<SpeedTestUrl[]> {
    return this.urls
      .filter(url => url.sizeBytes === sizeBytes)
      .sort((a, b) => a.priority - b.priority);
  }

  async findEnabled(): Promise<SpeedTestUrl[]> {
    return this.urls
      .filter(url => url.enabled)
      .sort((a, b) => a.priority - b.priority);
  }

  async findByPriorityRange(
    minPriority: number,
    maxPriority: number
  ): Promise<SpeedTestUrl[]> {
    return this.urls
      .filter(url => url.priority >= minPriority && url.priority <= maxPriority)
      .sort((a, b) => a.priority - b.priority);
  }

  async enableUrl(id: string): Promise<SpeedTestUrl | null> {
    const url = this.urls.find(url => url.id === id);
    if (!url) {
      return null;
    }

    url.enabled = true;
    return url;
  }

  async disableUrl(id: string): Promise<SpeedTestUrl | null> {
    const url = this.urls.find(url => url.id === id);
    if (!url) {
      return null;
    }

    url.enabled = false;
    return url;
  }

  async updatePriority(
    id: string,
    priority: number
  ): Promise<SpeedTestUrl | null> {
    const url = this.urls.find(url => url.id === id);
    if (!url) {
      return null;
    }

    url.priority = priority;
    return url;
  }

  async seedDefaultUrls(): Promise<void> {
    // Mock repository is already seeded in constructor
    // This method is a no-op for the mock
  }

  // Mock-specific methods for testing
  seedUrls(urls: SpeedTestUrl[]): void {
    this.urls = urls;
  }

  clearUrls(): void {
    this.urls = [];
  }

  getUrlCount(): number {
    return this.urls.length;
  }
}
